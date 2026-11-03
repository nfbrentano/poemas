# [SEO] Otimização de Rastreamento, Malha de Links Internos e Hidratação para Indexação no Google Search

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-03 · **Atualizada em:** 2026-11-03

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Reduzir a profundidade de clique (*Click Depth*) de todas as 244 URLs reportadas no Google Search Console como *"Detectada, mas não indexada no momento"* (`/poema/*`, `/sentimento/*` e `/sentimentos/`) para no máximo 1 a 2 cliques a partir da Home (`/`) e da página Explorar (`/colecoes/`).
  2. Pré-renderizar integralmente a página `/colecoes/` (`dist/colecoes/index.html`) com o catálogo de coleções, sentimentos indexáveis e acervo de poemas no HTML estático (hoje `dist/colecoes/index.html` é gerada com `<div id="app"></div>` vazia).
  3. Adicionar na Home (`/` e `dist/index.html`) e no menu de navegação global links diretos para `/sentimentos/`, além de um índice estruturado do acervo completo (`<details class="home-archive-index">`) na Home contendo links rastreáveis para todos os poemas publicados (agrupados por ano) e para todos os sentimentos indexáveis.
  4. Corrigir bugs críticos de hidratação client-side em `src/pages/collection.js`, `src/pages/sentiment.js`, `src/pages/sentiments.js`, `src/pages/collections.js` e `src/pages/home.js` que apagavam o HTML pré-renderizado ao executar JavaScript no Web Rendering Service (WRS) do Googlebot (ou travavam em `.skeleton` / disparavam `setNotFoundSEO()` com `noindex` caso a conexão com o Firestore atrasasse ou falhasse).
  5. Enriquecer o conteúdo textual das páginas `/sentimento/<slug>/` e `/colecao/<slug>/` com introduções literárias exclusivas em `src/data/sentiments.js` (cobrindo os sentimentos reportados pelo Search Console) e trechos (`excerpt`) de cada poema nas listagens, eliminando *thin content* e *boilerplate* repetitivo.
  6. Distribuir de forma determinística os links de "Você também pode gostar" (`relatedPoems`) no `scripts/prerender.js` para evitar que sempre os mesmos 3 poemas recebam todos os links internos e garantir que todo o acervo receba *inlinks* contextuais.

- **Problema e evidência:**
  - Exportação do Google Search Console mostra **244 URLs** (181 poemas em `/poema/.../`, 62 temas em `/sentimento/.../` e o hub `/sentimentos/`) com o status **"Detectada, mas não indexada no momento"** (*Discovered - currently not indexed*) e `Último rastreamento: 1969-12-31` (nunca rastreadas pelo Googlebot, conhecidas apenas via Sitemap).
  - Análise técnica do repositório revelou quatro causas-raiz combinadas:
    1. **Profundidade de clique excessiva (Click Depth > 10..90)**: `dist/index.html` pré-renderiza apenas os 20 poemas mais recentes e 5 sentimentos; os outros ~180 poemas dependem de um `<button id="load-more-btn">` (ignorado pelo Googlebot) ou de dezenas de saltos `rel="prev"`/`rel="next"`. Além disso, `dist/colecoes/index.html` não tinha o corpo pré-renderizado (`<div id="app"></div>` vazio).
    2. **Destruição do HTML pré-renderizado na hidratação JS (WRS)**:
       - `src/pages/collection.js` substituía `container.innerHTML` por `.skeleton` na linha 14 antes de checar `data-prerendered` na linha 121; quando `data-prerendered` era verdadeiro, pulava a renderização final e deixava a página travada no skeleton vazio.
       - `src/pages/sentiment.js` e `src/pages/sentiments.js` ignoravam `data-prerendered`, apagavam o HTML estático com `.skeleton` e, se o Firestore falhasse no WRS do Googlebot, chamavam `renderNotFound()` -> `setNotFoundSEO()` (`<meta name="robots" content="noindex">`).
    3. **Thin Content em `/sentimento/<slug>/`**: cerca de 50 páginas de sentimento usavam a mesma frase genérica de 1 linha e listavam apenas títulos curtos e anos, sem excerto dos versos.
    4. **Concentração de links em `relatedPoems`**: o empate de pontuação em `prerender.js` escolhia sempre os mesmos 3 primeiros poemas do array para cada tag, deixando a maioria dos poemas sem links contextuais de entrada.

- **Impacto de não fazer:**
  - Mais de 85% dos poemas e páginas temáticas de sentimentos continuarão fora do índice do Google Search, impedindo o tráfego orgânico de cauda longa e a descoberta das obras.

- **Para quem é destinado:**
  - Mecanismos de busca (Googlebot / Google Web Rendering Service, Bingbot) e leitores que buscam poesia por tema, sentimento ou título no Google.

- **História de usuário:**
  - Como autor do site, quero que todas as páginas de poemas, coleções e sentimentos sejam facilmente descobertas, rastreadas a poucos cliques da Home e preservadas durante a renderização JavaScript do Googlebot, para que sejam indexadas no Google Search.

