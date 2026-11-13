# [FEAT] Envio real de notificações Web Push na publicação de poemas

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Implementar o backend de disparo de notificações Web Push (Cloud Function com `web-push` usando o par VAPID do projeto), integrando envio manual no painel admin, disparo opcional na publicação imediata/agendada e limpeza automática de inscrições expiradas.
- **Problema e evidência:** Todo o lado cliente de Web Push já existe e está documentado — [`src/utils/push.js`](../src/utils/push.js), [`src/components/push-toggle.js`](../src/components/push-toggle.js), listener `push`/`notificationclick` em [`public/sw.js`](../public/sw.js), coleção `push_subscriptions` em [`firestore.rules`](../firestore.rules) e guia [`docs/notificacoes-push-vapid.md`](../docs/notificacoes-push-vapid.md). Entretanto, [`functions/index.js`](../functions/index.js) e [`functions/package.json`](../functions/package.json) não implementam nenhuma função ou biblioteca para enviar notificações para os endpoints salvos em `push_subscriptions`.
- **Impacto de não fazer:** Leitores que clicam em "Ativar Notificações" veem a mensagem *"Você receberá avisos sobre novos poemas!"*, mas nunca recebem nenhuma notificação quando novas obras são publicadas.
- **Para quem é destinado:** Leitores que ativaram Web Push no navegador e o autor administrador.
- **História de usuário:** Como leitor que ativou as notificações no navegador, quero receber um aviso discreto com o título do novo poema assim que ele for publicado, para ler a obra logo que sair.
- **Como saberemos que deu certo:** Ao acionar disparo de push para um poema publicado, os dispositivos inscritos recebem notificação abrindo `/poema/<slug>/`; endpoints inválidos/expirados (`404`/`410`) são removidos de `push_subscriptions`; falhas de lote são registradas no log de erros (`error_logs`).

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Adicionar dependência `web-push` em [`functions/package.json`](../functions/package.json) e implementar Cloud Function `onCall` autenticada (`sendPushNotification`) em [`functions/index.js`](../functions/index.js) recebendo `{ poemId, title?, body? }`, validando usuário admin e poema com `status === 'published'`. | P0 | CA01, CA02 |
| RF02 | Ler todos os documentos de `push_subscriptions`, enviar payload JSON `{ title, body, url }` em lotes controlados e exibir o poema correspondente em [`public/sw.js`](../public/sw.js) (mantendo tratamento seguro quando `event.data` não for JSON válido). | P0 | CA01, CA05 |
| RF03 | Excluir automaticamente de `push_subscriptions` os registros cujo push service retorne status HTTP `404` ou `410` (assinatura expirada/revogada). | P0 | CA03 |
| RF04 | Adicionar ação "Enviar Push" no painel admin (no editor ao publicar ou na aba de envios/campanhas) com prévia de quantas inscrições ativas existem e confirmação explícita antes de disparar. | P1 | CA04 |
| RF05 | Permitir que [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) dispare push quando o poema agendado tiver sinalização para notificar. | P1 | CA06 |
| RF06 | Registrar falhas críticas/parciais do envio em `error_logs` via `logBackendFunctionError` e gravar histórico de envio em coleção de logs de campanha (`push_campaign_logs` ou campo `channel: 'push'` em `email_campaign_logs`). | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A chave privada VAPID deve ser armazenada exclusivamente via `defineSecret("VAPID_PRIVATE_KEY")` no Firebase Functions (nunca no código-fonte ou variáveis `VITE_*`). | P0 | CA01 |
| RNF02 | Apenas usuário administrador autenticado pode invocar `sendPushNotification` (`unauthenticated` / `permission-denied` para terceiros). | P0 | CA02 |
| RNF03 | O payload do Web Push deve respeitar o limite prático de tamanho (`<= 3 KB`), truncando `body` para ~140 caracteres. | P1 | CA01 |
| RNF04 | Falha em 1 inscrição individual não pode abortar o envio às demais inscrições do lote. | P0 | CA03 |

### Dependências técnicas

- [`functions/index.js`](../functions/index.js), [`functions/package.json`](../functions/package.json), [`functions/error-logger.js`](../functions/error-logger.js).
- [`public/sw.js`](../public/sw.js) (listeners `push` e `notificationclick`).
- [`src/utils/push.js`](../src/utils/push.js) e [`docs/notificacoes-push-vapid.md`](../docs/notificacoes-push-vapid.md).
- Painel admin ([`src/pages/admin/editor.js`](../src/pages/admin/editor.js) / [`src/pages/admin/emails.js`](../src/pages/admin/emails.js)).

### Recursos necessários

