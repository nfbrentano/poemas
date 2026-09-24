# [SEC] Impedir leitura pública de rascunhos e poemas agendados

## Detalhes da Atividade

- **O que precisa ser feito:** Restringir a leitura pública da coleção `poems` a documentos com `status == 'published'`, e ajustar todas as consultas do site público para sempre incluir esse filtro.
- **Por que é necessário:** Em `firestore.rules`, `match /poems/{document=**} { allow read: if true; }` libera todos os documentos. As páginas filtram por `status` no cliente, mas qualquer pessoa com a config pública do Firebase (que vai no bundle) pode listar rascunhos e poemas agendados antes da publicação. Algumas consultas do site nem filtram (`getRandomPoem` em `navigation.js` e a coleção em `collection.js`), o que também causa bugs visíveis. Para um autor, um rascunho vazado significa perder o ineditismo da obra.
- **Qual valor será agregado:** Rascunhos ficam privados de verdade, o que protege obras inéditas e a publicação agendada.
- **Para quem é destinado:** O autor.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Regra: `allow read: if resource.data.status == 'published' || request.auth != null;` para `poems`.
- RF02: Toda consulta pública a `poems` deve incluir `where('status', '==', 'published')`, para que a query seja aceita pelas regras. Levantar e corrigir todos os pontos: `navigation.js`, `collection.js`, `collections.js`, `filter-chips.js`, `search-overlay.js`, `home.js`, `poem.js`.
- RF03: O painel admin (autenticado) continua enxergando todos os status.
- RF04: Scripts de build (`generate-sitemap.js`, `generate-rss.js`, `prerender.js`) e a Action do e-mail diário devem continuar funcionando. Verificar se usam credencial de admin ou o SDK público com o filtro.

### Requisitos não-funcionais

- RNF01: Nenhuma página pública pode quebrar com `permission-denied` depois da mudança.
- RNF02: Revisar pelo mesmo critério as outras coleções com `read: if true`: `push_subscriptions` (endpoints dos inscritos em push hoje são legíveis por qualquer pessoa) e `poem_reactions`. Registrar a decisão para cada uma.

### Dependências técnicas

- `firestore.rules`, todos os arquivos listados no RF02, `scripts/*`, `.github/workflows/*.yml`
- Relacionado a `2026-09-23_poema-aleatorio-somente-publicados.md` e `2026-09-23_pagina-colecao-seo-e-ordenacao.md`

### Recursos necessários

- Emulador do Firestore para testar as regras.
- Acesso ao Firebase Console para publicar.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um visitante anônimo, quando ele consulta `poems` sem o filtro de status pelo SDK, então recebe `permission-denied`.
- [ ] **CA02:** Dado um visitante anônimo, quando ele lê por ID um documento com `status: 'draft'`, então recebe `permission-denied`.
- [ ] **CA03:** Dado o site público, quando navego por home, poema, coleções, busca e aleatório, então nenhuma página exibe erro.
- [ ] **CA04:** Dado o admin logado, quando abro a lista de rascunhos, então todos aparecem.
- [ ] **CA05:** Dado que rodo `npm run build`, quando o build termina, então o sitemap, o RSS e o prerender são gerados sem erros.

## O que a atividade não inclui

- Não inclui mudar o fluxo de publicação agendada (`supabase/functions/publish-scheduled-poems`).
- Não inclui migrar o armazenamento de rascunhos para outra coleção.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Regras: lista anônima | Emulador: `getDocs(poems)` sem filtro | Negado |
| CT02 | Regras: lista filtrada | `where status == published` | Permitido |
| CT03 | Regras: admin | Autenticado lê um rascunho | Permitido |
| CT04 | Smoke do site | Percorrer todas as rotas públicas | Sem erros no console |
| CT05 | Build | `npm run build` | Conclui com sucesso |

## URL Complementar

- Código: [firestore.rules](../firestore.rules)
- Referência: Firebase, "Rules are not filters" (as queries precisam respeitar as regras)
