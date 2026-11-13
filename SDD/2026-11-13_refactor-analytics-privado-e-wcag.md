# [REFACTOR] Resiliência de analytics (remoção de dependência ipapi.co), foco WCAG AA e lint limpo

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Eliminar a dependência direta do cliente na API externa `https://ipapi.co/json/` em [`src/utils/analytics.js`](../src/utils/analytics.js), restaurar indicadores de foco visível compatíveis com WCAG AA onde há `outline: none` em [`src/styles/components.css`](../src/styles/components.css), substituir a policy `default` passthrough de Trusted Types em [`public/theme-init.js`](../public/theme-init.js) por política compatível com sanitização real e zerar os 106 warnings atualmente reportados pelo ESLint.
- **Problema e evidência:**
  1. [`src/utils/analytics.js`](../src/utils/analytics.js) consulta `https://ipapi.co/json/` diretamente no navegador do visitante. A API gratuita tem rate-limit rígido (HTTP 429) e é frequentemente bloqueada por extensões anti-rastreamento/Firefox ETP, além de exigir liberação em `connect-src` da CSP em [`index.html`](../index.html).
  2. [`src/styles/components.css`](../src/styles/components.css) define `outline: none` em campos de busca (`#mobile-search-input`, `#overlay-search-input`, `.search-sort-controls select`) e nos sliders do player de narração (`.narration-slider`, `.narration-volume-slider`) sem estilização `:focus-visible` equivalente, prejudicando navegação por teclado.
  3. [`public/theme-init.js`](../public/theme-init.js) registra uma policy Trusted Types `'default'` passthrough que retorna a string bruta para `createHTML`, `createScript` e `createScriptURL`.
  4. A execução atual de `eslint src scripts functions` reporta **0 erros e 106 warnings** (variáveis/imports não utilizados e assignments diretos a `innerHTML` sem `unwrapSafeHTML`/`escapeHtml` no admin e analytics em [`eslint.config.js`](../eslint.config.js)).
- **Impacto de não fazer:** Erros silenciosos ou bloqueios de rede em analytics de país no cliente; barreira de acessibilidade para usuários de teclado no player de áudio e filtros de busca; ruído de mais de cem warnings no CI mascarando regressões futuras no ESLint.
- **Para quem é destinado:** Usuários navegando via teclado/leitor de tela, visitantes com bloqueadores de privacidade e mantenedores do repositório.
- **História de usuário:** Como usuário que navega pelo teclado ou preza por privacidade, quero que o site funcione sem depender de API de geolocalização de terceiros e com foco visível claro em todos os controles, para ter uma experiência acessível e confiável.
- **Como saberemos que deu certo:** Nenhuma chamada do navegador para `ipapi.co`; 100% dos controles interativos possuem `:focus-visible` nítido; `npm run lint` executa com **0 erros e 0 warnings** (permitindo ativar `--max-warnings 0` no CI).

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Refatorar [`src/utils/analytics.js`](../src/utils/analytics.js) para registrar visualizações em `page_views` sem chamar `https://ipapi.co/json/` no navegador (gerando `session_hash` local efêmero/diário com `crypto.subtle` sem IP externo ou, caso país seja mantido, derivando via Cloud Function/proxy opcional sob demanda com timeout curto), limpando `https://ipapi.co` da CSP em [`index.html`](../index.html) se removido. | P0 | CA01, CA02 |
| RF02 | Garantir estado `:focus-visible` acessível (anel de `2px solid var(--accent-subtle)` com contraste adequado) em todos os controles de [`src/styles/components.css`](../src/styles/components.css) que hoje suprimem `outline` (`#mobile-search-input`, `#overlay-search-input`, `.search-sort-controls select`, `.narration-slider`, `.narration-volume-slider`) e remover `outline: none` de [`global.css`](../src/styles/global.css) onde não houver substituto visual suficiente. | P0 | CA03 |
| RF03 | Revisar [`public/theme-init.js`](../public/theme-init.js) removendo a policy `'default'` passthrough permissiva (mantendo compatibilidade com os navegadores sem quebrar a inicialização de tema e criando policy nomeada explícita em [`src/utils/html.js`](../src/utils/html.js) apenas para HTML já sanitizado/montado via `unwrapSafeHTML`). | P1 | CA04 |
| RF04 | Eliminar os `106` warnings do ESLint removendo imports/variáveis não utilizadas e aplicando `escapeHtml()` + `unwrapSafeHTML()` nos templates de admin e analytics ([`src/pages/admin.js`](../src/pages/admin.js), [`src/pages/admin/*.js`](../src/pages/admin/dashboard.js), [`src/pages/analytics.js`](../src/pages/analytics.js)), removendo o override `'warn'` em [`eslint.config.js`](../eslint.config.js). | P1 | CA05 |
| RF05 | Atualizar [`.github/workflows/pr.yml`](../.github/workflows/pr.yml) e [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) / [`package.json`](../package.json) para executar `eslint` com `--max-warnings 0`. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A gravação em `page_views` após troca de rota deve continuar respeitando integralmente [`firestore.rules`](../firestore.rules) (`poem_id`, `path`, `user_agent`, `created_at` e demais campos permitidos) e não atrasar a renderização (`non-blocking`). | P0 | CA01 |
| RNF02 | Contraste do indicador `:focus-visible` >= 3:1 nos 4 temas do site (`dark`, `light`, `sepia`, `contrast`). | P0 | CA03 |
| RNF03 | `npm run lint` deve completar com código de saída 0 e 0 warnings em `src/`, `scripts/` e `functions/`. | P1 | CA05 |

