# [FIX] Correção de vazamento de listener e page_view falso em /arquivo/, eliminação de leituras redundantes no Firestore e Referer no Poema do Dia

> **Status:** Concluído
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-24 · **Atualizada em:** 2026-11-24

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Corrigir em [`src/pages/archive.js`](../src/pages/archive.js):
     - O vazamento de listener de clique (`container.addEventListener('click', ...)` vs `document.removeEventListener('click', ...)`).
     - A chamada indevida `trackPageView('/arquivo', 'Arquivo e Linha do Tempo Literária')`, que duplica a contagem já feita por [`src/router.js`](../src/router.js) e grava a string `'Arquivo e Linha do Tempo Literária'` no campo `poem_id`.
     - A perda do JSON-LD completo (`archivePageSchema([])`) quando `/arquivo/` é carregado a partir do HTML pré-renderizado (`isPrerendered === true`).
  2. Eliminar leituras redundantes no Firestore durante a navegação SPA em [`src/pages/poem.js`](../src/pages/poem.js) e [`src/pages/about.js`](../src/pages/about.js), consultando primeiro o cache em memória/local de [`src/utils/poems-store.js`](../src/utils/poems-store.js) (`getPublishedPoems()`) antes de disparar queries diretas ao Firestore.
  3. Adicionar limites de segurança (`limit`) às queries administrativas abertas em [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js) e reduzir o fallback de `10.000` documentos em [`src/pages/admin/most-read-sync.js`](../src/pages/admin/most-read-sync.js).
  4. Atualizar [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) para usar `getFirebaseConfig()` dinâmico e `installFirebaseNodeReferer()` de [`scripts/build-data-cache.js`](../scripts/build-data-cache.js).
- **Problema e evidência:**
  1. Em [`src/pages/archive.js`](../src/pages/archive.js):
     - Linha 116 adiciona `clickHandler` em `container`, mas linha 121 remove de `document`. Como `#main-content` persiste entre rotas SPA, o listener nunca é removido.
     - Linha 36 chama `trackPageView('/arquivo', 'Arquivo e Linha do Tempo Literária')`. Em [`src/utils/analytics.js`](../src/utils/analytics.js) (linha 35), o 2º parâmetro é `poemId`. Isso gera `2` registros por visita a `/arquivo/` e faz `/arquivo` ser contabilizado como poema lido em [`src/pages/analytics.js`](../src/pages/analytics.js) (linhas 325 e 395: `views.filter(v => v.poem_id)`).
     - Linha 31 injeta `archivePageSchema([])` com `0` itens mesmo quando `isPrerendered` é `true`, sobrescrevendo o JSON-LD completo pré-renderizado no build.
  2. Em [`src/pages/poem.js`](../src/pages/poem.js) (linhas 151–187 e 1091–1144), mesmo após o leitor já ter baixado todos os poemas na Home via `getPublishedPoems()`, cada clique em um poema dispara até 5 queries novas no Firestore (`slug`, `prevQ`, `nextQ`, `collections` e `relatedQ` com `limit(20)`), consumindo até 25+ leituras por página visitada.
  3. Em [`src/pages/about.js`](../src/pages/about.js) (linhas 80–83), toda visita a `/sobre/` executa `getCountFromServer` na coleção `poems`, mesmo quando `poems-store.js` já possui a lista publicada em cache ou o número já veio pré-renderizado.
  4. Em [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js) (linha 20), `listDocs('page_views', { where: [['created_at', '>=', ...]] })` não possui `limit`, podendo ler milhares de documentos a cada abertura do painel.
  5. Em [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) (linhas 98–122), `firebaseConfig` é lido estaticamente no topo do arquivo e não instala o cabeçalho `Referer: https://nfgbrentano.art.br/`, ficando sujeito a bloqueio pela restrição de *HTTP Referer* da API key no GitHub Actions (`daily-poem.yml`).
