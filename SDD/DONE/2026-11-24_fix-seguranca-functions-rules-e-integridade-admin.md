# [FIX] Hardening de autorização na Cloud Function sendNewsletter, validação de page_views no Firestore e integridade de dados no Admin

> **Status:** Concluído
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-24 · **Atualizada em:** 2026-11-24

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Validar permissão de administrador (`assertAdminAuth` / `isAdminAuth`) na Cloud Function `sendNewsletter` em [`functions/index.js`](../functions/index.js), alinhando-a com `sendPushNotification` ([`functions/push-helpers.js`](../functions/push-helpers.js)).
  2. Substituir `allow create: if true;` na coleção `page_views` em [`firestore.rules`](../firestore.rules) por validação estrita de schema, tipos e limites de caracteres compatível com [`src/utils/analytics.js`](../src/utils/analytics.js).
  3. Garantir integridade referencial no painel Admin ao excluir poemas ([`src/pages/admin/list.js`](../src/pages/admin/list.js)) ou coleções ([`src/pages/admin/collections.js`](../src/pages/admin/collections.js) / [`src/pages/admin/data.js`](../src/pages/admin/data.js)), removendo vínculos órfãos em `collection_poems` e limpando `collection_slugs`.
  4. Corrigir a exportação CSV de assinantes em [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js) para usar `Blob` + `URL.createObjectURL`, escapando campos com aspas/vírgulas e neutralizando prefixos de execução de fórmulas (`=`, `+`, `-`, `@`).
- **Problema e evidência:**
  1. Em [`functions/index.js`](../functions/index.js) (linhas 105–110), `sendNewsletter` verifica apenas `if (!request.auth)` sem checar se o usuário autenticado é administrador (`token.admin === true` ou e-mail autorizado em `ADMIN_EMAILS`).
  2. Em [`firestore.rules`](../firestore.rules) (linha 75), `match /page_views/{document=**}` permite `allow create: if true;` sem validar campos nem tamanhos, abrindo brecha para inserção pública de documentos arbitrários de até 1 MB.
  3. Em [`src/pages/admin/list.js`](../src/pages/admin/list.js) (linha 171) e [`src/pages/admin/collections.js`](../src/pages/admin/collections.js) (linha 111), `deleteDocById` remove apenas o documento principal, deixando registros órfãos em `collection_poems` que distorcem contagens (`countPoemsByCollection`) e leituras do banco.
  4. Em [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js) (linhas 91–95), a exportação CSV concatena `data:text/csv;charset=utf-8,` com `encodeURI()`, truncando o arquivo caso algum campo contenha `#` e expondo planilhas a CSV Formula Injection.
- **Impacto de não fazer:** Risco de disparo não autorizado de e-mails via SMTP caso outro token Firebase exista no projeto; risco de abuso de armazenamento e leituras na coleção `page_views`; acúmulo de relações órfãs em `collection_poems`; falha ou vulnerabilidade ao abrir o CSV de assinantes no Excel/LibreOffice.
- **Para quem é destinado:** Administrador/autor do site e infraestrutura de segurança Firebase (Firestore + Cloud Functions).
- **História de usuário:** Como administrador do acervo, quero que todas as Cloud Functions administrativas validem meu perfil de admin, que o Firestore rejeite payloads inválidos em `page_views` e que exclusões e exportações no painel mantenham os dados íntegros e seguros.
- **Como saberemos que deu certo:** Chamadas a `sendNewsletter` com usuário autenticado não-admin retornam `permission-denied`; `firestore.rules` rejeita `page_views` com chaves extras ou campos acima do limite; excluir poema ou coleção limpa `collection_poems`; CSV exporta via `Blob` com sanitização contra fórmulas.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Exigir `assertAdminAuth(request.auth)` no início de `sendNewsletter` em [`functions/index.js`](../functions/index.js) antes de consultar `poems` ou `subscribers`, lançando `HttpsError('permission-denied', ...)` quando o usuário autenticado não for admin. | P0 | CA01 |
| RF02 | Restringir `allow create` de `match /page_views/{document=**}` em [`firestore.rules`](../firestore.rules) para aceitar exclusivamente as chaves `['page', 'poem_id', 'ip_hash', 'country', 'user_agent', 'referrer', 'created_at']` com validação de tipo e tamanho máximo. | P0 | CA02 |
| RF03 | Ao excluir um poema (`deletePoemWithRelations` / `deleteDocById` em [`src/pages/admin/data.js`](../src/pages/admin/data.js) e [`src/pages/admin/list.js`](../src/pages/admin/list.js)), remover também todos os documentos em `collection_poems` onde `poem_id == id`. | P0 | CA03 |
| RF04 | Ao excluir uma coleção ([`src/pages/admin/collections.js`](../src/pages/admin/collections.js) / [`src/pages/admin/data.js`](../src/pages/admin/data.js)), remover todos os documentos em `collection_poems` onde `collection_id == colId` e remover o `slug` da coleção de `collection_slugs` nos poemas afetados. | P1 | CA04 |
| RF05 | Refatorar a exportação CSV em [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js) com helper `buildSubscribersCsv(subs)` que escapa aspas duplas, prefixa valores iniciados por `=`, `+`, `-`, `@`, `\t`, `\r` com apóstrofo (`'`) e faz download via `Blob` (`text/csv;charset=utf-8`). | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A regra de `page_views` em [`firestore.rules`](../firestore.rules) deve continuar permitindo gravações anônimas legítimas geradas por `trackPageView()` em [`src/utils/analytics.js`](../src/utils/analytics.js) sem exigir login do leitor. | P0 | CA02 |
| RNF02 | A validação de admin em `sendNewsletter` não deve realizar leituras no Firestore caso `request.auth` seja nulo ou não pertença à lista `ADMIN_EMAILS` / custom claim `admin: true`. | P0 | CA01 |

