# [FIX] Restauração da impressão nativa, paridade de shell prerender/SPA, OG/Schema e limpeza de listeners

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o conflito de `@media print` que produz páginas em branco ao imprimir poemas, unificar o shell pré-renderizado com o SPA, corrigir URLs e metadados de Open Graph/Schema.org/Sobre, e eliminar vazamentos de listeners e caches obsoletos na navegação.
- **Problema e evidência:**
  1. [`src/styles/components.css`](../src/styles/components.css) declara `@media print { body #app { display: none !important; } #print-library-container { display: block !important; } }`, sobrescrevendo os estilos de impressão de `.single-poem` definidos em [`src/styles/global.css`](../src/styles/global.css). Como `#print-library-container` não existe no DOM, `Cmd/Ctrl+P` imprime uma página em branco.
  2. [`scripts/prerender.js`](../scripts/prerender.js) duplica o shell HTML com divergências em relação a [`src/main.js`](../src/main.js) (não inclui `/favoritos/` nos ajustes/navegação e renderiza `.newsletter-form` em vez de `#subscribe-form`), além de injetar `__DATA__` sem escapar `<` em strings JSON.
  3. [`src/utils/structured-data.js`](../src/utils/structured-data.js) usa fallback legado `https://poemas-natanael.web.app/og-image?slug=...`; [`src/utils/seo.js`](../src/utils/seo.js) aponta para `/og/poema/${slug}.png` mesmo quando o build cai no fallback `.jpg`; [`scripts/prerender.js`](../scripts/prerender.js) fixa `og:image:type="image/png"` para coleções mesmo quando `ogImage` é `.jpg`; [`src/pages/about.js`](../src/pages/about.js) chama [`getAboutFaq()`](../src/utils/about-template.js) sem passar `collectionsCount` (mantendo `5` em vez das `7` coleções curadas em [`src/data/collections.js`](../src/data/collections.js)) e sem atualizar o `avatarUrl` dinâmico no JSON-LD.
  4. [`src/pages/poem.js`](../src/pages/poem.js) adiciona `document.addEventListener('selectionchange', ...)` sem remoção no `cleanup()`; [`src/components/header.js`](../src/components/header.js) e [`src/components/search-overlay.js`](../src/components/search-overlay.js) duplicam o listener da tecla `/`; [`src/utils/navigation.js`](../src/utils/navigation.js) mantém `cachedPublishedSlugs` desvinculado de `invalidatePoemsCache()`; [`src/pages/home.js`](../src/pages/home.js), [`src/utils/text-format.js`](../src/utils/text-format.js) e [`src/pages/poem.js`](../src/pages/poem.js) têm interpolações sem `escapeHtml`; [`public/_headers`](../public/_headers) define `immutable` por 1 ano em `/*`.
