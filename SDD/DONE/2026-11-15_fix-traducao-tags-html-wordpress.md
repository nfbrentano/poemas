# [FIX] Tradução e sanitização segura de tags HTML e blocos legados do WordPress nos poemas

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-15 · **Atualizada em:** 2026-11-15

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o processamento e a renderização do conteúdo dos poemas (`poem.content`) em [`src/utils/text-format.js`](../src/utils/text-format.js), [`src/utils/html.js`](../src/utils/html.js), [`src/utils/rss-builder.js`](../src/utils/rss-builder.js), [`functions/newsletter-helpers.js`](../functions/newsletter-helpers.js), [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) e [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) para traduzir corretamente a marcação HTML e os comentários de blocos Gutenberg vindos da importação do WordPress em estrofes, quebras de verso e formatação inline segura (`<strong>`, `<em>`), mantendo proteção contra XSS.
- **Problema e evidência:**
  1. Todos os **159 poemas** importados do WordPress armazenam `poem.content` com comentários Gutenberg (`<!-- wp:verse {"textAlign":"center"} -->`, `<!-- /wp:verse -->`, `<!-- wp:paragraph -->`, `<!-- wp:group -->`) e tags HTML estruturais (`<pre class="wp-block-verse has-text-align-center">`, `<p>`, `<div class="wp-block-group">`, `<br>`, `<br />`), além de **47 poemas** com tags inline de ênfase (`<strong>`, `<em>`, `<span style="font-weight: 400">`, `<a href="...">`).
  2. Em [`src/utils/text-format.js`](../src/utils/text-format.js), a função `formatPoemForAnimation(content)` divide o texto apenas por `\n\s*\n` e `\n` e aplica `escapeHtml(line)` diretamente sobre a linha bruta. Como resultado, nos 159 poemas (tanto na SPA em [`src/pages/poem.js`](../src/pages/poem.js) quanto no HTML pré-renderizado em `dist/poema/*/index.html`), comentários `<!-- wp:verse -->` e tags `<pre>`, `<p>`, `<br>` e `<strong>` são exibidos literalmente como texto escapado na tela (ex.: `/poema/como-falar/`, `/poema/lar-de-abracos/`, `/poema/a-alma-do-meu-pai/`).
  3. Poemas cujos versos foram gravados no WordPress separados por `<br>` ou `<br />` dentro de um único bloco `<pre>` ou `<p>` (como `lar-de-abracos`, `a-alma-do-meu-pai`, `do-silencio-a-voz`, `silencio` e `insonia-e-escolhas`) não têm `<br>` traduzido para `\n` nem `<br><br>` traduzido para quebra de estrofe (`\n\n`), colapsando toda a obra em um único `.line-reveal` com `<br>` impresso literalmente.
  4. Em 8 poemas (como `a-escolha-do-ritmo`, `alem-das-telas`, `carinho-2`, `ecos-do-coracao-sobre-o-amor`, `o-que-e-o-amor`, `pista-de-pouso-para-dois`, `ressignificar` e `saiu-errado`), o Gutenberg gerou `<br>` aninhado dentro de `<strong>` (ex.: `<strong>ao nosso passo.<br></strong><br>` ou `<strong>Carinho dou,<br>Honesto sou.</strong>`), o que exige normalização e balanceamento de tags inline por verso antes de envolver cada linha em `<span class="line-reveal">`.
  5. Em [`src/utils/html.js`](../src/utils/html.js), `stripHtml` não converte `</pre>` em quebra de estrofe (`\n\n`); em [`src/utils/rss-builder.js`](../src/utils/rss-builder.js), `formatPoemHtmlForRss` testa `!/<p|br|div/i.test(html)` (onde `<pre` casa com `<p` sem borda de palavra) e depois remove `<pre>`, perdendo todas as quebras de linha em poemas com `<pre>` e `\n` no `feed.xml`; e em [`functions/newsletter-helpers.js`](../functions/newsletter-helpers.js) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js), `formatPoemContentHtml` aplica `escapeHtml` direto no `poem.content` bruto, enviando tags HTML literais por e-mail.
