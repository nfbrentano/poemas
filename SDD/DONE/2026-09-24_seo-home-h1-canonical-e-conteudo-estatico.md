# {SEO} Home: h1, título sem duplicação, canonical limpo e conteúdo prerenderizado

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir os sinais de SEO da página inicial, que é a página com mais autoridade do domínio.
- **Por que é necessário:**
  - A home **não tem `<h1>`** (só `h2` em `home.js:227, 268`; o logo do header é um `<a>`).
  - O título fica duplicado: `home.js:24` monta "Natanael Brentano — Poemas" e `updateSEO` acrescenta " — Natanael Brentano" de novo.
  - Sem `url` explícita, `updateSEO` usa `location.href` como canonical, então `/?tags=amor`, `/?cols=x` e `/?q=...` viram canonicals próprios, criando conteúdo duplicado e combinações infinitas.
  - O `#app` de `dist/index.html` é vazio: um crawler sem JS (ou o primeiro passe do Googlebot) não vê nenhum poema nem link interno na home.
- **Qual valor será agregado:** Home bem entendida pelos buscadores para a consulta de marca ("Natanael Brentano", "poemas Natanael Brentano") e para termos genéricos ("poemas brasileiros"), e distribuição de autoridade para os poemas via links estáticos.
- **Para quem é destinado:** Mecanismos de busca e novos leitores vindos da busca.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Adicionar um único `<h1>` semântico na home (ex.: "Poemas de Natanael Brentano"), pode ser visualmente discreto, mas não oculto com `display:none`.
- RF02: Corrigir a composição do título: `updateSEO` deve aplicar o sufixo da marca somente se o título ainda não o contiver, ou a home passa o título já final e desativa o sufixo. Título final da home: "Poemas Brasileiros — Natanael Brentano" (≤ 60 caracteres).
- RF03: A home sempre declara canonical `https://nfgbrentano.art.br/`, independentemente de `?tags=`, `?cols=`, `?q=` ou `?page=`.
- RF04: Quando houver filtro ou busca na URL, adicionar `<meta name="robots" content="noindex, follow">` (e remover ao limpar os filtros).
- RF05: No prerender, injetar em `dist/index.html` um bloco estático dentro de `#main-content` com: o `<h1>`, um parágrafo de apresentação (2–3 frases sobre o autor e o acervo) e a lista dos ~20 poemas mais recentes como `<a href="/poema/<slug>/">título</a>`, além de links para coleções e para `/sobre/`.
- RF06: Meta description da home revisada para 140–160 caracteres, com termos principais ("poemas", "poesia brasileira", nome do autor).

### Requisitos não-funcionais

- RNF01: O conteúdo estático não pode causar salto visual perceptível ao carregar a SPA (CLS ≤ 0,1). Coordenar com `2026-09-24_seo-core-web-vitals.md` (hidratação sem apagar o HTML prerenderizado).
- RNF02: Sem texto oculto ou diferente para robôs (cloaking): o bloco estático deve corresponder ao que o usuário vê.

### Dependências técnicas

- `src/pages/home.js`, `src/utils/seo.js`, `src/components/header.js`, `scripts/prerender.js`, `index.html`

### Recursos necessários

- Texto de apresentação aprovado pelo autor.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado a home carregada, quando conto `h1` no DOM, então existe exatamente 1.
- [x] **CA02:** Dado a home, quando leio `document.title`, então "Natanael Brentano" aparece uma única vez.
- [x] **CA03:** Dado que acesso `/?tags=amor`, quando inspeciono o `<head>`, então o canonical é `https://nfgbrentano.art.br/` e há `robots noindex, follow`.
- [x] **CA04:** Dado `dist/index.html`, quando o abro com JavaScript desativado, então vejo o h1, a apresentação e links para pelo menos 20 poemas.
- [x] **CA05:** Dado que limpo os filtros na home, quando inspeciono o `<head>`, então a meta `noindex` foi removida.

## O que a atividade não inclui

- Redesenho visual da home.
- Páginas de sentimento indexáveis (ver `2026-09-24_seo-paginas-de-sentimentos.md`).
- Paginação estática (`/pagina/2/`) da home.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | h1 único | `document.querySelectorAll('h1').length` na home | `1` |
| CT02 | Título | Abrir home | "Poemas Brasileiros — Natanael Brentano" |
| CT03 | Canonical com filtro | Abrir `/?cols=x&tags=y` | Canonical da raiz + noindex |
| CT04 | Sem JS | `curl https://nfgbrentano.art.br/ \| grep -c 'href="/poema/'` | ≥ 20 |
| CT05 | Unitário `updateSEO` | Título já contendo a marca | Sufixo não duplicado |
| CT06 | CLS | Lighthouse mobile na home | CLS ≤ 0,1 |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/appearance/title-link
- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Protótipo / mockup: N/A.
- Discussões relacionadas: `SDD/DONE/2026-09-23_home-paginacao-lista.md`, `SDD/DONE/2026-09-23_busca-por-url.md`
- Referências de design: N/A.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
