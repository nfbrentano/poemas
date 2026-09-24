import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { buildRssFeed, SITE_URL } from '../src/utils/rss-builder.js';

// Note: Run this with node --env-file=.env.local scripts/generate-rss.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const baseUrl = process.env.SITE_URL || SITE_URL;

if (!firebaseConfig.apiKey) {
  console.error('Environment variables for Firebase are required.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function runGenerateRss(outputDirectory) {
  console.log('Fetching published poems from Firestore for RSS feed...');
  const q = query(
    collection(db, 'poems'),
    where('status', '==', 'published'),
    orderBy('published_at', 'desc')
  );
  const snapshot = await getDocs(q);
  const poems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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
