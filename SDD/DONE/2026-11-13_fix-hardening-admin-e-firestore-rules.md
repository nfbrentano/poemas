# [FIX] Hardening do painel admin, Firestore Rules e consistência de dados (IDs e coleções)

> **Status:** Aprovado
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Eliminar a flag `?bypass_auth=true` do painel administrativo, restringir privilégios de administrador em [`firestore.rules`](../firestore.rules) para além de qualquer `request.auth != null`, remover `allow delete: if true` de `poem_reactions`, corrigir consultas por Document ID no admin, sincronizar `collection_slugs` ao editar coleções e substituir a leitura ilimitada de `page_views` na lista de poemas.
- **Problema e evidência:**
  1. [`src/pages/admin.js`](../src/pages/admin.js) e [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js) permitem contornar o redirecionamento de login passando `?bypass_auth=true` na URL (expondo a estrutura administrativa e dados mockados).
  2. [`firestore.rules`](../firestore.rules) concede leitura/escrita administrativa para qualquer `request.auth != null` sem validar claim/e-mail/UID, e permite `allow delete: if true` em `poem_reactions`.
  3. [`src/pages/admin/data.js`](../src/pages/admin/data.js) documenta que `where: [['id', '==', x]]` filtra pelo campo `id`, não pelo ID do documento Firestore; ainda assim [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) e [`src/pages/admin/collections.js`](../src/pages/admin/collections.js) usam essa query ao editar registros, além de `editor.js` chamar `insertDocs('poems', [payload])` em um ponto e `insertDocs('poems', payload)` em outro.
  4. O admin de coleções grava apenas `collection_poems`, enquanto [`src/pages/poem.js`](../src/pages/poem.js), [`src/pages/home.js`](../src/pages/home.js) e [`src/pages/collection.js`](../src/pages/collection.js) dependem de `poem.collection_slugs` para exibir coleções e calcular relacionados.
  5. [`src/pages/admin/list.js`](../src/pages/admin/list.js) executa `listDocs('page_views')` sem limite nem filtro temporal, baixando toda a coleção a cada abertura da lista de obras; e [`src/pages/admin/emails.js`](../src/pages/admin/emails.js) usa `colspan="5"` em tabela de 6 colunas.
- **Impacto de não fazer:** Risco de escalação de privilégio se outro usuário existir no Firebase Auth; risco de perda de integridade/exclusão maliciosa de reações; falhas ao editar poemas/coleções cujo campo interno `id` difere do ID do documento; custo crescente de leituras no Firestore ao abrir o admin; dados de coleções dessincronizados nas páginas públicas.
- **Para quem é destinado:** Autor/administrador do site e todos os leitores (integridade dos dados públicos e reações).
- **História de usuário:** Como autor e mantenedor do acervo, quero que apenas minha conta admin autenticada acesse e edite dados críticos e que os vínculos entre poemas e coleções permaneçam consistentes sem consultas caras ao banco, para operar o painel com segurança e escala.
- **Como saberemos que deu certo:** `?bypass_auth=true` redireciona para `/login`; regras de Firestore negam escrita a usuários autenticados sem privilégio admin e negam `delete` irrestrito em reações; edição por ID funciona diretamente via `getDocById`; abertura da listagem de poemas não lê a coleção inteira de `page_views`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Remover completamente o suporte a `?bypass_auth=true` em [`src/pages/admin.js`](../src/pages/admin.js) e [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js). | P0 | CA01 |
| RF02 | Criar helper `isAdmin()` em [`firestore.rules`](../firestore.rules) verificando Custom Claim (`request.auth.token.admin == true`) ou lista/e-mail verificado do administrador em todas as coleções administrativas (`poems`, `collections`, `collection_poems`, `subscribers`, `site_settings`, `error_logs`, `email_campaign_logs`, `push_subscriptions`, `page_views`, `poem_comments`). | P0 | CA02 |
| RF03 | Remover `allow delete: if true` em `poem_reactions` no [`firestore.rules`](../firestore.rules), vinculando a remoção do voto à validação do `session_id` (via doc ID determinístico `${poemId}_${emoji}_${sessionId}` ou regra compatível / apenas `isAdmin()`). | P0 | CA03 |
| RF04 | Adicionar `getDocById(colName, id)` em [`src/pages/admin/data.js`](../src/pages/admin/data.js) usando `doc(db, colName, id)` e padronizar a assinatura de `insertDocs`, corrigindo [`editor.js`](../src/pages/admin/editor.js) e [`collections.js`](../src/pages/admin/collections.js). | P0 | CA04 |
| RF05 | Ao salvar vínculos em [`collections.js`](../src/pages/admin/collections.js), sincronizar automaticamente o campo `collection_slugs` nos documentos de `poems` afetados e invalidar o cache local (`invalidatePoemsCache()`). | P1 | CA05 |
| RF06 | Substituir `listDocs('page_views')` irrestrito em [`src/pages/admin/list.js`](../src/pages/admin/list.js) por consulta limitada (ex.: janela dos últimos 30 dias com `limit` configurável ou contador agregado por poema) com aviso visual do escopo da coluna de visualizações. | P1 | CA06 |
| RF07 | Corrigir `colspan="6"` na célula vazia de [`src/pages/admin/emails.js`](../src/pages/admin/emails.js) e escapar `s.email` em [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js). | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Todas as regras de [`firestore.rules`](../firestore.rules) devem permanecer cobertas por testes automatizados em [`src/firestore-rules.test.js`](../src/firestore-rules.test.js), incluindo testes negativos de usuário autenticado não-admin. | P0 | CA02, CA03 |
| RNF02 | A abertura de `/admin?view=list` deve consumir no máximo `poems.length` + janela agregada (nunca leitura integral sem filtro de `page_views`). | P1 | CA06 |
| RNF03 | Scripts do CI/GitHub Actions que escrevem no Firestore (como [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js)) devem continuar autenticando como conta admin autorizada pelas novas regras. | P0 | CA02 |

