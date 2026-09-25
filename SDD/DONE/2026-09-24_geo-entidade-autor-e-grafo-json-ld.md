# {GEO} Entidade do autor completa e grafo JSON-LD conectado em todas as páginas

## Detalhes da Atividade

- **O que precisa ser feito:** Fortalecer a entidade "Natanael Brentano" e conectar autor, site, coleções e poemas em um único `@graph` JSON-LD por página, para que os LLMs entendam sem ambiguidade quem escreveu cada poema. Também é preciso exibir essa autoria de forma visível e semântica no HTML.
- **Por que é necessário:**
  - Nas páginas de poema, o schema `Poem` referencia o autor só por `"author": {"@id": ".../sobre/#autor"}` (`src/utils/structured-data.js:138`), mas a entidade `Person` **só é declarada na página `/sobre/`**. Um crawler que lê apenas o poema recebe um `@id` sem nome. O mesmo vale para `WebSite.publisher` na home.
  - O `personSchema()` tem só um `sameAs` (Instagram). Faltam outros perfis e fontes externas que confirmem a identidade (ex.: Wikidata, Goodreads, Spotify/YouTube se houver áudio, perfis em editoras e antologias).
  - O poema não tem licença/direitos (`license`, `copyrightHolder`, `copyrightYear`) nem os sentimentos modelados como conceitos (`about`). Existem só `keywords` soltas.
  - No HTML do poema não há um byline visível ligando ao autor ("por Natanael Brentano" → `/sobre/`) nem data em `<time datetime>`. O nome aparece apenas em header, footer e metatags.
- **Qual valor será agregado:** Os LLMs passam a associar corretamente cada poema ao autor (atribuição nas respostas) e o Knowledge Graph ganha uma entidade mais forte, com mais chance de painel de conhecimento e de citação por nome.
- **Para quem é destinado:** Motores de busca clássicos e de IA e o autor, que ganha reconhecimento de autoria.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar em `structured-data.js` uma função que monte um `@graph` por página contendo sempre `WebSite` e `Person` completos, mais as entidades da página (`Poem`, `CollectionPage`, `ProfilePage`, `BreadcrumbList`), todas ligadas por `@id`.
- RF02: Na referência `author` do `Poem`, incluir também `name` e `url`, além do `@id`, para que o poema seja autocontido mesmo se o grafo for lido parcialmente.
- RF03: Ampliar `personSchema()` com: `sameAs` (todos os perfis oficiais que o autor informar), `nationality` (Brasil), `knowsLanguage: pt-BR`, `image` com foto real do autor (não a capa OG) e, se houver, `birthPlace`, `alumniOf` e `award`.
- RF04: Adicionar ao `Poem`: `license` (URL da licença escolhida ou página de direitos), `copyrightHolder: {"@id": autor}`, `copyrightYear`, `wordCount` e `about`, com os sentimentos como `DefinedTerm` (`name` + `url` da página de sentimento, quando existir).
- RF05: No template do poema (`src/utils/poem-template.js`) e no prerender, exibir um byline visível e semântico: `por <a href="/sobre/" rel="author">Natanael Brentano</a>` e `<time datetime="AAAA-MM-DD">` com a data de publicação.
- RF06: Na home, usar o `@graph` com `WebSite` + `Person`, para que `publisher` e `author` sejam resolvidos na própria página.
- RF07: Aplicar o mesmo grafo na navegação SPA (`updateSEO` em `src/utils/seo.js`), mantendo paridade com o HTML prerenderizado.

### Requisitos não-funcionais

- RNF01: O JSON-LD deve validar sem erros no Schema Markup Validator e no Rich Results Test do Google.
- RNF02: Não duplicar entidades com `@id` diferentes para a mesma pessoa. Usar sempre `AUTHOR_ID` e `WEBSITE_ID`.
- RNF03: Não inventar dados biográficos: usar apenas o que o autor fornecer (perfis, prêmios, formação).
- RNF04: Atualizar os testes existentes (`src/utils/structured-data.test.js`, `src/seo-structured-data.test.js`) e adicionar casos para o grafo.
- RNF05: O byline não pode causar layout shift (CLS). Reservar espaço ou renderizar no HTML estático.

