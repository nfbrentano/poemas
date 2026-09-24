# [FIX] Comentários: clicar em "+ Deixar uma nota" não exibe o formulário

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer o botão "+ Deixar uma nota", na página do poema, abrir o formulário de comentário. Hoje o botão some ao ser clicado e nada aparece no lugar, então não é possível comentar. Também é preciso revisar o fluxo inteiro de comentários (abrir, enviar e listar) para que ele funcione de ponta a ponta.
- **Por que é necessário:** Os comentários ("notas") são o único canal de interação escrita do leitor com o autor. Com o formulário inacessível, a funcionalidade está quebrada para todos os usuários, em desktop e mobile.
- **Qual valor será agregado:** Recupera o engajamento dos leitores, que voltam a deixar notas, e a fila de moderação do admin volta a receber conteúdo.
- **Para quem é destinado:** Leitores que querem comentar um poema e o autor, que modera as notas no painel admin.

### Contexto técnico (causa provável, por análise do código)

O mesmo listener de clique no `#toggle-comment-btn` é registrado **duas vezes**:

1. Em [`src/pages/poem.js:307-312`](../src/pages/poem.js), quando a página do poema é montada.
2. Em [`src/components/poem-comments.js:6-12`](../src/components/poem-comments.js), dentro de `PoemComments.init()`, que é carregado de forma adiada (idle/timeout) em [`src/pages/poem.js:809-812`](../src/pages/poem.js).

Os dois handlers fazem um *toggle*: `display === 'none' ? 'block' : 'none'`. Depois que `PoemComments.init()` roda, um clique dispara os dois em sequência:

- o 1º muda o formulário de `none` para `block` e esconde o botão;
- o 2º muda o formulário de `block` de volta para `none`.

**Resultado:** o botão desaparece e o formulário continua oculto, sem nenhum jeito de reabrir sem recarregar a página. Se o usuário clicar antes de o módulo adiado carregar, o formulário abre normalmente. Por isso o bug pode parecer intermitente.

Pontos secundários a revisar no mesmo fluxo:

- `loadComments()` mostra "Silêncio... nenhum comentário ainda." tanto quando não há comentários quanto quando **ocorre um erro** (ex.: índice ausente ou `permission-denied`). Isso esconde falhas.
- A query de listagem (`poem_id ==`, `approved ==`, `orderBy created_at`) depende do índice composto de `firestore.indexes.json`. É preciso confirmar que ele está publicado no projeto Firebase.
- O elemento `#comment-msg` existe no markup ([`src/utils/poem-template.js`](../src/utils/poem-template.js)), mas não é usado. O feedback é dado só via toast.
- Depois de enviar com sucesso, o formulário é escondido e o botão continua oculto, então o usuário não consegue deixar outra nota sem recarregar a página.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Ao clicar em "+ Deixar uma nota", o formulário deve ficar visível e o foco deve ir para o campo "Seu nome".
- RF02: A lógica de abrir/fechar o formulário deve existir em **um único lugar**. Remover a duplicação entre `poem.js` e `poem-comments.js` e manter essa lógica no componente `PoemComments`.
- RF03: O formulário deve abrir corretamente com qualquer timing: antes e depois de o módulo de comentários ser carregado.
- RF04: Depois de enviar com sucesso, mostrar a mensagem "Sua nota foi enviada e aguarda moderação." e exibir de novo o botão "+ Deixar uma nota". O intervalo mínimo de 60s entre envios continua valendo.
- RF05: Se houver erro ao carregar os comentários, registrar o erro no console e mostrar uma mensagem distinta do estado vazio (ex.: "Não foi possível carregar as notas agora.").
- RF06: Manter as proteções já existentes: honeypot, intervalo de 60s, `trim()` e validação nas regras do Firestore (ver `SDD/DONE/2026-09-23_comentarios-antispam.md`).

### Requisitos não-funcionais

- RNF01: Acessibilidade: o botão deve ter `aria-expanded` e `aria-controls="comment-form"` coerentes com o estado do formulário.
- RNF02: Não registrar listeners duplicados ao navegar entre poemas pela SPA. Cada renderização deve ter exatamente um handler por elemento.
- RNF03: Continuar carregando o Firestore de forma adiada, sem impactar o LCP da página do poema.
- RNF04: Preferir controlar a visibilidade com o atributo `hidden` ou uma classe CSS em vez de `style.display` inline.

