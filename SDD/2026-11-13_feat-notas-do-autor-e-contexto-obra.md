# [FEAT] Notas do autor, dedicatória e metadados de criação do poema

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Permitir que o autor registre campos editoriais opcionais em cada poema — `dedication` (epígrafe/dedicatória breve), `author_note` (história, contexto ou bastidores da criação) e `written_at`/`written_location` (quando e onde foi escrito, distinto da data de publicação) — exibindo-os de forma discreta na página do poema, no pré-renderizado e no `llms-full.txt` / Schema.org.
- **Problema e evidência:** Atualmente [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) e [`src/utils/poem-template.js`](../src/utils/poem-template.js) trabalham apenas com `title`, `slug`, `content`, `excerpt`, `tags`, `audio_url` e `published_at`. Poemas escritos em anos anteriores ou dedicados a pessoas/momentos específicos (como homenagens familiares já listadas em [`src/data/collections.js`](../src/data/collections.js)) não têm campo estruturado para contextualizar o texto sem misturar explicações dentro dos versos.
- **Impacto de não fazer:** O autor precisa escolher entre deixar o leitor sem contexto ou poluir o corpo do poema (`poem-content`) e o `excerpt` com explicações em prosa, prejudicando a leitura estética e os resumos de busca/LLMs.
- **Para quem é destinado:** Autor do acervo (edição no admin) e leitores interessados nos bastidores e significado das obras (além de indexadores de IA/SEO).
- **História de usuário:** Como leitor, quero poder ler opcionalmente a dedicatória ou a história por trás de um poema depois de terminar os versos, para me conectar ainda mais com o momento em que a obra nasceu sem distrair minha primeira leitura.
- **Como saberemos que deu certo:** Poemas com `author_note` exibem painel colapsável discreto ao final dos versos (fechado por padrão para não interromper a poesia); poemas sem esses campos não exibem rótulos vazios; Schema.org inclui `dateCreated`/`contentLocation` quando presentes; pré-renderizado e `llms-full.txt` refletem os metadados.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Adicionar seção colapsável opcional "Contexto da obra" em [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) com campos opcionais `dedication` (máx. 160 chars), `author_note` (texto simples ou quebras de linha, máx. 2000 chars), `written_at` (data livre ou `YYYY-MM-DD`) e `written_location` (ex.: cidade/estado, máx. 100 chars). | P0 | CA01 |
| RF02 | Renderizar em [`src/utils/poem-template.js`](../src/utils/poem-template.js): (a) dedicatória em itálico sutil logo abaixo dos metadados do cabeçalho, apenas se preenchida; (b) bloco `<details class="poem-author-note">` colapsado por padrão após os versos e antes das ações, contendo `author_note` e local/ano de escrita formatados. | P0 | CA02, CA03 |
| RF03 | Incluir `dateCreated` e `locationCreated` em [`poemSchema()`](../src/utils/structured-data.js) e enriquecer [`buildLlmsFullTxt()`](../src/utils/llms-builder.js) com linha opcional de nota/local de criação quando preenchidos. | P1 | CA04 |
| RF04 | Preservar e renderizar esses campos durante o [`scripts/prerender.js`](../scripts/prerender.js) (tanto no HTML quanto no `__DATA__`) e na exportação WXR ([`src/utils/wxr-builder.js`](../src/utils/wxr-builder.js) se aplicável em postmeta/rodapé). | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Toda saída de `dedication`, `author_note` e `written_location` deve passar por `escapeHtml()` antes da inserção no DOM, sem aceitar tags HTML arbitrárias. | P0 | CA06 |
| RNF02 | Poemas antigos sem esses campos não sofrem mudança visual alguma nem geram `undefined`/`null` no DOM, no Schema.org ou no `llms-full.txt`. | P0 | CA03, CA04 |
| RNF03 | O `<details>` de "Nota do autor" deve ser totalmente operável por teclado (`Enter`/`Espaço`), com contraste WCAG AA e área clicável `>= 44px` de altura. | P1 | CA02 |

### Dependências técnicas

- [`src/pages/admin/editor.js`](../src/pages/admin/editor.js).
- [`src/utils/poem-template.js`](../src/utils/poem-template.js) e [`src/pages/poem.js`](../src/pages/poem.js).
- [`src/utils/structured-data.js`](../src/utils/structured-data.js), [`src/utils/llms-builder.js`](../src/utils/llms-builder.js) e [`scripts/prerender.js`](../scripts/prerender.js).

