# {GEO} Conteúdo citável: FAQ e fatos na página Sobre e textos de contexto nas coleções

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar ao site trechos de texto objetivos e "prontos para citação", que respondam diretamente às perguntas que as pessoas fazem aos assistentes de IA sobre o autor e a obra. São três frentes:
  - uma seção de perguntas frequentes e fatos na página `/sobre/`;
  - um parágrafo introdutório em cada coleção;
  - uma ficha de metadados semântica em cada poema.
- **Por que é necessário:**
  - Os LLMs tendem a citar trechos curtos, factuais e autocontidos (ex.: "Natanael Brentano é um poeta brasileiro contemporâneo que…"). Hoje o site tem prosa poética e interface, mas poucas frases declarativas que respondam a perguntas como "quem é Natanael Brentano?", "sobre o que ele escreve?", "quantos poemas ele tem?" ou "onde ler os poemas dele?".
  - As páginas de coleção (`/colecao/<slug>/`) são basicamente listas de poemas. Sem texto de contexto, o modelo não sabe explicar do que a coleção trata.
  - Os metadados do poema (coleção, sentimentos, data, tempo de leitura) estão espalhados na interface e não formam um bloco semântico legível.
- **Qual valor será agregado:** Mais chance de o site ser a fonte citada em respostas sobre o autor, sobre as coleções e sobre "poemas brasileiros sobre X", com respostas corretas e atribuídas.
- **Para quem é destinado:** Leitores que perguntam a assistentes de IA sobre o autor e a obra, e os próprios motores de IA.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Na página `/sobre/`, adicionar uma seção "Perguntas frequentes" com 4 a 6 pares pergunta/resposta em HTML semântico (`<h2>`/`<h3>` para a pergunta e `<p>` para a resposta). Sugestões:
  - Quem é Natanael Brentano?
  - Sobre quais temas ele escreve?
  - Quantos poemas estão publicados no site?
  - Como os poemas estão organizados?
  - Posso compartilhar ou citar os poemas?
  - Como receber novos poemas?
- RF02: Cada resposta deve começar com uma frase declarativa autocontida, que faça sentido fora de contexto, e ter até ~60 palavras.
- RF03: Os números dinâmicos (quantidade de poemas e de coleções, data do primeiro poema) devem ser calculados no build (`scripts/prerender.js`), não escritos à mão.
- RF04: Adicionar o JSON-LD `FAQPage` correspondente, integrado ao `@graph` da página (ver `2026-09-24_geo-entidade-autor-e-grafo-json-ld.md`), com o mesmo texto visível.
- RF05: Em cada página de coleção, exibir um parágrafo introdutório (2 a 4 frases) vindo do campo `description` da coleção no Firestore. Se o campo não existir, adicioná-lo ao modelo de dados e à tela de edição de coleções no admin.
- RF06: Na página do poema, agrupar os metadados em uma lista de definição semântica (`<dl>`): Autor, Publicado em (`<time>`), Coleção (link), Sentimentos (links) e Tempo de leitura. A lista deve ser renderizada no HTML prerenderizado.
- RF07: A home deve manter o parágrafo introdutório existente (`scripts/prerender.js:297`) e acrescentar uma frase factual com o número de poemas e coleções.

### Requisitos não-funcionais

- RNF01: O conteúdo textual deve estar presente no HTML estático (prerender), legível sem JavaScript.
- RNF02: O texto do FAQ e das descrições de coleção é escrito ou aprovado pelo autor. Não gerar biografia inventada.
- RNF03: O visual deve seguir o design atual (tipografia e cores de `variables.css`). O FAQ pode usar `<details>/<summary>` desde que o texto continue no DOM.
- RNF04: Sem impacto relevante em LCP/CLS nas páginas afetadas (conforme `SDD/DONE/2026-09-24_seo-core-web-vitals.md`).

### Dependências técnicas

- `src/pages/about.js`, `src/pages/collection.js`, `src/utils/poem-template.js`, `scripts/prerender.js`, `src/utils/structured-data.js`, `src/pages/admin.js` (campo `description` da coleção).
- Grafo JSON-LD da tarefa `2026-09-24_geo-entidade-autor-e-grafo-json-ld.md` (para integrar o `FAQPage`).

### Recursos necessários

- Textos do FAQ e descrições das coleções escritos ou aprovados pelo autor.
- Acesso ao admin para preencher as descrições das coleções.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o HTML prerenderizado de `/sobre/`, quando o leio sem JS, então vejo a seção "Perguntas frequentes" com pelo menos 4 perguntas e respostas.
- [x] **CA02:** Dado o FAQ, quando confiro "Quantos poemas estão publicados no site?", então o número corresponde à quantidade de poemas publicados no momento do build.
- [x] **CA03:** Dado `/sobre/`, quando valido o JSON-LD, então há um `FAQPage` cujo texto é idêntico ao visível e que passa no Schema Markup Validator sem erros.
- [x] **CA04:** Dado uma coleção com `description` preenchida, quando abro `/colecao/<slug>/`, então vejo o parágrafo introdutório antes da lista de poemas, também no HTML estático.
- [x] **CA05:** Dado a página de um poema, quando inspeciono o HTML, então há um `<dl>` com Autor, data em `<time>`, coleção e sentimentos como links, e tempo de leitura.
- [x] **CA06:** Dado o admin, quando edito uma coleção, então consigo salvar e alterar o campo de descrição.

## O que a atividade não inclui

- Criação das páginas de sentimento (tarefa `2026-09-24_seo-paginas-de-sentimentos.md`), exceto os links da ficha, que apontam para elas quando existirem.
- Textos de análise ou interpretação de cada poema.
- Blog, artigos ou conteúdo editorial novo além do descrito.
- Tradução para outros idiomas.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | FAQ estático | `curl /sobre/` e buscar "Perguntas frequentes" | Seção presente no HTML |
| CT02 | Número dinâmico | Publicar um poema novo, rodar o build e ler o FAQ | Contagem aumentada em 1 |
| CT03 | FAQPage | Validar `/sobre/` no Schema Markup Validator | `FAQPage` sem erros; texto igual ao visível |
| CT04 | Coleção com descrição | Preencher a descrição no admin, rodar o build e abrir a coleção | Parágrafo visível e presente no HTML estático |
| CT05 | Coleção sem descrição | Coleção sem o campo | Página renderiza sem parágrafo vazio nem erro |
| CT06 | Ficha do poema | Abrir um poema com JS desativado | `<dl>` com todos os campos |
| CT07 | Teste de citação | Perguntar a um assistente com busca "Quem é Natanael Brentano?" algumas semanas após o deploy | Resposta cita `nfgbrentano.art.br` (acompanhamento, não bloqueia a entrega) |

## URL Complementar

- Documentação técnica: [schema.org/FAQPage](https://schema.org/FAQPage), [Google — conteúdo útil e confiável](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [MDN — `<dl>`](https://developer.mozilla.org/pt-BR/docs/Web/HTML/Element/dl)
- Protótipo / mockup: N/A — seguir os estilos atuais de `/sobre/` e de `.page-header`.
- Discussões relacionadas: `SDD/2026-09-24_seo-links-rastreaveis-e-pagina-sobre.md`, `SDD/DONE/2026-09-23_pagina-colecao-seo-e-ordenacao.md`, `SDD/DONE/2026-09-24_seo-home-h1-canonical-e-conteudo-estatico.md`
- Referências de design: estilos existentes de `.about-header` e `.page-header` em `src/styles/components.css`.
- Requisitos originais: relatório de auditoria em 2026-09-24 sobre Otimização de Motores Gerativos (GEO).
