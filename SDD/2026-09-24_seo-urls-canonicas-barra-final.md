# [FIX] {SEO} URLs canônicas com barra final (evitar redirecionamento 301)

## Detalhes da Atividade

- **O que precisa ser feito:** Padronizar todas as URLs internas do site no formato com barra final (`/poema/<slug>/`, `/colecao/<slug>/`, `/sobre/`, `/colecoes/`), que é o formato servido pelo GitHub Pages para os diretórios gerados pelo prerender.
- **Por que é necessário:**
  - Hoje `https://nfgbrentano.art.br/poema/277` responde **301 → `/poema/277/`** (verificado com `curl`).
  - Canonical, `og:url`, sitemap, RSS, JSON-LD `url`, links internos e prefetch (`poem.js`) usam o formato **sem** barra. Ou seja, todas as URLs que declaramos como canônicas são redirecionamentos.
  - O Google trata canonical que redireciona como sinal conflitante, desperdiça orçamento de rastreamento e pode escolher outra URL como canônica. O Search Console acusa "Página com redirecionamento" nas URLs do sitemap.
- **Qual valor será agregado:** Sinais de canonicalização consistentes, rastreamento mais eficiente e consolidação de autoridade em uma única URL por página.
- **Para quem é destinado:** Mecanismos de busca e, indiretamente, o autor (mais páginas indexadas corretamente).

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar um helper único (ex.: `buildUrl(path)` em `src/utils/url.js`, reutilizado pelos scripts de build) que gera URLs absolutas e relativas sempre com barra final para rotas de página.
- RF02: `scripts/prerender.js` deve usar o formato com barra em `<link rel="canonical">`, `og:url` e JSON-LD `url` de poemas, coleções e páginas estáticas.
- RF03: `scripts/generate-sitemap.js` deve listar as URLs com barra final.
- RF04: `scripts/generate-rss.js` deve usar o formato com barra em `<link>` e `<guid>` dos itens (manter `isPermaLink` coerente; se o guid mudar, avaliar manter o antigo para não duplicar itens em leitores de feed — ver RNF02).
- RF05: `src/utils/seo.js` (`updateSEO`) deve normalizar a URL canônica para o formato com barra, e as páginas que hoje passam `location.href` devem passar a URL canônica limpa (sem query string e sem hash).
- RF06: Links internos gerados no cliente (`href` de cards, chips de coleção, relacionados, prefetch, header, footer) devem usar o formato com barra.
- RF07: O roteador (`src/router.js`) deve reconhecer as duas formas (com e sem barra) e, ao navegar via SPA, atualizar a URL para a forma com barra com `history.replaceState`.

### Requisitos não-funcionais

- RNF01: Nenhuma URL canônica, do sitemap ou do RSS pode responder com 3xx em produção.
- RNF02: Não gerar itens duplicados no RSS para assinantes existentes (manter `guid` estável ou aceitar a duplicação de forma consciente e registrada no PR).
- RNF03: Sem regressão na navegação SPA (voltar/avançar do navegador, links profundos, 404.html).

### Dependências técnicas

- `scripts/prerender.js`, `scripts/generate-sitemap.js`, `scripts/generate-rss.js`
- `src/utils/seo.js`, `src/router.js`, `src/pages/*.js`, `src/components/*.js`
- `public/404.html` (restauração de rota)

### Recursos necessários

- Acesso ao Google Search Console para reenviar o sitemap e acompanhar o relatório "Páginas".

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o build de produção, quando inspeciono `dist/poema/<slug>/index.html`, então `canonical`, `og:url` e JSON-LD `url` terminam em `/poema/<slug>/`.
- [ ] **CA02:** Dado o `sitemap.xml` gerado, quando faço `curl -I` em qualquer URL listada, então a resposta é `200` (nenhum `301`).
- [ ] **CA03:** Dado que estou na home, quando clico em um poema, então a barra de endereço mostra `/poema/<slug>/` e a página renderiza normalmente.
- [ ] **CA04:** Dado que acesso diretamente `/poema/<slug>` (sem barra), quando a página carrega, então o GitHub Pages redireciona para a forma com barra e o canonical aponta para ela.
- [ ] **CA05:** Dado que navego via SPA entre poema → coleção → sobre, quando inspeciono o `<head>`, então o canonical de cada página não contém query string nem hash.

## O que a atividade não inclui

- Migrar a hospedagem para fora do GitHub Pages ou configurar redirecionamentos no servidor.
- Redirecionamentos de slugs legados do WordPress (tratado em `2026-09-24_seo-indexacao-noindex-robots-404.md`).
- Alterar o formato dos slugs.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Canonical no prerender | Rodar `npm run build` e buscar `rel="canonical"` em `dist/poema/*/index.html` | Todas as URLs terminam com `/` |
| CT02 | Sitemap sem redirect | Script que faz `HEAD` em todas as URLs do `sitemap.xml` publicado | 100% `200` |
| CT03 | Teste unitário do helper | `buildUrl('poema/x')`, `buildUrl('/poema/x/')`, `buildUrl('')` | `https://nfgbrentano.art.br/poema/x/` nos dois primeiros; home com `/` |
| CT04 | Rota sem barra na SPA | Navegar para `/poema/x` pelo console (`navigateTo`) | URL final `/poema/x/`, página correta |
| CT05 | Home filtrada | Abrir `/?tags=amor` | Canonical = `https://nfgbrentano.art.br/` |
| CT06 | RSS | Validar `feed.xml` no W3C Feed Validator | Feed válido, links com barra |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Documentação técnica: https://docs.github.com/pages (comportamento de diretórios com `index.html`)
- Protótipo / mockup: N/A — alteração sem interface.
- Discussões relacionadas: `SDD/DONE/2026-09-23_navegacao-spa-links-internos.md`
- Referências de design: N/A — alteração sem interface.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
