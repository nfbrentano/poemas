import { db, getFirebaseAuth } from './firebase.js';
import { setDoc, deleteDoc, doc } from 'firebase/firestore';

// O ID do documento é o SHA-256 do endpoint: permite cancelar sem listar (a leitura é restrita a admin).
export async function subscriptionDocId(endpoint) {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

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

    // Save to Firebase
    const auth = await getFirebaseAuth();
    const user = auth.currentUser;
    const subJson = subscription.toJSON();
    try {
      await setDoc(doc(db, 'push_subscriptions', await subscriptionDocId(subJson.endpoint)), {
        user_id: user?.uid || null,
        subscription: subJson
      });
    } catch (e) {
      // Reinscrição do mesmo endpoint vira update (negado a anônimos): já está registrado.
      if (e?.code !== 'permission-denied') throw e;
    }

    return subscription;
  },

  async unsubscribe() {
    if (!this.isSupported()) return;
    const subscription = await this.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      // Remove from Firebase
      const endpoint = subscription.toJSON().endpoint;
      await deleteDoc(doc(db, 'push_subscriptions', await subscriptionDocId(endpoint)));
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