### Dependências técnicas

- [`firestore.rules`](../firestore.rules) e [`src/firestore-rules.test.js`](../src/firestore-rules.test.js).
- [`src/pages/admin.js`](../src/pages/admin.js), [`src/pages/admin/data.js`](../src/pages/admin/data.js), [`src/pages/admin/dashboard.js`](../src/pages/admin/dashboard.js), [`src/pages/admin/editor.js`](../src/pages/admin/editor.js), [`src/pages/admin/collections.js`](../src/pages/admin/collections.js), [`src/pages/admin/list.js`](../src/pages/admin/list.js), [`src/pages/admin/emails.js`](../src/pages/admin/emails.js), [`src/pages/admin/subscribers.js`](../src/pages/admin/subscribers.js).
- [`src/utils/poems-store.js`](../src/utils/poems-store.js) (`invalidatePoemsCache`).

### Recursos necessários

- Definir Custom Claim `admin: true` na conta do autor no Firebase Auth (via Firebase Admin SDK script em `scripts/dev/`) ou confirmar e-mail/UID autorizado em regra.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um visitante não autenticado acessando `/admin?bypass_auth=true`, quando a página inicia, então ele é redirecionado imediatamente para `/login` e nenhum markup do dashboard/mock é renderizado.
- [x] **CA02:** Dado um usuário autenticado no Firebase Auth sem privilégio de administrador, quando tenta criar/editar/excluir documentos em `poems` ou ler `subscribers` / `page_views`, então o Firestore rejeita a operação com `PERMISSION_DENIED`.
- [x] **CA03:** Dado um cliente anônimo tentando deletar uma reação em `poem_reactions` que não pertence ao seu `session_id` (ou sem permissão), quando a regra é avaliada, então a exclusão é negada.
- [x] **CA04:** Dado um poema ou coleção no Firestore cujo documento não possui campo interno `id` igual ao seu Document ID, quando o admin abre a tela de edição por `?id=<docId>`, então o registro é carregado e atualizado corretamente pelo Document ID.
- [x] **CA05:** Dado que um poema foi incluído ou removido de uma coleção em [`collections.js`](../src/pages/admin/collections.js), quando a alteração é salva, então `poem.collection_slugs` no documento do poema reflete imediatamente a lista atualizada de coleções.
- [x] **CA06:** Dado um banco com histórico grande de `page_views`, quando o admin abre a listagem de obras (`list.js`), então a consulta de visualizações aplica filtro/limite explícito sem ler toda a coleção histórica.
- [x] **CA07:** Dado nenhum registro filtrado no histórico de e-mails (`emails.js`), quando a tabela vazia é renderizada, então a célula única ocupa todas as 6 colunas (`colspan="6"`), e e-mails na tela de assinantes passam por `escapeHtml`.

