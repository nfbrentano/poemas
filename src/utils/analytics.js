import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';

// Tracks a page view. Called by router on every route change.
export async function trackPageView(page, poemId = null) {
  try {
    // Bot / crawler guard
    const ua = navigator.userAgent || '';
    if (/bot|crawler|spider|Googlebot|bingbot|facebookexternalhit/i.test(ua)) return;

    // Geo lookup via public API instead of Supabase Edge Function
    let country = null;
    try {
      if (!window._ipPromise) {
        window._ipPromise = fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .catch(() => null);
      }

      const data = await window._ipPromise;
      if (data) {
        country = data.country || null;

        // Build a privacy-safe IP hash
        if (data.ip && !window._ipHash) {
          const encoded = new TextEncoder().encode(data.ip);
          const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
          const hashArr = Array.from(new Uint8Array(hashBuf));
          window._ipHash = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      }
    } catch (_) { /* non-blocking */ }

    try {
      await addDoc(collection(db, 'page_views'), {
        page,
        poem_id: poemId || null,
        ip_hash: window._ipHash || null,
        country,
        user_agent: ua.substring(0, 300),
        referrer: document.referrer ? document.referrer.substring(0, 300) : null,
        created_at: new Date().toISOString()
      });
    } catch (insertErr) {
      console.warn('[analytics] insert error:', insertErr);
    }
  } catch (err) {
    console.warn('[analytics] track error:', err.message);
  }
}