- **Impacto de não fazer:** A leitura de praticamente todo o acervo importado do WordPress fica visualmente quebrada na página do poema, nos e-mails da newsletter/poema do dia e no feed RSS, exibindo código-fonte HTML (`<!-- wp:verse -->`, `<pre>`, `<br>`, `<strong>`) ao leitor e destruindo a divisão de versos, estrofes e acrósticos.
- **Para quem é destinado:** Todos os leitores do site (desktop e mobile), assinantes de newsletter/poema do dia, leitores de RSS e o autor no painel administrativo.
- **História de usuário:** Como leitor, quero ler os poemas trazidos do WordPress com suas estrofes, quebras de verso e destaques em negrito/itálico devidamente formatados e sem tags HTML ou comentários técnicos visíveis na página, para apreciar a obra limpa como foi concebida.
- **Como saberemos que deu certo:** 0 ocorrências de `&lt;!-- wp:`, `&lt;pre`, `&lt;p`, `&lt;br` ou `&lt;strong&gt;` dentro de `#poem-text` nos 159 poemas pré-renderizados em `dist/poema/*/index.html`; tags `<strong>` e `<em>` renderizadas como elementos HTML válidos e balanceados por verso; e-mails de newsletter/poema do dia e `feed.xml` sem tags estruturais cruas; e 100% dos testes de segurança XSS (`src/security.test.js` e `src/prerender-seo-print.test.js`) passando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Implementar normalizador de conteúdo poético em [`src/utils/text-format.js`](../src/utils/text-format.js) (usado por `formatPoemForAnimation`) que: (a) remova comentários HTML/Gutenberg (`<!-- ... -->`) e tags perigosas (`script`, `style`, `noscript`, `iframe`, `object`, `embed`, `svg`, `math`); (b) traduza quebras HTML (`<br>`, `<br />`) em `\n` e fechamentos/aberturas de blocos (`</pre>`, `</p>`, `</div>`) em quebras de estrofe `\n\n`, removendo wrappers de bloco (`<pre...>`, `<p...>`, `<div...>`) e desempacotando tags neutras (`<span...>`, `<a...>`) preservando seu texto; (c) normalize `<br>` dentro de tags inline (`<strong>...<br></strong>` e `<strong>Linha 1<br>Linha 2</strong>`) para manter tags balanceadas em cada verso. | P0 | CA01, CA02, CA03 |
| RF02 | Preservar e traduzir com segurança tags inline de ênfase poética (`<strong>`, `<b>` → `<strong>`, `<em>`, `<i>` → `<em>`, sem atributos) dentro de cada `<span class="line-reveal">` em `formatPoemForAnimation`, enquanto quaisquer outras tags HTML ou payloads maliciosos (ex.: `<script>`, `<img onerror=...>`, `<svg onload=...>`) continuam sendo escapados com `escapeHtml` (`&lt;...&gt;`). | P0 | CA02, CA04 |
| RF03 | Atualizar `stripHtml` em [`src/utils/html.js`](../src/utils/html.js) para converter também `</pre\s*>` em `\n\n` e normalizar múltiplas quebras de linha consecutivas, garantindo que resumos, cartões sociais, citações e texto plano preservem a separação entre múltiplos blocos `<pre>` do WordPress. | P0 | CA05 |
| RF04 | Atualizar `formatPoemContentHtml` em [`functions/newsletter-helpers.js`](../functions/newsletter-helpers.js) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) (bem como o corpo `text` em [`functions/index.js`](../functions/index.js)) para limpar comentários/wrappers do WordPress, traduzir `<br>`/`</p>`/`</pre>` em quebras de verso/estrofe e preservar apenas `<strong>`/`<em>` (ou `<b>`/`<i>` escapando tags perigosas). | P1 | CA06 |
| RF05 | Corrigir `formatPoemHtmlForRss` em [`src/utils/rss-builder.js`](../src/utils/rss-builder.js) para tratar blocos `<pre>` com quebras de linha `\n` (convertendo versos e estrofes em `<p>` e `<br />` antes de remover `<pre>`), garantindo que poemas legados do WordPress sem `<br>` explícito mantenham seus versos no `feed.xml`. | P1 | CA07 |
| RF06 | No editor administrativo ([`src/pages/admin/editor.js`](../src/pages/admin/editor.js)), atualizar o preview em tempo real (`#preview-content`) para renderizar com `formatPoemForAnimation` (com `unwrapSafeHTML`) e converter o conteúdo carregado do WordPress de modo legível sem destruir marcações poéticas (`<strong>`/`<em>`) nem exibir comentários Gutenberg. | P1 | CA08 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Segurança XSS: nenhuma tag com atributos, eventos inline (`onerror`, `onload`, `onclick`), `<script>`, `<style>`, `<iframe>`, `<svg>` ou `<math>` pode ser injetada sem escape em `formatPoemForAnimation` ou `formatPoemContentHtml`. Compatibilidade total com `CSP` e `TrustedTypes` (`unwrapSafeHTML`). | P0 | CA04 |
| RNF02 | Desempenho: a normalização e formatação de um poema em `formatPoemForAnimation` deve operar com expressões regulares/strings puras (sem depender de `JSDOM` no bundle do cliente) e executar em `< 2ms` por poema. | P0 | CA01, CA02 |
| RNF03 | Compatibilidade pós-build: após `npm run build` (que executa `scripts/prerender.js`), 100% dos 159 arquivos `dist/poema/*/index.html` devem conter apenas versos limpos e tags inline permitidas (`<strong>`, `<em>`) dentro de `#poem-text`. | P0 | CA01, CA02, CA03 |

