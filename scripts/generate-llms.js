import fs from 'fs';
import path from 'path';
import { buildAllLlmsFiles, SITE_URL } from '../src/utils/llms-builder.js';
import { enrichCollectionsWithCurated, mergeRelationsWithCurated } from '../src/data/collections.js';
import { loadFallbackPoems } from './fallback-data.js';
import { loadMostReadForBuild } from './most-read-loader.js';
import {
  getFirebaseConfig,
  installFirebaseNodeReferer,
  patchFirebaseAuthReferer,
  readBuildDataCache,
  writeBuildDataCache
} from './build-data-cache.js';

// Note: Run this with node --env-file=.env.local scripts/generate-llms.js
const baseUrl = process.env.SITE_URL || SITE_URL;

export async function runGenerateLlms(outputDirectory, options = {}) {
  let poems = [];
  let collections = [];
  let collectionPoems = [];
  let mostReadPoems = [];
  const firebaseConfig = getFirebaseConfig();

  if (!firebaseConfig.apiKey) {
    console.warn('⚠️  Aviso: Credenciais do Firebase ausentes. Usando poemas locais de fallback.');
    poems = loadFallbackPoems();
    collections = enrichCollectionsWithCurated([]);
    collectionPoems = mergeRelationsWithCurated([], poems, collections);
  } else {
    try {
      installFirebaseNodeReferer();
      const cached = readBuildDataCache(options.cacheOptions);
      const hasCachedCollections = cached && Array.isArray(cached.rawCollections) && Array.isArray(cached.rawCollectionPoems);

      if (cached && Array.isArray(cached.poems) && cached.poems.length > 0 && hasCachedCollections) {
        console.log('[LLMs] Reutilizando poemas e coleções do cache compartilhado de build.');
        poems = cached.poems.map(p => ({ ...p }));
        collections = enrichCollectionsWithCurated(cached.rawCollections);
        collectionPoems = mergeRelationsWithCurated(cached.rawCollectionPoems, poems, collections);

        if (Array.isArray(cached.mostReadPoems)) {
          mostReadPoems = cached.mostReadPoems;
        } else {
          try {
            const { initializeApp } = await import('firebase/app');
            const { getFirestore } = await import('firebase/firestore');
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            let auth = null;
            if (process.env.FIREBASE_ADMIN_EMAIL && process.env.FIREBASE_ADMIN_PASSWORD) {
              const { getAuth } = await import('firebase/auth');
              auth = patchFirebaseAuthReferer(getAuth(app));
            }
            mostReadPoems = await loadMostReadForBuild({ db, auth, poems });
            writeBuildDataCache({ mostReadPoems }, options.cacheOptions);
          } catch (mrErr) {
            console.warn('Aviso: Falha ao carregar poemas em destaque para llms.txt:', mrErr.message);
          }
        }
      } else {
        const { initializeApp } = await import('firebase/app');
        const { getFirestore, collection, getDocs, query, where, orderBy } = await import('firebase/firestore');
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
        const hasFirestorePoems = poems.length > 0;

        let rawCollections = [];
        let rawCp = [];
        let collectionsLoaded = false;
        let cpLoaded = false;

        console.log('Buscando coleções no Firestore...');
        try {
          const colSnapshot = await getDocs(collection(db, 'collections'));
          rawCollections = colSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(col => col.slug);
          collectionsLoaded = true;
          collections = enrichCollectionsWithCurated(rawCollections);
          console.log(`Encontradas ${collections.length} coleções.`);
        } catch (colErr) {
          console.warn('Aviso: Não foi possível obter coleções do Firestore:', colErr.message);
          collections = enrichCollectionsWithCurated([]);
        }

        console.log('Buscando vínculos collection_poems no Firestore...');
        try {
          const cpSnapshot = await getDocs(collection(db, 'collection_poems'));
          rawCp = cpSnapshot.docs.map(doc => doc.data());
          cpLoaded = true;
          collectionPoems = mergeRelationsWithCurated(rawCp, poems, collections);
        } catch (cpErr) {
          console.warn('Aviso: Não foi possível obter vínculos collection_poems:', cpErr.message);
          collectionPoems = mergeRelationsWithCurated([], poems, collections);
        }
        if (!hasFirestorePoems) {
          console.warn('[LLMs] Nenhum poema obtido do Firestore (modo offline/sandbox). Usando fallback local.');
          poems = loadFallbackPoems();
          collections = enrichCollectionsWithCurated(collections.length ? collections : []);
          collectionPoems = mergeRelationsWithCurated([], poems, collections);
        } else {
          try {
            let auth = null;
            if (process.env.FIREBASE_ADMIN_EMAIL && process.env.FIREBASE_ADMIN_PASSWORD) {
              const { getAuth } = await import('firebase/auth');
              auth = patchFirebaseAuthReferer(getAuth(app));
            }
            mostReadPoems = await loadMostReadForBuild({ db, auth, poems });
          } catch (mrErr) {
            console.warn('Aviso: Falha ao carregar poemas em destaque para llms.txt:', mrErr.message);
          }

          const cachePayload = { poems, mostReadPoems };
          if (collectionsLoaded) cachePayload.rawCollections = rawCollections;
          if (cpLoaded) cachePayload.rawCollectionPoems = rawCp;
          writeBuildDataCache(cachePayload, options.cacheOptions);
        }
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
    collectionPoems,
    mostReadPoems
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
