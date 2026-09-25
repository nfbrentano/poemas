import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { buildAllLlmsFiles, SITE_URL } from '../src/utils/llms-builder.js';

// Note: Run this with node --env-file=.env.local scripts/generate-llms.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const baseUrl = process.env.SITE_URL || SITE_URL;

export async function runGenerateLlms(outputDirectory) {
  let poems = [];
  let collections = [];
  let collectionPoems = [];

  if (!firebaseConfig.apiKey) {
    console.warn('⚠️  Aviso: Credenciais do Firebase ausentes. Gerando llms.txt com seções estáticas.');
  } else {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      console.log('Buscando poemas publicados no Firestore para llms.txt...');
      const poemsQuery = query(
        collection(db, 'poems'),
        where('status', '==', 'published'),
        orderBy('published_at', 'desc')
      );
      const poemSnapshot = await getDocs(poemsQuery);
      poems = poemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`Encontrados ${poems.length} poemas publicados.`);

      console.log('Buscando coleções no Firestore...');
      try {
        const colSnapshot = await getDocs(collection(db, 'collections'));
        collections = colSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(col => col.slug);
        console.log(`Encontradas ${collections.length} coleções.`);
      } catch (colErr) {
        console.warn('Aviso: Não foi possível obter coleções do Firestore:', colErr.message);
      }

      console.log('Buscando vínculos collection_poems no Firestore...');
      try {
        const cpSnapshot = await getDocs(collection(db, 'collection_poems'));
        collectionPoems = cpSnapshot.docs.map(doc => doc.data());
      } catch (cpErr) {
        console.warn('Aviso: Não foi possível obter vínculos collection_poems:', cpErr.message);
      }
    } catch (err) {
      // RNF04 & CA06: Se o Firestore falhar, o build não pode quebrar
      console.warn('⚠️  Aviso: Falha ao obter dados do Firestore para llms.txt (gerando arquivos com seções estáticas):', err.message);
    }
  }

  console.log('Gerando llms.txt e llms-full.txt...');
  const filesMap = buildAllLlmsFiles({
    baseUrl,
    poems,
    collections,
    collectionPoems
  });

  const targetDir = outputDirectory || path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const [filename, content] of Object.entries(filesMap)) {
    const filePath = path.join(targetDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    const sizeKb = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
    console.log(`✓ Gravou ${filename} (${sizeKb} KB) em ${filePath}`);
  }

  console.log(`Sucesso: Arquivos LLMs gerados em: ${targetDir}`);
}

if (process.argv[1] && process.argv[1].endsWith('generate-llms.js')) {
  const outDir = process.env.OUTPUT_DIR || path.resolve(process.cwd(), 'dist');
  runGenerateLlms(outDir)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Falha inesperada ao gerar llms:', err);
      // RNF04: Não falhar o build mesmo em erro imprevisto
      process.exit(0);
    });
}