### Recursos necessários

- N/A — campos opcionais retrocompatíveis no schema existente da coleção `poems` no Firestore.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o editor admin aberto, quando preencho `dedication`, `author_note`, `written_at` e `written_location` e salvo o poema, então os 4 campos são persistidos no documento em `poems` (ou gravados como `null` quando limpos).
- [ ] **CA02:** Dado um poema publicado com `dedication` e `author_note`, quando abro `/poema/<slug>/`, então vejo a dedicatória antes dos versos e o resumo clicável *"Sobre este poema / Nota do autor"* recolhido após o último verso; ao clicar/pressionar Enter, a nota expande com local e data de escrita.
- [ ] **CA03:** Dado um poema sem nenhum dos novos campos preenchidos, quando abro sua página, então não aparecem elementos `.poem-dedication` nem `.poem-author-note` no DOM.
- [ ] **CA04:** Dado um poema com `written_at = "2018-04-10"` e `written_location = "Porto Alegre"`, quando gero `poemSchema()` e `buildLlmsFullTxt()`, então `dateCreated` e `locationCreated` constam no JSON-LD e a nota aparece no bloco Markdown; em poemas sem esses campos, essas propriedades são omitidas do JSON-LD.
- [ ] **CA05:** Dado um build de produção com poema contendo nota do autor, quando inspeciono o arquivo pré-renderizado `dist/poema/<slug>/index.html`, então a nota já consta no HTML estático e no `__DATA__`.
- [ ] **CA06:** Dado um valor malicioso `<img src=x onerror=alert(1)>` salvo em `author_note` ou `dedication`, quando a página renderiza, então o texto aparece literalmente escapado sem executar script.

## O que a atividade não inclui

- Editor rich-text completo (WYSIWYG) para a nota do autor: motivo: texto simples com quebras de linha mantém estética coesa e elimina risco de HTML quebrado.
- Filtro público na Home por "cidade em que foi escrito": motivo: volume inicial de poemas com local preenchido será gradual.

### Considerado para o futuro (P2)

- Mapa ou índice editorial de "Lugares e datas de inspiração" quando um percentual expressivo do acervo tiver metadados de criação preenchidos.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O texto da nota do autor deve iniciar recolhido (`<details>`) por padrão para manter os versos protagonistas, ou visível aberto logo após a assinatura do poema? | design/PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Renderização com e sem nota | unit | CA02, CA03 | Chamar `renderPoemTemplate` com os 4 campos preenchidos e com objeto legado vazio | Elementos presentes e recolhidos no 1º caso; omitidos no 2º |
| CT02 | Schema.org e `llms-full.txt` | unit | CA04 | Testar `poemSchema` e `buildLlmsFullTxt` com e sem `written_at`/`author_note` | `dateCreated`/`locationCreated` presentes apenas quando preenchidos |
| CT03 | Prevenção de XSS | unit | CA06 | Renderizar poema com `<script>`/`onerror` em `dedication` e `author_note` | Nenhuma tag `<script>`/`<img>` criada no DOM |
| CT04 | Persistência no editor admin | integração (jsdom) | CA01 | Preencher formulário em `editor.js` e submeter com mock de `data.js` | Payload enviado inclui `dedication`, `author_note`, `written_at`, `written_location` |
| CT05 | Prerender estático | integração (pós-build) | CA05 | Validar geração em `prerender.js` com poema mockado contendo `author_note` | HTML resultante inclui `<details class="poem-author-note">` e `__DATA__` completo |

## URL Complementar

- Documentação técnica: [`src/utils/poem-template.js`](../src/utils/poem-template.js), [`src/pages/admin/editor.js`](../src/pages/admin/editor.js), [`src/utils/structured-data.js`](../src/utils/structured-data.js), [`src/utils/llms-builder.js`](../src/utils/llms-builder.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-10-23_schema-article-poemas.md`](DONE/2026-10-23_schema-article-poemas.md), [`SDD/DONE/2026-09-24_geo-llms-txt.md`](DONE/2026-09-24_geo-llms-txt.md)
- Referências de design: [`src/styles/global.css`](../src/styles/global.css)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
