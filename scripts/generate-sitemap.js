import fs from 'fs';
import path from 'path';
import { generateAllSitemaps, formatDateToYMD, SITE_URL } from '../src/utils/sitemap-builder.js';
import { enrichCollectionsWithCurated, mergeRelationsWithCurated } from '../src/data/collections.js';
import { loadFallbackPoems } from './fallback-data.js';

// Note: Run this with node --env-file=.env.local scripts/generate-sitemap.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const baseUrl = process.env.SITE_URL || SITE_URL;

function getFileMTime(relativePath) {
  try {
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (fs.existsSync(fullPath)) {
      return formatDateToYMD(fs.statSync(fullPath).mtime);
    }
  } catch (_e) {}
  return null;
}

export async function runGenerateSitemap(outputDirectory) {
  let poems = [];
  let collections = [];
  let collectionPoems = [];

  if (!firebaseConfig.apiKey) {
    console.warn('[Sitemap] Firebase apiKey missing, using local fallback poems.');
    poems = loadFallbackPoems();
    collections = enrichCollectionsWithCurated([]);
    collectionPoems = mergeRelationsWithCurated([], poems, collections);
  } else {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore, collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Fetching published poems from Firestore...');
    const poemsQuery = query(
      collection(db, 'poems'),
      where('status', '==', 'published'),
      orderBy('published_at', 'desc')
    );
    const poemSnapshot = await getDocs(poemsQuery);
    poems = poemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${poems.length} published poems.`);

    console.log('Fetching collections from Firestore...');
    const colSnapshot = await getDocs(collection(db, 'collections'));
    const rawCollections = colSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(col => col.slug);
    collections = enrichCollectionsWithCurated(rawCollections);
    console.log(`Found ${collections.length} collections (including curated).`);

    console.log('Fetching collection_poems relations from Firestore...');
    try {
      const cpSnapshot = await getDocs(collection(db, 'collection_poems'));
      const rawCp = cpSnapshot.docs.map(doc => doc.data());
      collectionPoems = mergeRelationsWithCurated(rawCp, poems, collections);
    } catch (e) {
      console.warn('Could not fetch collection_poems:', e.message);
      collectionPoems = mergeRelationsWithCurated([], poems, collections);
    }

    if (poems.length === 0) {
      console.warn('[Sitemap] No poems found from Firestore (offline mode). Using local fallback poems.');
      poems = loadFallbackPoems();
      collections = enrichCollectionsWithCurated(collections.length ? collections : []);
      collectionPoems = mergeRelationsWithCurated([], poems, collections);
    }
  }

  const staticPages = [
    { loc: 'sobre', lastmod: getFileMTime('src/pages/about.js') },
    { loc: 'colecoes', lastmod: getFileMTime('src/pages/collections.js') }
  ];

  console.log('Building sitemap index and sub-sitemaps...');
  const sitemapsMap = generateAllSitemaps({
    baseUrl,
    poems,
    collections,
    collectionPoems,
    staticPages
  });

  const targetDir = outputDirectory || path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const [filename, xmlContent] of Object.entries(sitemapsMap)) {
    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, xmlContent, 'utf-8');
    console.log(`✓ Wrote ${filename} to ${filePath}`);
  }

  console.log(`Successfully generated sitemap index and sub-sitemaps in: ${targetDir}`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.js')) {
  const outDir = process.env.OUTPUT_DIR || path.resolve(process.cwd(), 'dist');
  runGenerateSitemap(outDir)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Failed to generate sitemap:', err.message);
      process.exit(1);
    });
}
