# [FEAT] Curadoria Temática: Criação de Novas Coleções e Vinculação Integral do Acervo Poético

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-03 · **Atualizada em:** 2026-11-03

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Realizar uma curadoria temática de 100% dos 239 poemas publicados no acervo poético de Natanael Fernando Gatti Brentano.
  2. Associar os 75 poemas atualmente sem nenhuma coleção temática (órfãos) às coleções existentes adequadas e a novas coleções temáticas especializadas.
  3. Criar duas novas coleções temáticas coesas e expressivas no Firestore e na estrutura estática:
     - **"Alma e Autoconhecimento"** (`alma-e-autoconhecimento`): antologia focada no mergulho interior, amor-próprio, resiliência emocional, insônias, sombras e silêncio.
     - **"Poesia e Cotidiano"** (`poesia-e-cotidiano`): versos sobre a arte do dizer poético, a beleza das coisas simples, o olhar atento sobre o dia a dia e os paradoxos do mundo moderno e digital.
  4. Expandir as coleções existentes com os poemas afins identificados:
     - **"Família e Afeto"** (`familia-e-afeto`): incluir as obras paternas e familiares (`Coração de Pai`, `Para Minha Filha`, `Coração Emocionado`, `Dia das Mães`).
     - **"Paz e Esperança"** (`paz-e-esperanca`): incluir obras de renovação espiritual e calmaria (`Renovado, recarregado`, `A Transição para a Calmaria`, `Branco`, `Ciclos de Luz`, `Resiliência`).
     - **"Amor e Conexão"** (`amor-e-conexao`) e **"Amor"** (`amor`): vincular as obras de encontro romântico, cumplicidade e dedicatórias poéticas.
     - **"Reflexões e Tempo"** (`reflexoes-e-tempo`): integrar obras sobre a temporalidade, entardeceres e escolhas de vida (`O Que Cabe no Tempo`, `Entardecer`, `Insônia e Escolhas`).
  5. Atualizar os scripts de pré-renderização estática ([`prerender.js`](../scripts/prerender.js)), sitemaps ([`generate-sitemap.js`](../scripts/generate-sitemap.js)), feeds LLMs ([`generate-llms.js`](../scripts/generate-llms.js)) e páginas públicas para refletir a nova catalogação.

- **Problema e evidência:**
  - Análise dos dados do Firestore revelou que, dos **239 poemas publicados**, **75 poemas (31,4% do acervo)** não possuem vínculo com nenhuma coleção temática.
  - Obras fundamentais da poética do autor (como poemas dedicados à filha, reflexões profundas sobre amor-próprio e desabafos sobre o mundo virtual) ficavam invisíveis para quem navegava a partir da seção `/colecoes/`.
  - As coleções existentes deixavam lacunas conceituais: não havia um espaço formal para os poemas puramente introspectivos (autoconhecimento/mente) nem para a metapoesia e crônicas poéticas do cotidiano.

- **Impacto de não fazer:**
  - Mais de um terço do acervo do autor continuará sem categorização temática por coleção.
  - Menor descoberta de conteúdo pelos leitores e menor aproveitamento da malha de links internos para SEO e inteligência artificial (LLMs/GEO).

- **Para quem é destinado:**
  - Leitores do site que buscam poesias por afinidade de temas, o autor Natanael Fernando Gatti Brentano na gestão do acervo, e robôs de busca e IA (Googlebot, Bingbot, IndexNow, llms.txt).

- **História de usuário:**
  - Como leitor de poesia brasileira contemporânea, quero explorar coleções temáticas completas e bem curadas no site (incluindo temas de autoconhecimento, cotidiano, família, amor e reflexão), para que eu possa encontrar versos que conversem diretamente com meu estado de espírito e momento de vida.

- **Como saberemos que deu certo:**
  - 100% dos 239 poemas publicados passam a pertencer a pelo menos 1 coleção temática.
  - Zero poemas órfãos no acervo.
  - As duas novas coleções ("Alma e Autoconhecimento" e "Poesia e Cotidiano") passam a existir com slugs limpos, rotas pré-renderizadas (`/colecao/alma-e-autoconhecimento/` e `/colecao/poesia-e-cotidiano/`), meta tags SEO e cartões na página `/colecoes/`.
  - Suíte completa de testes no Vitest e `npm run build` executam com 100% de sucesso.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Criar as coleções temáticas "Alma e Autoconhecimento" e "Poesia e Cotidiano" com slug, nome e descrição curada. | P0 | CA01, CA02 |
