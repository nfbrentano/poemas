# [FIX] Prevenir erros de Soft 404 e noindex indevido na renderização de páginas de coleções e poemas

> **Status:** Concluída
> **Autor:** Natanael Brentano / Antigravity · **Revisor:** Autor · **Criada em:** 2026-10-07 · **Atualizada em:** 2026-10-07

## Detalhes da Atividade

- **O que precisa ser feito:** 
  1. Garantir hidratação estática segura em `src/pages/collection.js`, lendo payload `<script id="__DATA__">` embutido durante o prerender, sem apagar o DOM estático com skeletons e sem disparar consultas obrigatórias ao Firestore na carga inicial da página.
  2. Injetar `<script type="application/json" id="__DATA__">` nas páginas de coleção em `scripts/prerender.js`, alinhando a arquitetura de coleções à de poemas.
  3. Blindar `collection.js` e `poem.js` contra o acionamento indevido de `setNotFoundSEO()` quando a página já tiver sido entregue pré-renderizada com sucesso pelo servidor estático. Em caso de falha de conexão com o Firestore no cliente (como na sandbox do Googlebot WRS), o conteúdo pré-renderizado deve ser mantido intacto e nenhuma tag `noindex` ou título de erro deve ser injetada.
- **Problema e evidência:** 
  - Páginas públicas de coleções (ex.: `/colecao/amor/`, `/colecao/amor-e-conexao/`) e poemas foram apontadas no Google Search Console sob as categorias *"Identificada, mas não indexada no momento"*, *"Excluída pela tag 'noindex'"* e *"Erro soft 404"*.
  - Análise de código: em `src/pages/collection.js`, a primeira linha de execução substitui o DOM pré-renderizado por esqueletos de carregamento (`container.innerHTML = skeleton...`). Em seguida, executa chamadas assíncronas ao Firestore (`getDocs`). Quando essas chamadas falham (muito comum em sandboxes de rastreadores como o Googlebot WRS que não abrem conexões WebSocket persistentes ou encerram requisições rapidamente), o bloco de erro chama `setNotFoundSEO()`. Essa função insere `<meta name="robots" content="noindex">`, remove a tag canonical e exibe *"Página não encontrada"* sob o status HTTP 200 do GitHub Pages, caracterizando exatamente Soft 404 e desindexação por noindex.
- **Impacto de não fazer:** 
  - Desindexação contínua de coleções e poemas no Google; desperdício do orçamento de rastreamento (*crawl budget*); acúmulo de páginas na fila *"Identificada, mas não indexada no momento"*.
- **Para quem é destinado:** Mecanismos de busca (Googlebot, Bingbot), leitores do site e o autor.
- **História de usuário:** Como autor e leitor, quero que as páginas de coleções e poemas mantenham seu conteúdo estático e tags canônicas intactos durante a hidratação da SPA, para que os rastreadores consigam indexar todo o acervo sem encontrar páginas de erro ou tags noindex geradas por falhas de script.
- **Como saberemos que deu certo:** 100% das páginas de coleções pré-renderizadas preservam seu HTML e dados sem disparar `setNotFoundSEO()`, mesmo quando a chamada do Firestore for bloqueada ou falhar; cobertura completa por testes automatizados com `vitest`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | `scripts/prerender.js` deve embutir `<script type="application/json" id="__DATA__">` em cada página de coleção gerada no build, contendo os metadados da coleção e a lista ordenada de poemas. | P0 | CA01 |
| RF02 | `src/pages/collection.js` deve verificar se a página foi pré-renderizada (`data-prerendered` ou presença de dados) antes de alterar o DOM, reaproveitando o HTML existente e hidratando a partir do `__DATA__` sem exibir skeletons. | P0 | CA02 |
| RF03 | `src/pages/collection.js` e `src/pages/poem.js` não devem chamar `setNotFoundSEO()` se a página já possui conteúdo pré-renderizado válido daquela rota. Em caso de erro de rede ou do Firestore, o conteúdo pré-renderizado deve ser preservado. | P0 | CA03, CA04 |
| RF04 | Apenas rotas verdadeiramente inexistentes acessadas dinamicamente via SPA (onde não há conteúdo pré-renderizado e o Firestore confirmar que o documento não existe) devem invocar `setNotFoundSEO()`. | P0 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma página de coleção ou poema do sitemap deve conter `<meta name="robots" content="noindex">` antes ou após a execução do JavaScript em páginas válidas. | P0 | CA01, CA02, CA03 |
| RNF02 | O tempo de carregamento e First Contentful Paint (FCP) de coleções deve permanecer instantâneo, sem CLS causado por skeletons substituindo texto pré-renderizado. | P1 | CA02 |

