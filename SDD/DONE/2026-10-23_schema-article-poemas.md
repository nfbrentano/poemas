# [FEAT] {SEO} Habilitar Schema Article nos Poemas para Resultados Aprimorados no Google

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-10-23 · **Atualizada em:** 2026-10-23

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar `"Article"` ao array de tipos Schema.org do poema (`@type: ["CreativeWork", "Poem", "Article"]`) em `src/utils/structured-data.js` e atualizar os testes correspondentes, de forma que o Teste de Pesquisa Aprimorada do Google (Google Rich Results Test) reconheça oficialmente os poemas como Artigos literários estruturados.
- **Problema e evidência:** Ao testar a URL de um poema na ferramenta oficial Google Rich Results Test, o Google relata *"Nenhum item foi detectado. Nenhuma pesquisa aprimorada foi detectada neste URL"*, pois a ferramenta do Google reconhece `Article`, mas não possui card rico exclusivo para o tipo `Poem`.
- **Impacto de não fazer:** O Google não exibe badges, carrosséis de artigos ou destaques visuais aprimorados na SERP para as obras do autor, perdendo visibilidade e taxa de clique (CTR).
- **Para quem é destinado:** Leitores em busca orgânica no Google e o próprio autor ao auditar no Google Search Console e no Google Rich Results Test.
- **História de usuário:** Como autor, quero que meus poemas sejam reconhecidos como Artigos (`Article`) pelo Google, para que o Google Rich Results Test valide a página com sucesso e a busca apresente resultados aprimorados.
- **Como saberemos que deu certo:** O schema gerado para poemas contém `"Article"` no `@type`, `vitest run` passa com 100% de sucesso e o Google Rich Results Test detecta o item `Artigo`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Incluir `"Article"` no `@type` de `poemSchema` em `src/utils/structured-data.js` preservando `"CreativeWork"` e `"Poem"` | P0 | CA01, CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Manter conformidade estrita com Schema.org e diretrizes de Artigos do Google (headline, author, image, datePublished, dateModified) | P0 | CA01 |

### Dependências técnicas

- Arquivo `src/utils/structured-data.js`.
- Arquivo de testes `src/seo-geo-enhancements.test.js` e `src/utils/structured-data.test.js`.

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um poema publicado tem seu schema gerado via `poemSchema`, quando o JSON-LD é avaliado, então a propriedade `@type` é um array contendo `["CreativeWork", "Poem", "Article"]`.
- [x] **CA02:** Dado que as modificações são implementadas, quando a suíte de testes `vitest run` é executada, então todos os testes passam com 100% de aprovação.

## O que a atividade não inclui

- Remoção dos tipos `"CreativeWork"` ou `"Poem"`: motivo: eles são essenciais para ontologias semânticas literárias e indexadores de poesia/GEO.
- Alteração no layout visual da página: motivo: trata-se estritamente de dados estruturados JSON-LD.

### Considerado para o futuro (P2)

- N/A.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O uso múltiplo de tipos `["CreativeWork", "Poem", "Article"]` é suportado pela Schema.org e Google? | dev | Não | Sim, a sintaxe de array em `@type` é nativa e recomendada pela Schema.org para multi-tipagem. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Validar tipos no poemSchema | unit | CA01 | Executar `poemSchema(poem)` e inspecionar `@type` | Contém `['CreativeWork', 'Poem', 'Article']` |
| CT02 | Regressão da suíte de testes | unit | CA02 | Executar `vitest run` | 100% dos testes aprovados |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/appearance/structured-data/article
- Protótipo / mockup: N/A
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário após teste no Google Rich Results.
- Issue / PR relacionado: N/A
