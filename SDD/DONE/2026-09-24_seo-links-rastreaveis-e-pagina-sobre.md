# {SEO} Links rastreáveis (anterior/próximo) e SEO da página Sobre

## Detalhes da Atividade

- **O que precisa ser feito:** Transformar a navegação entre poemas em links HTML reais e corrigir o SEO da página `/sobre/`, que é a página de autoria do site.
- **Por que é necessário:**
  - Os botões "anterior" e "próximo" do poema são `<button>` que chamam `navigateTo` (`poem.js:323, 331`). Robôs não seguem botões, então a cadeia de poemas não é rastreável por eles.
  - A página `/sobre` não chama `updateSEO` (`about.js` só define `meta.title`): ao chegar nela via SPA vinda de um poema, canonical, description, OG e JSON-LD continuam os do poema.
  - A foto do autor é carregada por JS em cima de um GIF 1×1 (`about.js:16, 89`), então robôs e a busca de imagens não a veem.
  - `/info` é uma rota duplicada de `/sobre` com canonical próprio (conteúdo duplicado).
  - `poem.title` não é escapado em `poem.js:225`.
- **Qual valor será agregado:** Rastreamento completo do acervo seguindo os links, sinal de autoria forte (E-E-A-T) e eliminação de conteúdo duplicado.
- **Para quem é destinado:** Mecanismos de busca e leitores que querem conhecer o autor.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Renderizar anterior/próximo como `<a href="/poema/<slug>/" data-link rel="prev|next">` com o título do poema de destino no texto ou `aria-label`, mantendo o visual atual.
- RF02: No prerender do poema, incluir os links anterior/próximo e os poemas relacionados (ou pelo menos 3 do mesmo sentimento/coleção) como `<a>` estáticos no HTML.
- RF03: Chamar `updateSEO` na página Sobre com título "Sobre Natanael Brentano — Poeta", description própria, canonical `/sobre/`, `og:type=profile` e o JSON-LD `ProfilePage` definido em `2026-09-24_seo-dados-estruturados-json-ld.md`.
- RF04: No prerender de `/sobre/`, incluir no HTML estático o h1, a biografia e a foto com `<img src="…" alt="Natanael Brentano, poeta" width height>` reais (não o GIF placeholder). Se a foto vier do Firestore, buscar a URL no build.
- RF05: Remover `/info` como página independente: não prerenderizar; o roteador e um `dist/info/index.html` com `meta refresh` + canonical redirecionam para `/sobre/`.
- RF06: Escapar `poem.title` em `poem.js:225` com `escapeHtml`.
- RF07: Garantir que toda rota SPA chame `updateSEO` (ou que o roteador aplique um SEO padrão quando a página não chamar), para nenhum `<head>` herdar dados da página anterior.

### Requisitos não-funcionais

- RNF01: A troca de `<button>` por `<a>` não pode alterar o comportamento de gestos/atalhos existentes (swipe, teclado) nem o foco.
- RNF02: Acessibilidade: links com nome acessível descritivo ("Poema anterior: <título>").

### Dependências técnicas

- `src/pages/poem.js`, `src/pages/about.js`, `src/router.js`, `src/utils/seo.js`, `src/utils/html.js`, `scripts/prerender.js`
- `SDD/DONE/2026-09-23_layout-navegacao-inferior-poema.md` (layout atual dos botões)

### Recursos necessários

- Foto do autor em boa resolução com URL estável e texto de bio aprovado.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema com anterior e próximo, quando inspeciono o DOM, então existem `<a rel="prev">` e `<a rel="next">` com `href` canônico.
- [ ] **CA02:** Dado o HTML prerenderizado de um poema, quando o abro sem JS, então vejo links para o poema anterior, o próximo e pelo menos 3 relacionados.
- [ ] **CA03:** Dado que estou em um poema, quando navego via SPA para `/sobre/`, então o canonical, a description e o JSON-LD são os da página Sobre.
- [ ] **CA04:** Dado `dist/sobre/index.html`, quando o abro sem JS, então vejo a foto real com `alt` descritivo.
- [ ] **CA05:** Dado que acesso `/info`, quando a página carrega, então chego em `/sobre/`.
- [ ] **CA06:** Dado um poema com título `<b>x</b>`, quando abro a página, então o título aparece como texto literal.

## O que a atividade não inclui

- Reescrever a biografia do autor.
- Mudanças visuais na barra de navegação do poema.
- Estratégia de links para coleções (já coberta em `SDD/DONE/2026-09-23_poema-sentimentos-colecoes-relacionados.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Links prev/next | `document.querySelectorAll('a[rel=prev],a[rel=next]')` em poema do meio | 2 elementos |
| CT02 | Primeiro poema | Abrir o poema mais antigo | Sem `rel=prev`, sem link quebrado |
| CT03 | Rastreamento | Screaming Frog (ou script de crawl) a partir da home sem JS | Alcança ≥ 95% dos poemas do sitemap |
| CT04 | Head do Sobre via SPA | Poema → Sobre, ler canonical | `https://nfgbrentano.art.br/sobre/` |
| CT05 | Foto estática | `curl /sobre/ \| grep '<img'` | `src` real, com `alt`, `width` e `height` |
| CT06 | `/info` | Abrir `/info` | Chega em `/sobre/` |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- Documentação técnica: https://developers.google.com/search/docs/appearance/structured-data/profile-page
- Protótipo / mockup: N/A — visual mantido.
- Discussões relacionadas: `SDD/DONE/2026-09-23_navegacao-spa-links-internos.md`, `SDD/DONE/2026-09-23_layout-navegacao-inferior-poema.md`
- Referências de design: N/A.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
