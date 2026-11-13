# [FIX] Correção do fluxo de newsletter, reativação, cancelamento (unsubscribe) e segurança de e-mails

> **Status:** Aprovado
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o ciclo completo da newsletter: inscrição anônima com schema compatível com o envio, reativação de e-mail anteriormente cancelado, cancelamento real via Cloud Function removendo o placeholder `dummy-endpoint.com`, escape HTML nos templates de e-mail e disparo opcional ao publicar poemas agendados.
- **Problema e evidência:**
  1. [`src/components/newsletter.js`](../src/components/newsletter.js) grava em `subscribers` apenas `{ email, created_at }` (restrição de `hasOnly(['email', 'created_at'])` em [`firestore.rules`](../firestore.rules)), sem `active: true` nem `unsubscribe_token`. Já [`functions/index.js`](../functions/index.js) (`sendNewsletter`) filtra `.where("active", "==", true)` e lê `sub.unsubscribe_token`, enquanto [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js) conta ativos por `s.active`. Assinantes inscritos pelo site nunca recebem envios.
  2. [`src/pages/unsubscribe.js`](../src/pages/unsubscribe.js) faz `POST` para `https://dummy-endpoint.com/unsubscribe` (domínio fictício fora da CSP em [`index.html`](../index.html)).
  3. Reativar um e-mail já existente no doc `subscribers/{email}` é bloqueado porque `setDoc` vira `update` e as regras negam `update` para anônimos.
  4. [`functions/index.js`](../functions/index.js) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) interpolam `poem.title` e `poemContentHtml` sem escape HTML, e `send-daily-poem.js` fixa `targetEmail = 'nfgbrentano@gmail.com'`.
- **Impacto de não fazer:** Leitores que assinam a newsletter nunca recebem poemas; quem clica em "Cancelar inscrição" recebe erro sem ser descadastrado (violando boas práticas de entregabilidade/LGPD); títulos ou trechos com `<`/`&` podem quebrar ou injetar marcação no HTML do e-mail.
- **Para quem é destinado:** Leitores inscritos na newsletter, visitante interessado em assinar/cancelar e autor administrador do painel.
- **História de usuário:** Como leitor inscrito na newsletter, quero receber os novos poemas normalmente e conseguir cancelar ou reativar minha inscrição em um clique, para controlar com segurança o recebimento dos e-mails.
- **Como saberemos que deu certo:** 100% dos assinantes criados pelo formulário público passam a constar como `active: true` com token válido; cancelamento via `/unsubscribe?token=...` conclui com HTTP 200 e altera `active: false` no Firestore; 0 referências a `dummy-endpoint.com`; testes unitários e de regras passando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Substituir gravação direta ou criar Cloud Function pública `subscribeNewsletter` (`https` com CORS restrito ao domínio oficial e localhost em dev) que valida e-mail, gera `unsubscribe_token` criptográfico (`crypto.randomUUID()` ou 32 bytes hex), define `active: true` e permite reativação idempotente de assinante inativo. | P0 | CA01, CA02, CA06 |
| RF02 | Criar Cloud Function `unsubscribeNewsletter` que recebe `token`, localiza o assinante correspondente por `unsubscribe_token`, define `active: false` e registra `unsubscribed_at` em ISO 8601. | P0 | CA03, CA04 |
| RF03 | Atualizar [`src/pages/unsubscribe.js`](../src/pages/unsubscribe.js) (também servindo `/cancelar-inscricao/`) para consumir a Cloud Function real, removendo `dummy-endpoint.com`. | P0 | CA03, CA04 |
| RF04 | Incluir escape HTML completo para título, conteúdo e URLs nos templates de [`functions/index.js`](../functions/index.js) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js), além dos cabeçalhos `List-Unsubscribe` e `List-Unsubscribe-Post: List-Unsubscribe=One-Click`. | P0 | CA05 |
| RF05 | Criar script de backfill único em `scripts/dev/` (ou migração via admin) para normalizar assinantes legados sem `active`/`unsubscribe_token`. | P1 | CA01 |
| RF06 | Permitir marcar "Enviar newsletter automaticamente ao publicar" em poemas agendados (campo opcional `notify_newsletter_on_publish` tratado por [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) e [`.github/workflows/publish-scheduled.yml`](../.github/workflows/publish-scheduled.yml)). | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A página `/unsubscribe` e a Cloud Function de cancelamento não devem expor e-mails de outros assinantes nem listar a coleção `subscribers` publicamente (`firestore.rules` continua bloqueando `read` anônimo). | P0 | CA04, CA08 |
| RNF02 | A API de inscrição deve responder em `< 3s` em condições normais de rede e exibir feedback claro caso o navegador esteja offline. | P1 | CA01, CA09 |
| RNF03 | `unsubscribeNewsletter` deve ser idempotente: múltiplas chamadas com o mesmo token válido retornam sucesso sem alterar `unsubscribed_at` original após o primeiro cancelamento. | P1 | CA03 |
| RNF04 | Remover qualquer necessidade de alteração manual na CSP para domínios externos fictícios; apenas `https://*.cloudfunctions.net` (ou URL configurada) permanece em `connect-src`. | P0 | CA03 |

