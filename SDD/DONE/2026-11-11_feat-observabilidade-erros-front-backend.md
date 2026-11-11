# [FEAT] Observabilidade de erros no front-end e back-end com persistência em banco de dados

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-11 · **Atualizada em:** 2026-11-11

## Detalhes da Atividade

- **O que precisa ser feito:** Criar um sistema completo de observabilidade de erros para capturar, sanitizar e persistir no banco de dados (Cloud Firestore, coleção `error_logs`) as falhas que ocorrem no front-end (exceções globais, rejeições de Promises, falhas de rotas/chunks e erros em fluxos de interação) e no back-end (Cloud Functions e scripts de automação/CI), além de disponibilizar uma interface dedicada no painel administrativo (`Escrivaninha`) para triagem, análise de causa-raiz e gestão de resolução visando melhorias e ajustes futuros.
- **Problema e evidência:** Atualmente, erros ocorridos no navegador dos leitores são apenas impressos via `console.error` ou `console.warn` localmente (ex.: [`src/router.js`](../src/router.js) linha 281, [`src/main.js`](../src/main.js) linha 174, [`src/utils/analytics.js`](../src/utils/analytics.js) linhas 45–48) e não há captura global de `window.onerror` nem `unhandledrejection`. No back-end, [`functions/index.js`](../functions/index.js) registra detalhes de falhas apenas no stdout do Cloud Functions (`firebase-functions/logger`) e resume o disparo em `email_campaign_logs`, enquanto scripts críticos como [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) emitem erros somente nos logs temporários do GitHub Actions. Como consequência, falhas silenciosas em dispositivos reais ou rotinas de servidor não ficam centralizadas no banco de dados para atuação posterior.
- **Impacto de não fazer:** O autor fica sem visibilidade sobre bugs enfrentados por leitores em navegadores/dispositivos específicos (ex.: Webviews mobile, falhas de cache/Service Worker, erros de permissão no Firestore) e sobre falhas operacionais de back-end, perdendo insumos concretos para priorizar correções e evoluir a plataforma.
- **Para quem é destinado:** Autor e administrador do site (`Natanael Fernando Gatti Brentano`).
- **História de usuário:** Como autor e administrador da plataforma, quero que os erros do front-end e do back-end sejam salvos de forma estruturada no banco de dados e consultáveis no painel administrativo, para identificar problemas reais, priorizar correções e atuar em melhorias e ajustes futuros.
- **Como saberemos que deu certo:** 100% das exceções não tratadas e erros críticos instrumentados no front-end e no back-end geram registros válidos na coleção `error_logs` do Firestore; o painel `/admin?view=errors` permite filtrar, inspecionar e marcar erros como resolvidos em até 2 cliques; 0 loops de erro ou impacto perceptível na navegação do leitor caso a gravação do log falhe.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Capturar automaticamente no front-end exceções síncronas/assíncronas não tratadas (`window` `error`), rejeições de Promises não tratadas (`unhandledrejection`) e falhas de carregamento de rotas ou módulos dinâmicos (`ChunkLoadError`, `vite:preloadError`) em [`src/router.js`](../src/router.js) e [`src/main.js`](../src/main.js). | P0 | CA01, CA02 |
| RF02 | Disponibilizar utilitário central de telemetria (`reportError(error, context)` em `src/utils/error-reporter.js`) para registrar falhas capturadas em blocos `try/catch` de fluxos importantes do front-end (comentários, reações, inscrição em newsletter, notificações push, leitura do Firestore e operações do admin). | P0 | CA02 |
| RF03 | Capturar e persistir erros ocorridos no back-end — na Cloud Function `sendNewsletter` ([`functions/index.js`](../functions/index.js)) e nos scripts automatizados de servidor/CI ([`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js)) — na coleção `error_logs`, identificando a camada de origem (`backend:functions` ou `backend:scripts`). | P0 | CA03, CA04 |
| RF04 | Persistir cada erro em `error_logs` com estrutura padronizada: `source` (`frontend` \| `backend:functions` \| `backend:scripts`), `category` (`runtime` \| `promise` \| `router` \| `chunk` \| `firestore` \| `network` \| `smtp` \| `script` \| `sw`), `severity` (`error` \| `warning` \| `critical`), `message`, `stack`, `route_or_task` (caminho da URL ou nome da função/script), `fingerprint` (chave determinística do erro para correlação), `context` (metadados seguros), `user_agent`, `status` (`open` \| `resolved` \| `ignored`) e `created_at` (ISO 8601). | P0 | CA01, CA03, CA05 |
| RF05 | Implementar controle de ruído no front-end: desduplicação por `fingerprint` dentro da mesma sessão de navegação, limite máximo de 10 erros enviados por sessão, descarte de user-agents de bots/crawlers conhecidos e supressão de erros de rede esperados quando o navegador estiver offline (`navigator.onLine === false`). | P0 | CA06, CA07 |
| RF06 | Criar a aba "Erros" (`/admin?view=errors`) no painel administrativo ([`src/pages/admin.js`](../src/pages/admin.js)), exibindo KPIs (total em aberto, ocorrências nas últimas 24h e 7 dias, proporção front-end vs. back-end), busca textual e filtros por `source`, `severity`, `category` e `status`. | P0 | CA08, CA09 |
| RF07 | Permitir ao administrador no painel `/admin?view=errors` inspecionar os detalhes completos de um registro (stack trace, rota/tarefa, contexto, fingerprint, user-agent, data/hora), alterar seu `status` (`open`, `resolved`, `ignored`) e excluir registros individualmente ou limpar resolvidos. | P0 | CA10 |
| RF08 | Exibir no painel inicial do admin (`/admin?view=dashboard`, [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js)) um indicador com a contagem de erros com `status == 'open'` e link rápido para `/admin?view=errors`. | P1 | CA11 |
| RF09 | Permitir copiar um resumo estruturado do erro (em formato Markdown/JSON) na tela de detalhes do admin, facilitando a criação de novas especificações `SDD` de correção (`[FIX]`) ou investigação. | P1 | CA12 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Segurança no [`firestore.rules`](../firestore.rules) para `error_logs`: qualquer cliente pode apenas criar (`allow create`) documentos novos com `status == 'open'`, chaves estritamente validadas (`hasOnly`/`hasAll`) e limites de tamanho por campo (`message <= 1000`, `stack <= 4000`, `route_or_task <= 300`, `user_agent <= 300`, `context <= 2000`); leitura (`read`), atualização (`update`) e exclusão (`delete`) são exclusivas para administrador autenticado (`request.auth != null`). | P0 | CA13, CA14 |
| RNF02 | Isolamento de falhas e prevenção de loop infinito (fail-safe): uma falha ao gravar em `error_logs` nunca deve disparar novo evento de erro nem interromper o fluxo do usuário ou derrubar o processo chamador. | P0 | CA15 |
| RNF03 | Desempenho: o envio de logs no front-end deve ocorrer de forma assíncrona e não bloqueante, sem degradar o LCP ou o INP das páginas públicas. | P0 | CA01, CA15 |
| RNF04 | Privacidade e proteção de dados (LGPD): sanitizar mensagens, URLs, stacks e contextos antes da persistência para remover possíveis e-mails, tokens, senhas ou parâmetros sensíveis de query string (`token`, `password`, `key`, `auth`). | P0 | CA16 |
| RNF05 | Controle de volume por documento: truncar campos extensos no cliente e no servidor antes do envio para garantir que cada documento de `error_logs` ocupe no máximo 8 KB e nunca seja rejeitado pelas regras do Firestore por excesso de caracteres. | P0 | CA05, CA14 |

### Dependências técnicas

- Configuração e cliente do Firestore no front-end ([`src/utils/firebase.js`](../src/utils/firebase.js)) e Admin SDK nas Cloud Functions ([`functions/index.js`](../functions/index.js)).
- Regras de segurança do banco de dados ([`firestore.rules`](../firestore.rules)) e suíte de testes de regras ([`src/firestore-rules.test.js`](../src/firestore-rules.test.js)).
- Roteador SPA ([`src/router.js`](../src/router.js)), inicialização ([`src/main.js`](../src/main.js)) e painel administrativo ([`src/pages/admin.js`](../src/pages/admin.js), [`src/pages/admin/data.js`](../src/pages/admin/data.js), [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js)).
- Scripts de back-end/automação ([`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js), [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js)).

