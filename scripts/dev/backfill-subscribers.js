import crypto from 'crypto';
import { fileURLToPath } from 'url';

/**
 * Normaliza os campos obrigatórios de um assinante no Firestore.
 * Se o assinante não tiver 'active', define como true.
 * Se não tiver 'unsubscribe_token', gera um UUID criptográfico v4.
 * Se não tiver 'created_at', define a data atual em ISO.
 *
 * @param {Object} docData Dados atuais do assinante
 * @param {Object} [options]
 * @param {Function} [options.generateToken] Função geradora de token para testes
 * @param {string} [options.nowIso] Data ISO para testes
 * @returns {{ needsUpdate: boolean, updatedData: Object }}
 */
export function normalizeSubscriberDoc(docData = {}, options = {}) {
  const tokenGen = options.generateToken || (() => crypto.randomUUID());
  const nowIso = options.nowIso || new Date().toISOString();

  let needsUpdate = false;
  const updatedData = {};

  if (docData.active === undefined || docData.active === null) {
    updatedData.active = true;
    needsUpdate = true;
  }

  if (!docData.unsubscribe_token || typeof docData.unsubscribe_token !== 'string' || !docData.unsubscribe_token.trim()) {
    updatedData.unsubscribe_token = tokenGen();
    needsUpdate = true;
  }

  if (!docData.created_at) {
    updatedData.created_at = nowIso;
    needsUpdate = true;
  }

  return {
    needsUpdate,
    updatedData
  };
}

/**
 * Executa a migração/normalização de assinantes no Firestore.
 *
 * @param {Object} params
 * @param {Object} params.db Instância do Firestore
 * @param {Function} [params.collectionFn]
 * @param {Function} [params.getDocsFn]
 * @param {Function} [params.docFn]
 * @param {Function} [params.updateDocFn]
 * @param {Function} [params.log]
 * @param {Function} [params.errorLog]
 * @returns {Promise<{ totalCount: number, updatedCount: number, skippedCount: number, errors: Array }>}
 */
export async function runBackfillSubscribers({
  db,
  collectionFn,
  getDocsFn,
  docFn,
  updateDocFn,
  log = console.log,
  errorLog = console.error
} = {}) {
  let cFn = collectionFn;
  let gDocs = getDocsFn;
  let dFn = docFn;
  let uDoc = updateDocFn;

  if (!cFn || !gDocs || !dFn || !uDoc) {
    const firestore = await import('firebase/firestore');
    cFn = cFn || firestore.collection;
    gDocs = gDocs || firestore.getDocs;
    dFn = dFn || firestore.doc;
    uDoc = uDoc || firestore.updateDoc;
  }

  log('[Backfill Subscribers] Iniciando varredura da coleção subscribers...');

  const snapshot = await gDocs(cFn(db, 'subscribers'));
  const totalCount = snapshot.docs ? snapshot.docs.length : (snapshot.size || 0);

  let updatedCount = 0;
  let skippedCount = 0;
  const errors = [];

  const docs = snapshot.docs || [];
  for (const docSnap of docs) {
    const docData = docSnap.data();
    const docId = docSnap.id;

    const { needsUpdate, updatedData } = normalizeSubscriberDoc(docData);

    if (needsUpdate) {
      try {
        const ref = dFn(db, 'subscribers', docId);
        await uDoc(ref, updatedData);
        updatedCount++;
        log(`✓ Assinante atualizado: ${docId} -> ${JSON.stringify(updatedData)}`);
      } catch (err) {
        errorLog(`✗ Falha ao atualizar assinante ${docId}:`, err.message);
        errors.push({ id: docId, error: err.message });
      }
    } else {
      skippedCount++;
    }
  }

  log(`[Backfill Subscribers] Concluído. Total: ${totalCount}, Atualizados: ${updatedCount}, Já normalizados: ${skippedCount}, Erros: ${errors.length}.`);

  return {
    totalCount,
    updatedCount,
    skippedCount,
    errors
  };
}

async function main() {
  const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
  };

  const adminEmail = process.env.FIREBASE_ADMIN_EMAIL;
  const adminPassword = process.env.FIREBASE_ADMIN_PASSWORD;

  if (!firebaseConfig.apiKey) {
    console.error('[Backfill Subscribers] VITE_FIREBASE_API_KEY ausente.');
    process.exit(1);
  }

  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  if (adminEmail && adminPassword) {
    console.log(`[Backfill Subscribers] Autenticando admin (${adminEmail})...`);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  }

  await runBackfillSubscribers({ db });
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  main().catch(err => {
    console.error('[Backfill Subscribers] Erro fatal:', err);
    process.exit(1);
  });
}
