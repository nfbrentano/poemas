# [FIX] Resiliência no FetchEvent do Service Worker para Rotas SPA e Fallback de Rede

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o tratamento de eventos de fetch no Service Worker (`public/sw.js`) para evitar que requisições a rotas SPA (como `/sobre`, `/colecoes/`, `/sentimentos/`, etc.) e recursos de mesma origem rejeitem a promise do `FetchEvent` com `Uncaught (in promise) TypeError: Failed to fetch`.
- **Por que é necessário:** Quando o navegador ou scripts fazem prefetch/fetch de rotas como `https://nfgbrentano.art.br/sobre` sem `mode === 'navigate'`, a requisição caía no handler genérico com stale-while-revalidate. Se o recurso não estivesse em cache ou a rede falhasse, o bloco executava `throw err`, causando rejeição da promise do `FetchEvent` (`the promise was rejected`) no console do navegador. Além disso, revalidações em background que falham não devem disparar exceções não tratadas no escopo do Service Worker.
- **Qual valor será agregado:** Eliminação completa dos erros de console do Service Worker, melhoria da resiliência offline/PWA e garantia de que rotas SPA sempre tenham fallback para `/index.html` ou `/offline.html` sem quebrar o ciclo de vida do Service Worker.
- **Para quem é destinado:** Usuários e administradores do site, prevenindo quebras em conexões instáveis e ruído nos relatórios de console e telemetria.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Identificar requisições para rotas HTML/páginas mesmo quando `request.mode !== 'navigate'` (por exemplo: prefetch via `purpose: prefetch`, `destination === 'document'`, cabeçalho `Accept: text/html` ou caminhos sem extensão de arquivo).
- RF02: Tratar falhas de rede no handler HTML com fallback elegante (primeiro cache da rota, depois `/index.html`, depois `/offline.html`), retornando uma resposta válida sem rejeitar a promise do `FetchEvent`.
- RF03: No handler de outros recursos de mesma origem (stale-while-revalidate), capturar erros da chamada de rede em segundo plano sem relançar (`throw err`), e caso o recurso não esteja em cache, retornar uma resposta estruturada de fallback (ex.: status 408 ou 503) em vez de rejeitar a promise.
- RF04: Incrementar a versão do cache (`CACHE_NAME`) para invalidar versões antigas e ativar o Service Worker atualizado.

### Requisitos não-funcionais

- RNF01: Compatibilidade total com navegadores modernos (Chrome, Safari, Firefox, Edge) e seus mecanismos de prefetch/speculation rules.
- RNF02: Não degradar a performance de carregamento dos assets e manter a pontuação de Core Web Vitals.

### Dependências técnicas

- Arquivo [`public/sw.js`](file:///Users/natanaelfernandogattibrentano/poemas/public/sw.js)
- Testes automatizados do projeto (`vitest`)

### Recursos necessários

- N/A (Alteração puramente em JavaScript clientside no Service Worker).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que uma requisição para uma rota HTML como `/sobre` falha na rede ou ocorre via prefetch, quando o Service Worker intercepta o FetchEvent, então a promise não é rejeitada e uma resposta válida (ou fallback de cache/index) é retornada.
- [x] **CA02:** Dado que um recurso de mesma origem não está em cache e a requisição de rede falha, quando o Service Worker processa o evento, então ele não emite `Uncaught (in promise) TypeError: Failed to fetch`.
- [x] **CA03:** Dado que um recurso está em cache e a revalidação de rede em segundo plano falha, quando a revalidação rejeita, então o erro é capturado internamente sem gerar exceção global não tratada no Service Worker.
- [x] **CA04:** Todos os testes unitários e de integração existentes continuam passando com sucesso.

## O que a atividade não inclui

- Configuração de credenciais no Google Cloud Console (esta é uma ação manual na nuvem do Google pelo proprietário da conta).
- Alteração no fluxo de autenticação do Firebase Auth em si.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Fetch de rota HTML sem cache | Simular FetchEvent para `/sobre` sem rede | Service Worker retorna fallback `/index.html` ou `/offline.html` sem rejeitar promise |
| CT02 | Falha de rede em asset no stale-while-revalidate | Simular FetchEvent para asset não em cache com rede indisponível | Retorna resposta 408/503 em vez de estourar TypeError não tratado |
| CT03 | Suite de testes existente | Executar `npm test -- --run` | 100% dos testes passam |

## URL Complementar

- Documentação técnica: https://developer.chrome.com/docs/workbox/caching-strategies-overview/
- Protótipo / mockup: N/A
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Relato de erro de console `sw.js:111 Uncaught (in promise) TypeError: Failed to fetch` para `/sobre`
