import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { buildWxr, SITE_URL } from '../src/utils/wxr-builder.js';

// Gera um XML no formato de exportação do WordPress (WXR 1.2) com os poemas publicados.
// Uso: npm run export:wxr  (ou: node --env-file=.env.local scripts/export-wordpress-xml.js [--out arquivo.xml])
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.apiKey) {
  console.error('Environment variables for Firebase are required (use --env-file=.env.local).');
  process.exit(1);
}

const outIndex = process.argv.indexOf('--out');
const today = new Date().toISOString().slice(0, 10);
const outputPath = path.resolve(process.cwd(), outIndex > -1 && process.argv[outIndex + 1] ? process.argv[outIndex + 1] : `exports/poemas-${today}.xml`);

const db = getFirestore(initializeApp(firebaseConfig));

console.log('Buscando os poemas publicados no Firestore...');
const snapshot = await getDocs(query(collection(db, 'poems'), where('status', '==', 'published')));
const poems = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

const xml = buildWxr({ poems, siteUrl: process.env.SITE_URL || SITE_URL, now: new Date() });
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, xml, 'utf-8');

console.log(`${poems.length} poemas exportados para: ${outputPath}`);
console.log('Rascunhos e agendados não entram: só os publicados são legíveis sem login de administrador.');
process.exit(0);
