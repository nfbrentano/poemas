import { db } from './firebase.js';
import { collection, addDoc } from 'firebase/firestore';

async function getAnonymousSessionHash() {
  if (typeof window === 'undefined') return null;
  if (window._sessionHash) return window._sessionHash;

  try {
    let rawId = sessionStorage.getItem('analytics_session_id');
    if (!rawId) {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        rawId = crypto.randomUUID();
      } else {
        rawId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      }
      try { sessionStorage.setItem('analytics_session_id', rawId); } catch (_) {}
    }

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const today = new Date().toISOString().slice(0, 10);
      const encoded = new TextEncoder().encode(`${rawId}:${today}`);
      const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
      const hashArr = Array.from(new Uint8Array(hashBuf));
      window._sessionHash = hashArr.map(b => b.toString(16).padStart(2, '0')).slice(0, 32).join('');
    } else {
      window._sessionHash = String(rawId).slice(0, 32);
    }
  } catch (_) {
    window._sessionHash = null;
  }
  return window._sessionHash;
}

// Tracks a page view. Called by router on every route change.
export async function trackPageView(page, poemId = null) {
  try {
    // Bot / crawler guard
    const ua = navigator.userAgent || '';
    if (/bot|crawler|spider|Googlebot|bingbot|facebookexternalhit/i.test(ua)) return;

    const sessionHash = await getAnonymousSessionHash();

    try {
      await addDoc(collection(db, 'page_views'), {
        page,
        poem_id: poemId || null,
        ip_hash: sessionHash,
        country: null,
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
