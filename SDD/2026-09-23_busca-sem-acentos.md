# [FEAT] Busca tolerante a acentos e marcação HTML

## Detalhes da Atividade

- **O que precisa ser feito:** Normalizar o texto (remover diacríticos, caixa e tags HTML) antes de comparar na busca do `searchOverlay` e no destaque dos resultados.
- **Por que é necessário:** Hoje a comparação é `toLowerCase().includes(q)`. Em português, buscar "coracao" não encontra "coração", e "solidao" não encontra "solidão". Isso é comum no celular e em teclados sem acento. Além disso, `poem.content` contém HTML (`<p>`, `<br>`), então um termo pode casar com uma tag, e o trecho exibido (`getSnippet`) pode mostrar marcação quebrada.
- **Qual valor será agregado:** Leitores encontram o poema que procuram mesmo digitando sem acento, e os trechos exibidos ficam limpos.
- **Para quem é destinado:** Leitores que usam a busca (cabeçalho, barra inferior e atalho `/`).

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar uma função utilitária `normalizeForSearch(text)` em `src/utils/` que aplique `stripHtml`, `normalize('NFD')`, remova diacríticos (`\p{Diacritic}`) e converta para minúsculas.
- RF02: Aplicar a normalização a título, resumo, conteúdo, tags e ao termo buscado.
- RF03: O destaque `<mark>` deve cair na posição correta do texto original (com acentos), mesmo quando o termo foi digitado sem acento.
- RF04: O snippet deve ser gerado a partir do texto sem HTML.
- RF05: Título, resumo, snippet e tags devem ser escapados (`escapeHtml`) antes de inserir o `<mark>`, porque hoje são injetados crus no `innerHTML`.

### Requisitos não-funcionais

- RNF01: Pré-computar os campos normalizados uma única vez ao carregar o cache (`loadAllPoems`), sem recalcular a cada tecla.
- RNF02: A busca deve responder em menos de 50 ms para 200 poemas em um celular de médio porte.

### Dependências técnicas

- `src/components/search-overlay.js`, `src/utils/html.js` (`stripHtml`, `escapeHtml`)

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema com "coração" no texto, quando busco "coracao", então ele aparece nos resultados com "coração" destacado.
- [ ] **CA02:** Dado um poema com `<br>` no conteúdo, quando busco "br", então ele não aparece por causa da tag.
- [ ] **CA03:** Dado um título com `<`, quando ele aparece nos resultados, então é exibido como texto.
- [ ] **CA04:** Dado que rodo `npm test`, quando os testes terminam, então os testes de `normalizeForSearch` passam.

## O que a atividade não inclui

- Não inclui busca aproximada (fuzzy) ou correção ortográfica.
- Não inclui sinônimos ou stemming ("amar" encontrando "amor").
- Não inclui busca por URL (ver `2026-09-23_busca-por-url.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Sem acento | `normalizeForSearch('Solidão')` | `'solidao'` |
| CT02 | HTML | `normalizeForSearch('<p>Mar</p>')` | `'mar'` |
| CT03 | Destaque | Buscar "acao" em "Ação" | `<mark>Ação</mark>` |
| CT04 | Ç e til | Buscar "maca" | Encontra "maçã" |
| CT05 | Sem resultados | Buscar "xyzw" | "Nenhum poema encontrado." |

## URL Complementar

- Código: [src/components/search-overlay.js](../src/components/search-overlay.js), [src/utils/html.js](../src/utils/html.js)
- Referência: MDN, `String.prototype.normalize()`
