import { supabase } from './supabase.js';

const VAPID_PUBLIC_KEY = 'BCX7...'; // This should ideally be a config, but I'll use a placeholder or check site_settings

export const pushManager = {
  async getSubscription() {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  },

  async subscribe() {
    const registration = await navigator.serviceWorker.ready;
    
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
      applicationServerKey: this.urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
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
