# [FIX] Inscrição na newsletter falha para visitantes não autenticados

## Detalhes da Atividade

- **O que precisa ser feito:** Revisar o fluxo de inscrição (`src/components/newsletter.js`) para que visitantes anônimos consigam se inscrever, e normalizar o e-mail antes de gravar.
- **Por que é necessário:** Antes de gravar, o componente faz uma consulta em `subscribers` (`where('email', '==', email)`) para checar duplicidade. Em `firestore.rules`, a coleção `subscribers` só permite `create` para anônimos, e `read` exige `request.auth != null`. Com isso, a consulta de duplicidade deve falhar com `permission-denied` para qualquer visitante, e o usuário vê "Erro ao inscrever. Tente novamente." *(Confirmar em produção: com o admin logado, o fluxo funciona e o problema passa despercebido.)* Além disso, o e-mail é gravado como digitado, então `Maria@X.com` e `maria@x.com ` viram dois inscritos.
- **Qual valor será agregado:** A captação de leitores volta a funcionar, e isso sustenta o e-mail diário, que é uma das funcionalidades centrais do site.
- **Para quem é destinado:** Visitantes que querem receber poemas por e-mail e o autor, que depende da lista.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Um visitante anônimo deve conseguir se inscrever com sucesso.
- RF02: O e-mail deve ser normalizado com `trim()` e `toLowerCase()` antes da validação e da gravação.
- RF03: A duplicidade deve ser evitada sem exigir leitura pública da coleção. Sugestão: usar o e-mail normalizado (ou um hash dele) como ID do documento (`setDoc(doc(db, 'subscribers', id), ...)`), com uma regra que permita `create` e negue `update`, de modo que uma segunda inscrição falhe de forma previsível e seja tratada como "já inscrito".
- RF04: A mensagem de sucesso, de erro ou de "já inscrito" deve ser anunciada no `aria-live` já existente.
- RF05: O botão "Assinar" deve ficar desabilitado enquanto a requisição estiver em andamento.

### Requisitos não-funcionais

- RNF01: A lista de inscritos continua ilegível para anônimos (privacidade/LGPD).
- RNF02: As regras devem validar o formato do documento criado (apenas os campos `email` e `created_at`, e `email` como string com no máximo 254 caracteres).

### Dependências técnicas

- `src/components/newsletter.js`
- `firestore.rules` (bloco `subscribers`)
- `scripts/send-daily-poem.js` e a página de cancelamento (`src/pages/unsubscribe.js`), que devem continuar encontrando o inscrito pelo novo formato de ID.

### Recursos necessários

- Acesso ao Firebase Console para publicar as regras.
- Migração opcional dos inscritos existentes para o novo formato de ID.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um visitante não logado, quando ele envia um e-mail válido, então vê "Obrigado por assinar." e o documento é criado.
- [ ] **CA02:** Dado um e-mail já inscrito, quando ele é enviado de novo com outra caixa ou espaços, então aparece "Este e-mail já está inscrito." e nenhum documento novo é criado.
- [ ] **CA03:** Dado um visitante anônimo, quando ele tenta ler `subscribers` pelo SDK, então recebe `permission-denied`.
- [ ] **CA04:** Dado que a requisição está em andamento, quando o usuário clica em "Assinar" de novo, então nada acontece (botão desabilitado).

## O que a atividade não inclui

- Não inclui double opt-in (e-mail de confirmação).
- Não inclui mudar o template ou a frequência do e-mail diário.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Inscrição anônima | Janela anônima → rodapé da home → e-mail novo → Assinar | Sucesso |
| CT02 | Duplicado com caixa diferente | Inscrever `a@b.com`, depois `A@B.com ` | Mensagem "já inscrito" |
| CT03 | E-mail inválido | `abc@` | Mensagem de validação, sem request |
| CT04 | Regras | Emulador do Firestore: anônimo faz `getDocs(subscribers)` | Negado |
| CT05 | Cancelamento | Cancelar a inscrição pelo link do e-mail após a mudança de ID | Inscrito removido |

## URL Complementar

- Código: [src/components/newsletter.js](../src/components/newsletter.js), [firestore.rules](../firestore.rules)
- Referência: documentação do Firebase sobre Security Rules e condições em `create`
