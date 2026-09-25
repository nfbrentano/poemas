import fs from 'fs';
import path from 'path';

/**
 * Searches for an IndexNow key file in public/ or dist/ directories,
 * or returns process.env.INDEXNOW_KEY if configured.
 */
export function getIndexNowKey() {
  if (process.env.INDEXNOW_KEY && process.env.INDEXNOW_KEY.trim()) {
    return process.env.INDEXNOW_KEY.trim();
  }

  for (const dir of ['public', 'dist']) {
    const fullDir = path.resolve(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      try {
        const files = fs.readdirSync(fullDir);
        for (const file of files) {
          if (/^[a-f0-9]{16,64}\.txt$/i.test(file)) {
            const keyInName = file.replace(/\.txt$/, '');
            const fileContent = fs.readFileSync(path.join(fullDir, file), 'utf-8').trim();
            if (fileContent === keyInName) {
              return keyInName;
            }
          }
        }
      } catch {
        // Silently continue if directory can't be read
      }
    }
  }

  return null;
}

/**
 * Pings IndexNow API (Bing, Yandex, etc.) with updated URLs if configured.
 * Optional and gated behind flag or env var: INDEXNOW_KEY, --ping or --url flag.
 */
export async function pingIndexNow({
  key = getIndexNowKey(),
  host = 'nfgbrentano.art.br',
  urlList = []
} = {}) {
  if (!key) {
    console.log('[IndexNow] Skipped: No IndexNow key configured or found.');
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
  const urlArgIndex = process.argv.indexOf('--url');
  const customUrl = urlArgIndex !== -1 && process.argv[urlArgIndex + 1] ? process.argv[urlArgIndex + 1] : null;

  const key = getIndexNowKey();

  if (!isEnabled && !customUrl && !process.env.INDEXNOW_KEY) {
    console.log('[IndexNow] Flag --ping, --url or INDEXNOW_KEY not set. Skipping.');
    process.exit(0);
  }

  let urls = [];
  if (customUrl) {
    urls = [customUrl];
  } else {
    // Read URLs from sitemap-poemas.xml in dist/, falling back to sitemap.xml
    const candidates = [
      path.resolve(process.cwd(), 'dist/sitemap-poemas.xml'),
      path.resolve(process.cwd(), 'dist/sitemap.xml')
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf-8');
        const matches = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
        if (matches.length > 0) {
          urls = matches;
          break;
        }
      }
    }
  }

  pingIndexNow({ key, urlList: urls })
    .then(() => process.exit(0))
    .catch(() => process.exit(0)); // non-blocking for builds
}
