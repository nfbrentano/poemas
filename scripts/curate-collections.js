import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, query, where, writeBatch } from 'firebase/firestore';

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

export const NEW_COLLECTIONS = [
  {
    id: 'col-alma-autoconhecimento',
    slug: 'alma-e-autoconhecimento',
    name: 'Alma e Autoconhecimento',
    description: 'Versos intimistas sobre a coragem de olhar para dentro, acolher as próprias sombras, curar feridas e descobrir a força do amor-próprio.',
    image_url: null
  },
  {
    id: 'col-poesia-cotidiano',
    slug: 'poesia-e-cotidiano',
    name: 'Poesia e Cotidiano',
    description: 'Poemas sobre o ritmo dos dias, a magia oculta na simplicidade das coisas, a relação com as palavras e os paradoxos do mundo contemporâneo.',
    image_url: null
  }
];

export const POEM_CURATION_MAP = {
  // Família e Afeto
  'coracao-de-pai': 'familia-e-afeto',
  'para-minha-filha': 'familia-e-afeto',
  'coracao-emocionado': 'familia-e-afeto',
  'dia-das-maes': 'familia-e-afeto',

  // Paz e Esperança
  'renovado-recarregado': 'paz-e-esperanca',
  'a-transicao-para-a-calmaria': 'paz-e-esperanca',
  'branco': 'paz-e-esperanca',
  'ciclos-de-luz': 'paz-e-esperanca',
  'resiliencia': 'paz-e-esperanca',

  // Reflexões e Tempo
  'o-que-cabe-no-tempo': 'reflexoes-e-tempo',
  'entardecer': 'reflexoes-e-tempo',
  'insonia-e-escolhas': 'reflexoes-e-tempo',
  'so-viajo-na-mente': 'reflexoes-e-tempo',

  // Alma e Autoconhecimento (Nova coleção)
  'a-essencia-do-eu': 'alma-e-autoconhecimento',
  'o-mago-de-si-mesmo': 'alma-e-autoconhecimento',
  'amar-se': 'alma-e-autoconhecimento',
  'refatoracao-interna': 'alma-e-autoconhecimento',
  'portas-internas': 'alma-e-autoconhecimento',
  'espelho-da-alma': 'alma-e-autoconhecimento',
  'lado-escuro-da-alma': 'alma-e-autoconhecimento',
  'vazio': 'alma-e-autoconhecimento',
  'refugio': 'alma-e-autoconhecimento',
  'sanidade-enfim': 'alma-e-autoconhecimento',
  'ponto-de-inflexao': 'alma-e-autoconhecimento',
  'a-voz-do-silencio': 'alma-e-autoconhecimento',
  'mares-internas': 'alma-e-autoconhecimento',
  'penhasco-de-sentimentos': 'alma-e-autoconhecimento',
  'inerente': 'alma-e-autoconhecimento',

  // Poesia e Cotidiano (Nova coleção)
  'palavras': 'poesia-e-cotidiano',
  'entre-caos-e-rimas': 'poesia-e-cotidiano',
  'a-vida-e-mais': 'poesia-e-cotidiano',
  'calibragem': 'poesia-e-cotidiano',
  'tao-perto-mas-tao-distante': 'poesia-e-cotidiano',
  'simulacro': 'poesia-e-cotidiano',
  'trilha-sonora-do-agora': 'poesia-e-cotidiano',
  'caverna-de-sonhos': 'poesia-e-cotidiano',
  'labirinto-da-vida': 'poesia-e-cotidiano',

  // Amor e Conexão (Obras líricas, cumplicidade e afeto romântico)
  'o-abraco': 'amor-e-conexao',
  'apaixonidade': 'amor-e-conexao',
  'eu-livro-aberto': 'amor-e-conexao',
  'particularidades': 'amor-e-conexao',
  'habitar-em-mim': 'amor-e-conexao',
  'conexao-incomum': 'amor-e-conexao',
  'vem-a-vida': 'amor-e-conexao',
  'partilhar': 'amor-e-conexao',
  'ser-porto': 'amor-e-conexao',
  'existencia': 'amor-e-conexao',
  'colors': 'amor-e-conexao',
  'simples-pra-quem-ve': 'amor-e-conexao',
  'juras': 'amor-e-conexao',
  'vontade-de-existir': 'amor-e-conexao',
  'amor-desnudo': 'amor-e-conexao',
  'leveza-do-sentir': 'amor-e-conexao',
  'entre-linhas-e-abracos': 'amor-e-conexao',
  'natural': 'amor-e-conexao',
  'o-amor-ainda-e-tudo': 'amor-e-conexao',
  'sintonia-em-ti': 'amor-e-conexao',
  'amor-e-poesia': 'amor-e-conexao',
  'melodia-da-vida': 'amor-e-conexao',
  'reflexos-de-luz': 'amor-e-conexao',
  'fazer-parte': 'amor-e-conexao',
  'em-admiracao': 'amor-e-conexao',
  'contemplacao': 'amor-e-conexao',
  'sol-de-nos-dois': 'amor-e-conexao',
  'com-voce': 'amor-e-conexao',
  'amanhecer-em-nos': 'amor-e-conexao',
  'dois-coracoes': 'amor-e-conexao',
  'toque-no-coracao': 'amor-e-conexao',
  'encontro-de-almas': 'amor-e-conexao',
  'seu-par': 'amor-e-conexao',
  'raro-e-surreal': 'amor-e-conexao',
  'sois-a-contemplar': 'amor-e-conexao',
  'print-de-um-sentimento': 'amor-e-conexao',
  'lugar-de-existir': 'amor-e-conexao',
  'amor-em-atos': 'amor-e-conexao'
};