### Dependências técnicas

- `src/utils/structured-data.js`, `src/utils/seo.js`, `src/utils/poem-template.js`, `scripts/prerender.js`.
- **Informações do autor:** lista de perfis oficiais (`sameAs`), foto oficial, licença desejada (ex.: "todos os direitos reservados" com página de termos, ou Creative Commons BY-NC-ND 4.0).
- Opcional: criação de um item no Wikidata para o autor (precisa atender aos critérios de notabilidade do Wikidata).

### Recursos necessários

- Dados biográficos e perfis fornecidos pelo autor.
- Acesso ao Schema Markup Validator e ao Google Rich Results Test.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o HTML prerenderizado de qualquer poema, quando extraio o JSON-LD, então encontro no mesmo documento `Person` (com `name`), `WebSite`, `Poem` e `BreadcrumbList` ligados por `@id`.
- [x] **CA02:** Dado o schema `Poem`, quando inspeciono `author`, então ele contém `@id`, `name: "Natanael Brentano"` e `url` para `/sobre/`.
- [x] **CA03:** Dado o schema `Poem`, quando inspeciono, então há `license`, `copyrightHolder`, `copyrightYear`, `wordCount` e `about` (sentimentos como `DefinedTerm`).
- [x] **CA04:** Dado a página de um poema, quando a vejo no navegador (inclusive com JS desativado), então há um byline "por Natanael Brentano" com link `rel="author"` para `/sobre/` e a data em `<time datetime>`.
- [x] **CA05:** Dado a home, quando valido o JSON-LD, então `publisher` e `author` apontam para um `Person` declarado na própria página.
- [x] **CA06:** Dado qualquer página, quando a submeto ao Schema Markup Validator, então não há erros.
- [x] **CA07:** Dado que navego de um poema para outro pela SPA, quando inspeciono o `<head>`, então o grafo corresponde ao poema atual.

## O que a atividade não inclui

- Criação das páginas de sentimento (tarefa `2026-09-24_seo-paginas-de-sentimentos.md`). Até lá, `about` usa `DefinedTerm` sem `url`.
- Criação de perfis externos (redes sociais, Wikidata) em nome do autor.
- Redesenho do cabeçalho do poema além do byline.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Grafo no poema | Build + extrair `<script type="application/ld+json">` de `dist/poema/<slug>/index.html` | `@graph` com Person, WebSite, Poem e Breadcrumb |
| CT02 | Autor autocontido | Ler só o nó `Poem` | `author.name` presente |
| CT03 | Sem duplicatas | Contar nós `Person` com `@id` diferentes | Exatamente 1 |
| CT04 | Byline sem JS | Abrir um poema com JS desativado | Byline e data visíveis |
| CT05 | Validação | Schema Markup Validator na home, em `/sobre/`, em uma coleção e em um poema | 0 erros |
| CT06 | SPA | Navegar home → poema A → poema B e ler o JSON-LD | Dados do poema B |
| CT07 | Unit tests | `npm test` | Testes de structured-data passando |

## URL Complementar

- Documentação técnica: [schema.org/Poem](https://schema.org/Poem), [schema.org/Person](https://schema.org/Person), [schema.org/DefinedTerm](https://schema.org/DefinedTerm), [Google — dados estruturados de artigos e autor](https://developers.google.com/search/docs/appearance/structured-data/article#author-bp), [Schema Markup Validator](https://validator.schema.org/)
- Protótipo / mockup: byline abaixo do título do poema, no estilo da linha de metadados atual (data · tempo de leitura).
- Discussões relacionadas: `SDD/DONE/2026-09-24_seo-dados-estruturados-json-ld.md`, `SDD/2026-09-24_seo-links-rastreaveis-e-pagina-sobre.md`
- Referências de design: linha de metadados existente em `.single-poem header`.
- Requisitos originais: relatório de auditoria em 2026-09-24: "compreender a estrutura subjacente das entidades".
