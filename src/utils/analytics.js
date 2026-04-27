import { supabase } from './supabase.js';

// Tracks a page view. Called by router on every route change.
export async function trackPageView(page, poemId = null) {
  try {
    // Bot / crawler guard
    const ua = navigator.userAgent || '';
    if (/bot|crawler|spider|Googlebot|bingbot|facebookexternalhit/i.test(ua)) return;

    // Lightweight IP country lookup (free, no key needed, 45 req/min)
    let country = null;
    try {
      const geo = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) });
      if (geo.ok) {
        const g = await geo.json();
        country = g.countryCode || null;
        // Also build a privacy-safe IP hash from the IP string
        if (g.ipAddress) {
          const encoded = new TextEncoder().encode(g.ipAddress);
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
