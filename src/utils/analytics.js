import { supabase } from './supabase.js';

// Tracks a page view. Called by router on every route change.
export async function trackPageView(page, poemId = null) {
  try {
    // Bot / crawler guard
    const ua = navigator.userAgent || '';
    if (/bot|crawler|spider|Googlebot|bingbot|facebookexternalhit/i.test(ua)) return;

    // Geo lookup via Supabase Edge Function (proxies freeipapi.com server-side, no CORS issues)
    let country = null;
    try {
      if (!window._ipPromise) {
        window._ipPromise = (async () => {
          try {
            const { data, error } = await supabase.functions.invoke('geo-ip');
            if (error) return null;
            return data;
          } catch (e) {
            return null;
          }
        })();
      }

      const data = await window._ipPromise;
      if (data && !data.error) {
        country = data.countryCode || null;

        // Build a privacy-safe IP hash
        if (data.ipAddress && !window._ipHash) {
          const encoded = new TextEncoder().encode(data.ipAddress);
          const hashBuf = await crypto.subtle.digest('SHA-256', encoded);
          const hashArr = Array.from(new Uint8Array(hashBuf));
          window._ipHash = hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
        }
      }
    } catch (_) { /* non-blocking */ }

    const { error: insertErr } = await supabase.from('page_views').insert([{
      page,
      poem_id: poemId || null,
      ip_hash: window._ipHash || null,
      country,
      user_agent: ua.substring(0, 300),
      referrer: document.referrer ? document.referrer.substring(0, 300) : null
    }]);
    
    if (insertErr) {
      console.warn('[analytics] insert error:', insertErr);
    }
  } catch (err) {
    console.warn('[analytics] track error:', err.message);
  }
}
