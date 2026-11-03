import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function dedupeCollectionPoems({ dryRun = false } = {}) {
  console.log(`[Dedupe] Buscando relações de collection_poems no Firestore... (dryRun: ${dryRun})`);
  const snapshot = await getDocs(collection(db, 'collection_poems'));
  const docs = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
  console.log(`[Dedupe] Total de documentos encontrados: ${docs.length}`);

  const uniqueMap = new Map();
  const toDelete = [];

  docs.forEach(d => {
    const key = `${d.collection_id}::${d.poem_id}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, d.docId);
    } else {
      toDelete.push(d.docId);
    }
  });

  console.log(`[Dedupe] Pares únicos a preservar: ${uniqueMap.size}`);
  console.log(`[Dedupe] Documentos duplicados a remover: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('[Dedupe] Nenhuma duplicata encontrada. Tudo limpo!');
    return { preserved: uniqueMap.size, deleted: 0 };
  }

  if (dryRun) {
    console.log('[Dedupe] Modo dryRun ativo. Nenhuma alteração gravada.');
    return { preserved: uniqueMap.size, deleted: toDelete.length, dryRun: true };
  }

  // Firestore batch write suporta até 500 operações por batch
  const batchSize = 400;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const chunk = toDelete.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach(docId => {
      batch.delete(doc(db, 'collection_poems', docId));
    });
    await batch.commit();
    console.log(`[Dedupe] Removidos ${Math.min(i + batchSize, toDelete.length)} de ${toDelete.length} duplicados...`);
  }

  console.log('[Dedupe] Limpeza de duplicatas concluída com sucesso!');
  return { preserved: uniqueMap.size, deleted: toDelete.length };
}

if (process.argv[1] && process.argv[1].endsWith('dedupe-collection-poems.js')) {
  const isDryRun = process.argv.includes('--dry-run');
  dedupeCollectionPoems({ dryRun: isDryRun })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Dedupe] Erro na execução:', err);
      process.exit(1);
    });
}
