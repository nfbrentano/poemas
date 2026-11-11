import fs from 'fs';
import { fileURLToPath } from 'url';
import { reportError } from '../src/utils/error-reporter.js';

/**
 * Filtra poemas com status 'scheduled' que já passaram da data/hora agendada.
 *
 * @param {Array<Object>} poems
 * @param {Date|string|number} [now=new Date()]
 * @returns {Array<Object>}
 */
export function getDueScheduledPoems(poems, now = new Date()) {
  if (!Array.isArray(poems)) return [];
  const nowMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
  if (isNaN(nowMs)) return [];

  return poems.filter(poem => {
    if (!poem || poem.status !== 'scheduled' || !poem.scheduled_at) return false;
    const scheduledMs = new Date(poem.scheduled_at).getTime();
    return !isNaN(scheduledMs) && scheduledMs <= nowMs;
  });
}

/**
 * Prepara o payload para atualizar um poema agendado para publicado.
 * RF02: Preserva o horário originalmente agendado como `published_at`,
 * atualiza `updated_at` com o instante da execução e define `status: 'published'`.
 *
 * @param {Object} poem
 * @param {Date|string|number} [now=new Date()]
 * @returns {Object}
 */
export function preparePromotionPayload(poem, now = new Date()) {
  const nowDate = now instanceof Date ? now : new Date(now);
  const nowIso = !isNaN(nowDate.getTime()) ? nowDate.toISOString() : new Date().toISOString();

  return {
    status: 'published',
    published_at: poem.scheduled_at || nowIso,
    updated_at: nowIso
  };
}

/**
 * Executa a verificação e promoção de poemas agendados no Firestore.
 *
 * @param {Object} options
 * @param {Object} options.db Instância do Firestore
 * @param {Function} [options.getDocsFn] Opcional para injeção em testes
 * @param {Function} [options.updateDocFn] Opcional para injeção em testes
 * @param {Function} [options.queryFn] Opcional para injeção em testes
 * @param {Function} [options.collectionFn] Opcional para injeção em testes
 * @param {Function} [options.whereFn] Opcional para injeção em testes
 * @param {Function} [options.docFn] Opcional para injeção em testes
 * @param {Date} [options.now=new Date()] Data de referência
 * @param {Function} [options.log=console.log] Função de log
 * @param {Function} [options.errorLog=console.error] Função de log de erro
 * @returns {Promise<{ publishedCount: number, publishedPoems: Array<Object>, errors: Array<Object> }>}
 */
export async function publishDuePoems({
  db,
  getDocsFn,
  updateDocFn,
  addDocFn,
  queryFn,
  collectionFn,
  whereFn,
  docFn,
  reportErrorFn = reportError,
  now = new Date(),
  log = console.log,
  errorLog = console.error
}) {
  let gDocs = getDocsFn;
  let uDoc = updateDocFn;
  let aDoc = addDocFn;
  let qFn = queryFn;
  let cFn = collectionFn;
  let wFn = whereFn;
  let dFn = docFn;

  if (!gDocs || !uDoc || !qFn || !cFn || !wFn || !dFn) {
    const firestore = await import('firebase/firestore');
    gDocs = gDocs || firestore.getDocs;
    uDoc = uDoc || firestore.updateDoc;
    aDoc = aDoc || firestore.addDoc;
    qFn = qFn || firestore.query;
    cFn = cFn || firestore.collection;
    wFn = wFn || firestore.where;
    dFn = dFn || firestore.doc;
  }

  log(`[Publish Scheduled] Verificando poemas agendados até ${now.toISOString()}...`);

  let snapshot;
  try {
    const scheduledQuery = qFn(cFn(db, 'poems'), wFn('status', '==', 'scheduled'));
    snapshot = await gDocs(scheduledQuery);
  } catch (err) {
    errorLog('[Publish Scheduled] Erro ao consultar poemas agendados no Firestore:', err.message);
    await reportErrorFn(err, {
      source: 'backend:scripts',
      category: 'script',
      severity: 'error',
      route_or_task: 'scripts/publish-scheduled-poems.js',
      user_agent: 'node-script/publish-scheduled-poems',
      context: { phase: 'query' },
      dbInstance: db,
      addDocFn: aDoc,
      collectionFn: cFn,
      skipSessionLimits: true
    });
    return { publishedCount: 0, publishedPoems: [], errors: [{ phase: 'query', error: err.message }] };
  }

  const allScheduled = [];
  snapshot.forEach(docSnap => {
    allScheduled.push({ id: docSnap.id, ...docSnap.data() });
  });

  const duePoems = getDueScheduledPoems(allScheduled, now);

  if (duePoems.length === 0) {
    log(`[Publish Scheduled] Nenhum poema agendado com data vencida (total agendados: ${allScheduled.length}).`);
    return { publishedCount: 0, publishedPoems: [], errors: [] };
  }

  log(`[Publish Scheduled] Encontrados ${duePoems.length} poema(s) para publicar.`);

  const publishedPoems = [];
  const errors = [];

  for (const poem of duePoems) {
    const payload = preparePromotionPayload(poem, now);
    try {
      const docRef = dFn(db, 'poems', poem.id);
      await uDoc(docRef, payload);
      publishedPoems.push({ id: poem.id, title: poem.title, slug: poem.slug, published_at: payload.published_at });
      log(`✓ [Publish Scheduled] Publicado: "${poem.title}" (${poem.slug}) com published_at = ${payload.published_at}`);
    } catch (err) {
      errorLog(`✗ [Publish Scheduled] Falha ao publicar "${poem.title}" (${poem.id}):`, err.message);
      errors.push({ id: poem.id, title: poem.title, error: err.message });
      await reportErrorFn(err, {
        source: 'backend:scripts',
        category: 'script',
        severity: 'error',
        route_or_task: 'scripts/publish-scheduled-poems.js',
        user_agent: 'node-script/publish-scheduled-poems',
        context: { phase: 'update', poemId: poem.id, slug: poem.slug },
        dbInstance: db,
        addDocFn: aDoc,
        collectionFn: cFn,
        skipSessionLimits: true
      });
    }
  }

  log(`[Publish Scheduled] Concluído: ${publishedPoems.length} publicado(s), ${errors.length} erro(s).`);

  return {
    publishedCount: publishedPoems.length,
    publishedPoems,
    errors
  };
}

/**
 * Função executada via linha de comando no GitHub Actions ou localmente.
 */
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
    console.warn('[Publish Scheduled] VITE_FIREBASE_API_KEY ausente. Modo offline / simulação.');
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, 'published_count=0\n');
    }
    return;
  }

  const { initializeApp } = await import('firebase/app');
  const { getFirestore } = await import('firebase/firestore');
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  if (adminEmail && adminPassword) {
    console.log(`[Publish Scheduled] Autenticando como admin (${adminEmail})...`);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('[Publish Scheduled] Autenticado com sucesso.');
  } else {
    console.warn('[Publish Scheduled] Aviso: FIREBASE_ADMIN_EMAIL ou FIREBASE_ADMIN_PASSWORD ausentes. Tentando sem auth...');
  }

  const result = await publishDuePoems({ db });

  // Sinaliza quantidade para o GitHub Actions Workflow
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `published_count=${result.publishedCount}\n`);
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  main().catch(err => {
    console.error('[Publish Scheduled] Erro fatal:', err);
    process.exit(1);
  });
}