- **Impacto de não fazer:** Leitores não conseguem imprimir poemas no navegador; há risco de drift visual/funcional na hidratação entre SSR e SPA (newsletter estática na Home sem handler até re-render, falta de `/favoritos/` no HTML inicial); metadados OG/JSON-LD inconsistentes em compartilhamentos e crawlers; acúmulo de event listeners em sessões longas de leitura.
- **Para quem é destinado:** Todos os leitores (desktop/mobile) e motores de busca/redes sociais.
- **História de usuário:** Como leitor, quero poder imprimir um poema diretamente do navegador, acessar favoritos e newsletter de forma consistente desde o carregamento inicial e navegar dezenas de poemas sem lentidão ou bugs de atalhos, para ter uma experiência editorial polida.
- **Como saberemos que deu certo:** `Cmd/Ctrl+P` exibe título, autor e versos formatados; zero divergências estruturais entre shell prerenderizado e `main.js`; todos os caminhos de OG/Schema usam `SITE_URL` (`https://nfgbrentano.art.br`) com MIME type correto; zero vazamento de `selectionchange` ou listener `/` duplicado; testes pós-build validam todos os arquivos em `dist/`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Corrigir `@media print` em [`src/styles/components.css`](../src/styles/components.css) removendo o bloqueio global `body #app { display: none !important; }` (aplicando-o apenas quando `body.is-printing-anthology` estiver ativo) e adicionar botão discreto "Imprimir" nas ações do poema. | P0 | CA01 |
| RF02 | Extrair módulo compartilhado (`src/utils/shell-template.js`) para o shell base (barra inferior, folha de ajustes com `/favoritos/`, rodapé) consumido por [`src/main.js`](../src/main.js) e [`scripts/prerender.js`](../scripts/prerender.js), e alinhar o formulário de newsletter pré-renderizado com `#subscribe-form`. | P0 | CA02 |
| RF03 | Escapar `<` como `\u003c` no `JSON.stringify` de `__DATA__` em [`scripts/prerender.js`](../scripts/prerender.js) e aplicar `escapeHtml` em `data-title` ([`home.js`](../src/pages/home.js)), versos ([`text-format.js`](../src/utils/text-format.js)) e `r.slug` + hover via CSS nos cards relacionados ([`poem.js`](../src/pages/poem.js)). | P0 | CA03 |
| RF04 | Remover a URL obsoleta `poemas-natanael.web.app` de [`structured-data.js`](../src/utils/structured-data.js), ajustar `og:image:type` conforme extensão real (`.png` vs `.jpg`) em [`prerender.js`](../scripts/prerender.js) e [`seo.js`](../src/utils/seo.js), e passar `collectionsCount` real + `avatarUrl` atualizado em [`about.js`](../src/pages/about.js) / [`about-template.js`](../src/utils/about-template.js). | P1 | CA04, CA05 |
| RF05 | Registrar referência do handler `selectionchange` em [`poem.js`](../src/pages/poem.js) para removê-lo em `cleanup()`, centralizar o atalho `/` em um único ponto e expor/chamar invalidação de `cachedPublishedSlugs` quando `invalidatePoemsCache()` ocorrer. | P1 | CA06, CA07 |
| RF06 | Ajustar [`public/_headers`](../public/_headers) para aplicar `immutable` apenas em `/assets/*`, `/fonts/*` e `/icons/*`, preservando `no-cache` / `must-revalidate` para HTML, `sw.js` e `manifest.json`. | P1 | CA08 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A unificação do shell não deve introduzir dependências Node exclusivas no bundle do cliente nem aumentar o bundle JS principal em mais de `2 KB` gzipped. | P1 | CA02 |
| RNF02 | Todos os testes existentes de SEO/Open Graph/CWV (`src/seo-*.test.js`) devem continuar passando após as correções. | P0 | CA04, CA05 |
| RNF03 | Não gerar regressão visual na navegação SPA nem no carregamento pré-renderizado sem JS. | P0 | CA02 |

### Dependências técnicas

- [`src/styles/global.css`](../src/styles/global.css), [`src/styles/components.css`](../src/styles/components.css)
- [`src/main.js`](../src/main.js), [`scripts/prerender.js`](../scripts/prerender.js)
- [`src/utils/structured-data.js`](../src/utils/structured-data.js), [`src/utils/seo.js`](../src/utils/seo.js), [`src/pages/about.js`](../src/pages/about.js), [`src/utils/about-template.js`](../src/utils/about-template.js)
- [`src/pages/poem.js`](../src/pages/poem.js), [`src/components/header.js`](../src/components/header.js), [`src/components/search-overlay.js`](../src/components/search-overlay.js), [`src/utils/navigation.js`](../src/utils/navigation.js)
- [`public/_headers`](../public/_headers)

### Recursos necessários

