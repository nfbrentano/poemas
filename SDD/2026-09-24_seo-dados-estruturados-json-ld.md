# [FEAT] {SEO} Dados estruturados (JSON-LD) completos: poema, autor, coleção e breadcrumbs

## Detalhes da Atividade

- **O que precisa ser feito:** Enriquecer e padronizar os dados estruturados schema.org de todas as páginas públicas, gerados no prerender e mantidos iguais na navegação SPA.
- **Por que é necessário:**
  - O poema usa `CreativeWork` genérico com `genre: Poetry`, sem `keywords`, `isPartOf` (coleção), `dateModified`, `mainEntityOfPage`, nem `author.url`.
  - O autor não tem uma entidade `Person` própria (a página `/sobre` não tem JSON-LD), o que enfraquece o sinal de E-E-A-T e o Knowledge Panel do autor.
  - Coleções e a lista de coleções não têm `CollectionPage`/`ItemList`.
  - Não existe `BreadcrumbList` em nenhuma página, então a SERP mostra a URL crua em vez de "nfgbrentano.art.br › Coleções › Nome".
  - O `WebSite` + `SearchAction` só existe via JS na home (`home.js:38-55`), fora do HTML estático.
- **Qual valor será agregado:** Elegibilidade para breadcrumbs e sitelinks na SERP, entidade de autor consolidada no Google e melhor entendimento semântico do acervo.
- **Para quem é destinado:** Mecanismos de busca e leitores que chegam pela busca.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar `src/utils/structured-data.js` com funções puras reutilizadas pelo prerender e pelo cliente: `personSchema()`, `websiteSchema()`, `poemSchema(poem, collections)`, `collectionSchema(col, poems)`, `breadcrumbSchema(items)`.
- RF02: **Autor (`Person`)**, com `@id` fixo `https://nfgbrentano.art.br/sobre/#autor`: `name`, `url`, `image` (foto do autor), `description`, `sameAs` (Instagram e outras redes), `jobTitle`/`knowsAbout` (poesia). Emitido em `/sobre/` como `ProfilePage` com `mainEntity` = Person.
- RF03: **Site (`WebSite`)**, com `@id` `https://nfgbrentano.art.br/#website`, `name`, `inLanguage: pt-BR`, `publisher`/`author` referenciando a Person por `@id`, e `potentialAction` `SearchAction` (`/?q={search_term_string}`). Emitido no HTML estático da home.
- RF04: **Poema:** `@type: ["CreativeWork", "Poem"]` se validar no Rich Results Test (senão `CreativeWork` + `genre`), com `headline`, `name`, `text` ou `abstract` (excerto), `keywords` (sentimentos), `inLanguage`, `datePublished`, `dateModified`, `author` por `@id`, `isPartOf` (coleções e WebSite), `mainEntityOfPage`, `image` (conforme `2026-09-24_seo-imagem-compartilhamento-og.md`), `url`.
- RF05: **Coleção:** `CollectionPage` com `mainEntity` do tipo `ItemList` contendo os poemas na ordem da coleção (`ListItem` com `position` e `url`).
- RF06: **Lista de coleções (`/colecoes/`):** `CollectionPage` + `ItemList` das coleções.
- RF07: **BreadcrumbList** em poema (Início › [Coleção principal ›] Poema), coleção (Início › Coleções › Nome), sobre e coleções. Adicionar também breadcrumb visível no HTML com `<nav aria-label="breadcrumb">`.
- RF08: Na navegação SPA, substituir (não acumular) os blocos `<script type="application/ld+json">` ao trocar de rota, marcando-os com `data-seo`.
- RF09: Todo texto em JSON-LD deve ser serializado com `JSON.stringify` e com `<` escapado (`<`) para evitar quebra do `<script>`.

### Requisitos não-funcionais

- RNF01: Zero erros e zero avisos críticos no Rich Results Test e no Schema Markup Validator.
- RNF02: Todas as URLs no JSON-LD no formato canônico (com barra final).
- RNF03: As funções de schema devem ter testes unitários (Vitest).

### Dependências técnicas

- `scripts/prerender.js`, `src/utils/seo.js`, `src/pages/poem.js`, `src/pages/collection.js`, `src/pages/collections.js`, `src/pages/about.js`, `src/pages/home.js`
- Campo `updated_at` nos poemas (ver `2026-09-24_seo-sitemap-e-rss.md`); até existir, `dateModified = datePublished`.
- `2026-09-24_seo-urls-canonicas-barra-final.md`

### Recursos necessários

- URL da foto oficial do autor e lista de perfis sociais para `sameAs`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado uma página de poema prerenderizada, quando a valido no Rich Results Test, então são detectados o item do poema e um `BreadcrumbList`, sem erros.
- [ ] **CA02:** Dado a página `/sobre/`, quando inspeciono o HTML estático, então existe um `ProfilePage` cuja `mainEntity` é a Person com `@id` `…/sobre/#autor`.
- [ ] **CA03:** Dado uma coleção com 10 poemas, quando inspeciono o JSON-LD, então há um `ItemList` com 10 `ListItem` em ordem e com URLs canônicas.
- [ ] **CA04:** Dado que navego via SPA por 5 páginas, quando conto os `script[type="application/ld+json"]` no `<head>`, então só existem os blocos da página atual.
- [ ] **CA05:** Dado um poema cujo título contém `</script>`, quando o prerender roda, então o HTML continua válido e o JSON-LD é parseável.

## O que a atividade não inclui

- Dados estruturados de áudio (`AudioObject`) para `audio_url` — pode virar feature futura.
- Avaliações (`Review`/`AggregateRating`), que não se aplicam a este conteúdo.
- Criar páginas de sentimento (ver `2026-09-24_seo-paginas-de-sentimentos.md`); aqui só se referenciam as keywords.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Unitário `poemSchema` | Poema com 2 tags e 1 coleção | `keywords` com as 2 tags, `isPartOf` com a coleção |
| CT02 | Unitário `breadcrumbSchema` | 3 itens | `position` 1..3, último item com `item` = URL da página |
| CT03 | Escape | Título `A </script> B` | JSON-LD parseável, sem fechar a tag |
| CT04 | Validador | Colar 3 URLs (poema, coleção, sobre) no Rich Results Test | Sem erros |
| CT05 | SPA sem duplicação | Navegar e contar blocos JSON-LD | Apenas os da rota atual |
| CT06 | Breadcrumb visível | Abrir poema em coleção | Trilha "Início › Coleção › Poema" clicável |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Documentação técnica: https://developers.google.com/search/docs/appearance/structured-data/profile-page
- Documentação técnica: https://schema.org/Poem ; https://schema.org/CollectionPage
- Protótipo / mockup: N/A — breadcrumb visível segue o estilo dos links atuais.
- Discussões relacionadas: `SDD/DONE/2026-09-23_busca-por-url.md` (SearchAction)
- Referências de design: N/A.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