## O que a atividade não inclui

- Suporte multi-usuário com múltiplos papéis (revisor, editor, leitor logado): motivo: o site tem apenas um autor/administrador.
- Migração de analytics histórico para BigQuery: motivo: volume atual ainda comporta janela limitada no Firestore.

### Considerado para o futuro (P2)

- Contador incremental agregado de visualizações por poema mantido por Cloud Function para substituir consultas de janela em `page_views`.
- Rotação automática/limpeza (TTL) de registros antigos de `page_views` e `error_logs`.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Preferência entre validar `isAdmin()` via Custom Claim (`request.auth.token.admin == true`) ou UID/e-mail fixo em `firestore.rules` (lembrando que [`publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) usa `FIREBASE_ADMIN_EMAIL`)? | dev/PO | Sim | Combinar ambos no helper `isAdmin()`: `request.auth != null && (request.auth.token.admin == true || request.auth.token.email in ['nfgbrentano@gmail.com'])`. Assegura funcionamento imediato para a conta do autor e scripts com `FIREBASE_ADMIN_EMAIL`, além de suporte a custom claims futuros. |
| D02 | Para `poem_reactions`, manter alternância/remoção do próprio voto (exigindo migração do schema/doc ID) ou permitir apenas acréscimo de reação no cliente anônimo? | PO/dev | Não | Permitir apenas acréscimo para clientes anônimos (comportamento de "curtir/aplaudir" cumulativo) e restringir `delete` exclusivamente a `isAdmin()`. Isso elimina a vulnerabilidade de exclusão arbitrária/em massa de reações de terceiros sem exigir migração arriscada de IDs legados. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Remoção do bypass_auth | integração (jsdom) | CA01 | Navegar para `/admin?bypass_auth=true` sem sessão | `navigateTo('/login')` acionado; dashboard não renderizado |
| CT02 | Firestore Rules não-admin | integração | CA02 | Avaliar regras em `src/firestore-rules.test.js` com `auth` comum sem claim/email admin | Negado em `poems`, `subscribers`, `page_views`, `error_logs` |
| CT03 | Firestore Rules deleção de reação | integração | CA03 | Tentar `delete` anônimo em `poem_reactions` de terceiro | Operação negada pelas regras |
| CT04 | `getDocById` e `insertDocs` | unit | CA04 | Testar `getDocById` e `insertDocs` com objeto único e array em `src/pages/admin/data.test.js` | Busca por ID do documento funciona e ambos formatos de `insertDocs` são tratados uniformemente |
| CT05 | Sincronismo de `collection_slugs` | unit/integração | CA05 | Salvar associação coleção-poema mockando Firestore | `updateDocById` é chamado atualizando `collection_slugs` do poema |
| CT06 | Consulta limitada em `list.js` | unit | CA06 | Renderizar `renderList` espiando opções de `listDocs('page_views', ...)` | Query inclui restrição de janela/limite |
| CT07 | Markup de tabela e escape | unit | CA07 | Renderizar tabela vazia em `emails.js` e assinante com `<` em `subscribers.js` | `colspan="6"` presente e e-mail escapado |

## URL Complementar

- Documentação técnica: [`firestore.rules`](../firestore.rules), [`src/pages/admin/data.js`](../src/pages/admin/data.js), [`src/pages/admin.js`](../src/pages/admin.js)
- Protótipo / mockup: N/A — sem alteração visual significativa.
- Discussões relacionadas: [`SDD/DONE/2026-10-04_fix-regras-firestore-push-e-reacoes.md`](DONE/2026-10-04_fix-regras-firestore-push-e-reacoes.md), [`SDD/DONE/2026-10-05_refactor-dividir-admin-em-modulos.md`](DONE/2026-10-05_refactor-dividir-admin-em-modulos.md)
- Referências de design: N/A
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
