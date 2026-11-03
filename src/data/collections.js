/**
 * Curadoria Temática das Coleções de Poemas de Natanael Fernando Gatti Brentano.
 * Fornece metadados oficiais e mapeamento temático de 100% do acervo poético.
 */

export const curatedCollections = [
  {
    id: '75c966b1-bf90-464e-a6bd-fa00f1c6e81b',
    slug: 'amor-e-conexao',
    name: 'Amor e Conexão',
    description: 'Poemas que exploram os laços de afeto, os encontros, a cumplicidade e a profundidade do amor em suas diversas formas.',
    image_url: null
  },
  {
    id: '347e4b3a-4412-4216-9c18-53b30f2e7341',
    slug: 'reflexoes-e-tempo',
    name: 'Reflexões e Tempo',
    description: 'Uma jornada interna sobre a passagem do tempo, a vida, as escolhas e os sentimentos mais profundos da alma.',
    image_url: null
  },
  {
    id: 'col-alma-autoconhecimento',
    slug: 'alma-e-autoconhecimento',
    name: 'Alma e Autoconhecimento',
    description: 'Versos intimistas sobre a coragem de olhar para dentro, acolher as próprias sombras, curar feridas e descobrir a força do amor-próprio.',
    image_url: null
  },
  {
    id: '842bee02-88f5-4c32-8afb-d90aaab903d3',
    slug: 'paz-e-esperanca',
    name: 'Paz e Esperança',
    description: 'Versos que trazem calma, fé e a esperança em dias melhores, novos recomeços e equilíbrio espiritual.',
    image_url: null
  },
  {
    id: 'col-poesia-cotidiano',
    slug: 'poesia-e-cotidiano',
    name: 'Poesia e Cotidiano',
    description: 'Poemas sobre o ritmo dos dias, a magia oculta na simplicidade das coisas, a relação com as palavras e os paradoxos do mundo contemporâneo.',
    image_url: null
  },
  {
    id: '78fbee6f-7b5e-4c29-a4b9-f67f2ed78508',
    slug: 'familia-e-afeto',
    name: 'Família e Afeto',
    description: 'Uma homenagem àqueles que são nosso lar: a paternidade, a família, as alegrias diárias e a saudade de quem amamos.',
    image_url: null
  },
  {
    id: '6e130040-5d18-44b0-9478-6908ae4b29a4',
    slug: 'amor',
    name: 'Amor',
    description: 'Palavras essenciais e declarações poéticas sobre a arte de amar.',
    image_url: null
  }
];

export const poemCurationMap = {
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

  // Alma e Autoconhecimento (Nova coleção temática)
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

  // Poesia e Cotidiano (Nova coleção temática)
  'palavras': 'poesia-e-cotidiano',
  'entre-caos-e-rimas': 'poesia-e-cotidiano',
  'a-vida-e-mais': 'poesia-e-cotidiano',
  'calibragem': 'poesia-e-cotidiano',
  'tao-perto-mas-tao-distante': 'poesia-e-cotidiano',
  'simulacro': 'poesia-e-cotidiano',
  'trilha-sonora-do-agora': 'poesia-e-cotidiano',
  'caverna-de-sonhos': 'poesia-e-cotidiano',
  'labirinto-da-vida': 'poesia-e-cotidiano',

  // Amor e Conexão (Lírica romântica, cumplicidade e parceria)
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

/**
 * Mescla as coleções do Firestore com as coleções curadas,
 * garantindo que todas as 7 coleções existam com nomes e descrições poéticas.
 * @param {Array<object>} firestoreCols
 * @returns {Array<object>}
 */
export function enrichCollectionsWithCurated(firestoreCols = []) {
  const map = new Map();

  // Adiciona as curadas como base
  curatedCollections.forEach(c => map.set(c.slug, { ...c }));

  // Sobrescreve com dados do Firestore se já existirem (preservando IDs do Firestore)
  (firestoreCols || []).forEach(fc => {
    if (fc && fc.slug) {
      const existing = map.get(fc.slug) || {};
      map.set(fc.slug, {
        ...existing,
        ...fc,
        name: fc.name || existing.name,
        description: fc.description || existing.description,
        id: fc.id || existing.id
      });
    }
  });

  return Array.from(map.values());
}

/**
 * Enriquece e deduplica a lista de relações de collection_poems com a curadoria temática.
 * @param {Array<object>} firestoreRelations
 * @param {Array<object>} poems
 * @param {Array<object>} collections
 * @returns {Array<object>}
 */
export function mergeRelationsWithCurated(firestoreRelations = [], poems = [], collections = []) {
  const poemSlugToId = new Map((poems || []).map(p => [p.slug, p.id]));
  const colSlugToId = new Map((collections || []).map(c => [c.slug, c.id]));

  const pairSet = new Set();
  const result = [];

  // Adiciona as relações existentes deduplicadas
  (firestoreRelations || []).forEach(r => {
    if (r && r.collection_id && r.poem_id) {
      const key = `${r.collection_id}::${r.poem_id}`;
      if (!pairSet.has(key)) {
        pairSet.add(key);
        result.push(r);
      }
    }
  });

  // Adiciona as relações curadas para poemas órfãos
  for (const [poemSlug, colSlug] of Object.entries(poemCurationMap)) {
    const poemId = poemSlugToId.get(poemSlug);
    const colId = colSlugToId.get(colSlug);
    if (poemId && colId) {
      const key = `${colId}::${poemId}`;
      if (!pairSet.has(key)) {
        pairSet.add(key);
        result.push({ collection_id: colId, poem_id: poemId });
      }
    }
  }

  return result;
}