- **Como saberemos que deu certo:**
  - 100% dos poemas publicados e 100% dos sentimentos indexáveis estão presentes como links `<a href="...">` diretamente a 1 clique da Home (`dist/index.html`) e da página Explorar (`dist/colecoes/index.html`).
  - Nenhuma página pré-renderizada (`/`, `/colecoes/`, `/colecao/:slug/`, `/sentimentos/`, `/sentimento/:slug/`, `/poema/:slug/`, `/sobre/`) perde seu conteúdo HTML ou recebe `noindex` acidental caso o Firestore esteja indisponível durante a hidratação.
  - Suíte completa de testes automatizados (`vitest run`) e build de produção (`npm run build`) executam com 0 erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Incluir link para `/sentimentos/` na navegação global (`renderBaseLayout` em `scripts/prerender.js` e `index.html`) e nos filtros da Home, reduzindo a profundidade de `/sentimentos/` para 1 clique em todo o site | P0 | CA01 |
| RF02 | Adicionar na Home (`scripts/prerender.js` e `src/pages/home.js`) uma seção semântica recolhível (`<details class="home-archive-index">`) com links `<a href="...">` para todos os poemas publicados (agrupados por ano) e todos os sentimentos indexáveis | P0 | CA02 |
| RF03 | Criar template reutilizável `src/utils/collections-template.js` e pré-renderizar o HTML completo de `dist/colecoes/index.html` em `scripts/prerender.js` contendo todas as coleções, sentimentos indexáveis e lista de poemas | P0 | CA03 |
| RF04 | Corrigir a hidratação de `data-prerendered` em `src/pages/collection.js`, `src/pages/sentiment.js`, `src/pages/sentiments.js`, `src/pages/collections.js` e `src/pages/home.js` para não destruir o DOM estático com skeleton nem aplicar `noindex`/404 em caso de falha de rede | P0 | CA04, CA05 |
| RF05 | Expandir `src/data/sentiments.js` com descrições únicas para os sentimentos indexáveis e exibir trechos (`excerpt`) dos poemas nas listagens de `/sentimento/<slug>/` e `/colecao/<slug>/` | P0 | CA06, CA07 |
| RF06 | Distribuir a seleção de poemas relacionados (`relatedPoems`) em `scripts/prerender.js` com rotação determinística entre candidatos empatados e exibir até 4 poemas relacionados por obra | P1 | CA08 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Toda página HTML gerada em `dist/` deve manter exatamente um único `<h1>` e URLs canônicas terminadas em `/` | P0 | CA02, CA03 |
| RNF02 | A distância máxima de rastreamento (*Click Depth*) a partir de `dist/index.html` até qualquer poema publicado ou sentimento indexável deve ser `<= 1` clique | P0 | CA02 |
| RNF03 | Todos os testes existentes e novos da suíte `vitest` devem passar com 100% de sucesso | P0 | CA09 |

### Dependências técnicas

- `scripts/prerender.js`, `index.html`
- `src/pages/home.js`, `src/pages/collections.js`, `src/pages/collection.js`, `src/pages/sentiment.js`, `src/pages/sentiments.js`
- `src/utils/collection-template.js`, `src/utils/collections-template.js` (novo), `src/data/sentiments.js`

### Recursos necessários

- Variáveis de ambiente `.env.local` para execução do build e pré-renderização com dados reais do Firestore.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado qualquer página pré-renderizada ou o `index.html`, quando inspeciono a navegação e a Home, então encontro links `<a href="/sentimentos/">` rastreáveis levando diretamente ao hub de sentimentos.
- [x] **CA02:** Dado o arquivo `dist/index.html` gerado pelo build, quando extraio todos os atributos `href` sem executar JavaScript, então 100% dos poemas publicados (`/poema/<slug>/`) e 100% dos sentimentos indexáveis (`/sentimento/<slug>/`) estão presentes a 1 clique da Home, mantendo apenas 1 elemento `<h1>` na página.
- [x] **CA03:** Dado o arquivo `dist/colecoes/index.html` gerado pelo build, quando o inspeciono sem JavaScript, então `<div id="app">` contém o layout pré-renderizado com `data-prerendered="/colecoes"`, links para todas as coleções (`/colecao/<slug>/`), links para sentimentos e lista de poemas publicados.
- [x] **CA04:** Dado que uma página `/colecao/<slug>/`, `/sentimento/<slug>/` ou `/sentimentos/` já possui DOM pré-renderizado (`data-prerendered` correspondente), quando o componente SPA é inicializado, então o conteúdo pré-renderizado não é substituído por skeleton vazio nem fica travado em estado de carregamento.
- [x] **CA05:** Dado que uma página pré-renderizada (`/sentimento/<slug>/`, `/sentimentos/`, `/colecao/<slug>/` ou `/`) sofre falha na requisição ao Firestore durante a execução de JS no cliente/Googlebot, quando o erro ocorre, então o DOM pré-renderizado original é preservado e `setNotFoundSEO()` (`noindex`) **não** é chamado.
- [x] **CA06:** Dado que acesso ou pré-renderizo uma página `/sentimento/<slug>/` ou `/colecao/<slug>/`, quando os poemas são listados, então cada item apresenta o título, o ano e um trecho (`excerpt`) textual dos versos do poema.
- [x] **CA07:** Dado o catálogo de sentimentos em `src/data/sentiments.js`, quando `getSentimentIntro(name, slug)` é chamado para qualquer um dos sentimentos indexáveis do site, então retorna uma introdução editorial contextualizada e distinta.
- [x] **CA08:** Dado um conjunto de poemas que compartilham os mesmos sentimentos/coleções no pré-render, quando `relatedPoems` é calculado para cada poema, então a seleção rotaciona deterministicamente entre os candidatos empatados para distribuir os links internos pelo acervo.
- [x] **CA09:** Dado que todas as alterações foram aplicadas, quando executo `npm run build` e `npx vitest run`, então o build conclui sem erros de auditoria e 100% dos testes passam.