### Dependências técnicas

- [`src/utils/analytics.js`](../src/utils/analytics.js), [`src/pages/analytics.js`](../src/pages/analytics.js), [`index.html`](../index.html), [`firestore.rules`](../firestore.rules).
- [`src/styles/components.css`](../src/styles/components.css), [`src/styles/global.css`](../src/styles/global.css).
- [`public/theme-init.js`](../public/theme-init.js), [`src/utils/html.js`](../src/utils/html.js).
- [`eslint.config.js`](../eslint.config.js) e [`package.json`](../package.json).

### Recursos necessários

- N/A — sem novas dependências externas; opcionalmente verificar se [`src/pages/analytics.js`](../src/pages/analytics.js) precisa adaptar o card "Países" caso deixe de coletar `country` no cliente.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que navego por 3 poemas no site, quando inspeciono as requisições de rede no cliente, então nenhuma requisição vai para `ipapi.co` e os documentos de `page_views` continuam sendo aceitos pelas regras do Firestore.
- [ ] **CA02:** Dado que o analytics administrativo ([`src/pages/analytics.js`](../src/pages/analytics.js)) é aberto com registros sem campo `country` (ou usando fallback do Clarity), quando renderiza, então não lança exceção nem exibe `"undefined"` na tabela geográfica.
- [ ] **CA03:** Dado que navego por teclado (`Tab`) pelo overlay de busca e pelo player de áudio, quando o foco alcança o `<select>` de ordenação ou os sliders de progresso/volume, então há indicador visual de foco claro (`outline` ou `box-shadow` equivalente) nos 4 temas.
- [ ] **CA04:** Dado o carregamento inicial de `index.html` com [`public/theme-init.js`](../public/theme-init.js), quando verifico políticas Trusted Types, então nenhuma policy `'default'` retorna strings de `<script>`/`innerHTML` arbitrariamente sem passar pelo fluxo controlado da aplicação.
- [ ] **CA05:** Dado o comando `eslint --max-warnings 0 src scripts functions`, quando executado na CI e localmente, então finaliza com `0` erros e `0` warnings mantendo todas as proteções de `no-unsanitized` ativas inclusive no admin.

## O que a atividade não inclui

- Substituição do Microsoft Clarity por uma ferramenta própria de heatmaps/session replay: motivo: Clarity já está integrado e atende bem à observabilidade comportamental.
- Alteração visual radical nos temas `dark`, `light`, `sepia` e `contrast`: motivo: manter identidade estética atual alterando apenas estados de foco.

### Considerado para o futuro (P2)

- Endpoint leve em Cloud Function (`trackPageView`) que lê cabeçalhos de região no servidor/CDN para recuperar contagem por país sem expor IP nem depender de API de terceiros no browser.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O card de distribuição por "Países" em [`src/pages/analytics.js`](../src/pages/analytics.js) é usado ativamente (justificando criar um endpoint leve em Cloud Functions para geolocalização anônima no servidor) ou pode ser substituído por métricas do Clarity removendo `country` do `page_views`? | PO | Sim | |
| D02 | Ao trocar a policy `'default'` passthrough em [`theme-init.js`](../public/theme-init.js), o carregamento do script do Microsoft Clarity e Firebase SDK exige permitir `clarity.ms`/`apis.google.com` ou apenas remover `defaultPolicy` até adotar `require-trusted-types-for` na CSP? | dev | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Registro de view sem `ipapi.co` | unit/integração | CA01 | Espionar `global.fetch` e chamar `trackPageView` em `analytics.js` | `fetch` para `ipapi.co` nunca chamado; documento válido enviado ao Firestore |
| CT02 | Painel analytics com `country` ausente | integração (jsdom) | CA02 | Renderizar `analytics.js` com `page_views` sem `country`/`city` | Renderiza estado vazio amigável sem `"undefined"` |
| CT03 | Validação CSS de foco acessível | unit | CA03 | Inspecionar regras de `components.css`/`global.css` | Controles com `outline: none` possuem `:focus-visible` correspondente |
| CT04 | Ausência de policy `default` passthrough | unit | CA04 | Avaliar comportamento de `theme-init.js` e `unwrapSafeHTML` | `theme-init.js` não registra `defaultPolicy` passthrough irrestrita e o app renderiza normalmente |
| CT05 | Lint estrito sem warnings | integração (CI) | CA05 | Rodar `eslint --max-warnings 0 src scripts functions` | Exit code 0 e 0 warnings |

## URL Complementar

- Documentação técnica: [`src/utils/analytics.js`](../src/utils/analytics.js), [`src/pages/analytics.js`](../src/pages/analytics.js), [`src/styles/components.css`](../src/styles/components.css), [`public/theme-init.js`](../public/theme-init.js), [`eslint.config.js`](../eslint.config.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-09-29_fix-alertas-code-scanning-codeql.md`](DONE/2026-09-29_fix-alertas-code-scanning-codeql.md), [`SDD/DONE/2026-10-23_integracao-microsoft-clarity.md`](DONE/2026-10-23_integracao-microsoft-clarity.md)
- Referências de design: [`src/styles/variables.css`](../src/styles/variables.css)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