### Dependências técnicas

- [`src/utils/text-format.js`](../src/utils/text-format.js) e [`src/utils/text-format.test.js`](../src/utils/text-format.test.js)
- [`src/utils/html.js`](../src/utils/html.js) e [`src/utils/html.test.js`](../src/utils/html.test.js)
- [`src/utils/rss-builder.js`](../src/utils/rss-builder.js) e [`src/seo-sitemap-rss.test.js`](../src/seo-sitemap-rss.test.js)
- [`functions/newsletter-helpers.js`](../functions/newsletter-helpers.js), [`functions/index.js`](../functions/index.js), [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js) e [`src/newsletter-flow.test.js`](../src/newsletter-flow.test.js)
- [`src/pages/admin/editor.js`](../src/pages/admin/editor.js)
- [`src/prerender-seo-print.test.js`](../src/prerender-seo-print.test.js) e [`src/security.test.js`](../src/security.test.js)

### Recursos necessários

- N/A — correção realizada integralmente nos utilitários de formatação e build existentes no repositório.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um poema importado do WordPress contendo comentários Gutenberg (`<!-- wp:verse {"textAlign":"center"} -->`, `<!-- /wp:verse -->`) e wrappers (`<pre class="wp-block-verse">`, `<p class="has-text-align-right">`, `<div class="wp-block-group">`), quando `formatPoemForAnimation` renderiza o poema na página ou no prerender, então todos os comentários e wrappers estruturais são removidos e não aparecem como texto visível para o leitor.
- [x] **CA02:** Dado um poema do WordPress cujos versos são separados por `<br>` ou `<br />` e estrofes por `<br><br>` ou `</pre><p>` (ex.: `a-alma-do-meu-pai`, `lar-de-abracos`, `do-silencio-a-voz`), quando renderizado, então cada verso é separado em seu próprio `<span class="line-reveal">` e cada estrofe em sua `<div class="stanza stagger-reveal">`, com `<strong>` e `<em>` renderizados como negrito e itálico reais.
- [x] **CA03:** Dado um poema em que uma tag `<strong>` ou `<em>` envolve um `<br>` no final da linha (ex.: `<strong>ao nosso passo.<br></strong><br>`) ou abrange múltiplos versos (ex.: `<strong>Carinho dou,<br>Honesto sou.</strong>`), quando `formatPoemForAnimation` processa o poema, então as tags inline são fechadas e reabertas corretamente em cada verso, sem gerar spans `.line-reveal` vazios nem quebrar a separação de estrofes.
- [x] **CA04:** Dado um conteúdo contendo tentativa de injeção XSS como `<script>alert("xss")</script>`, `<img src=x onerror=alert(1)>` ou `<strong onclick="evil()">texto</strong>`, quando processado por `formatPoemForAnimation`, então tags maliciosas continuam escapadas (`&lt;script&gt;...&lt;&#x2F;script&gt;`) e eventuais atributos em `<strong>`/`<em>` são descartados.
- [x] **CA05:** Dado um poema com múltiplos blocos `<pre class="wp-block-verse">...</pre>` consecutivos, quando `stripHtml` é executado para gerar resumo, citação ou card social, então o fechamento `</pre>` produz quebra de estrofe (`\n\n`) sem colar o último verso de um bloco no primeiro verso do bloco seguinte.
- [x] **CA06:** Dado um poema legado do WordPress enviado por `formatPoemContentHtml` (Newsletter ou Poema do Dia), quando o HTML do e-mail é gerado, então comentários Gutenberg e tags `<pre>`/`<p>` não aparecem escapados no corpo do e-mail, quebras `<br>` são respeitadas e tags perigosas (`<script>`, `<img onerror>`) permanecem neutralizadas.
- [x] **CA07:** Dado um poema do WordPress estruturado apenas com `<pre class="wp-block-verse">` e quebras `\n` (sem tags `<br>`, como `como-falar`), quando `formatPoemHtmlForRss` gera o `<content:encoded>` do `feed.xml`, então as estrofes e versos são convertidos em `<p>` e `<br />` preservando a formatação poética.
- [x] **CA08:** Dado o painel administrativo ao abrir um poema importado do WordPress em [`src/pages/admin/editor.js`](../src/pages/admin/editor.js), quando o editor carrega e atualiza o preview em tempo real, então os comentários Gutenberg e wrappers `<pre>`/`<p>` são limpos, os destaques `<strong>`/`<em>` são preservados e o painel de preview renderiza as estrofes formatadas.

## O que a atividade não inclui