### Dependências técnicas

- `src/pages/poem.js`, `src/components/poem-comments.js`, `src/utils/poem-template.js`
- `firestore.rules` e `firestore.indexes.json`: confirmar que as regras e o índice composto de `poem_comments` estão publicados (`firebase deploy --only firestore`).

### Recursos necessários

- Servidor de dev (`npm run dev`) com acesso ao Firestore (ou ao emulador).
- Acesso ao Firebase Console para verificar índices e documentos criados em `poem_comments`.
- Acesso ao painel admin para aprovar um comentário de teste.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou na página de um poema e a seção de comentários já carregou, quando clico em "+ Deixar uma nota", então o formulário aparece e o foco vai para o campo "Seu nome".
- [ ] **CA02:** Dado que acabei de abrir a página, quando clico em "+ Deixar uma nota" antes de o módulo de comentários carregar, então o formulário também aparece.
- [ ] **CA03:** Dado que preenchi nome e nota válidos, quando clico em "Enviar Nota", então vejo "Sua nota foi enviada e aguarda moderação." e um documento é criado em `poem_comments` com `approved: false`.
- [ ] **CA04:** Dado que enviei uma nota com sucesso, quando o envio termina, então o formulário é limpo e o botão "+ Deixar uma nota" volta a aparecer.
- [ ] **CA05:** Dado que um comentário foi aprovado no admin, quando abro a página do poema, então ele aparece na lista com nome e data.
- [ ] **CA06:** Dado que a consulta de comentários falhou, quando a seção é renderizada, então vejo uma mensagem de erro distinta de "Silêncio... nenhum comentário ainda." e o erro fica registrado no console.
- [ ] **CA07:** Dado que naveguei por vários poemas pela SPA, quando clico em "+ Deixar uma nota" em qualquer um deles, então o formulário abre (sem listeners duplicados que o fechem).

## O que a atividade não inclui

- Mudanças visuais na seção de comentários além do necessário para exibir o formulário e as mensagens.
- Respostas a comentários (threads), edição ou exclusão pelo leitor.
- Mudanças na tela de moderação do admin.
- Notificação ao autor sobre novos comentários.
- Novas regras antispam além das já existentes.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Abrir formulário (após carregar) | Abrir `/poema/<slug>`, esperar ~3s, clicar em "+ Deixar uma nota" | Formulário visível, foco em "Seu nome" |
| CT02 | Abrir formulário (antes de carregar) | Recarregar a página e clicar no botão imediatamente | Formulário visível |
| CT03 | Listeners duplicados | Navegar pela SPA por 3 poemas diferentes e clicar no botão no último | Formulário visível; `aria-expanded="true"` |
| CT04 | Envio válido | Preencher nome e nota, enviar | Toast de sucesso; documento com `approved: false` no Firestore; botão reaparece |
| CT05 | Campos vazios / só espaços | Enviar com nome `"   "` | Mensagem "Preencha os campos corretamente."; nada gravado |
| CT06 | Intervalo de 60s | Enviar duas notas seguidas | Segunda bloqueada com "aguarde 1 minuto" |
| CT07 | Honeypot | Preencher `#comment-website` via DevTools e enviar | Sucesso aparente; nada gravado |
| CT08 | Listagem aprovada | Aprovar um comentário no admin e recarregar o poema | Comentário aparece na lista |
| CT09 | Erro de listagem | Simular falha (offline ou índice ausente) | Mensagem de erro distinta do estado vazio; erro no console |
| CT10 | Mobile e desktop | Repetir CT01 e CT04 em 375px e 1280px | Funciona nos dois |

## URL Complementar

- Documentação técnica: [Firestore — índices compostos](https://firebase.google.com/docs/firestore/query-data/indexing), [MDN — atributo `hidden`](https://developer.mozilla.org/pt-BR/docs/Web/HTML/Global_attributes/hidden)
- Protótipo / mockup: N/A — correção de comportamento, sem mudança de layout.
- Discussões relacionadas: `SDD/DONE/2026-09-23_comentarios-antispam.md` (honeypot, intervalo de 60s e regras do Firestore).
- Referências de design: N/A — mantém o visual atual da seção de notas.
- Requisitos originais: relato do usuário em 2026-09-24: comentários não funcionam; ao clicar para deixar um comentário não aparece nada.
