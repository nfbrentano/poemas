import { supabase } from './supabase.js';

// Tracks a page view. Called by router on every route change.
export async function trackPageView(page, poemId = null) {
  try {
    // Bot / crawler guard
    const CACHE_NAME = 'poemas-cache-v4';
    const ua = navigator.userAgent || '';
    if (/bot|crawler|spider|Googlebot|bingbot|facebookexternalhit/i.test(ua)) return;

    // Lightweight IP country lookup (free, no key needed, 45 req/min)
    let country = null;
    try {
      // Avoid multiple concurrent IP lookups
      if (!window._ipPromise) {
        window._ipPromise = fetch('https://ipwho.is/json', { signal: AbortSignal.timeout(3000) })
          .then(res => res.ok ? res.json() : null)
          .catch(() => null);
      }
      
      const g = await window._ipPromise;
      if (g && g.success) {
        country = g.country_code || null;
        // Also build a privacy-safe IP hash from the IP string if not already set
        if (g.ip && !window._ipHash) {
          const encoded = new TextEncoder().encode(g.ip);
          const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
          const hashArr = Array.from(new Uint8Array(hashBuf));
          window._ipHash = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      }
    } catch (_) { /* non-blocking */ }

    await supabase.from('page_views').insert([{
      page,
      poem_id: poemId || null,
      ip_hash: window._ipHash || null,
      country,
      user_agent: ua.substring(0, 300),
      referrer: document.referrer ? document.referrer.substring(0, 300) : null
    }]);
  } catch (err) {
    console.warn('[analytics] track error:', err.message);
  }
}