- **Impacto de não fazer:** Contaminação das métricas de poemas mais lidos com a rota `/arquivo`; vazamento cumulativo de memória/eventos no DOM; consumo desnecessário de dezenas de leituras do Firestore a cada clique em poema no SPA e ao abrir o dashboard admin; risco de falha no envio diário do Poema do Dia via GitHub Actions.
- **Para quem é destinado:** Leitores do site (navegação SPA instantânea sem round-trips redundantes ao Firestore) e autor/administrador (métricas precisas e controle de cota do Firebase).
- **História de usuário:** Como leitor e administrador, quero que a navegação entre poemas reutilize o acervo já carregado em cache, que a página de Arquivo limpe seus eventos e não polua o analytics de poemas e que o script do Poema do Dia autentique com o `Referer` correto.
- **Como saberemos que deu certo:** Navegar da Home para um poema em SPA realiza `0` leituras na coleção `poems` quando o cache de `poems-store.js` está ativo (com conteúdo completo); visitar `/arquivo/` não grava `poem_id` em `page_views` e remove `clickHandler` do `container` no `cleanup()`; `dashboard.js` aplica `limit` em todas as coleções de log/views; `send-daily-poem.js` injeta `Referer`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Em [`src/pages/archive.js`](../src/pages/archive.js), remover a chamada duplicada `trackPageView('/arquivo', ...)`, remover `clickHandler` do mesmo alvo (`activeContainer.removeEventListener('click', clickHandler)`) em `cleanup()` e atualizar o JSON-LD com `archivePageSchema(allPoems)` também após carregar os poemas no fluxo `isPrerendered`. | P0 | CA01, CA02 |
| RF02 | Em [`src/pages/poem.js`](../src/pages/poem.js), ao abrir um poema via SPA (`!isPrerendered`), consultar primeiro `getPublishedPoems()` de [`src/utils/poems-store.js`](../src/utils/poems-store.js) (desde que o item possua `content` completo, i.e., `!found._lightweight`), resolvendo `poem`, `prevSlug`, `nextSlug` e `relatedPoems` diretamente em memória sem consultar a coleção `poems` no Firestore; recorrer à query direta no Firestore apenas se o poema não estiver no store ou estiver apenas em modo `_lightweight`. | P0 | CA03 |
| RF03 | Em [`src/pages/poem.js`](../src/pages/poem.js), resolver metadados de `collectionsData` a partir de `enrichCollectionsWithCurated([])` quando todos os `poem.collection_slugs` pertencerem às coleções curadas conhecidas, consultando a coleção `collections` no Firestore apenas para slugs personalizados não encontrados localmente. | P1 | CA03 |
| RF04 | Em [`src/pages/about.js`](../src/pages/about.js), obter a contagem de poemas publicados via `getPublishedPoems()` (reutilizando o cache do store) em vez de disparar `getCountFromServer` a cada visita. | P1 | CA04 |
| RF05 | Em [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js), adicionar `limit: 2500` na consulta de `page_views` de 7 dias e `limit: 200` nas consultas de `poem_comments` pendentes e `error_logs` em aberto; em [`src/pages/admin/most-read-sync.js`](../src/pages/admin/most-read-sync.js), reduzir o fallback de `page_views` antigos de `10000` para `2500`. | P0 | CA05 |
| RF06 | Em [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js), utilizar `getFirebaseConfig()` dinâmico e `installFirebaseNodeReferer()` de [`scripts/build-data-cache.js`](../scripts/build-data-cache.js) antes de inicializar o Firebase. | P0 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Quando o cache de `poems-store.js` estiver populado com poemas completos, a transição SPA para `/poema/<slug>/` deve fazer `0` chamadas `getDocs` para a coleção `poems` (mantendo apenas o carregamento diferido opcional de `poem_reactions` e `poem_comments`). | P0 | CA03 |
| RNF02 | A filtragem de "Poemas mais lidos" em [`src/pages/analytics.js`](../src/pages/analytics.js) deve ignorar qualquer registro legado de `page_views` cujo `page` não comece com `/poema/`. | P1 | CA01 |

### Dependências técnicas

- [`src/pages/archive.js`](../src/pages/archive.js), [`src/pages/poem.js`](../src/pages/poem.js), [`src/pages/about.js`](../src/pages/about.js), [`src/pages/analytics.js`](../src/pages/analytics.js).
- [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js), [`src/pages/admin/most-read-sync.js`](../src/pages/admin/most-read-sync.js).
- [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) e [`scripts/build-data-cache.js`](../scripts/build-data-cache.js).

### Recursos necessários

