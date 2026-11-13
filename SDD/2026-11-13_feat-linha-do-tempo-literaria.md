# [FEAT] Página de Arquivo e Linha do Tempo Literária (`/arquivo/`)

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Criar a rota pública e pré-renderizada `/arquivo/` apresentando uma linha do tempo cronológica interativa de toda a obra publicada desde dezembro de 2015 até o ano corrente, com agrupamento por ano/mês, destaques automáticos de marcos literários (1º, 50º, 100º, 200º poema publicado, picos anuais) e distribuição temática de sentimentos por fase.
- **Problema e evidência:** Hoje a única navegação por anos fica em um `<details>` colapsado no rodapé da Home ([`src/pages/home.js`](../src/pages/home.js)) e nos textos estáticos da seção "Marcos Literários" em [`src/utils/about-template.js`](../src/utils/about-template.js). Conforme o acervo cresce além de 2026 (atualmente mais de 200 obras), falta uma página dedicada que conte a evolução poética ano a ano com URL indexável e dinâmica (sem depender de edição manual dos marcos em `about-template.js`).
- **Impacto de não fazer:** Poemas de anos intermediários ficam enterrados na paginação cronológica da Home; os marcos e contagens em `about-template.js` tendem a ficar desatualizados manualmente.
- **Para quem é destinado:** Leitores interessados na trajetória e evolução estilística do poeta, pesquisadores/estudantes e motores de busca (malha de links internos cronológicos).
- **História de usuário:** Como leitor ou pesquisador, quero explorar os poemas em uma linha do tempo por ano com estatísticas e marcos da obra, para acompanhar como a escrita evoluiu desde 2015.
- **Como saberemos que deu certo:** Rota `/arquivo/` pré-renderizada em `dist/arquivo/index.html`, incluída no `sitemap-paginas.xml` e `llms.txt`, carregando todos os anos com âncoras navegáveis (`#ano-2025`), marcos calculados automaticamente a partir dos poemas publicados e `0` links quebrados.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Criar utilitário puro `src/utils/archive-builder.js` que agrupa poemas publicados por ano (`published_at`, ordem decrescente ou alternável crescente/decrescente), calcula total por ano, principais sentimentos de cada ano e marcos históricos automáticos (1º poema, 50º, 100º, 150º, 200º, etc. em ordem cronológica ascendente). | P0 | CA01, CA02 |
| RF02 | Criar página `src/pages/archive.js` (novo arquivo) e registrá-la no [`src/router.js`](../src/router.js) em `/arquivo/`, exibindo sumário rápido de anos (âncoras/filtros), toggle de ordem (`Mais recentes primeiro` vs `Ordem cronológica desde 2015`) e blocos anuais com contagem de poemas e principais tags do ano. | P0 | CA01, CA03 |
| RF03 | Pré-renderizar `/arquivo/` em [`scripts/prerender.js`](../scripts/prerender.js) (com JSON-LD `CollectionPage` + `BreadcrumbList`), incluí-la em `knownRoutes`, [`scripts/generate-sitemap.js`](../scripts/generate-sitemap.js) (`sitemap-paginas.xml`) e [`src/utils/llms-builder.js`](../src/utils/llms-builder.js). | P0 | CA04 |
| RF04 | Adicionar link discreto para `/arquivo/` no bloco "Arquivo por Ano" da Home ([`src/pages/home.js`](../src/pages/home.js)) e na seção "Marcos Literários" de [`src/utils/about-template.js`](../src/utils/about-template.js), além de corrigir ou atualizar o cálculo dinâmico da contagem de poemas. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A página `/arquivo/` deve incluir apenas poemas com `status === 'published'` (jamais rascunhos ou agendados). | P0 | CA06 |
| RNF02 | O HTML pré-renderizado de `dist/arquivo/index.html` deve conter todos os links `<a href="/poema/<slug>/">` rastreáveis sem exigir execução de JavaScript. | P0 | CA04 |
| RNF03 | O cálculo e renderização de 250–1000 poemas no cliente deve levar `< 100ms` usando [`poems-store.js`](../src/utils/poems-store.js). | P1 | CA01 |

### Dependências técnicas

