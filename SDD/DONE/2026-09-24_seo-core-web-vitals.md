# {SEO} (PERF) Core Web Vitals: hidratação do prerender, carregamento de dados, fontes e ícones

## Detalhes da Atividade

- **O que precisa ser feito:** Melhorar LCP, CLS e INP das páginas públicas (principalmente a do poema, que é a página de entrada mais comum vinda da busca).
- **Por que é necessário:**
  - `src/main.js:19` substitui o `#app` inteiro ao iniciar: o HTML do poema prerenderizado é jogado fora, aparece um skeleton e depois o poema é renderizado de novo. Isso atrasa o LCP e gera CLS.
  - A página do poema faz 3 consultas sequenciais ao Firestore (poema → anterior → próximo, `poem.js:97-127`) antes de renderizar.
  - O `vendor-firebase` (589 KB) é necessário em toda página pública só para ler dados que já estão no HTML prerenderizado.
  - O CSS inteiro (64 KB) é embutido em cada um dos ~240 HTMLs e não aproveita cache entre páginas.
  - 4 famílias de fontes do Google Fonts sem preload do arquivo usado no título/versos: texto "pula" quando a fonte chega.
  - `Clarity.init()` roda de forma síncrona no topo do `main.js`, antes do roteador.
  - O favicon é um emoji em SVG; os ícones 192 e 512 do manifest são o mesmo PNG de 1024 px e 544 KB.
- **Qual valor será agregado:** Core Web Vitals "Bom" no relatório do Search Console (fator de ranqueamento da experiência na página), menos consumo de dados no celular e menor taxa de rejeição.
- **Para quem é destinado:** Leitores (majoritariamente no celular) e mecanismos de busca.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: **Hidratação:** se o `#main-content` já contém o conteúdo prerenderizado da rota atual (marcado com `data-prerendered="<rota>"`), a SPA reaproveita esse DOM (anexa eventos, lê os dados de um `<script type="application/json" id="__DATA__">` embutido no build) em vez de apagar e re-renderizar. O layout base (header/footer) também deve vir do prerender.
- RF02: **Dados embutidos:** o prerender inclui no HTML do poema os dados necessários para a primeira renderização (poema, anterior, próximo, relacionados), dispensando consultas ao Firestore no primeiro carregamento. O Firebase só é carregado sob demanda (comentários, curtidas, newsletter, admin) ou em `requestIdleCallback`.
- RF03: Quando for preciso consultar o Firestore (navegação SPA), buscar poema, anterior e próximo em paralelo (`Promise.all`) ou usar os campos `prev_slug`/`next_slug` precomputados.
- RF04: **CSS:** embutir no HTML apenas o CSS crítico (acima da dobra, ~≤ 14 KB) e carregar o restante como arquivo com cache (`<link rel="stylesheet">` com hash).
- RF05: **Fontes:** reduzir para no máximo 2 famílias nas páginas públicas (avaliar as realmente usadas), self-host em WOFF2 com subset latino, `font-display: swap`, `<link rel="preload">` só da fonte do texto do poema e `size-adjust`/métricas de fallback para evitar CLS.
- RF06: **Clarity:** inicializar após o evento `load` + `requestIdleCallback` (ou após 3 s), sem bloquear a primeira renderização.
- RF07: **Ícones:** gerar favicon `.ico` 32×32, `favicon.svg` real (não emoji), `apple-touch-icon` 180×180 e ícones de manifest 192×192 e 512×512 com os tamanhos reais; separar `purpose: "any"` e `"maskable"`.
- RF08: Adicionar `fetchpriority="high"` no elemento LCP quando for imagem (ex.: capa de coleção) e `width`/`height` em todas as imagens.

### Requisitos não-funcionais

- RNF01: Lighthouse mobile (Moto G Power, 4G lenta) na página de poema: Performance ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms.
- RNF02: No relatório de Core Web Vitals do Search Console (dados de campo), 75% das URLs em "Bom" em até 28 dias após o deploy.
- RNF03: JS executado no primeiro carregamento de um poema ≤ 100 KB (gzip), excluindo carregamentos sob demanda.
- RNF04: Sem regressões de funcionalidade (tema, revelação de estrofes, compartilhar, áudio, comentários, service worker).

### Dependências técnicas

- `src/main.js`, `src/router.js`, `src/pages/poem.js`, `scripts/prerender.js`, `vite.config.js`, `index.html`, `public/manifest.json`, `public/sw.js` (versão do cache)
- `SDD/DONE/2026-09-23_layout-revelacao-estrofes.md` (conteúdo prerenderizado não pode ficar invisível sem JS)
- `2026-09-24_seo-home-h1-canonical-e-conteudo-estatico.md`

### Recursos necessários

- Logo/ícone vetorial do autor para gerar os ícones.
- PageSpeed Insights / Lighthouse CI para medir antes e depois.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o acesso direto a um poema, quando a página carrega, então o texto prerenderizado não é removido nem substituído por skeleton (verificável por `MutationObserver` ou gravação do Performance).
- [x] **CA02:** Dado o acesso direto a um poema, quando observo a aba Rede, então nenhuma requisição ao Firestore acontece antes da primeira renderização.
- [x] **CA03:** Dado a navegação SPA para um poema, quando observo a aba Rede, então as consultas de poema, anterior e próximo saem em paralelo.
- [x] **CA04:** Dado o Lighthouse mobile em 3 poemas diferentes, quando o executo, então todos atendem ao RNF01.
- [x] **CA05:** Dado o `manifest.json`, quando verifico cada ícone, então as dimensões declaradas correspondem às reais e cada arquivo tem ≤ 50 KB.
- [x] **CA06:** Dado o primeiro carregamento de uma página pública, quando uso o Performance, então o Clarity só é inicializado depois do LCP.

## O que a atividade não inclui

- Migração de framework ou do bundler.
- Otimização do painel admin.
- Troca de hospedagem/CDN.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Baseline | Rodar Lighthouse mobile antes da mudança em home, poema e coleção; registrar no PR | Métricas registradas |
| CT02 | Hidratação | Abrir poema com JS lento (CPU 6x) | Texto visível desde o primeiro paint, sem piscar |
| CT03 | Sem JS | Abrir poema com JS desativado | Poema legível e completo |
| CT04 | Navegação SPA | Poema → próximo → anterior | Conteúdo e `<head>` corretos a cada passo |
| CT05 | Fontes | Throttling 3G, observar o título | Sem salto de layout ao trocar a fonte (CLS ≤ 0,1) |
| CT06 | Offline/SW | Carregar poema, ficar offline, recarregar | Service worker continua servindo o poema/offline.html |
| CT07 | Bundle | `vite build` e somar o JS do entry do poema | ≤ 100 KB gzip |

## URL Complementar

- Documentação técnica: https://web.dev/articles/vitals ; https://web.dev/articles/optimize-lcp ; https://web.dev/articles/optimize-cls
- Documentação técnica: https://developers.google.com/search/docs/appearance/core-web-vitals
- Protótipo / mockup: N/A — visual mantido.
- Discussões relacionadas: `SDD/DONE/2026-09-23_layout-revelacao-estrofes.md`, `SDD/DONE/2026-09-23_layout-tema-inicial-e-theme-color.md`
- Referências de design: N/A.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
