import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Note: Run this with node --env-file=.env.local scripts/generate-sitemap.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const baseUrl = 'https://nfbrentano.github.io/poemas/'; 

if (!firebaseConfig.apiKey) {
  console.error('Environment variables for Firebase are required.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function generateSitemap() {
  try {
    console.log('Fetching published poems from Supabase...');
    
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'published'),
      orderBy('published_at', 'desc')
    );
    const snapshot = await getDocs(q);
    const poems = snapshot.docs.map(doc => doc.data());

    console.log(`Found ${poems.length} poems. Generating XML...`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home Page -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Poems -->
${poems.map(poem => `  <url>
    <loc>${baseUrl}poema/${poem.slug}</loc>
    <lastmod>${new Date(poem.published_at || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    
    console.log(`Successfully generated sitemap with ${poems.length + 1} URLs at: ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to generate sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