### Dependências técnicas

- [`functions/index.js`](../functions/index.js) e [`functions/package.json`](../functions/package.json).
- [`src/components/newsletter.js`](../src/components/newsletter.js) e [`src/pages/unsubscribe.js`](../src/pages/unsubscribe.js).
- [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js) e [`firestore.rules`](../firestore.rules).
- [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) e [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js).

### Recursos necessários

- Deploy das novas Cloud Functions no projeto `poemas-natanael` (`southamerica-east1`).
- Execução única do script de backfill para registros históricos em `subscribers`.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um visitante anônimo na Home, quando envia um e-mail válido no formulário `#subscribe-form`, então um registro em `subscribers` passa a existir com `active: true`, `created_at` e `unsubscribe_token` único, e `sendNewsletter` passa a incluí-lo no lote de envio.
- [x] **CA02:** Dado um e-mail previamente descadastrado (`active: false`), quando o mesmo e-mail se inscreve novamente pelo site, então sua assinatura é reativada (`active: true` e novo ou preservado `unsubscribe_token`) com mensagem de confirmação.
- [x] **CA03:** Dado um assinante ativo com `unsubscribe_token` válido, quando acessa `/unsubscribe?token=<token>` (ou `/cancelar-inscricao/?token=<token>`), então o backend marca `active: false` + `unsubscribed_at`, exibe confirmação e uma segunda abertura do mesmo link segue retornando confirmação sem erro.
- [x] **CA04:** Dado um token inexistente ou ausente na URL de cancelamento, quando a página processa a requisição, então nenhum documento de `subscribers` é alterado e uma mensagem clara de link inválido/expirado é exibida.
- [x] **CA05:** Dado um poema contendo `<script>` ou `<img onerror=...>` no título ou nos versos, quando [`functions/index.js`](../functions/index.js) ou [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) renderiza o HTML do e-mail, então os caracteres especiais são escapados (`&lt;`, `&gt;`, `&amp;`) e o cabeçalho `List-Unsubscribe` está presente.
- [x] **CA06:** Dado um envio pelo formulário com e-mail já ativo, quando a inscrição é submetida, então o sistema não duplica registros e informa de forma amigável que o e-mail já está inscrito sem vazar dados de terceiros.
- [x] **CA07:** Dado um poema agendado com envio automático habilitado, quando [`publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) o promove para `published`, então o disparo de newsletter é acionado uma única vez para os assinantes ativos.
- [x] **CA08:** Dado um leitor não autenticado tentando consultar `subscribers` diretamente via SDK do Firestore, quando as regras são avaliadas, então a leitura e a alteração direta continuam negadas (`PERMISSION_DENIED`).
- [x] **CA09:** Dado um dispositivo offline tentando assinar ou cancelar inscrição, quando o formulário ou página é acionado, então nenhuma requisição é disparada e uma mensagem orientando a conectar à internet é exibida.

## O que a atividade não inclui

- Migração para provedor SMTP pago (SendGrid/Resend/Postmark): motivo: Gmail SMTP com secrets já está configurado e atende ao volume atual.
- Painel público de preferências granulares (frequência semanal vs diária para todo assinante): motivo: escopo separado para evitar complexidade de autenticação de leitor antes do necessário.

### Considerado para o futuro (P2)

- Opt-in público para receber o "Poema do Dia" ([`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js)) aos assinantes que desejarem envio diário, mantendo `daily-poem` configurável além do endereço fixo do autor.
- Double opt-in por link de confirmação no primeiro cadastro caso o volume de spam em inscrições cresça.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O formulário de inscrição deve chamar diretamente uma Cloud Function HTTP (`subscribeNewsletter`) ou manter `create` direto no Firestore complementado por trigger `onDocumentCreated`? (Cloud Function HTTP facilita reativação sem abrir `update` no Firestore.) | dev | Sim | Usar Cloud Function pública `subscribeNewsletter` (`https`/`onRequest` com CORS). Permite reativação idempotente de inscritos inativos, geração atômica de `unsubscribe_token` no servidor e isolamento das regras do Firestore sem expor `update` para anônimos. |
| D02 | O script [`send-daily-poem.js`](../scripts/send-daily-poem.js) deve permanecer exclusivo para o e-mail do autor por enquanto ou ganhar parâmetro/env var configurável (`DAILY_POEM_RECIPIENTS`)? | PO/dev | Não | Suportar a variável de ambiente `DAILY_POEM_RECIPIENTS` com fallback seguro para `nfgbrentano@gmail.com`. Permite múltiplos destinatários separados por vírgula sem quebrar o comportamento existente. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Nova inscrição ativa | integração | CA01, CA06 | Chamar handler de inscrição com e-mail inédito e depois repetir o mesmo e-mail | Cria doc com `active: true` e token; 2ª chamada retorna estado já inscrito sem duplicar |
| CT02 | Reativação de inativo | integração | CA02 | Criar assinante com `active: false` e submeter inscrição com o mesmo e-mail | `active` volta para `true` e `unsubscribed_at` é limpo/tratado |
| CT03 | Cancelamento real e idempotência | integração | CA03 | Chamar `unsubscribeNewsletter` duas vezes com o mesmo token válido | 1ª marca `active: false` e `unsubscribed_at`; 2ª mantém sucesso sem erro |
| CT04 | Token inválido/ausente | unit/integração | CA04 | Renderizar `/unsubscribe` sem token e com token inexistente mockando resposta 404/400 | UI exibe erro amigável e nenhuma alteração ocorre no banco |
| CT05 | Escape HTML e List-Unsubscribe | unit | CA05 | Gerar e-mail com título/verso contendo `<script>alert(1)</script>` | HTML contém `&lt;script&gt;` escapado e headers `List-Unsubscribe` presentes |
| CT06 | Disparo em poema agendado | unit | CA07 | Simular promoção de poema agendado em `publish-scheduled-poems.js` | Disparo chamado apenas quando `notify_newsletter_on_publish === true` e poema promovido |
| CT07 | Segurança Firestore | integração | CA08 | Testar `getDocs(collection(db, 'subscribers'))` e `updateDoc` anônimo em `firestore-rules.test.js` | Todas as leituras/atualizações anônimas negadas |
| CT08 | Offline guard | unit | CA09 | Simular `navigator.onLine = false` no formulário de inscrição e em `/unsubscribe` | Exibe aviso offline sem lançar exceção não tratada |

## URL Complementar

- Documentação técnica: [`functions/index.js`](../functions/index.js), [`src/pages/unsubscribe.js`](../src/pages/unsubscribe.js), [`src/components/newsletter.js`](../src/components/newsletter.js), [`firestore.rules`](../firestore.rules)
- Protótipo / mockup: N/A — mantém layout editorial minimalista existente.
- Discussões relacionadas: [`SDD/DONE/2026-09-23_newsletter-inscricao-anonima.md`](DONE/2026-09-23_newsletter-inscricao-anonima.md)
- Referências de design: [`src/pages/unsubscribe.js`](../src/pages/unsubscribe.js)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
