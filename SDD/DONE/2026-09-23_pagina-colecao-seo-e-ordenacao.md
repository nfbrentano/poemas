# [FEAT] Página de coleção: SEO, ordenação, carregamento eficiente e estados consistentes

## Detalhes da Atividade

- **O que precisa ser feito:** Evoluir `src/pages/collection.js` (rota `/colecao/:slug`) para ficar no mesmo nível das outras páginas.
- **Por que é necessário:**
  - Não chama `updateSEO` e não tem `meta.title`: título, descrição e OpenGraph continuam os da página anterior, e compartilhar uma coleção mostra dados errados.
  - Para montar a lista, baixa **todos** os documentos de `poems` (inclusive rascunhos e conteúdo completo) e filtra no cliente.
  - Os poemas não têm ordem definida (vem da ordem do Firestore).
  - `col.name`, `col.description` e `poem.title` são inseridos sem `escapeHtml`.
  - Os estados de carregamento e erro (`.loading`, `.error`) destoam do skeleton e do 404 usados no resto do site.
- **Qual valor será agregado:** Coleções que podem ser compartilhadas e indexadas, carregamento mais rápido e leitura em ordem.
- **Para quem é destinado:** Leitores que navegam por séries temáticas e o autor, que divulga coleções.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Chamar `updateSEO` com o nome, a descrição e a URL canônica da coleção, e definir `document.title` como `<nome> — Natanael Brentano`.
- RF02: Buscar apenas os poemas da coleção, com `where(documentId(), 'in', ids)` em lotes de até 30, ou com `where('collection_slugs', 'array-contains', slug)` (o campo já é usado na home), sempre com `status == 'published'`.
- RF03: Ordenar os poemas por um campo `order` do vínculo (`collection_poems`), se existir, e senão por `published_at` do mais antigo para o mais recente. Deixar o critério escolhido registrado no código.
- RF04: Escapar todos os textos vindos do banco.
- RF05: Usar skeleton durante o carregamento e o mesmo componente visual de 404 (`not-found-page`) quando a coleção não existir.
- RF06: Mostrar a quantidade de poemas no cabeçalho (ex.: "12 poemas").

### Requisitos não-funcionais

- RNF01: No máximo 3 consultas ao Firestore por visita à coleção.
- RNF02: O prerender (`scripts/prerender.js`) deve gerar o HTML estático das coleções, se ainda não gerar, para manter a coerência com o sitemap que já inclui coleções.

### Dependências técnicas

- `src/pages/collection.js`, `src/utils/seo.js`, `src/utils/html.js`, `scripts/prerender.js`
- Possível índice composto no Firestore (`collection_slugs` + `status`)

### Recursos necessários

- Acesso ao Firebase Console para criar o índice, se necessário.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que abro `/colecao/<slug>`, quando a página carrega, então o título da aba e o `og:title` são o nome da coleção.
- [ ] **CA02:** Dado que a coleção tem um rascunho vinculado, quando a abro, então o rascunho não aparece e não é baixado.
- [ ] **CA03:** Dado que recarrego a página várias vezes, quando comparo a ordem, então ela é sempre a mesma.
- [ ] **CA04:** Dado um slug inexistente, quando o abro, então vejo o layout de 404 padrão do site.
- [ ] **CA05:** Dado que abro a coleção, quando inspeciono a aba Network, então não há download de todos os poemas.

## O que a atividade não inclui

- Não inclui a ordenação manual por arrastar e soltar no painel admin.
- Não inclui capa ou imagem por coleção.
- Não inclui mudanças na listagem `/colecoes`.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | SEO | Abrir uma coleção e inspecionar `<head>` | `title`, `description` e `og:*` corretos |
| CT02 | Rascunho | Vincular um rascunho à coleção | Não listado |
| CT03 | Mais de 30 poemas | Coleção com 45 poemas | Todos listados (lotes) |
| CT04 | Escape | Coleção com nome `A & B <i>` | Texto literal |
| CT05 | 404 | `/colecao/nao-existe` | Layout 404 padrão |

## URL Complementar

- Código: [src/pages/collection.js](../src/pages/collection.js), [src/pages/collections.js](../src/pages/collections.js), [scripts/prerender.js](../scripts/prerender.js)
- Referência: documentação do Firestore sobre a query `in` (limite de 30 valores)
