# [FEAT] {SEO} Páginas indexáveis por sentimento (`/sentimento/<slug>/`)

## Detalhes da Atividade

- **O que precisa ser feito:** Criar uma página própria, rastreável e prerenderizada para cada sentimento (tag) usado nos poemas, e fazer os chips de sentimento apontarem para ela.
- **Por que é necessário:**
  - Hoje os sentimentos só existem como filtro `/?tags=amor` da home: não são páginas próprias, não estão no sitemap e (após `2026-09-24_seo-home-h1-canonical-e-conteudo-estatico.md`) terão `noindex`.
  - Buscas como "poemas de amor", "poemas sobre saudade", "poesia sobre solidão" são justamente o principal volume de busca do nicho. Hoje o site não tem nenhuma página que responda a essas consultas.
  - As antigas URLs `/tag/<slug>` (do WordPress) respondem 404 do GitHub e perdem os backlinks que ainda existirem.
- **Qual valor será agregado:** Novas páginas de entrada para consultas de cauda média/longa, mais links internos entre poemas relacionados e recuperação de links legados.
- **Para quem é destinado:** Leitores que buscam poemas por tema e mecanismos de busca.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Nova rota `/sentimento/:slug/` em `src/router.js`, com a página `src/pages/sentiment.js` que lista os poemas publicados com aquele sentimento (usando `normalizeTag`/`formatTag` de `src/utils/tags.js` para unificar variações).
- RF02: Cada página tem `<h1>` "Poemas sobre <Sentimento>", um parágrafo introdutório (texto padrão com o nome do sentimento, com opção de texto personalizado por sentimento — ex.: coleção `sentiments` no Firestore ou arquivo `src/data/sentiments.js`), a lista de poemas como links `<a>` e links para os sentimentos relacionados (co-ocorrentes).
- RF03: Título: "Poemas sobre <Sentimento> — Natanael Brentano"; description única gerada a partir da intro e da contagem ("<N> poemas sobre …").
- RF04: `scripts/prerender.js` gera `dist/sentimento/<slug>/index.html` com head completo (canonical, OG, JSON-LD `CollectionPage` + `ItemList` + `BreadcrumbList`) e a lista estática de links.
- RF05: `scripts/generate-sitemap.js` inclui as páginas de sentimento, com `lastmod` = data do poema mais recente daquele sentimento.
- RF06: Os chips de sentimento em `poem.js` e os cartões da home passam a apontar para `/sentimento/<slug>/`. O filtro múltiplo da home (`?tags=a,b`) continua existindo para uso interativo.
- RF07: Só gerar página indexável para sentimentos com **pelo menos 3 poemas**; os demais ficam com `noindex, follow` e fora do sitemap, para evitar páginas rasas (thin content).
- RF08: Página `/sentimentos/` listando todos os sentimentos indexáveis com contagem (hub de links internos), linkada no rodapé.
- RF09: Redirecionar `/tag/<slug>` e `/?tag=<slug>` (legado) para `/sentimento/<slug>/` via `public/404.html`/roteador, e gerar `dist/tag/<slug>/index.html` com `<meta http-equiv="refresh">` + `<link rel="canonical">` apontando para a nova URL.

### Requisitos não-funcionais

- RNF01: Slugs de sentimento em minúsculas, sem acentos e com hífens (`saudade`, `solidao`, `amor-proprio`), estáveis entre builds.
- RNF02: No máximo 2 consultas ao Firestore por visita à página de sentimento.
- RNF03: Escapar todo texto vindo do banco.

### Dependências técnicas

- `src/router.js`, `src/utils/tags.js`, `src/pages/poem.js`, `src/pages/home.js`, novo `src/pages/sentiment.js`
- `scripts/prerender.js`, `scripts/generate-sitemap.js`, `public/404.html`
- Índice Firestore `tags` (array-contains) + `status` + `published_at`, se necessário
- `2026-09-24_seo-dados-estruturados-json-ld.md` (funções de schema)

### Recursos necessários

- Textos introdutórios dos principais sentimentos (opcional, recomendado para os 10 mais usados).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o sentimento "saudade" com 12 poemas, quando acesso `/sentimento/saudade/`, então vejo o h1 "Poemas sobre Saudade" e os 12 poemas como links.
- [ ] **CA02:** Dado um sentimento com 2 poemas, quando inspeciono sua página, então há `noindex, follow` e ela não aparece no sitemap.
- [ ] **CA03:** Dado uma página de poema, quando clico em um chip de sentimento, então sou levado a `/sentimento/<slug>/` via SPA.
- [ ] **CA04:** Dado a URL antiga `/tag/amor`, quando a acesso, então chego em `/sentimento/amor/`.
- [ ] **CA05:** Dado o build, quando abro `dist/sentimento/amor/index.html` sem JS, então vejo título, intro e links para os poemas.
- [ ] **CA06:** Dado tags "Saudade" e "saudade " em poemas diferentes, quando gero as páginas, então existe uma única página `/sentimento/saudade/` com os dois.

## O que a atividade não inclui

- Editor de textos introdutórios no painel admin (pode ser feature futura).
- Alterar a UI do filtro múltiplo da home.
- Traduções ou páginas em outros idiomas.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Unitário slug | `slugifyTag('Amor-Próprio ')` | `amor-proprio` |
| CT02 | Limite de poemas | Sentimento com 2 poemas | `noindex`, fora do sitemap |
| CT03 | Sitemap | Buscar `/sentimento/` no `sitemap.xml` | Somente sentimentos com ≥ 3 poemas, com `lastmod` |
| CT04 | Legado | Abrir `/tag/saudade` | Redireciona para `/sentimento/saudade/` |
| CT05 | Rascunho | Sentimento presente só em rascunho | Nenhuma página gerada |
| CT06 | Relacionados | Página de "amor" | Links para sentimentos co-ocorrentes |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Protótipo / mockup: Reaproveitar o layout de `src/pages/collection.js`.
- Discussões relacionadas: `SDD/DONE/2026-09-23_poema-sentimentos-colecoes-relacionados.md`, `SDD/DONE/2026-09-23_busca-sem-acentos.md`
- Referências de design: Página de coleção atual.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