- N/A — alterações contidas nos módulos de front-end e script Node.js existentes.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que o usuário navega para `/arquivo/` via `router.js`, quando a página renderiza, então `trackPageView` não é chamado com `poemId = 'Arquivo e Linha do Tempo Literária'` e `analytics.js` contabiliza em "Poemas mais lidos" apenas visualizações cuja rota pertença a `/poema/`.
- [x] **CA02:** Dado que `archive.render(container)` foi executado e em seguida `archive.cleanup()` é chamado, quando o usuário clica em `.btn-archive-sort` dentro de `container`, então o listener antigo foi efetivamente removido de `container` e não dispara.
- [x] **CA03:** Dado que `getPublishedPoems()` já retornou o acervo completo em memória, quando `poemPage.render(container, { slug })` é executado em navegação SPA, então o poema, `prevSlug`, `nextSlug`, `collectionsData` curadas e `relatedPoems` são resolvidos a partir do cache com `0` chamadas `getDocs` para a coleção `poems`.
- [x] **CA04:** Dado que o leitor acessa `/sobre/`, quando `loadSettings` atualiza `#total-poems-count`, então utiliza a lista de `getPublishedPoems()` sem invocar `getCountFromServer` no Firestore.
- [x] **CA05:** Dado que o administrador abre o dashboard (`/admin?view=dashboard`), quando as consultas iniciais são disparadas via `listDocs`, então `page_views`, `poem_comments` e `error_logs` incluem parâmetro `limit` explícito (`<= 2500`).
- [x] **CA06:** Dado que `sendDailyPoem()` é executado em [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) sem `dbInstance` injetado, quando inicializa o cliente Firebase, então lê as variáveis dinamicamente via `getFirebaseConfig()` e ativa `installFirebaseNodeReferer()`.

## O que a atividade não inclui

- Alteração do TTL de 5 minutos do `poems-store.js`: motivo: o TTL atual já equilibra frescor e economia de leituras na sessão.
- Mudança no provedor de e-mail (Gmail SMTP / Nodemailer) do `send-daily-poem.js`: motivo: escopo restrito à autenticação e Referer do Firebase.

### Considerado para o futuro (P2)

- Cache compartilhado em memória para `poem_reactions` e `poem_comments` por `poemId` durante a mesma sessão de navegação.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Caso `poems-store.js` retorne um resumo `_lightweight: true` (sem `content`, quando o `IndexedDB` está indisponível e o acervo excede 4 MB), `poem.js` deve buscar o documento completo no Firestore? | dev | Não | Sim — se `found._lightweight` for verdadeiro ou `!found.content`, `poem.js` faz fallback transparente para a query unitária por `slug` no Firestore. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Limpeza de listener e ausência de `poemId` falso em `/arquivo/` | unit (jsdom) | CA01, CA02 | Renderizar `archive.render(container)`, verificar `trackPageView`, chamar `archive.cleanup()` e disparar click em `.btn-archive-sort` | `trackPageView` não é chamado dentro de `archive.js`; clique após `cleanup()` não re-renderiza |
| CT02 | Resolução SPA de poema 100% via `poems-store` | integração (jsdom) | CA03 | Mockar `getPublishedPoems` com 3 poemas completos e `getDocs` do Firestore; chamar `poemPage.render` | Poema, anterior/próximo, coleção curada e relacionados renderizam com `0` chamadas a `getDocs` em `poems` |
| CT03 | Contagem de poemas em `/sobre/` via store | unit (jsdom) | CA04 | Renderizar `about.render(container)` com `getPublishedPoems` retornando 159 poemas | `#total-poems-count` exibe `159` sem chamar `getCountFromServer` |
| CT04 | Limites nas queries do Dashboard Admin e `most-read-sync` | unit | CA05 | Espionar `listDocs` ao chamar `renderDashboard` e `syncMostReadSetting` | `listDocs` recebe `limit: 2500` em `page_views` e `limit: 200` em `poem_comments`/`error_logs` |
| CT05 | `Referer` e config dinâmica em `send-daily-poem.js` | unit | CA06 | Executar `sendDailyPoem` verificando chamada a `installFirebaseNodeReferer` e leitura dinâmica de `process.env` | `globalThis.__firebaseNodeReferer` configurado para `https://nfgbrentano.art.br/` |

## URL Complementar

- Documentação técnica: [`src/pages/archive.js`](../src/pages/archive.js), [`src/pages/poem.js`](../src/pages/poem.js), [`src/pages/about.js`](../src/pages/about.js), [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js), [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-17_fix-otimizacao-leituras-firestore-e-auth-ci.md`](DONE/2026-11-17_fix-otimizacao-leituras-firestore-e-auth-ci.md)
- Referências de design: N/A
- Requisitos originais: Auditoria técnica de falhas e melhorias no código em 2026-11-24.
- Issue / PR relacionado: N/A
