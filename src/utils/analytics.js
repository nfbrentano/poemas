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
      // Avoid multiple concurrent IP lookups
      if (!window._ipPromise) {
        window._ipPromise = (async () => {
          try {
            // Try ipapi.co first (usually good for localhost)
            const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
            if (res.ok) return await res.json();
            
            // Fallback 1: freeipapi.com
            const res2 = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) });
            if (res2.ok) {
              const d = await res2.json();
              return { ip: d.ipAddress, country_code: d.countryCode, success: true };
            }
            
            // Fallback 2: ipwho.is
            const res3 = await fetch('https://ipwho.is/json', { signal: AbortSignal.timeout(3000) });
            if (res3.ok) return await res3.json();
            
            return null;
          } catch (e) {
            return null;
          }
        })();
      }
      
      const g = await window._ipPromise;
      if (g) {
        country = g.country_code || g.countryCode || null;
        const ip = g.ip || g.ipAddress;
        
        // Also build a privacy-safe IP hash from the IP string if not already set
        if (ip && !window._ipHash) {
          const encoded = new TextEncoder().encode(ip);
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
