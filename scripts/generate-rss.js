import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

import { stripHtml } from '../src/utils/html.js';

// Note: Run this with node --env-file=.env.local scripts/generate-rss.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const baseUrl = 'https://nfgbrentano.art.br/'; 

if (!firebaseConfig.apiKey) {
  console.error('Environment variables for Firebase are required.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function getExcerpt(poem, limit = 160) {
  if (poem.excerpt && poem.excerpt.trim()) {
    return poem.excerpt.trim();
  }
  const cleanContent = stripHtml(poem.content);
  if (cleanContent.length <= limit) return cleanContent;
  return cleanContent.slice(0, limit - 3) + '...';
}

async function generateRss() {
  try {
    console.log('Fetching published poems for RSS feed...');
    
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'published'),
      orderBy('published_at', 'desc')
    );
    const snapshot = await getDocs(q);
    const poems = snapshot.docs.map(doc => doc.data());

    console.log(`Found ${poems.length} poems. Generating RSS XML...`);

    const lastBuildDate = poems.length > 0 ? new Date(poems[0].published_at).toUTCString() : new Date().toUTCString();

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Poemas Brasileiros - Natanael Brentano</title>
    <link>${baseUrl}</link>
    <description>Coleção de poemas originais em português por Natanael Fernando Gatti Brentano.</description>
    <language>pt-br</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}feed.xml" rel="self" type="application/rss+xml" />
    
${poems.map(poem => `    <item>
      <title>${escapeXml(poem.title || '')}</title>
      <link>${baseUrl}poema/${poem.slug}</link>
      <guid>${baseUrl}poema/${poem.slug}</guid>
      <description>${escapeXml(getExcerpt(poem))}</description>
      <pubDate>${new Date(poem.published_at).toUTCString()}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'feed.xml');
    fs.writeFileSync(outputPath, rss);
    
    console.log(`Successfully generated RSS feed with ${poems.length} items at: ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to generate RSS feed:', err.message);
    process.exit(1);
  }
}

generateRss();