## O que a atividade não inclui

- Alteração de domínio, DNS ou configurações manuais no painel web do Google Search Console: motivo: ação externa que depende da conta do proprietário após o deploy.
- Criação de backlinks externos (off-page SEO): motivo: fora do escopo técnico do código-fonte do repositório.

### Considerado para o futuro (P2)

- Integração com a Google Indexing API / Search Console Inspection API via script automatizado de pós-deploy.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Como disponibilizar links para todos os ~200 poemas na Home sem prejudicar o design minimalista que mostra os 20 mais recentes? | dev | Não | Utilizar um bloco semântico `<details class="home-archive-index">` ("Índice completo do acervo") abaixo da paginação da Home: o conteúdo é nativamente rastreado e indexado pelo Googlebot (Click Depth = 1), mantendo a interface limpa para o leitor. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Cobertura de 100% dos poemas e sentimentos a 1 clique na Home | integração | CA01, CA02 | Ler `dist/index.html` e comparar os links `/poema/<slug>/` e `/sentimento/<slug>/` com `dist/sitemap-poemas.xml` e `dist/sitemap-sentimentos.xml` | 100% das URLs dos sitemaps de poemas e sentimentos possuem link `<a href="...">` em `dist/index.html` |
| CT02 | Pré-renderização completa de `/colecoes/` | integração | CA03 | Ler `dist/colecoes/index.html` e verificar `data-prerendered="/colecoes"`, links `/colecao/`, `/sentimento/` e `/poema/` | HTML estático populado com coleções, sentimentos e poemas |
| CT03 | Hidratação sem skeleton bug em `/colecao/:slug` | unit | CA04, CA05 | Chamar `collection.render(container, { slug })` com `data-prerendered="/colecao/slug"` preenchido | DOM pré-renderizado é mantido, sem ficar preso em `.skeleton` |
| CT04 | Resiliência de `/sentimento/:slug` e `/sentimentos/` quando pré-renderizados | unit | CA04, CA05 | Simular falha no Firestore ao renderizar `sentiment` com `data-prerendered="/sentimento/amor"` | Conteúdo pré-renderizado permanece no container e `meta[name="robots"]` não recebe `noindex` |
| CT05 | Exibição de trechos (`excerpt`) nas listas de sentimentos e coleções | unit | CA06 | Renderizar `sentiment` e `renderCollectionMarkup` com poemas contendo `content`/`excerpt` | Elementos `.poem-row-excerpt` presentes com texto dos versos |
| CT06 | Descrições ricas em `src/data/sentiments.js` | unit | CA07 | Consultar `getSentimentIntro` para os sentimentos listados no Search Console | Retorna textos descritivos ricos e distintos |
| CT07 | Rotação determinística de `relatedPoems` | unit | CA08 | Calcular poemas relacionados para múltiplos poemas do mesmo grupo | Todos os poemas do grupo recebem links de entrada distribuídos |

## URL Complementar

- Documentação técnica:
  - Google Search Central — Links crawlable & Click Depth: https://developers.google.com/search/docs/crawling-indexing/links-crawlable
  - Google Search Central — Fix "Discovered - currently not indexed": https://support.google.com/webmasters/answer/7440203
- Protótipo / mockup: N/A — mantém a identidade visual editorial do site.
- Discussões relacionadas: `SDD/DONE/2026-09-24_seo-links-rastreaveis-e-pagina-sobre.md`, `SDD/DONE/2026-09-24_seo-paginas-de-sentimentos.md`.
- Referências de design: Layout atual da Home e páginas de Coleção/Sentimento.
- Requisitos originais: Relatório de cobertura de indexação do Google Search Console (244 páginas com status "Detectada, mas não indexada no momento").
- Issue / PR relacionado: N/A.