- Configurar secrets no Firebase Functions: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_SUBJECT` (`mailto:nfgbrentano@gmail.com`), atualizando [`docs/notificacoes-push-vapid.md`](../docs/notificacoes-push-vapid.md).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema publicado e inscrições válidas em `push_subscriptions`, quando o admin aciona `sendPushNotification`, então todas as inscrições recebem payload `{ title, body, url: "https://nfgbrentano.art.br/poema/<slug>/" }` dentro de `<= 3 KB`.
- [ ] **CA02:** Dado um usuário não autenticado ou sem permissão admin chamando `sendPushNotification` (ou tentando enviar para um rascunho), quando a Cloud Function executa, então rejeita a chamada com `HttpsError` apropriado (`unauthenticated`/`permission-denied`/`failed-precondition`).
- [ ] **CA03:** Dado um lote com 2 inscrições válidas e 1 expirada retornando HTTP `410`, quando o envio executa, então as 2 válidas são entregues e apenas a expirada é excluída de `push_subscriptions`.
- [ ] **CA04:** Dado o painel admin autenticado, quando o autor seleciona enviar notificação push de um poema publicado, então vê feedback com quantidade de entregas bem-sucedidas, falhas e inscrições expiradas limpas.
- [ ] **CA05:** Dado que o usuário clica na notificação exibida pelo Service Worker ([`public/sw.js`](../public/sw.js)), quando a janela já está aberta ou fechada, então o navegador foca ou abre exatamente a URL do poema notificado (fallback para `/` se ausente).
- [ ] **CA06:** Dado um poema agendado marcado para notificação push, quando promovido para `published` pelo workflow agendado, então a notificação é enviada após a publicação.
- [ ] **CA07:** Dado uma falha inesperada no serviço `web-push`, quando ocorre exceção, então um registro de erro é gravado via `logBackendFunctionError`.

## O que a atividade não inclui

- Segmentação de notificações push por tag/sentimento escolhido pelo leitor: motivo: exigiria preferência por inscrição e interface extra prematura para a base atual.
- Notificações agendadas recorrentes ("Poema do Dia" via push): motivo: risco de fadiga de notificação; manter apenas para poemas inéditos publicados.

### Considerado para o futuro (P2)

- Preferência do leitor entre "Novos poemas" e "Poema do Dia" salva junto ao documento de `push_subscriptions`.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O envio de Web Push na publicação imediata deve acontecer por clique explícito do autor ("Publicar e Notificar") ou automaticamente via trigger `onDocumentWritten` em `poems`? | PO/dev | Sim | |
| D02 | O histórico de push deve compartilhar a tela/aba atual de [`emails.js`](../src/pages/admin/emails.js) (renomeando para "Envios / Campanhas") ou ganhar uma sub-seção própria? | design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Validação de auth e status do poema | unit | CA02 | Invocar handler sem `request.auth`, sem claim admin e com poema `draft` | Lança `HttpsError` antes de ler `push_subscriptions` |
| CT02 | Envio em lote e limpeza de 410 | unit | CA01, CA03 | Mockar `webpush.sendNotification` resolvendo 2 e rejeitando 1 com `statusCode: 410` | Retorna `{ sent: 2, failed: 1, removed: 1 }` e apaga apenas o doc expirado |
| CT03 | Payload no Service Worker | unit | CA05 | Simular eventos `push` (JSON e texto simples) e `notificationclick` no SW | `showNotification` chamado sem exceção; `clients.openWindow` abre URL do poema |
| CT04 | Log de falha crítica | unit | CA07 | Simular erro fatal na inicialização VAPID | `logBackendFunctionError` registra erro em `error_logs` |
| CT05 | Fluxo E2E manual no navegador | manual | CA01, CA04, CA05 | Ativar push em `/sobre/`, disparar teste no admin em `localhost`/produção | Notificação exibida pelo SO abre o poema correto ao clicar |
| CT06 | Disparo na publicação agendada | unit | CA06 | Executar [`publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) com poema agendado marcado para notificação push | Poema é promovido para `published` e função/serviço de envio push é acionado após a publicação |

## URL Complementar

- Documentação técnica: [`docs/notificacoes-push-vapid.md`](../docs/notificacoes-push-vapid.md), [`src/utils/push.js`](../src/utils/push.js), [`public/sw.js`](../public/sw.js), [`functions/index.js`](../functions/index.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-10-04_fix-regras-firestore-push-e-reacoes.md`](DONE/2026-10-04_fix-regras-firestore-push-e-reacoes.md)
- Referências de design: [`src/components/push-toggle.js`](../src/components/push-toggle.js)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