| RF02 | Mapear e associar todos os 75 poemas órfãos às coleções correspondentes, garantindo 100% de cobertura do acervo. | P0 | CA03 |
| RF03 | Manter unicidade relacional em `collection_poems`, evitando duplicatas no banco de dados. | P0 | CA04 |
| RF04 | Atualizar os sitemaps de coleções (`sitemap-colecoes.xml`), `llms.txt`, `dist/routes.json` e a pré-renderização estática das novas páginas. | P0 | CA05 |
| RF05 | Exibir as novas coleções no grid de `/colecoes/` e no painel administrativo `/admin?view=collections`. | P0 | CA01, CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Performance: todas as páginas de novas coleções devem ser 100% pré-renderizadas estaticamente em HTML no build. | P0 | CA05 |
| RNF02 | Consistência de contadores: os números exibidos nas páginas e no admin devem bater exatamente com os poemas vinculados. | P0 | CA03, CA06 |
| RNF03 | Idempotência: o script de migração/associação de poemas deve poder ser executado múltiplas vezes sem criar duplicatas. | P0 | CA04 |

### Dependências técnicas

- Firestore Collections: `collections`, `collection_poems`, `poems`.
- Scripts de build: `scripts/prerender.js`, `scripts/generate-sitemap.js`, `scripts/generate-llms.js`.
- Componentes e páginas: `src/pages/collections.js`, `src/pages/collection.js`, `src/utils/collections-template.js`, `src/utils/collection-template.js`.

### Recursos necessários

- Acesso ao Firestore em modo leitura e gravação autenticada para atualização das coleções e vínculos.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que o usuário acessa `/colecoes/`, quando a página carrega, então ele visualiza no grid de Séries em Destaque as 7 coleções temáticas disponíveis, incluindo "Alma e Autoconhecimento" e "Poesia e Cotidiano", cada uma com nome, descrição poética e contador de poemas.
- [ ] **CA02:** Dado que o usuário navega para `/colecao/alma-e-autoconhecimento/` ou `/colecao/poesia-e-cotidiano/`, quando a página é aberta, então o leitor encontra os poemas selecionados para essa temática com título, excerto e ano, com navegação breadcrumb funcional e meta tags SEO/Open Graph completas.
- [ ] **CA03:** Dado o acervo total de 239 poemas publicados, quando a checagem de cobertura é realizada, então o número de poemas publicados sem coleção é igual a 0 (zero).
- [ ] **CA04:** Dado o registro de vínculos em `collection_poems`, quando as novas associações são inseridas, então não deve haver nenhum par `(collection_id, poem_id)` duplicado no banco de dados.
- [ ] **CA05:** Dado que o build estático (`npm run build`) é executado, quando a geração termina, então os arquivos `dist/colecao/alma-e-autoconhecimento/index.html` e `dist/colecao/poesia-e-cotidiano/index.html` existem, estão listados em `dist/sitemap-colecoes.xml` e no `dist/llms.txt`.
- [ ] **CA06:** Dado que o autor acessa o painel `/admin?view=collections`, quando a listagem de coleções é renderizada, então as novas coleções aparecem listadas com a quantidade exata de obras vinculadas e prontas para edição.

## O que a atividade não inclui

- Exclusão ou alteração de títulos e conteúdos dos poemas já publicados.
- Modificação das coleções já consolidadas ("Amor e Conexão", "Reflexões e Tempo", "Paz e Esperança", "Família e Afeto", "Amor").

### Considerado para o futuro (P2)

- Criação de capas ilustradas personalizadas (`image_url`) para cada uma das coleções temáticas.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Um mesmo poema pode pertencer a mais de uma coleção temática se tiver forte aderência a ambas? | Autor/Dev | Não | Sim, a modelagem N:N via `collection_poems` suporta que uma obra pertença a mais de uma coleção (ex: um poema que seja ao mesmo tempo de "Amor" e "Família"). |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Cobertura total do acervo poético por coleções | Integração/Unit | CA03 | Comparar todos os poemas publicados com as relações de `collection_poems` | 0 poemas publicados órfãos de coleção |
| CT02 | Presença e links das novas coleções em `/colecoes/` | Unit | CA01 | Renderizar `renderCollectionsPageMarkup` com as 7 coleções | Exibe cards com links para as 7 coleções com dados corretos |
| CT03 | Pré-renderização e metadados das novas coleções | E2E/Build | CA02, CA05 | Executar `npm run build` e inspecionar os arquivos gerados em `dist/colecao/` | Arquivos HTML estáticos válidos com canonical e Open Graph |
| CT04 | Ausência de duplicatas em `collection_poems` | Unit | CA04 | Verificar mapa de chaves de `collection_poems` | Cada par `(collection_id, poem_id)` é estritamente único |

## URL Complementar

- Rotas públicas:
  - `https://nfgbrentano.art.br/colecoes/`
  - `https://nfgbrentano.art.br/colecao/alma-e-autoconhecimento/`
  - `https://nfgbrentano.art.br/colecao/poesia-e-cotidiano/`
- Arquivo SDD de referência: `SDD/2026-11-03_curadoria-e-novas-colecoes-tematicas.md`
