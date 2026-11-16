# [FIX] Correção de Permissões no Painel Administrativo e Firestore Rules

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-15 · **Atualizada em:** 2026-11-15

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar o e-mail do autor `natanaelfernando@outlook.com` à lista de administradores autorizados no helper `isAdmin()` em [`firestore.rules`](../firestore.rules), atribuir a custom claim `admin: true` às contas de administrador no Firebase Auth, atualizar os testes de regras e garantir a inicialização segura de sessão no painel admin.
- **Problema e evidência:**
  Ao carregar o painel administrativo (`/admin?view=dashboard` e `/admin?view=list`), o console do navegador registra múltiplos erros de permissão do Firestore:
  ```
  installHook.js:1 FirebaseError: Missing or insufficient permissions.
  O @ list-2MkSvq_K.js:147
  r @ dashboard-Bkb5A25B.js:178
  render @ admin-BsIm5P7l.js:22
  ```
  A investigação identificou que o usuário ativo no Firebase Auth é `natanaelfernando@outlook.com` (UID `facb36ce-a587-4277-b56f-884a46216127`), cuja última autenticação ocorreu em 2026-11-16T00:41:55Z. Entretanto, o helper `isAdmin()` em [`firestore.rules`](../firestore.rules) continha apenas `request.auth.token.email in ['nfgbrentano@gmail.com']` e nenhuma das contas possuía a custom claim `admin: true`. Como resultado, todas as coleções restritas (`page_views`, `subscribers`, `poem_comments`, `poems` sem filtro público e `error_logs`) falham com erro de permissão insuficiente.
- **Impacto de não fazer:** O autor fica completamente impossibilitado de gerenciar obras, visualizar métricas no dashboard, moderar comentários e acessar logs no ambiente de produção autenticado.
- **Para quem é destinado:** Autor e administrador do acervo poético (`natanaelfernando@outlook.com` / `nfgbrentano@gmail.com`).
- **História de usuário:** Como administrador do site, quero acessar o dashboard e a lista de obras autenticado com minha conta `natanaelfernando@outlook.com` sem erros de permissão no Firestore, para gerenciar meu acervo e métricas com segurança.
- **Como saberemos que deu certo:** Zero erros de permissão insuficiente (`FirebaseError: Missing or insufficient permissions`) ao abrir o dashboard e a lista de obras; consultas a `poems`, `page_views`, `subscribers`, `poem_comments` e `error_logs` retornam com sucesso para o usuário logado; regras do Firestore validadas e testadas via suite automatizada.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar o helper `isAdmin()` em [`firestore.rules`](../firestore.rules) para autorizar explicitamente o e-mail `natanaelfernando@outlook.com` ao lado de `nfgbrentano@gmail.com` e a custom claim `admin: true`. | P0 | CA01 |
| RF02 | Definir a custom claim `admin: true` para as contas de administrador no Firebase Auth (`natanaelfernando@outlook.com` e `nfgbrentano@gmail.com`). | P0 | CA02 |
| RF03 | Fazer deploy das regras atualizadas do Firestore para o projeto Firebase em produção. | P0 | CA03 |
| RF04 | Atualizar os testes automatizados em [`src/firestore-rules.test.js`](../src/firestore-rules.test.js) e [`src/admin-auth.test.js`](../src/admin-auth.test.js) para cobrir o acesso de ambas as contas. | P0 | CA04 |
| RF05 | Garantir em [`src/pages/admin/data.js`](../src/pages/admin/data.js) que `getAdminSession()` aguarde `auth.authStateReady()` (quando disponível) para evitar perda de estado transitória no carregamento inicial da página. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma permissão pública de escrita ou leitura indiscriminada deve ser aberta para visitantes não-admin. | P0 | CA01, CA04 |
| RNF02 | A suite completa de testes automatizados (`npx vitest run`) deve rodar com 100% de sucesso. | P0 | CA04 |
| RNF03 | As alterações em [`firestore.rules`](../firestore.rules) devem ser elaboradas com auxílio do subagente especialista `firestore-rules-author`. | P0 | CA01 |

### Dependências técnicas

