import { supabase } from './supabase.js';

const VAPID_PUBLIC_KEY = 'BCX7...'; // This should ideally be a config, but I'll use a placeholder or check site_settings

export const pushManager = {
  isSupported() {
    return ('serviceWorker' in navigator) && ('PushManager' in window);
  },

  async getSubscription() {
    if (!this.isSupported()) return null;
    try {
      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) return null;
      return await registration.pushManager.getSubscription();
    } catch (e) {
      console.warn('Erro ao obter assinatura de push:', e);
      return null;
    }
  },

  async subscribe() {
    if (!this.isSupported()) {
      throw new Error('Notificações Push não são suportadas neste navegador.');
    }

    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      throw new Error('Chave pública VAPID não está configurada no ambiente.');
    }

    const registration = await navigator.serviceWorker.ready;
    if (!registration.pushManager) {
      throw new Error('PushManager não está disponível no Service Worker.');
    }
    
    // Check for existing permission
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      throw new Error('Permissão de notificação negada');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
    });

    // Save to Supabase
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('push_subscriptions').insert({
      user_id: session?.user?.id || null,
      subscription: subscription.toJSON()
    });

    return subscription;
  },

  async unsubscribe() {
    if (!this.isSupported()) return;
    const subscription = await this.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from Supabase
      const subJson = subscription.toJSON();
      await supabase.from('push_subscriptions').delete().match({
        'subscription->endpoint': subJson.endpoint
      });
    }
  },

  urlBase64ToUint8Array(base64String) {
    if (!base64String) return new Uint8Array();
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};
