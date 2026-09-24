import fs from 'fs';
import path from 'path';

/**
 * Pings IndexNow API (Bing, Yandex, etc.) with updated URLs if configured.
 * Optional and gated behind flag or env var: INDEXNOW_KEY or --ping flag.
 */
export async function pingIndexNow({
  key = process.env.INDEXNOW_KEY,
  host = 'nfgbrentano.art.br',
  urlList = []
} = {}) {
  if (!key) {
    console.log('[IndexNow] Skipped: No INDEXNOW_KEY configured.');
    return { skipped: true, reason: 'NO_KEY' };
  }

  if (!urlList || urlList.length === 0) {
    console.log('[IndexNow] Skipped: URL list is empty.');
    return { skipped: true, reason: 'EMPTY_URLS' };
  }

  const endpoint = 'https://api.indexnow.org/indexnow';
  const payload = {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      console.log(`[IndexNow] Successfully submitted ${urlList.length} URLs to IndexNow.`);
      return { success: true, status: res.status };
    } else {
      const errText = await res.text().catch(() => '');
      console.warn(`[IndexNow] Response status ${res.status}: ${errText}`);
      return { success: false, status: res.status, error: errText };
    }
  } catch (err) {
    console.warn('[IndexNow] Failed to ping IndexNow:', err.message);
    return { success: false, error: err.message };
  }
}

if (process.argv[1] && process.argv[1].endsWith('ping-indexnow.js')) {
  const isEnabled = process.argv.includes('--ping') || process.env.INDEXNOW_PING === 'true';
  const key = process.env.INDEXNOW_KEY;

  if (!isEnabled && !key) {
    console.log('[IndexNow] Flag --ping or INDEXNOW_KEY not set. Skipping.');
    process.exit(0);
  }

  // Read URLs from sitemap-poemas.xml in dist/
  const poemSitemapPath = path.resolve(process.cwd(), 'dist/sitemap-poemas.xml');
  let urls = [];
  if (fs.existsSync(poemSitemapPath)) {
    const content = fs.readFileSync(poemSitemapPath, 'utf-8');
    urls = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  }

  pingIndexNow({ key, urlList: urls })
    .then(() => process.exit(0))
    .catch(() => process.exit(0)); // non-blocking for builds
}