- [`firestore.rules`](../firestore.rules) e [`src/firestore-rules.test.js`](../src/firestore-rules.test.js).
- MCP `firebase-mcp-server` (`auth_update_user`, `firebase_deploy`, `firebase_validate_security_rules`).
- [`src/pages/admin/data.js`](../src/pages/admin/data.js) e [`src/admin-auth.test.js`](../src/admin-auth.test.js).

### Recursos necessários

- Acesso ao projeto Firebase via ferramentas MCP já configuradas no ambiente.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um usuário autenticado com o e-mail `natanaelfernando@outlook.com` ou `nfgbrentano@gmail.com`, quando executa consultas administrativas no Firestore (`poems`, `page_views`, `subscribers`, `poem_comments`, `error_logs`), então o helper `isAdmin()` avalia como verdadeiro e a operação é autorizada.
- [x] **CA02:** Dado o usuário UID `facb36ce-a587-4277-b56f-884a46216127` (`natanaelfernando@outlook.com`) e UID `fc92a33d-2451-4e2a-8b8e-4db86309a49d` (`nfgbrentano@gmail.com`), quando suas custom claims são consultadas, então possuem `admin: true`.
- [x] **CA03:** Dado o arquivo [`firestore.rules`](../firestore.rules) atualizado, quando o deploy das regras do Firestore é executado com sucesso no Firebase, então as regras ativas no serviço passam a contemplar o novo helper `isAdmin()`.
- [x] **CA04:** Dado o arquivo de testes [`src/firestore-rules.test.js`](../src/firestore-rules.test.js), quando a suite é executada com `vitest`, então valida que tanto `nfgbrentano@gmail.com` quanto `natanaelfernando@outlook.com` e a claim `admin: true` são reconhecidos como administradores válidos.
- [x] **CA05:** Dado um usuário autenticado recarregando `/admin` diretamente no navegador, quando a aplicação inicializa, então `getAdminSession()` aguarda a restauração da autenticação persistida antes de retornar o status da sessão.

## O que a atividade não inclui

- Criação de novos perfis de permissão com granularidade parcial (ex: moderador de comentários vs editor): motivo: o autor opera o acervo de forma unificada e possui acesso administrativo integral.
- Alteração da camada de visualização do dashboard ou filtros de lista: motivo: a UI já está pronta e apenas aguardava a liberação das permissões do Firestore.

### Considerado para o futuro (P2)

- Interface no painel para visualização e gerenciamento de claims administrativas para múltiplos colaboradores convidados caso o acervo passe a ser colaborativo.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Ambas as contas (`natanaelfernando@outlook.com` e `nfgbrentano@gmail.com`) devem receber a claim `admin: true` e constar no helper `isAdmin()`? | dev/PO | Não | Sim, ambas pertencem ao autor Natanael e são utilizadas alternadamente dependendo do ambiente/histórico do WordPress e Google. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Validação sintática e estática de firestore.rules | unit / lint | CA01, CA04 | Executar testes em `src/firestore-rules.test.js` | Helper `isAdmin()` contém os dois e-mails e claim `admin: true` |
| CT02 | Autenticação com sessão admin para natanaelfernando@outlook.com | unit | CA04 | Executar teste em `src/admin-auth.test.js` com o e-mail do autor | Renderização do painel admin permitida sem redirecionamento para login |
| CT03 | getAdminSession com authStateReady | unit | CA05 | Invocar `getAdminSession` garantindo que `authStateReady` seja aguardado | Sessão do usuário retornada confiavelmente após resolução |
| CT04 | Suite completa de testes de regressão | integração | CA01, CA04, CA05 | Executar `npx vitest run` em todo o repositório | Todos os 26+ arquivos de teste aprovados sem falhas |

## URL Complementar

- Documentação técnica: [`firestore.rules`](../firestore.rules), [`src/pages/admin/data.js`](../src/pages/admin/data.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-13_fix-hardening-admin-e-firestore-rules.md`](DONE/2026-11-13_fix-hardening-admin-e-firestore-rules.md)
- Referências de design: N/A
- Requisitos originais: Relato de erro no console ao carregar lista de obras e dashboard admin (`Missing or insufficient permissions`).
- Issue / PR relacionado: N/A
