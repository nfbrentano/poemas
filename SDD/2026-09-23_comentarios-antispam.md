# [FEAT] Comentários: proteção contra spam e validação no servidor

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar proteções leves contra spam no formulário de "notas" (`src/components/poem-comments.js`) e validar o formato do comentário nas regras do Firestore.
- **Por que é necessário:** A regra atual permite `read, create: if true` em `poem_comments`, sem nenhuma validação de campos. Os limites `maxlength` existem só no HTML e podem ser ignorados chamando o SDK direto. Qualquer script pode criar milhares de documentos (inclusive com `approved: true`, publicando o comentário sem moderação) e ler os não aprovados. O formulário também não tem honeypot nem intervalo mínimo entre envios, e o botão permite envios repetidos.
- **Qual valor será agregado:** A moderação fica de fato obrigatória, o autor recebe menos lixo na fila de aprovação e o custo do Firestore fica controlado.
- **Para quem é destinado:** O autor, que modera no painel admin, e os leitores, que veem só comentários legítimos.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Adicionar um campo honeypot invisível (ex.: `website`). Se ele vier preenchido, fingir sucesso e não gravar.
- RF02: Impedir um novo envio do mesmo navegador em menos de 60 segundos (via `localStorage`) e mostrar uma mensagem amigável.
- RF03: Aplicar `trim()` e rejeitar nome ou conteúdo vazios (hoje só espaços passam no `required`).
- RF04: Depois de enviar com sucesso, esconder o formulário e mostrar "Sua nota foi enviada e aguarda moderação."

### Requisitos não-funcionais

- RNF01: Regras do Firestore para `create`: exigir exatamente os campos `poem_id`, `author_name`, `content`, `approved` e `created_at`; `approved == false`; `author_name` com 1 a 50 caracteres; `content` com 1 a 500 caracteres.
- RNF02: Regras de leitura: anônimos só podem ler documentos com `approved == true` (a query atual já filtra por isso, então continua funcionando).
- RNF03: Não adicionar CAPTCHA de terceiros nesta etapa, para preservar a experiência e a privacidade.

### Dependências técnicas

- `src/components/poem-comments.js`, `src/pages/poem.js` (markup do formulário), `firestore.rules`
- *(Opcional)* Firebase App Check para limitar o acesso ao próprio site

### Recursos necessários

- Acesso ao Firebase Console para publicar as regras.
- Emulador do Firestore para testar as regras.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um envio pelo SDK com `approved: true`, quando ele é processado, então as regras o negam.
- [ ] **CA02:** Dado um envio com `content` de 2.000 caracteres pelo SDK, quando ele é processado, então as regras o negam.
- [ ] **CA03:** Dado um anônimo, quando ele consulta `poem_comments` sem o filtro `approved == true`, então recebe `permission-denied`.
- [ ] **CA04:** Dado que enviei uma nota, quando tento enviar outra em menos de 60 segundos, então vejo uma mensagem pedindo para aguardar.
- [ ] **CA05:** Dado o honeypot preenchido, quando envio, então vejo sucesso e nenhum documento é criado.

## O que a atividade não inclui

- Não inclui respostas a comentários (threads).
- Não inclui notificação por e-mail ao autor sobre novos comentários.
- Não inclui mudanças na tela de moderação do admin.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Envio válido | Nome e texto normais | Documento criado com `approved: false` |
| CT02 | Só espaços | Nome `"   "` | Bloqueado no cliente |
| CT03 | Regras: campo extra | `create` com o campo `ip` | Negado |
| CT04 | Regras: leitura | Anônimo lê um comentário não aprovado por ID | Negado |
| CT05 | Honeypot | Preencher o campo oculto via DevTools | Sucesso aparente, nada gravado |

## URL Complementar

- Código: [src/components/poem-comments.js](../src/components/poem-comments.js), [firestore.rules](../firestore.rules)
- Referência: documentação do Firebase sobre validação de dados nas Security Rules e sobre o App Check
