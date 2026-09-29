# [FIX] Correção dos alertas de segurança do Code Scanning (CodeQL)

> **Status:** Concluída
> **Autor:** Natanael Fernando Gatti Brentano (com Claude Code e Antigravity) · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-09-29 · **Atualizada em:** 2026-09-29

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir, ou dispensar com justificativa registrada, os 18 alertas abertos de severidade **High** que o CodeQL aponta na branch `main` (`#25`, `#26`, `#29`–`#44`). Hoje eles estão espalhados em 9 arquivos, entre código de cliente (`src/pages`, `src/utils`) e scripts de build (`scripts/`).
- **Problema e evidência:** Os alertas foram abertos em 2026-09-24 pelo CodeQL (`gh api repos/nfbrentano/poemas/code-scanning/alerts?state=open`). Eles se dividem em 6 regras:

  | Regra CodeQL | Alertas | Local | Diagnóstico | Risco real |
  |---|---|---|---|---|
  | `js/xss-through-dom` | #39 | `src/pages/about.js:183` (e o mesmo padrão sem alerta em `:66` e `:174`) | A bio do autor, lida do Firestore (`site_settings/author_bio`) ou do `textarea`, vai para `innerHTML` apenas com `\n → <br>`, sem escapar nada. Se o documento no Firestore for adulterado, um script roda para **todo visitante** da página Sobre. | **Alto** (XSS armazenado) |
  | `js/xss-through-dom` | #26 | `src/pages/poem.js:724` | `poem.id` é interpolado em `innerHTML` (link "Editar Obra"). O `id` pode vir do `__DATA__` embutido no HTML. | Médio (só com sessão de admin) |
  | `js/xss-through-dom` | #40 | `src/pages/poem.js:874` | `prevSlug`/`nextSlug` (vindos do `__DATA__` ou do Firestore) vão para `link.href` sem validação nem `encodeURIComponent`. | Baixo |
  | `js/xss-through-dom` | #41 | `src/utils/seo.js:72` | `window.location.href` passa por `cleanCanonicalUrl` e vai para o `href` do canonical/og:url sem validar a origem nem o protocolo. | Baixo |
  | `js/xss-through-dom` | #25 | `src/utils/html.js:31` | `DOMParser.parseFromString` recebe texto do DOM. O documento gerado pelo `DOMParser` é inerte (não executa scripts nem carrega recursos), então é provável falso positivo. | Muito baixo |
  | `js/incomplete-multi-character-sanitization` + `js/bad-tag-filter` | #33, #34, #35, #36, #37 | `src/utils/rss-builder.js:50-51` (`formatPoemHtmlForRss`) | Tenta tirar o que é perigoso com lista negra de regex (`<script>`, `<style>`, `on*=`). Não pega `</script >`, atributos `on*` sem aspas, `javascript:` em `href`, `<iframe>`, `<svg onload>`, nem entradas aninhadas como `<scr<script>ipt>`. O HTML vai para o feed RSS (CDATA), que é lido por leitores de terceiros. | Médio |
  | `js/incomplete-multi-character-sanitization` | #29, #30, #31, #42, #43 | `scripts/prerender.js:560, 679, 812, 911, 1024` | Uma passada só de regex remove blocos `<script type="application/ld+json">` do `index.html`. A entrada é o `index.html` do próprio build (confiável), mas o padrão está repetido 5 vezes e pode deixar resíduos. | Baixo (build) |
  | `js/incomplete-multi-character-sanitization` | #38 | `scripts/generate-og-images.js:51` | `text.replace(/<[^>]+>/g, '')` numa passada só para limpar o trecho que vai para a imagem OG. Já existe `stripHtml` seguro em `src/utils/html.js`. | Baixo (build) |
  | `js/double-escaping` | #44 | `src/utils/llms-builder.js:18` (`decodeHtmlEntities`) | `&amp;` é decodificado **antes** de `&lt;`, `&gt;` etc. Então `&amp;lt;` vira `<` em vez do literal `&lt;`, o que corrompe texto e pode reintroduzir marcação no `llms.txt`/Markdown. | Baixo (integridade) |
  | `js/incomplete-url-substring-sanitization` | #32 | `src/utils/structured-data.js:385` (breadcrumb) | `href.startsWith(SITE_URL)` sem a barra final aceita `https://nfgbrentano.art.br.evil.com/...` como se fosse do próprio site, e o resultado vira o caminho relativo `.evil.com/...`. | Baixo |