export async function runCurateCollections({ dryRun = false } = {}) {
  console.log(`[Curate] Iniciando curadoria temática... (dryRun: ${dryRun})`);

  // 1. Carrega todas as coleções do Firestore
  const colsSnap = await getDocs(collection(db, 'collections'));
  const existingCols = colsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const colSlugToId = new Map(existingCols.map(c => [c.slug, c.id]));

  console.log(`[Curate] Coleções existentes no Firestore: ${existingCols.length}`);
  existingCols.forEach(c => console.log(`  - ${c.name} (${c.slug}) [${c.id}]`));

  // 2. Garante que as novas coleções existam
  for (const nc of NEW_COLLECTIONS) {
    if (!colSlugToId.has(nc.slug)) {
      console.log(`[Curate] Criando nova coleção: ${nc.name} (${nc.slug})...`);
      if (!dryRun) {
        const payload = {
          id: nc.id,
          name: nc.name,
          slug: nc.slug,
          description: nc.description,
          image_url: nc.image_url,
          created_at: new Date().toISOString()
        };
        await setDoc(doc(db, 'collections', nc.id), payload);
      }
      colSlugToId.set(nc.slug, nc.id);
    } else {
      console.log(`[Curate] Coleção ${nc.name} já existe no Firestore com id: ${colSlugToId.get(nc.slug)}`);
    }
  }

  // 3. Carrega todos os poemas publicados
  const pubQ = query(collection(db, 'poems'), where('status', '==', 'published'));
  const pubSnap = await getDocs(pubQ);
  const publishedPoems = pubSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const poemSlugToPoem = new Map(publishedPoems.map(p => [p.slug, p]));

  console.log(`[Curate] Poemas publicados no Firestore: ${publishedPoems.length}`);

  // 4. Carrega relações existentes em collection_poems
  const cpSnap = await getDocs(collection(db, 'collection_poems'));
  const existingPairs = new Set(
    cpSnap.docs.map(d => `${d.data().collection_id}::${d.data().poem_id}`)
  );
  console.log(`[Curate] Relações existentes: ${existingPairs.size}`);

  // 5. Mapeia e planeja novas relações
  const toInsert = [];
  let skipped = 0;
  let notFound = 0;

  for (const [poemSlug, targetColSlug] of Object.entries(POEM_CURATION_MAP)) {
    const poem = poemSlugToPoem.get(poemSlug);
    const colId = colSlugToId.get(targetColSlug);

    if (!poem) {
      console.warn(`[Curate] AVISO: Poema com slug "${poemSlug}" não foi encontrado nos poemas publicados.`);
      notFound++;
      continue;
    }
    if (!colId) {
      console.warn(`[Curate] AVISO: Coleção com slug "${targetColSlug}" não encontrada.`);
      continue;
    }

    const pairKey = `${colId}::${poem.id}`;
    if (existingPairs.has(pairKey)) {
      skipped++;
    } else {
      toInsert.push({
        collection_id: colId,
        poem_id: poem.id,
        poem_title: poem.title,
        col_slug: targetColSlug
      });
      existingPairs.add(pairKey); // Evita duplicar no mesmo lote
    }
  }

  console.log(`[Curate] Resumo do planejamento:`);
  console.log(`  - Novos vínculos a inserir: ${toInsert.length}`);
  console.log(`  - Vínculos já existentes (ignorados): ${skipped}`);
  console.log(`  - Slugs não encontrados: ${notFound}`);

  if (dryRun) {
    console.log('[Curate] Modo dryRun ativo. Nenhuma alteração gravada.');
    return { inserted: toInsert.length, dryRun: true };
  }

  // 6. Insere em batches de até 400
  const batchSize = 400;
  for (let i = 0; i < toInsert.length; i += batchSize) {
    const chunk = toInsert.slice(i, i + batchSize);
    const batch = writeBatch(db);
    chunk.forEach(item => {
      const newRef = doc(collection(db, 'collection_poems'));
      batch.set(newRef, {
        collection_id: item.collection_id,
        poem_id: item.poem_id
      });
    });
    await batch.commit();
    console.log(`[Curate] Gravados ${Math.min(i + batchSize, toInsert.length)} de ${toInsert.length} vínculos...`);
  }

  console.log('[Curate] Curadoria temática concluída com sucesso!');
  return { inserted: toInsert.length, dryRun: false };
}

if (process.argv[1] && process.argv[1].endsWith('curate-collections.js')) {
  const isDryRun = process.argv.includes('--dry-run');
  runCurateCollections({ dryRun: isDryRun })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Curate] Erro na execução:', err);
      process.exit(1);
    });
}
