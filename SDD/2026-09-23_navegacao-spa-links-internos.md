# [FIX] Links internos com ícone ou texto aninhado recarregam a página inteira

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o interceptador de cliques do roteador (`src/router.js`, função `initRouter`) para que qualquer clique dentro de um elemento `[data-link]` seja tratado pela navegação SPA, e não só cliques cujo alvo seja o próprio `<a>`.
- **Por que é necessário:** Hoje o handler usa `e.target.matches('[data-link]')`. Quando o clique cai em um filho do link (o `<svg>` ou o `<span>` da barra de navegação inferior, o `<h2>`/`<h3>` dos itens da lista de poemas, o título do "poema do dia"), a condição falha e o navegador faz uma navegação completa. Isso recarrega o bundle, o Firebase e o Clarity, perde o estado da página e ignora as transições de view.
- **Qual valor será agregado:** Navegação instantânea e consistente em todo o site, principalmente no celular, onde a barra inferior é o menu principal.
- **Para quem é destinado:** Todos os leitores, especialmente no celular.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Um clique em qualquer descendente de um elemento `[data-link]` deve ser interceptado e navegar via `navigateTo`.
- RF02: Cliques com modificadores (Ctrl/Cmd/Shift/Alt), com o botão do meio ou em links com `target="_blank"` não devem ser interceptados, para que "abrir em nova aba" continue funcionando.
- RF03: Links externos (outra origem) nunca devem ser interceptados, mesmo que tenham `data-link`.

### Requisitos não-funcionais

- RNF01: Um único listener delegado no `body`, sem adicionar listeners por link.
- RNF02: Nenhuma regressão nos testes existentes de `src/router.test.js`.

### Dependências técnicas

- `src/router.js` (`initRouter`, `navigateTo`).

### Recursos necessários

- N/A: nenhum recurso externo.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou no celular, quando toco no ícone "Coleções" da barra inferior, então a página muda sem recarregar o documento (não há novo request de `index.html`).
- [ ] **CA02:** Dado que estou na home, quando clico no título de um poema da lista, então o poema abre via SPA.
- [ ] **CA03:** Dado um link interno, quando clico com Ctrl/Cmd pressionado, então o link abre em nova aba e a aba atual não muda.
- [ ] **CA04:** Dado que rodo `npm test`, quando os testes terminam, então todos passam, incluindo um novo teste de clique em elemento filho.

## O que a atividade não inclui

- Não inclui mudar o sistema de rotas nem a estrutura das URLs.
- Não inclui prefetch de rotas ao passar o mouse.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Clique em filho SVG | Disparar `click` no `<svg>` dentro de `.bottom-nav-item[data-link]` | `preventDefault` chamado e `history.pushState` executado |
| CT02 | Clique com modificador | Disparar `click` com `metaKey: true` em um `[data-link]` | `preventDefault` não chamado |
| CT03 | Link externo | `<a data-link href="https://instagram.com/...">` | Navegação não interceptada |
| CT04 | Clique fora de links | Clique em um `<p>` qualquer | Nada acontece |

## URL Complementar

- Código: [src/router.js](../src/router.js) (listener `click` em `initRouter`)
- Referência: MDN, `Element.closest()`
