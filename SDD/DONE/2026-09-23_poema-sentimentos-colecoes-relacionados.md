# [FEAT] Página do poema: exibir sentimentos, coleções e poemas relacionados

## Detalhes da Atividade

- **O que precisa ser feito:** Na página `/poema/:slug`, mostrar os sentimentos (tags) e as coleções do poema como links, e adicionar uma seção "Você também pode gostar" com até 3 poemas relacionados.
- **Por que é necessário:** O poema tem `tags` e `collection_slugs` (os dois usados como filtro na home), mas a página do poema não mostra nenhum deles. A única navegação ao final da leitura é "Anterior/Próximo" em ordem cronológica, que não tem relação temática com o poema. O leitor que gostou de um poema sobre saudade não tem caminho para outros poemas sobre saudade.
- **Qual valor será agregado:** Mais poemas lidos por visita, descoberta por tema e mais links internos para o SEO.
- **Para quem é destinado:** Leitores que chegam por um link direto (WhatsApp, Instagram, Google), que é a maior parte das entradas em um site de poesia.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Abaixo do poema, exibir os chips de sentimentos (usando `formatTag`) que levam a `/?tags=<tag>`.
- RF02: Exibir as coleções do poema como links para `/colecao/<slug>`, com o nome da coleção.
- RF03: Exibir até 3 poemas relacionados, ordenados pelo número de tags em comum e, em caso de empate, pela mesma coleção e depois pelos mais recentes, excluindo o poema atual.
- RF04: Esconder a seção de relacionados quando não houver nenhum.
- RF05: Carregar os relacionados depois de renderizar o poema (não bloquear a leitura).

### Requisitos não-funcionais

- RNF01: Usar no máximo uma consulta extra (ex.: `where('tags', 'array-contains-any', tags.slice(0, 10))` + `status == 'published'` + `limit(20)`), com o ranqueamento feito no cliente.
- RNF02: Visual coerente com o tom minimalista da página, sem competir com o texto do poema.
- RNF03: Links acessíveis, com `data-link` para a navegação SPA.

### Dependências técnicas

- `src/pages/poem.js`, `src/utils/tags.js`, `src/styles/components.css`
- Possível índice composto no Firestore (`tags` + `status`)
- Depende de `2026-09-23_navegacao-spa-links-internos.md` para os cliques em elementos aninhados funcionarem via SPA

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema com as tags "Saudade" e "Mar", quando o abro, então vejo os dois chips, e clicar em "Saudade" leva à home filtrada por Saudade.
- [ ] **CA02:** Dado um poema que pertence a uma coleção, quando o abro, então vejo o link da coleção com o nome correto.
- [ ] **CA03:** Dado um poema com tags compartilhadas por outros, quando rolo até o fim, então vejo até 3 relacionados, nenhum igual ao atual e nenhum rascunho.
- [ ] **CA04:** Dado um poema sem tags e sem coleção, quando o abro, então as seções não aparecem e não há espaço vazio.

## O que a atividade não inclui

- Não inclui recomendações por histórico de leitura ou por IA.
- Não inclui mudar a navegação "Anterior/Próximo".
- Não inclui editar tags pela página pública.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Ranqueamento | Função pura com o poema A (tags x, y), B (x, y), C (x) e D (z) | Ordem B, C; D excluído |
| CT02 | Exclusão do atual | Lista contendo o próprio poema | Não aparece |
| CT03 | Sem tags | Poema sem `tags` | Nenhuma consulta extra |
| CT04 | Mais de 10 tags | Poema com 12 tags | Consulta usa no máximo 10 (limite do `array-contains-any`) |
| CT05 | Navegação | Clicar em um relacionado | Abre via SPA e o scroll volta ao topo |

## URL Complementar

- Código: [src/pages/poem.js](../src/pages/poem.js), [src/utils/tags.js](../src/utils/tags.js)
- Referência: documentação do Firestore sobre `array-contains-any`
