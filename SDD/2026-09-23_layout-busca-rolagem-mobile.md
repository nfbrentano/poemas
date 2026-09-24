# [FIX][UI] Resultados da busca não rolam no celular

## Detalhes da Atividade

- **O que precisa ser feito:** Tornar a lista de resultados do overlay de busca (`#search-overlay`) rolável no celular, mantendo o campo de busca fixo no topo.
- **Por que é necessário:** Isso foi verificado em uma viewport de 375×812: ao buscar "amor", aparecem 148 resultados. O container `.search-overlay-content` fica com cerca de 33.700px de altura dentro de um overlay de 812px com `overflow-y: visible`, e o `body` recebe `overflow: hidden` ao abrir a busca. Com isso, a rolagem não tem efeito (`scrollY` continua em 0) e o leitor só alcança os 5 primeiros resultados. O texto de ajuda ("Digite título...") fica no fim da lista, a cerca de 33.800px.
- **Qual valor será agregado:** A busca passa a funcionar de fato no celular, que é o principal dispositivo de leitura.
- **Para quem é destinado:** Leitores que buscam poemas pelo celular.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O overlay deve ocupar `100dvh`, com o cabeçalho (input, limpar e fechar) fixo e a lista de resultados em uma área própria com `overflow-y: auto`.
- RF02: A lista deve rolar com inércia no iOS (`-webkit-overflow-scrolling: touch`) e sem vazar a rolagem para a página de fundo (`overscroll-behavior: contain`).
- RF03: O texto de ajuda deve aparecer só quando não há busca ativa, logo abaixo do campo, e não depois dos resultados.
- RF04: A linha "148 obras encontradas / Ordenar por" deve caber em 375px sem quebrar: contagem à esquerda e seletor à direita, ou a contagem em uma linha própria.
- RF05: Quando o poema não tem `excerpt`, o resultado deve mostrar as primeiras palavras do conteúdo em vez de ficar só com as tags (hoje é o caso de vários resultados).
- RF06: Ao abrir o teclado virtual, a lista deve continuar visível e rolável acima dele.

### Requisitos não-funcionais

- RNF01: Respeitar `env(safe-area-inset-top)` e `env(safe-area-inset-bottom)`.
- RNF02: Área de toque de cada resultado com pelo menos 44px de altura.
- RNF03: Sem regressão no desktop.

### Dependências técnicas

- `src/components/search-overlay.js` (markup), `src/styles/components.css` (`.search-overlay*`)

### Recursos necessários

- Um dispositivo iOS e um Android reais, ou emulação, para validar a rolagem e o teclado.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o celular (375×812), quando busco "amor", então consigo rolar até o último resultado.
- [ ] **CA02:** Dado que rolei os resultados, quando olho o topo, então o campo de busca e o botão fechar continuam visíveis.
- [ ] **CA03:** Dado que cheguei ao fim da lista, quando continuo arrastando, então a página de fundo não se move.
- [ ] **CA04:** Dado o teclado aberto, quando digito, então os primeiros resultados aparecem acima do teclado.

## O que a atividade não inclui

- Não inclui mudar a lógica de busca (ver `2026-09-23_busca-sem-acentos.md` e `2026-09-23_busca-por-url.md`).
- Não inclui virtualização ou paginação dos resultados.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Rolagem | Mobile → Buscar → "amor" → arrastar para cima | A lista rola |
| CT02 | Cabeçalho fixo | Rolar 20 resultados | Input visível no topo |
| CT03 | Sem excerpt | Poema sem `excerpt` nos resultados | Mostra o início do conteúdo |
| CT04 | Landscape | Girar o celular com resultados | A lista continua rolável |
| CT05 | Desktop | 1280px, buscar "amor" | Layout igual ao atual, rolável |

## URL Complementar

- Código: [src/components/search-overlay.js](../src/components/search-overlay.js), [src/styles/components.css](../src/styles/components.css)
- Referência: MDN, `overscroll-behavior` e unidades `dvh`