- Migração destrutiva em massa sobrescrevendo documentos direto no banco de produção Firestore sem ação do autor: motivo: risco desnecessário de perda de dados originais; a tradução/normalização na camada de leitura e no editor resolve 100% da exibição pública, SSG, RSS e e-mails com segurança e reversibilidade.
- Suporte a um editor Rich Text WYSIWYG completo (ex.: TipTap/Quill) no painel admin: motivo: fora do escopo deste fix de compatibilidade com os poemas vindos do WordPress.

### Considerado para o futuro (P2)

- Script opcional de limpeza/migração supervisionada no Firestore com backup prévio em WXR/JSON caso o autor deseje remover definitivamente os comentários Gutenberg dos documentos brutos no banco.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Nos poemas que trazem uma assinatura final `@nfgbrentano` ou `<a href="https://www.instagram.com/nfgbrentano/">@nfgbrentano</a>` herdada dos posts do WordPress, devemos manter o texto `@nfgbrentano` como última linha/estrofe sem a tag `<a>` bruta? | PO | Não | Sim: desempacotar `<a>` preservando o texto visível `@nfgbrentano` sem exibir tags HTML cruas. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Limpeza de blocos Gutenberg e `<pre>`/`<p>`/`<div>` em `formatPoemForAnimation` | unit | CA01 | Passar poemas reais do WordPress (`como-falar`, `ponto-de-inflexao`, `abraco` com `<p></p>` vazio) para `formatPoemForAnimation` | Retorno contém apenas `.stanza` e `.line-reveal` sem `&lt;!--`, `&lt;pre`, `&lt;p` ou `&lt;div`, e sem estrofes vazias |
| CT02 | Tradução de `<br>`, `<br />`, `<strong>` e `<em>` | unit | CA02 | Passar `a-alma-do-meu-pai` e `a-estrofe-que-faltava` para `formatPoemForAnimation` | `<br>` divide versos em `.line-reveal`, `<br><br>` divide `.stanza`, e `<strong>`/`<em>` são preservados como HTML válido |
| CT03 | Balanceamento de `<strong>` contendo `<br>` | unit | CA03 | Passar `<strong>ao nosso passo.<br></strong><br>Verso 2` e `<strong>Carinho dou,<br>Honesto sou.</strong>` para `formatPoemForAnimation` | Nenhum `.line-reveal` vazio é criado, a quebra de estrofe funciona e cada verso possui `<strong>...</strong>` balanceado |
| CT04 | Proteção XSS em `formatPoemForAnimation` | unit | CA04 | Passar `<script>alert("xss")</script>\n<img src=x onerror=alert(1)>\n<strong onclick="alert(1)">Verso</strong>` | `<script>` e `<img>` saem escapados (`&lt;script&gt;`, `&lt;&#x2F;script&gt;`) e `onclick` é removido de `<strong>` |
| CT05 | `stripHtml` com múltiplos blocos `<pre>` | unit | CA05 | Chamar `stripHtml('<pre>Estrofe 1</pre><pre>Estrofe 2</pre>')` | Retorna `'Estrofe 1\n\nEstrofe 2'` |
| CT06 | Formatação de e-mail (`formatPoemContentHtml`) com HTML do WordPress | unit | CA06 | Passar poema com `<!-- wp:verse --><pre>Verso 1<br><strong>Verso 2</strong></pre>` e poema com `<script>` para `formatPoemContentHtml` | Comentários e `<pre>` são removidos, `<br>` e `<strong>` funcionam e `<script>` continua escapado |
| CT07 | Feed RSS (`formatPoemHtmlForRss`) para poema em `<pre>` sem `<br>` | unit | CA07 | Chamar `formatPoemHtmlForRss` com o conteúdo de `como-falar` | Retorno contém `<p>` e `<br>` separando estrofes e versos |
| CT08 | Editor Admin e Preview | unit/integração | CA08 | Carregar poema com blocos Gutenberg no editor | Textarea exibe versos limpos sem `<!-- wp:verse -->` e `#preview-content` renderiza estrofes formatadas |

## URL Complementar

- Documentação técnica: [`src/utils/text-format.js`](../src/utils/text-format.js), [`src/utils/poem-template.js`](../src/utils/poem-template.js), [`src/utils/html.js`](../src/utils/html.js), [`src/utils/rss-builder.js`](../src/utils/rss-builder.js), [`functions/newsletter-helpers.js`](../functions/newsletter-helpers.js), [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-13_fix-impressao-e-paridade-prerender-seo.md`](DONE/2026-11-13_fix-impressao-e-paridade-prerender-seo.md), [`SDD/DONE/2026-10-26_correcao-codeql-html-seo.md`](DONE/2026-10-26_correcao-codeql-html-seo.md)
- Referências de design: N/A
- Requisitos originais: Análise de poemas importados do WordPress em `exports/poemas-2026-10-06.xml` e `dist/poema/*/index.html`.
- Issue / PR relacionado: N/A