### Recursos necessários

- Nenhuma biblioteca externa paga (Sentry, Datadog etc.) é necessária; utiliza a própria infraestrutura do Cloud Firestore já existente no projeto.
- Permissão de escrita autenticada nos scripts de CI (já configurada via `FIREBASE_ADMIN_EMAIL` / `FIREBASE_ADMIN_PASSWORD` ou regras validando schema na coleção `error_logs`).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um erro não tratado (`window` `error` ou `unhandledrejection`) ocorre no navegador de um visitante online, quando o evento é disparado, então um documento é criado de forma assíncrona na coleção `error_logs` com `source: 'frontend'`, `status: 'open'`, mensagem, stack trace, rota atual e `created_at`.
- [x] **CA02:** Dado que uma falha ocorre no carregamento de rota/chunk em [`src/router.js`](../src/router.js) ou em um fluxo instrumentado via `reportError(err, context)`, quando o erro é capturado, então ele é persistido em `error_logs` com a `category` correspondente (`router`, `chunk`, `firestore`, etc.) e os metadados de contexto.
- [x] **CA03:** Dado que a Cloud Function `sendNewsletter` em [`functions/index.js`](../functions/index.js) encontra uma falha parcial de envio SMTP ou uma exceção geral, quando o erro é tratado, então um registro detalhado é gravado em `error_logs` com `source: 'backend:functions'`, `route_or_task: 'sendNewsletter'` e detalhes técnicos da falha.
- [x] **CA04:** Dado que um script automatizado de back-end ([`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) ou [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js)) falha ao consultar/atualizar o Firestore ou enviar e-mail, quando a falha ocorre, então ela é registrada em `error_logs` com `source: 'backend:scripts'` antes do encerramento do script.
- [x] **CA05:** Dado que um erro possui stack trace ou mensagem muito longa (ex.: > 10.000 caracteres), quando o utilitário de erro prepara o payload, então os campos são truncados dentro dos limites máximos (`message <= 1000`, `stack <= 4000`, `context <= 2000`) e o documento é aceito pelo Firestore.
- [x] **CA06:** Dado que o mesmo erro (mesmo `fingerprint`) é disparado repetidas vezes na mesma sessão do navegador ou que a sessão já atingiu o limite de 10 erros enviados, quando novas ocorrências acontecem nessa sessão, então nenhuma nova escrita duplicada é enviada ao Firestore.
- [x] **CA07:** Dado que o visitante é um bot/crawler conhecido ou está com o dispositivo sem conexão (`navigator.onLine === false`) enfrentando erro de rede, quando a falha ocorre, então o erro é ignorado e não gera documento em `error_logs`.
- [x] **CA08:** Dado que estou autenticado no painel administrativo (`/admin`), quando clico na aba "Erros" (`/admin?view=errors`), então vejo os KPIs de saúde (total em aberto, últimas 24h, últimos 7 dias, front vs. back) e a lista de erros ordenada do mais recente para o mais antigo.
- [x] **CA09:** Dado que existem erros de diferentes origens, categorias, severidades e status em `/admin?view=errors`, quando seleciono filtros (ex.: apenas `backend:functions`, apenas `open`) ou digito um termo na busca, então a listagem exibe apenas os registros correspondentes.
- [x] **CA10:** Dado um erro listado com status `open` em `/admin?view=errors`, quando abro seus detalhes e aciono "Marcar como resolvido" (ou "Ignorar" / "Excluir"), então o documento é atualizado (ou removido) no Firestore e a interface reflete a mudança imediatamente.
- [x] **CA11:** Dado que existem erros com `status: 'open'` no banco de dados, quando abro o Dashboard inicial (`/admin?view=dashboard`), então vejo a quantidade de erros pendentes de análise com link direto para `/admin?view=errors`.
- [x] **CA12:** Dado que estou visualizando os detalhes de um erro em `/admin?view=errors`, quando clico em "Copiar diagnóstico", então um resumo formatado com mensagem, origem, rota/tarefa, data, fingerprint e stack trace é copiado para a área de transferência.
- [x] **CA13:** Dado um usuário não autenticado (anônimo), quando ele tenta ler (`get`/`list`), atualizar (`update`) ou excluir (`delete`) qualquer documento de `error_logs`, então as regras do [`firestore.rules`](../firestore.rules) negam a operação.
- [x] **CA14:** Dado um cliente não autenticado tentando criar (`create`) um documento em `error_logs` com campos não permitidos, com `status` diferente de `'open'` ou com campos acima do tamanho máximo permitido, então o Firestore rejeita a gravação.
- [x] **CA15:** Dado que a gravação em `error_logs` falha (ex.: Firestore indisponível ou permissão negada), quando o `reportError` executa, então a falha é absorvida silenciosamente sem lançar nova exceção e sem entrar em recursão/loop infinito.
- [x] **CA16:** Dado que a mensagem de erro, URL ou contexto contém um endereço de e-mail ou parâmetro sensível (ex.: `?token=abc123`, `password=...`), quando o erro é formatado para envio, então esses valores aparecem mascarados (ex.: `[REDACTED]`, `[EMAIL_REDACTED]`) no documento salvo no Firestore.

## O que a atividade não inclui

- Integração com plataformas externas pagas de APM/monitoramento (Sentry, Datadog, New Relic, LogRocket): motivo: custo adicional e dependência de terceiros; o objetivo é manter os dados sob controle no próprio banco de dados do projeto.
- Upload e desminificação automática de Source Maps no servidor: motivo: complexo demais agora; o stack trace nativo, somado à rota, categoria e contexto da ação, já permite localizar a origem no código-fonte.
- Alertas ativos em tempo real por e-mail/SMS/WhatsApp a cada erro ocorrido: motivo: risco de fadiga de alertas e consumo da cota de envio de e-mails (Gmail SMTP); a consulta será feita pelo painel administrativo.
- Rastreamento de métricas de performance contínua (RUM completo de todas as sessões): motivo: outra iniciativa; o Microsoft Clarity e o Lighthouse já cobrem comportamento visual e Web Vitals.

### Considerado para o futuro (P2)

- Rotina automática de retenção/TTL (expurgo automático de erros com status `resolved` ou `ignored` com mais de 90 dias).
- Resumo semanal por e-mail ao autor caso existam erros `critical` em aberto.
- Agrupamento automático no banco por `fingerprint` com incremento de contador (`occurrences_count`) via Cloud Function.
- Botão no painel admin para gerar automaticamente um rascunho de arquivo `SDD/AAAA-MM-DD_fix-...md` preenchido a partir de um erro selecionado.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Os scripts de build estático (`prerender.js`, `generate-sitemap.js`, `generate-rss.js`, `generate-llms.js`) também devem gravar em `error_logs` quando falharem, ou apenas os scripts operacionais (`publish-scheduled-poems.js`, `send-daily-poem.js`) e as Cloud Functions? | PO/dev | Não | Definido: Instrumentados os scripts operacionais (`publish-scheduled-poems.js` e `send-daily-poem.js`) e a função `sendNewsletter`, além do utilitário reutilizável `src/utils/error-reporter.js` compartilhado entre front-end e Node.js. |
| D02 | Ao excluir ou resolver erros no painel admin, deve haver uma ação em lote ("Limpar todos os resolvidos") além da ação individual por item? | PO | Não | Definido: Incluído botão "Limpar resolvidos / ignorados" no cabeçalho da aba `/admin?view=errors`, além das ações individuais por item e dentro do modal de diagnóstico. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Captura de erro global e Promise rejeitada | unit | CA01 | Disparar `window.onerror` e `unhandledrejection` com mock do Firestore | `addDoc` chamado na coleção `error_logs` com `source: 'frontend'`, `status: 'open'` e campos estruturados |
| CT02 | Utilitário `reportError` e erro no roteador | unit / integração | CA02 | Chamar `reportError(new Error('Falha X'), { category: 'router' })` e simular erro de rota em `router.js` | Documento formatado com categoria, rota e contexto corretos |
| CT03 | Persistência de erro na Cloud Function | unit | CA03 | Simular falha no envio de newsletter em `functions/index.js` | Registro adicionado em `error_logs` com `source: 'backend:functions'` e `route_or_task: 'sendNewsletter'` |
| CT04 | Persistência de erro em scripts de back-end | unit | CA04 | Simular erro de query/update em `publish-scheduled-poems.js` com logger de erro injetado | Registro de erro enviado para `error_logs` com `source: 'backend:scripts'` |
| CT05 | Truncamento de campos longos | unit | CA05 | Passar erro com `stack` de 10.000 caracteres e `message` de 2.500 caracteres | Payload final respeita `message <= 1000`, `stack <= 4000` e `context <= 2000` |
| CT06 | Desduplicação e rate-limit por sessão | unit | CA06 | Disparar 5 vezes o mesmo erro e depois 15 erros distintos na mesma sessão | Mesmo erro é enviado apenas 1 vez; total na sessão não ultrapassa 10 envios |
| CT07 | Ignorar bots e erros de rede offline | unit | CA07 | Simular `navigator.userAgent` de `Googlebot` e `navigator.onLine = false` com erro de fetch | Nenhum documento é enviado para `error_logs` |
| CT08 | Renderização da aba Erros no Admin e KPIs | integração (jsdom) | CA08 | Renderizar `/admin?view=errors` com lista fictícia de erros do front e back | KPIs calculados corretamente e tabela/lista exibida em ordem decrescente de data |
| CT09 | Filtros e busca na aba Erros | integração (jsdom) | CA09 | Filtrar por `source = 'backend:functions'`, `status = 'open'` e buscar por texto | Apenas os itens que atendem aos filtros permanecem visíveis |
| CT10 | Resolver, ignorar e excluir erro no Admin | integração (jsdom) | CA10 | Clicar em "Resolver" e depois em "Excluir" em um item de `/admin?view=errors` | `updateDocById` / `deleteDocById` chamados em `error_logs` e UI atualizada |
| CT11 | Indicador de erros em aberto no Dashboard | integração (jsdom) | CA11 | Renderizar `dashboard.js` com 4 erros em aberto retornados de `error_logs` | Card/alerta no dashboard exibe `4` erros em aberto com link para `?view=errors` |
| CT12 | Copiar diagnóstico do erro | unit / integração (jsdom) | CA12 | Acionar botão "Copiar diagnóstico" no detalhe de um erro | Texto formatado em Markdown copiado para `navigator.clipboard.writeText` |
| CT13 | Regras do Firestore: bloqueio de leitura/edição anônima | integração | CA13 | Validar bloco `match /error_logs/` em [`src/firestore-rules.test.js`](../src/firestore-rules.test.js) | `allow read, update, delete: if request.auth != null` presente e sem leitura pública |
| CT14 | Regras do Firestore: validação estrita no `create` | integração | CA14 | Validar regras de schema, `status == 'open'` e limites de tamanho em `src/firestore-rules.test.js` | Regras exigem chaves permitidas, tipos string e tamanhos máximos |
| CT15 | Proteção anti-loop quando o Firestore falha | unit | CA15 | Fazer `addDoc` rejeitar a Promise ao chamar `reportError` | Nenhuma exceção escapa e `addDoc` é chamado apenas 1 vez (sem recursão) |
| CT16 | Sanitização de dados sensíveis (PII/tokens) | unit | CA16 | Passar erro contendo `leitor@dominio.com` e URL `?token=secreto123&password=abc` | Payload salvo contém `[EMAIL_REDACTED]` e `token=[REDACTED]` |

## URL Complementar

- Documentação técnica: [`firestore.rules`](../firestore.rules), [`src/router.js`](../src/router.js), [`src/pages/admin.js`](../src/pages/admin.js), [`src/pages/admin/data.js`](../src/pages/admin/data.js), [`functions/index.js`](../functions/index.js), [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js)
- Protótipo / mockup: N/A — segue o padrão visual já estabelecido nas telas do painel administrativo (`Escrivaninha`, como [`src/pages/admin/emails.js`](../src/pages/admin/emails.js) e [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js)).
- Discussões relacionadas: [`SDD/DONE/2026-11-10_fix-publicacao-automatica-agendados.md`](DONE/2026-11-10_fix-publicacao-automatica-agendados.md), [`SDD/DONE/2026-11-10_feat-leitura-offline-acervo.md`](DONE/2026-11-10_feat-leitura-offline-acervo.md)
- Referências de design: [`src/pages/admin/emails.js`](../src/pages/admin/emails.js) (layout de KPIs, barra de filtros e tabela de logs)
- Requisitos originais: solicitação do autor em 2026-11-11 para criar SDD de observabilidade de erros no front-end e back-end persistindo em banco de dados para embasar melhorias e ajustes futuros.
- Issue / PR relacionado: N/A
