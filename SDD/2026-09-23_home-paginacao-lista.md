# [FEAT] Home: paginação ("carregar mais") e agrupamento por ano na lista de poemas

## Detalhes da Atividade

- **O que precisa ser feito:** Exibir a lista de poemas da home em blocos (ex.: 20 por vez), com um botão "Carregar mais poemas", e agrupar os itens por ano de publicação.
- **Por que é necessário:** A home renderiza todos os poemas publicados de uma vez (hoje mais de 150, segundo `scripts/152_poems.json`) em uma única lista longa, sem nenhum marco de navegação. No celular, isso vira uma rolagem extensa em que o newsletter e o botão "Poema aleatório" ficam no fim da página e quase ninguém chega até eles. Cada linha já mostra o ano (`poem-row-year`), o que indica que a cronologia importa.
- **Qual valor será agregado:** Uma home mais leve de percorrer, com o newsletter e o "aleatório" alcançáveis e uma leitura cronológica mais clara.
- **Para quem é destinado:** Leitores na home, principalmente no celular.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Exibir inicialmente 20 poemas (o destaque conta como 1) e um botão "Carregar mais poemas" que acrescenta os próximos 20.
- RF02: Inserir um separador de ano (`<h3>` com o ano) sempre que o ano muda na lista.
- RF03: Ao filtrar por sentimento ou coleção, aplicar a mesma paginação sobre o resultado filtrado.
- RF04: Durante uma busca (evento `global-search`), mostrar todos os resultados, sem paginação.
- RF05: Esconder o botão quando não houver mais itens, e exibir a contagem ("Mostrando 40 de 152").
- RF06: Ao voltar de um poema para a home, manter a quantidade já carregada, via `sessionStorage` ou `history.state`.

### Requisitos não-funcionais

- RNF01: Manter uma única consulta ao Firestore (os dados já vêm completos). A paginação é só de renderização, para não aumentar as leituras.
- RNF02: O botão deve ser um `<button>` acessível, e o foco deve ir para o primeiro item novo depois de carregar.

### Dependências técnicas

- `src/pages/home.js` (`renderPoemList`, `handleGlobalSearch`), `src/styles/components.css`

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado 152 poemas publicados, quando abro a home, então vejo 20 itens e o botão "Carregar mais poemas".
- [ ] **CA02:** Dado a home aberta, quando clico em "Carregar mais" até o fim, então todos os poemas aparecem e o botão some.
- [ ] **CA03:** Dado poemas de 2024 a 2026, quando vejo a lista, então há um separador para cada ano.
- [ ] **CA04:** Dado que carreguei 60 itens e abri um poema, quando volto, então os 60 itens continuam visíveis.
- [ ] **CA05:** Dado uma busca ativa, quando os resultados aparecem, então não há paginação.

## O que a atividade não inclui

- Não inclui paginação no servidor (cursor do Firestore).
- Não inclui scroll infinito automático.
- Não inclui mudar o destaque ou o "poema do dia".

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Primeira carga | Mock com 45 poemas | 20 itens e o botão visível |
| CT02 | Última página | Clicar 2x | 45 itens e o botão oculto |
| CT03 | Separador de ano | Poemas de 2025 e 2026 | Dois cabeçalhos de ano na ordem correta |
| CT04 | Filtro | `?tags=Amor` com 5 resultados | 5 itens, sem botão |
| CT05 | Busca | Buscar "mar" | Todos os resultados, sem botão |

## URL Complementar

- Código: [src/pages/home.js](../src/pages/home.js)