- N/A — apenas alterações de código-fonte e testes automatizados já suportados pelo ambiente Vitest/Vite atual.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou em uma página de poema, quando os estilos `@media print` são aplicados (sem classe `is-printing-anthology`), então `#app` e `.single-poem` permanecem visíveis enquanto menus, ações e rodapé ficam ocultos.
- [ ] **CA02:** Dado o HTML pré-renderizado da Home (`dist/index.html`) e de um poema, quando inspeciono o DOM inicial antes mesmo da troca de rota, então o link `/favoritos/` consta nos Ajustes e o formulário de newsletter usa `#subscribe-form` compatível com [`newsletter.init()`](../src/components/newsletter.js).
- [ ] **CA03:** Dado um poema com texto contendo `</script><script>` no conteúdo ou `"` no título, quando o HTML é pré-renderizado ou renderizado no cliente, então nenhuma tag `<script>` espúria é aberta e todos os atributos ficam corretamente escapados.
- [ ] **CA04:** Dado um poema ou coleção sem OG gerada (usando fallback `.jpg`), quando o HTML é pré-renderizado e inspecionado pelo módulo SEO, então `og:image` aponta para `https://nfgbrentano.art.br/...`, `og:image:type` corresponde ao formato real (`image/jpeg` ou `image/png`) e não há referências a `poemas-natanael.web.app`.
- [ ] **CA05:** Dado a página `/sobre/` carregada no navegador ou pré-renderizada, quando o FAQ e o JSON-LD são gerados, então o número de coleções exibido reflete o total real curado/publicado (`>= 7`) e o `Person`/`ProfilePage` schema usa a URL de avatar configurada.
- [ ] **CA06:** Dado que navego de `/poema/a/` para `/poema/b/` e depois para `/`, quando `cleanup()` é executado em `poem.js`, então o listener `selectionchange` da rota anterior é removido e pressionar `/` dispara a abertura da busca apenas uma vez.
- [ ] **CA07:** Dado que `invalidatePoemsCache()` foi chamado após publicação/edição no admin, quando o usuário aciona "Poema Aleatório", então `getRandomPoem()` recarrega a lista atualizada de slugs publicados.
- [ ] **CA08:** Dado o arquivo [`public/_headers`](../public/_headers), quando inspecionado, então apenas recursos com hash ou estáticos versionáveis usam `immutable`, nunca páginas `.html` ou `/sw.js`.

## O que a atividade não inclui

- Refatoração completa de `scripts/prerender.js` em um framework SSR (Astro/Next/Nuxt): motivo: complexo demais para a arquitetura estática atual do repositório.
- Implementação do gerador de livreto/antologia multi-poemas: motivo: tratado em SDD própria de Leitura Contínua em Coleção.

### Considerado para o futuro (P2)

- Extrair também templates de marcação da Home (`renderHomeMarkup`) para `src/utils/home-template.js` compartilhado com o cliente.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Deseja exibir um botão explícito "Imprimir poema" na barra de ações do poema ou apenas corrigir o `@media print` nativo (`Cmd/Ctrl+P`) por enquanto? | design/PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | CSS de impressão | unit | CA01 | Validar regras `@media print` de `global.css` e `components.css` | Não existe regra incondicional `body #app { display: none !important; }` fora de `.is-printing-anthology` |
| CT02 | Paridade do shell pré-renderizado | integração (pós-build) | CA02 | Inspecionar `dist/index.html` e um poema em `dist/poema/*/index.html` | Contém `/favoritos/` e `#subscribe-form` |
| CT03 | Escape em `__DATA__` e helpers | unit | CA03 | Pré-renderizar/formatar poema com `</script>` e título com `"` | Nenhuma quebra de tag `<script>` e atributos escapados |
| CT04 | Metadados OG e `about.js` | unit/integração | CA04, CA05 | Gerar `poemSchema` sem `poem.image` e renderizar `about.js` | Nenhuma string `web.app`, `og:image:type` coerente com extensão e `collectionsCount` atualizado |
| CT05 | Limpeza de listeners e cache | integração (jsdom) | CA06, CA07 | Montar/desmontar `poem.js` espionando `removeEventListener('selectionchange')`; pressionar `/`; chamar `invalidatePoemsCache()` | `selectionchange` removido no `cleanup()`, busca abre 1× e slugs são renovados |
| CT06 | Cache-Control em `_headers` | unit | CA08 | Ler `public/_headers` | `/*` não possui `immutable`; apenas `/assets/*`, `/fonts/*` e `/icons/*` têm cache longo |

## URL Complementar

- Documentação técnica: [`src/styles/components.css`](../src/styles/components.css), [`scripts/prerender.js`](../scripts/prerender.js), [`src/utils/seo.js`](../src/utils/seo.js), [`src/utils/structured-data.js`](../src/utils/structured-data.js), [`src/pages/poem.js`](../src/pages/poem.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-09-29_atualizar-nome-completo-autor.md`](DONE/2026-09-29_atualizar-nome-completo-autor.md), [`SDD/DONE/2026-10-26_correcao-codeql-html-seo.md`](DONE/2026-10-26_correcao-codeql-html-seo.md)
- Referências de design: N/A
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