### Dependências técnicas

- [`functions/index.js`](../functions/index.js) e [`functions/push-helpers.js`](../functions/push-helpers.js).
- [`firestore.rules`](../firestore.rules) e [`src/utils/analytics.js`](../src/utils/analytics.js).
- [`src/pages/admin/data.js`](../src/pages/admin/data.js), [`src/pages/admin/list.js`](../src/pages/admin/list.js), [`src/pages/admin/collections.js`](../src/pages/admin/collections.js) e [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js).

### Recursos necessários

- N/A — todas as alterações são testáveis localmente via Vitest.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um token autenticado cujo e-mail não está em `ADMIN_EMAILS` e não possui `token.admin === true`, quando `sendNewsletter` é invocada, então a função rejeita imediatamente com `HttpsError('permission-denied')` e `0` leituras no Firestore.
- [x] **CA02:** Dado o arquivo [`firestore.rules`](../firestore.rules), quando uma gravação em `page_views` contém apenas os 7 campos de `trackPageView` dentro dos limites de tamanho, então a regra permite a criação; quando contém campos extras ou strings acima do limite, a regra nega a operação.
- [x] **CA03:** Dado um poema vinculado a 2 coleções em `collection_poems`, quando o administrador exclui o poema na lista de obras, então o documento em `poems` e seus vínculos em `collection_poems` são removidos.
- [x] **CA04:** Dada uma coleção com poemas vinculados, quando o administrador exclui a coleção, então o documento em `collections`, os registros em `collection_poems` daquela coleção e o slug em `poems.collection_slugs` são limpos.
- [x] **CA05:** Dada uma lista de assinantes contendo caracteres especiais (`#`, `,`, `"`) ou início com `=cmd|...`, quando `buildSubscribersCsv` gera o CSV, então os campos são escapados com segurança sem truncar o download nem permitir execução de fórmula.

## O que a atividade não inclui

- Deploy automático das `firestore.rules` ou Cloud Functions para produção durante os testes: motivo: o deploy de infraestrutura Firebase é feito separadamente via CLI pelo administrador.
- Limpeza retroativa em banco de produção de `collection_poems` antigos: motivo: já existe o script utilitário [`scripts/dedupe-collection-poems.js`](../scripts/dedupe-collection-poems.js) para manutenção pontual.

### Considerado para o futuro (P2)

- App Check (reCAPTCHA Enterprise / Play Integrity) para proteger `page_views`, `poem_comments` e `error_logs` em nível de transporte no Firebase.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O limite máximo de tamanho para `page` e `user_agent`/`referrer` em `page_views` no `firestore.rules` deve seguir os 300 caracteres já aplicados em `src/utils/analytics.js`? | dev | Não | Sim — `page <= 300`, `user_agent <= 300`, `referrer <= 300`, `poem_id <= 128`, `ip_hash <= 64`, `country <= 10`, `created_at <= 40`. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Bloqueio de não-admin em `sendNewsletter` | unit | CA01 | Invocar handler de `sendNewsletter` sem `auth` e com `auth.token.email = 'invasor@teste.com'` | Lança `unauthenticated` e `permission-denied` respectivamente, sem ler `poems` |
| CT02 | Validação de schema de `page_views` em `firestore.rules` | unit | CA02 | Auditar regras de `page_views` em `src/firestore-rules.test.js` verificando `hasOnly`, `hasAll` e limites de tamanho | Regra exige chaves válidas e limites estritos compatíveis com `trackPageView` |
| CT03 | Exclusão em cascata de poema e coleção | unit | CA03, CA04 | Chamar funções de exclusão de poema e de coleção no módulo `admin/data.js` com mocks do Firestore | Vínculos em `collection_poems` e `collection_slugs` são removidos e cache invalidado |
| CT04 | Sanitização e formato CSV de assinantes | unit | CA05 | Passar assinantes com `user#1+tag@gmail.com` e `=HYPERLINK("http://malicioso")` para `buildSubscribersCsv` | Fórmulas neutralizadas com `'`, valores entre aspas e download via `Blob` |

## URL Complementar

- Documentação técnica: [`functions/index.js`](../functions/index.js), [`functions/push-helpers.js`](../functions/push-helpers.js), [`firestore.rules`](../firestore.rules), [`src/pages/admin/data.js`](../src/pages/admin/data.js), [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-13_fix-hardening-admin-e-firestore-rules.md`](DONE/2026-11-13_fix-hardening-admin-e-firestore-rules.md)
- Referências de design: N/A
- Requisitos originais: Auditoria técnica de falhas e melhorias no código em 2026-11-24.
- Issue / PR relacionado: N/A