- [`src/router.js`](../src/router.js) e [`src/utils/poems-store.js`](../src/utils/poems-store.js).
- [`scripts/prerender.js`](../scripts/prerender.js), [`scripts/generate-sitemap.js`](../scripts/generate-sitemap.js), [`src/utils/sitemap-builder.js`](../src/utils/sitemap-builder.js), [`src/utils/llms-builder.js`](../src/utils/llms-builder.js).
- [`src/utils/structured-data.js`](../src/utils/structured-data.js) e [`src/utils/about-template.js`](../src/utils/about-template.js).

### Recursos necessários

- N/A — utiliza o acervo existente em `poems` e `src/data/sentiments.js`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um acervo com poemas publicados entre 2015 e o ano atual, quando acesso `/arquivo/`, então vejo os anos organizados em linha do tempo com a contagem exata de obras e links clicáveis para cada poema.
- [ ] **CA02:** Dado 100+ poemas publicados ordenados cronologicamente do mais antigo para o mais novo, quando o módulo calcula os marcos literários, então identifica corretamente o 1º poema, o 50º e o 100º com título, data e link.
- [ ] **CA03:** Dado que estou em `/arquivo/`, quando seleciono "Ordem cronológica (2015 → atual)" ou clico em um chip de ano no topo, então a lista reordena ou rola para o ano selecionado mantendo usabilidade no mobile.
- [ ] **CA04:** Dado o build de produção, quando verifico `dist/arquivo/index.html` e `dist/sitemap-paginas.xml`, então o arquivo HTML contém marcação semântica, `<link rel="canonical" href="https://nfgbrentano.art.br/arquivo/">` e a URL consta no sitemap.
- [ ] **CA05:** Dado que visito a Home ou `/sobre/`, quando olho a seção de arquivo ou marcos literários, então encontro link navegável SPA (`data-link`) levando a `/arquivo/`.
- [ ] **CA06:** Dado um poema em rascunho ou agendado no conjunto de entrada, quando a linha do tempo e o prerender são gerados, então o poema não publicado nunca aparece na listagem nem nos marcos.

## O que a atividade não inclui

- Gráficos complexos de nuvem de palavras com bibliotecas pesadas externas (Chart.js/D3): motivo: manter bundle leve usando apenas HTML/CSS editorial e SVG simples se necessário.
- Adição de um novo botão na barra inferior fixa (`bottom-nav`): motivo: a barra inferior já tem 5 itens definidos para evitar aperto em telas estreitas.

### Considerado para o futuro (P2)

- Retrospectiva anual automática ("Seu ano em poesia — 2026") ao final de dezembro de cada ano com links compartilháveis.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O bloco de arquivo na Home deve permanecer como `<details>` simples + link "Ver linha do tempo completa →" ou ser substituído por apenas um card/chamada para `/arquivo/`? | design/PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Agrupamento por ano e marcos | unit | CA01, CA02, CA06 | Testar `archive-builder.js` com poemas `published`, `draft` e `scheduled` distribuídos em múltiplos anos | Apenas `published` contabilizados; marcos (1º, 50º, 100º) exatos |
| CT02 | Alternância de ordenação na UI | integração (jsdom) | CA03 | Renderizar `archive.js` e clicar no controle de ordem cronológica | Anos invertem de `desc` para `asc` e vice-versa |
| CT03 | Prerender e Sitemap de `/arquivo/` | integração (pós-build) | CA04 | Inspecionar `dist/arquivo/index.html`, `dist/routes.json` e `dist/sitemap-paginas.xml` | HTML pré-renderizado sem `noindex`; rota presente no sitemap |
| CT04 | Links de entrada na Home e Sobre | integração (jsdom) | CA05 | Renderizar Home e `about-template.js` | Contêm `<a href="/arquivo/" data-link>` |

## URL Complementar

- Documentação técnica: [`src/pages/home.js`](../src/pages/home.js), [`src/utils/about-template.js`](../src/utils/about-template.js), [`src/router.js`](../src/router.js), [`scripts/prerender.js`](../scripts/prerender.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-03_otimizacao-rastreamento-e-indexacao-google.md`](DONE/2026-11-03_otimizacao-rastreamento-e-indexacao-google.md)
- Referências de design: [`src/styles/global.css`](../src/styles/global.css)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