- **Impacto de não fazer:** Fica aberta uma XSS armazenada na página Sobre, com feed RSS podendo carregar HTML ativo para leitores de terceiros. O painel de Security do GitHub continua com 18 alertas High, o que esconde alertas novos e relevantes. Há também risco de texto corrompido no `llms.txt`.
- **Para quem é destinado:** Visitantes anônimos do site e assinantes do RSS (proteção contra XSS), o autor/admin (sessão protegida) e o dev/mantenedor (painel de segurança limpo).
- **História de usuário:** Como mantenedor do site, quero que todo conteúdo dinâmico seja escapado ou sanitizado por lista de permissão antes de chegar ao HTML, para que nenhum visitante, admin ou leitor de RSS execute código injetado e o Code Scanning fique sem alertas High abertos.
- **Como saberemos que deu certo:** A consulta `gh api "repos/nfbrentano/poemas/code-scanning/alerts?state=open&severity=high"` retorna **0 alertas** depois do próximo scan na `main`. Cada alerta aparece como `fixed` ou como `dismissed` com motivo registrado. `npm test` passa, com os novos testes de segurança incluídos.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | **About (#39):** a bio do autor deve ser renderizada sem interpretar HTML. Usar `escapeHtml(value)` e só depois trocar `\n` por `<br>`, ou `textContent` com `white-space: pre-line`. Vale para a carga inicial (`about.js:66`) e para o salvamento (`:183`). Na edição (`:174`), o `textarea` deve receber o valor bruto guardado, e não `innerHTML` convertido. | P0 | CA01, CA02 |
| RF02 | **RSS (#33–#37):** trocar a lista negra de regex em `formatPoemHtmlForRss` por uma **lista de permissão** de tags (`p`, `br`, `em`, `strong`, `i`, `b`, `span`), sem nenhum atributo `on*`, `style` ou `href`/`src` com protocolo não seguro. Opções: (a) sanitizar com `jsdom` (já é dependência) percorrendo os nós e mantendo só o que está na lista; (b) `stripHtml` + `escapeHtml` e montar `<p>`/`<br>` de novo a partir do texto. Ver D01. | P0 | CA03, CA04 |
| RF03 | **Poema, admin (#26):** montar o link "Editar Obra" com `createElement` + `setAttribute('href', ...)` usando `encodeURIComponent(poem.id)`, ou com `escapeHtml(encodeURIComponent(poem.id))` se continuar usando template string. | P0 | CA05 |
| RF04 | **Poema, prefetch (#40):** validar `prevSlug`/`nextSlug` contra o padrão de slug (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`) e aplicar `encodeURIComponent` antes de montar `link.href`. Slugs inválidos são descartados. | P1 | CA06 |
| RF05 | **SEO canonical (#41):** `updateSEO` deve montar o canonical a partir do **pathname** analisado com `new URL(...)`, sempre sobre a origem `SITE_URL`, e ignorar host/protocolo vindos de `window.location`. O resultado passa por `sanitizeUrl`. | P1 | CA07 |
| RF06 | **Breadcrumb (#32):** comparar a origem com `new URL(href).origin === new URL(SITE_URL).origin`, e não com `startsWith`. URLs de outra origem continuam absolutas e intactas. | P1 | CA08 |
| RF07 | **llms-builder (#44):** `decodeHtmlEntities` deve decodificar numa **única passada** (um regex com mapa de entidades) ou decodificar `&amp;` **por último**, para que `&amp;lt;` resulte em `&lt;`. | P1 | CA09 |
| RF08 | **Prerender (#29–#31, #42, #43):** criar um helper único `removeJsonLdScripts(html)` que repete a remoção até a string não mudar mais (ou usa `jsdom` para remover os nós) e trocar as 5 ocorrências por ele. | P1 | CA10 |
| RF09 | **OG images (#38):** trocar `text.replace(/<[^>]+>/g, '')` por `stripHtml` de `src/utils/html.js`, que já faz o laço até estabilizar. | P1 | CA11 |
| RF10 | **html.js (#25):** confirmar que `stripHtml` só usa `DOMParser` (documento inerte) e não insere o resultado em DOM vivo. Se confirmado, dispensar o alerta como *false positive*, com justificativa no GitHub. Alternativa sem dispensa: trocar o `DOMParser` pela versão em laço já existente no mesmo arquivo. | P2 | CA12 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma mudança visual: poemas, bio, feed RSS e páginas pré-renderizadas mantêm a mesma formatação (estrofes, quebras de linha, itálico/negrito permitidos). | P0 | CA02, CA04 |
| RNF02 | Nenhuma dependência nova de runtime no bundle do cliente. `jsdom` só pode ser usado em scripts de build e testes. | P0 | — |
| RNF03 | Cada correção coberta por pelo menos um teste unitário em Vitest, preferencialmente em `src/security.test.js` ou no `*.test.js` do módulo. | P0 | Todos |
| RNF04 | Sem alertas CodeQL High novos introduzidos pela correção (verificado no scan do PR). | P0 | CA13 |

### Dependências técnicas

- `src/utils/html.js`: `escapeHtml`, `stripHtml`, `sanitizeUrl` (reutilizar, não duplicar).
- `src/utils/url.js`: `SITE_URL`, `cleanCanonicalUrl`, `buildUrl`.
- `jsdom` (devDependency já presente), se a opção (a) do RF02 ou do RF08 for escolhida.
- Workflow do CodeQL no GitHub Actions, para validar o fechamento dos alertas.

### Recursos necessários

- Acesso de escrita ao repositório `nfbrentano/poemas` e permissão `security_events` para dispensar alertas (RF10) via UI ou `gh api`.
- Build local (`npm run build` + prerender) para comparar o HTML gerado antes e depois.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que o documento `site_settings/author_bio` contém `<img src=x onerror=alert(1)>`, quando um visitante abre `/sobre/`, então o texto aparece literalmente e nenhum script é executado.
- [x] **CA02:** Dado que a bio tem várias linhas, quando o admin salva e a página recarrega, então as quebras de linha aparecem e, ao reabrir o editor, o `textarea` mostra o texto original sem `<br>` nem entidades escapadas.
- [x] **CA03:** Dado um poema com `<scr<script>ipt>alert(1)</script >`, `<p onclick=alert(1)>`, `<a href="javascript:alert(1)">`, `<svg onload=alert(1)>` ou `<iframe>`, quando `formatPoemHtmlForRss` é executado, então o resultado não contém `<script`, `<iframe`, `<svg`, `on…=` nem `javascript:`.
- [x] **CA04:** Dado um poema com `<p>`, `<br>`, `<em>` e `<strong>`, quando o feed RSS é gerado, então essas tags são mantidas e o texto é idêntico ao atual.
- [x] **CA05:** Dado um admin logado e um `poem.id` contendo `"><img src=x onerror=alert(1)>`, quando a página do poema carrega, então o link "Editar Obra" tem o `id` codificado na query string e nenhum elemento extra é criado.
- [x] **CA06:** Dado um `__DATA__` com `prev.slug = "javascript:alert(1)"` ou `"../../x"`, quando o prefetch roda, então nenhum `<link rel="prefetch">` é criado para esse slug. Slugs válidos continuam gerando prefetch.
- [x] **CA07:** Dado qualquer `window.location` (inclusive host diferente, como preview ou localhost), quando `updateSEO` roda sem `url` explícita, então `link[rel=canonical]` e `og:url` começam com `https://nfgbrentano.art.br/` e não têm query nem hash.
- [x] **CA08:** Dado um breadcrumb com `url = "https://nfgbrentano.art.br.evil.com/x"`, quando `breadcrumb` é renderizado, então o `href` continua absoluto (`https://nfgbrentano.art.br.evil.com/x`) e não vira `.evil.com/x`. Dado `https://nfgbrentano.art.br/poema/a/`, então vira `/poema/a/`.
- [x] **CA09:** Dado o texto `&amp;lt;b&amp;gt;`, quando `decodeHtmlEntities` é executado, então o resultado é `&lt;b&gt;` (e não `<b>`). `&amp;`, `&lt;`, `&nbsp;` isolados continuam decodificados como hoje.
- [x] **CA10:** Dado um HTML com dois blocos `ld+json`, inclusive aninhados ou malformados, quando `removeJsonLdScripts` é executado, então nenhum `<script type="application/ld+json"` permanece. As 5 chamadas de `prerender.js` usam o helper.
- [x] **CA11:** Dado um poema com `<scr<b>ipt>` no trecho, quando a imagem OG é gerada, então o texto usado não contém `<`.
- [x] **CA12:** Dado o alerta #25, quando a análise é concluída, então ele aparece como `fixed` ou `dismissed (false positive)` com comentário explicando que o documento do `DOMParser` é inerte (corrigido no código removendo o DOMParser).
- [ ] **CA13:** Dado o merge na `main` e o scan do CodeQL concluído, quando se consulta `code-scanning/alerts?state=open&severity=high`, então a lista está vazia. **Caso negativo:** nenhum alerta novo foi aberto pelo PR.

## O que a atividade não inclui

- Adicionar Content Security Policy (CSP): motivo: é outra iniciativa, com impacto em scripts de terceiros (Firebase, analytics) e precisa de spec própria.
- Revisar as regras de segurança do Firestore (quem pode escrever em `site_settings`): motivo: é outra camada (backend) e deve ter atividade separada, embora reduza o risco do RF01.
- Alertas de severidade Medium/Low ou de outras ferramentas (Dependabot, secret scanning): motivo: fora do recorte pedido (alertas High do CodeQL).
- Introduzir DOMPurify ou `sanitize-html` no bundle do cliente: motivo: dependência nova de runtime. O escape resolve os casos do cliente (RNF02).
- Trocar o prerender de regex para um parser de HTML completo: motivo: complexo demais agora. O helper do RF08 basta para o alerta.

### Considerado para o futuro (P2)

- CSP com `script-src` restrito e Trusted Types, para barrar novas regressões de `innerHTML`.
- Regra de lint (`no-unsanitized/property`) no ESLint para bloquear `innerHTML` com interpolação não escapada.
- Centralizar a sanitização de HTML de poemas (RSS, prerender, llms.txt) num único módulo com lista de permissão compartilhada.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | No RSS, os poemas usam alguma formatação além de `p`/`br`/`em`/`strong` que precise ser mantida? Se não, a opção (b) do RF02 (texto puro + montar parágrafos de novo) é mais simples e segura. | PO/dev | Sim (define a abordagem do RF02) | **Opção A definida:** Usar lista de permissão de tags seguras (`p`, `br`, `em`, `strong`, `i`, `b`, `span`) sem atributos perigosos, preservando a formatação já existente. |
| D02 | A bio da página Sobre deve aceitar alguma formatação (links, negrito)? Se sim, o RF01 precisa de lista de permissão em vez de escape puro. | PO | Sim | **Apenas texto simples:** Aplicar `escapeHtml` em todo o conteúdo e converter `\n` para `<br>`, sem permitir tags HTML arbitrárias. |
| D03 | Para o #25, a preferência é dispensar como falso positivo ou trocar o código para zerar o alerta sem dispensa? | Dev | Não | **Zerar no código:** Ajustar `stripHtml` para utilizar algoritmo seguro em laço iterativo sem `DOMParser`, eliminando o alerta diretamente no código. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Bio com payload XSS | unit (jsdom) + manual | CA01 | Mockar `getDocs`/Firestore retornando `<img src=x onerror=alert(1)>`; renderizar About | `#bio-content` não contém elemento `img`; `textContent` mostra o payload literal |
| CT02 | Bio multilinha: salvar e reeditar | unit + manual | CA02 | Salvar `"linha1\nlinha2 & <3"`; reabrir o editor | Exibe 2 linhas; `textarea.value === "linha1\nlinha2 & <3"` |
| CT03 | RSS com payloads de bypass | unit | CA03 | Chamar `formatPoemHtmlForRss` com cada payload do CA03 | Nenhuma ocorrência de `<script`, `<iframe`, `<svg`, `/\son\w+=/i`, `javascript:` |
| CT04 | RSS mantém formatação | unit (snapshot) | CA04 | Poema com `<p>`, `<br>`, `<em>`, `<strong>` e poema em texto puro com estrofes | Mesma saída de hoje (snapshot) |
| CT05 | Link de edição com id malicioso | unit (jsdom) | CA05 | Renderizar o slot de admin com `poem.id` malicioso | Um único `<a>` e um `<button>`; `href` contém `encodeURIComponent(id)` |
| CT06 | Prefetch com slug inválido | unit | CA06 | Chamar o prefetch com `prevSlug = "javascript:alert(1)"` e `nextSlug = "poema-valido"` | Só 1 `<link rel=prefetch>`, apontando para `/poema/poema-valido/` |
| CT07 | Canonical com origem externa | unit | CA07 | `updateSEO({})` com `window.location = http://localhost:5173/poema/x/?utm=1#a` | canonical = `https://nfgbrentano.art.br/poema/x/` |
| CT08 | Breadcrumb com domínio parecido | unit | CA08 | Chamar o breadcrumb com as duas URLs do CA08 | `href` absoluto no primeiro caso e `/poema/a/` no segundo |
| CT09 | Decodificação sem double-unescape | unit | CA09 | `decodeHtmlEntities('&amp;lt;b&amp;gt;')` e casos simples | `'&lt;b&gt;'`; casos simples iguais aos de hoje |
| CT10 | Remoção de JSON-LD | unit | CA10 | `removeJsonLdScripts` com 2 blocos e um bloco aninhado | Nenhum `ld+json` restante; resto do HTML intacto |
| CT11 | Build de regressão | integração/manual | CA04, CA10, CA11, RNF01 | `npm run build` antes e depois; `diff` de `dist/` (HTML, `feed.xml`, `llms.txt`) | Diferenças só onde houver payload ou entidade dupla |
| CT12 | Scan CodeQL no PR | manual (CI) | CA12, CA13 | Abrir o PR e aguardar o workflow do CodeQL | 0 alertas High novos; após o merge, 0 alertas High abertos |

## URL Complementar

- Documentação técnica: [CodeQL `js/xss-through-dom`](https://codeql.github.com/codeql-query-help/javascript/js-xss-through-dom/) · [`js/incomplete-multi-character-sanitization`](https://codeql.github.com/codeql-query-help/javascript/js-incomplete-multi-character-sanitization/) · [`js/bad-tag-filter`](https://codeql.github.com/codeql-query-help/javascript/js-bad-tag-filter/) · [`js/double-escaping`](https://codeql.github.com/codeql-query-help/javascript/js-double-escaping/) · [`js/incomplete-url-substring-sanitization`](https://codeql.github.com/codeql-query-help/javascript/js-incomplete-url-substring-sanitization/) · [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- Protótipo / mockup: N/A — correção de segurança sem mudança visual.
- Discussões relacionadas: N/A — sem discussão prévia registrada.
- Referências de design: N/A — sem impacto de interface.
- Requisitos originais: [Code scanning alerts abertos na `main`](https://github.com/nfbrentano/poemas/security/code-scanning?query=is%3Aopen+branch%3Amain+severity%3Ahigh) — alertas [#25](https://github.com/nfbrentano/poemas/security/code-scanning/25), [#26](https://github.com/nfbrentano/poemas/security/code-scanning/26), [#29](https://github.com/nfbrentano/poemas/security/code-scanning/29)–[#44](https://github.com/nfbrentano/poemas/security/code-scanning/44).
- Issue / PR relacionado: specs anteriores de segurança em `SDD/DONE/` (ex.: `2026-09-24_correcao-service-worker-fetch-promise.md`); PR a ser aberto.
