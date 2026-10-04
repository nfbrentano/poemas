# [FIX] Endurecer regras do Firestore para inscrições push e reações

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-04 · **Atualizada em:** 2026-10-04

## Detalhes da Atividade

- **O que precisa ser feito:** Restringir as regras de `push_subscriptions` e `poem_reactions` em `firestore.rules` e ajustar `src/utils/push.js` para continuar funcionando sob as novas regras.
- **Problema e evidência:** `push_subscriptions` permite `read` público: qualquer pessoa lista endpoints e chaves (`p256dh`, `auth`) de todos os inscritos. `create` aceita qualquer payload. Em `poem_reactions`, `create` aceita qualquer documento (qualquer campo, emoji ou tamanho).
- **Impacto de não fazer:** Vazamento de dados de inscritos (permite enviar push indevido a eles) e poluição do banco por escrita arbitrária.
- **Para quem é destinado:** Leitor anônimo (protegido) e administrador (mantém acesso).
- **História de usuário:** Como mantenedor, quero que apenas admin leia inscrições push e que escritas públicas sejam validadas, para proteger os dados dos leitores.
- **Como saberemos que deu certo:** 0 leituras públicas possíveis em `push_subscriptions`; criação de reação/inscrição com payload fora do esquema é rejeitada pelas regras; inscrever e cancelar push continuam funcionando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | `push_subscriptions`: `get`/`list` somente para usuário autenticado | P0 | CA01 |
| RF02 | `push_subscriptions`: `create` só com campos `user_id` e `subscription` (com `endpoint` string https) e ID do documento no formato SHA-256 hex (64 caracteres) | P0 | CA02, CA03 |
| RF03 | `push.js` grava a inscrição com ID = SHA-256 hex do endpoint e cancela via `deleteDoc` direto por esse ID, sem consulta | P0 | CA04 |
| RF04 | `poem_reactions`: `create` só com `poem_id`, `emoji`, `session_id`; emoji dentre os 6 permitidos; strings com tamanho limitado | P0 | CA05, CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma alteração na leitura pública de reações (contagem continua funcionando sem login) | P0 | CA07 |
| RNF02 | Suíte `npm test` continua 100% verde | P0 | CA08 |

### Dependências técnicas

- `firestore.rules`, `src/utils/push.js`, `src/utils/reactions.js`
- Cloud Functions usam Admin SDK (ignoram regras), então não são afetadas.

### Recursos necessários

- Deploy das regras pelo mantenedor (`firebase deploy --only firestore:rules`) após o merge.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um visitante anônimo, quando tenta ler ou listar `push_subscriptions`, então as regras negam; admin autenticado consegue.
- [x] **CA02:** Dado que um visitante se inscreve em push, quando o documento é criado com ID SHA-256 do endpoint e campos válidos, então as regras permitem.
- [x] **CA03:** Dado que o payload tem campo extra ou endpoint inválido, quando tenta criar, então as regras negam.
- [x] **CA04:** Dado que o usuário cancela as notificações, quando `unsubscribe()` roda, então o documento de ID derivado do endpoint é removido sem nenhuma leitura ao Firestore.
- [x] **CA05:** Dado que um visitante reage a um poema, quando cria `{poem_id, emoji, session_id}` válidos com emoji permitido, então as regras permitem.
- [x] **CA06:** Dado um emoji fora da lista, campo extra ou string acima do limite, quando tenta criar reação, então as regras negam.
- [x] **CA07:** Dado um visitante anônimo, quando carrega um poema, então as reações continuam sendo lidas e exibidas.
- [x] **CA08:** Dado o projeto, quando `npm test -- --run` roda, então todos os testes passam.

## O que a atividade não inclui

- Migrar inscrições legadas (IDs automáticos): o cancelamento delas deixa de funcionar pelo cliente; o admin pode removê-las. Baixo volume e impacto.
- Impedir que alguém apague reações de terceiros: exige autenticação anônima ou App Check, atividade própria.
- Rate limiting: exige Cloud Function ou App Check.

### Considerado para o futuro (P2)

- Firebase App Check e Auth anônimo para vincular reação ao `request.auth.uid`.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | Existem inscrições legadas em produção que o usuário precise cancelar sozinho? | dev | Não | Aceito o impacto |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Regras de push negam leitura pública | unit (análise estática das regras) | CA01 | Ler `firestore.rules` e inspecionar o bloco | Sem `read: if true` em `push_subscriptions` |
| CT02 | Regras de push validam payload | unit | CA02, CA03 | Inspecionar `hasOnly`, ID e endpoint | Presentes |
| CT03 | `unsubscribe` não consulta | unit | CA04 | Mock do Firestore; chamar `unsubscribe()` | `deleteDoc` chamado com ID SHA-256; `getDocs` não chamado |
| CT04 | Regras de reação validam payload | unit | CA05, CA06 | Inspecionar regra | `hasOnly`, lista de emojis e `size()` presentes |
| CT05 | Leitura pública de reações preservada | unit | CA07 | Inspecionar regra | `read` público mantido |
| CT06 | Suíte completa | integração | CA08 | `npm test -- --run` | Verde |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/firestore/security/rules-conditions
- Protótipo / mockup: N/A
- Discussões relacionadas: revisão de melhorias do site (2026-10-04)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
