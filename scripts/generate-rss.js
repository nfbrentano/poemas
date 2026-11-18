import fs from 'fs';
import path from 'path';
import { buildRssFeed, SITE_URL } from '../src/utils/rss-builder.js';
import { loadFallbackPoems } from './fallback-data.js';
import {
  getFirebaseConfig,
  installFirebaseNodeReferer,
  readBuildDataCache,
  writeBuildDataCache
} from './build-data-cache.js';

// Note: Run this with node --env-file=.env.local scripts/generate-rss.js
const baseUrl = process.env.SITE_URL || SITE_URL;

export async function runGenerateRss(outputDirectory, options = {}) {
  let poems = [];
  const firebaseConfig = getFirebaseConfig();

  if (!firebaseConfig.apiKey) {
    console.warn('[RSS] Firebase apiKey missing, using local fallback poems.');
    poems = loadFallbackPoems();
  } else {
    const cached = readBuildDataCache(options.cacheOptions);
    if (cached && Array.isArray(cached.poems) && cached.poems.length > 0) {
      console.log('[RSS] Reutilizando cache compartilhado de build (0 leituras no Firestore).');
      poems = cached.poems.map(p => ({ ...p }));
    } else {
      installFirebaseNodeReferer();
      const { initializeApp } = await import('firebase/app');
      const { getFirestore, collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      console.log('Fetching published poems from Firestore for RSS feed...');
      const q = query(
        collection(db, 'poems'),
        where('status', '==', 'published'),
        orderBy('published_at', 'desc')
      );
      const snapshot = await getDocs(q);
      poems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (poems.length === 0) {
        console.warn('[RSS] No poems found from Firestore (offline mode). Using local fallback poems.');
        poems = loadFallbackPoems();
      } else {
        writeBuildDataCache({ poems }, options.cacheOptions);
      }
    }
  }

  console.log(`Found ${poems.length} published poems. Generating RSS XML (limited to 50 latest)...`);

  const rssXml = buildRssFeed({
    baseUrl,
    poems,
    buildDate: new Date(),
    limit: 50
  });

  const targetDir = outputDirectory || path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outputPath = path.join(targetDir, 'feed.xml');
  fs.writeFileSync(outputPath, rssXml, 'utf-8');

  const count = Math.min(poems.length, 50);
  console.log(`Successfully generated RSS feed with ${count} items at: ${outputPath}`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-rss.js')) {
  const outDir = process.env.OUTPUT_DIR || path.resolve(process.cwd(), 'dist');
  runGenerateRss(outDir)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Failed to generate RSS feed:', err.message);
      process.exit(1);
    });
}