### Dependências técnicas

- `scripts/prerender.js`, `src/pages/collection.js`, `src/pages/poem.js`, `src/utils/seo.js`.

### Recursos necessários

- N/A (ambiente de build e testes existente no repositório).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o build de pré-renderização, quando `dist/colecao/<slug>/index.html` é gerado, então o arquivo contém a tag `<script type="application/json" id="__DATA__">` com os dados da coleção e poemas.
- [x] **CA02:** Dado que o usuário ou bot carrega uma página pré-renderizada de coleção `/colecao/<slug>/`, quando o script da SPA é executado, então o DOM estático não é apagado com skeletons e nenhuma chamada obrigatória de rede é necessária para exibir os poemas.
- [x] **CA03:** Dado uma página de coleção pré-renderizada `/colecao/<slug>/`, quando o cliente JavaScript sofre uma falha de conexão (ex.: Firestore offline ou rejeitado), então a página NÃO dispara `setNotFoundSEO()`, NÃO insere `noindex`, NÃO altera o título para "Página não encontrada" e preserva o conteúdo da coleção.
- [x] **CA04:** Dado uma página de poema pré-renderizada `/poema/<slug>/`, quando o cliente JavaScript sofre erro de conexão, então o conteúdo e SEO do poema permanecem intactos sem acionar `setNotFoundSEO()`.
- [x] **CA05:** Dado uma navegação SPA para uma URL inexistente `/colecao/slug-que-realmente-nao-existe/` sem pré-renderização, quando a busca no Firestore retorna vazio, então `setNotFoundSEO()` é chamado exibindo 404.

## O que a atividade não inclui

- Forçar indexação manual de URLs no painel do Google Search Console (isso é feito pelo autor no Search Console após o deploy).
- Modificar regras de noindex em páginas privadas (`/admin`, `/login`, `/unsubscribe`).

### Considerado para o futuro (P2)

- N/A.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | As coleções precisam recarregar dados do Firestore caso o usuário navegue entre páginas via SPA? | Dev | Não | Sim, na navegação cliente (links internos) entre páginas diferentes, se não houver pré-render da nova rota, faz o fetch normal no Firestore. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | `__DATA__` em coleções pré-renderizadas | Integração | CA01 | Inspecionar `dist/colecao/amor/index.html` após build | Contém `<script type="application/json" id="__DATA__">` com `col` e `poemsList` |
| CT02 | Hidratação de coleção sem skeleton | Integração/Unit | CA02 | Renderizar `collection.js` em container com `data-prerendered` e `__DATA__` | Não substitui container por skeleton, lê dados do script |
| CT03 | Coleção pré-renderizada resiliente a erro de rede | Unit | CA03 | Renderizar `collection.js` com dados pré-renderizados forçando erro no Firestore | Não chama `setNotFoundSEO()`, `meta[name="robots"]` não contém `noindex` |
| CT04 | Poema pré-renderizado resiliente a erro | Unit | CA04 | Renderizar `poem.js` com `data-prerendered` forçando erro de rede | Mantém conteúdo do poema e não aciona `setNotFoundSEO()` |
| CT05 | Coleção inexistente em navegação dinâmica | Unit | CA05 | Navegar dinamicamente para slug inexistente | Exibe 404 e chama `setNotFoundSEO()` |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/http-network-errors#soft-404-errors
- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Protótipo / mockup: N/A
- Discussões relacionadas: `SDD/DONE/2026-09-24_seo-indexacao-noindex-robots-404.md`
- Referências de design: N/A
- Requisitos originais: Relato de páginas com erro Soft 404 e noindex no Search Console (2026-10-07)
