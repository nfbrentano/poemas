# [FIX] Correção dos Alertas de Segurança do CodeQL (#41, #45 e #46)

> **Status:** Concluída
> **Autor:** Natanael Fernando Gatti Brentano (com Antigravity) · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-10-26 · **Atualizada em:** 2026-10-26

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir os 3 alertas de segurança de severidade High apontados pelo CodeQL no GitHub Code Scanning:
  1. **Alerta #46** (`js/incomplete-multi-character-sanitization` em `src/utils/html.js:26`): a remoção de comentários HTML (`<!--...-->`) deve ser executada em um loop iterativo (`do ... while`) até a estabilização da string, prevenindo bypasses através de sequências aninhadas como `<!--<!--...-->-->` ou comentários terminados com `--!>`.
  2. **Alerta #45** (`js/bad-tag-filter` em `src/utils/html.js:36`): a expressão regular de remoção de tags perigosas (`script`, `style`, `noscript`, `iframe`) deve suportar espaços em branco e atributos opcionais em tags de fechamento (por exemplo `</script >` ou `</script foo="bar">`), impedindo que navegadores com parsers flexíveis interpretem scripts não filtrados.
  3. **Alerta #41** (`js/xss-through-dom` em `src/utils/seo.js:100`): validação estrita de slugs contra `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` na hidratação de poemas e aplicação de `encodeURI` na atribuição de URLs canônicas em `canonical.setAttribute('href', ...)`, assegurando que texto lido do DOM (`dataScript.textContent`) nunca alcance atributos de navegação sem codificação e sanitização contextual.
- **Problema e evidência:** Três alertas de segurança High ativos no GitHub Code Scanning (`is:open branch:main severity:high`):
  - [Alert #46](https://github.com/nfbrentano/poemas/security/code-scanning/46): Incomplete multi-character sanitization em `src/utils/html.js:26`.
  - [Alert #45](https://github.com/nfbrentano/poemas/security/code-scanning/45): Bad HTML filtering regexp em `src/utils/html.js:36`.
  - [Alert #41](https://github.com/nfbrentano/poemas/security/code-scanning/41): DOM text reinterpreted as HTML em `src/utils/seo.js:100`.
- **Impacto de não fazer:** Manter potenciais brechas para injeção HTML/XSS decorrentes de falhas em regexes de sanitização, além de deixar alertas abertos no painel de segurança do GitHub.
- **Para quem é destinado:** Usuários do site (proteção contra XSS) e mantenedores do repositório (garantia de código seguro e conformidade com CodeQL).
- **História de usuário:** Como mantenedor do site, quero aprimorar as rotinas de limpeza HTML e definição de tags canônicas, para eliminar vulnerabilidades de sanitização e zerar os alertas High do Code Scanning.
- **Como saberemos que deu certo:**
  - `stripHtml` remove comentários e scripts com tags de fechamento variadas em laço iterativo.
  - A URL canônica em `updateSEO` é validada e codificada com `encodeURI`.
  - Todos os testes automatizados existentes e novos passam com `npm test -- --run`.
  - O build completo de produção (`npm run build`) conclui sem erros.
  - Os alertas #41, #45 e #46 no GitHub Code Scanning são marcados como fechados/corrigidos após scan na branch `main`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar a remoção de comentários em `stripHtml` (`src/utils/html.js`) para executar em loop `do ... while (result !== prev)` suportando `--!>` e comentários aninhados. | P0 | CA01 |
| RF02 | Atualizar a remoção de tags de script/style/iframe em `stripHtml` (`src/utils/html.js`) para aceitar espaços e atributos no fechamento (`<\/(?:script|style|noscript|iframe)\s*[^>]*>`). | P0 | CA02 |
| RF03 | Em `src/pages/poem.js`, validar `poem.slug` contra `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` ao ler dados do DOM (`dataScript.textContent`). | P0 | CA03 |
| RF04 | Em `src/utils/seo.js`, aplicar `encodeURI` na URL canônica final e garantir que `canonical.setAttribute('href', safeCanonicalHref)` receba valor sanitizado. | P0 | CA03 |
| RF05 | Adicionar testes de segurança em `src/utils/html.test.js` e `src/security.test.js` para validar os casos de borda do CodeQL. | P0 | CA01, CA02, CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma alteração visual ou regressão na formatação de poemas, feeds RSS, sitemaps ou pré-renderização estática. | P0 | CA04, CA05 |
| RNF02 | Desempenho mantido sem introdução de novas dependências pesadas de runtime no cliente. | P0 | CA04, CA05 |

### Dependências técnicas

- Arquivos `src/utils/html.js`, `src/utils/seo.js`, `src/pages/poem.js`.
- Testes unitários com Vitest (`src/utils/html.test.js`, `src/security.test.js`).

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um texto com comentários HTML aninhados como `<!--<!-- comentário -->-->` ou fechamento alternativo `--!>`, quando `stripHtml` for executado, então todos os comentários são removidos sem deixar resíduos de `<!--`.
- [x] **CA02:** Dado um texto contendo tags de script com espaços ou atributos no fechamento (`<script>alert(1)</script >` ou `<script>alert(1)</script foo="bar">`), quando `stripHtml` for executado, então a tag e seu conteúdo são eliminados integralmente.
- [x] **CA03:** Dado que `updateSEO` monta e atribui a URL canônica em `link[rel="canonical"]`, quando `canonical.setAttribute('href', ...)` é invocado, então a URL é higienizada com `sanitizeUrl`, prefixada na origem segura e codificada via `encodeURI`.
- [x] **CA04:** Dado que as modificações de segurança foram aplicadas, quando os testes automatizados forem executados com `npm test -- --run`, então 100% dos testes passam sem falhas.
- [x] **CA05:** Dado que o build de produção for executado com `npm run build`, então a compilação do Vite e a pré-renderização estática de todos os poemas e rotas concluem com sucesso.

## O que a atividade não inclui

- Atualizações de dependências npm não relacionadas a essas vulnerabilidades.
- Alterações em estilos ou componentes visuais da interface.

### Considerado para o futuro (P2)

- Monitorar periodicamente o painel de Code Scanning para assegurar que nenhuma nova heurística do CodeQL gere alertas falso-positivos em atualizações de rotas.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | `encodeURI` altera links canônicos padrão? | dev | Não | Verificado: URLs ASCII padrão com barras e traços permanecem intactas; apenas caracteres reservados ou de controle são percent-encoded. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Sanitização de comentários aninhados em `stripHtml` | unit | CA01 | Chamar `stripHtml` com `<!--<!-- x -->-->` e `<!-- y --!>` | Texto limpo sem marcadores de comentário |
| CT02 | Sanitização de script com fechamento com espaço em `stripHtml` | unit | CA02 | Chamar `stripHtml` com `<script>evil()</script >` e `<script>evil()</script attr>` | Conteúdo do script removido completamente |
| CT03 | URL canônica codificada com `encodeURI` em `updateSEO` | unit | CA03 | Chamar `updateSEO` com URL contendo caracteres especiais | `canonical.getAttribute('href')` contém URL sanitizada e codificada com `encodeURI` |
| CT04 | Execução da suíte completa de testes automatizados | unit/integração | CA04 | Executar `npm test -- --run` | 100% dos testes aprovados |
| CT05 | Execução do build completo de produção | integração | CA05 | Executar `npm run build` | Compilação e pré-renderização estática finalizadas com código 0 |

## URL Complementar

- Documentação técnica: [CodeQL js/bad-tag-filter](https://codeql.github.com/codeql-query-help/javascript/js-bad-tag-filter/), [CodeQL js/incomplete-multi-character-sanitization](https://codeql.github.com/codeql-query-help/javascript/js-incomplete-multi-character-sanitization/), [CodeQL js/xss-through-dom](https://codeql.github.com/codeql-query-help/javascript/js-xss-through-dom/)
- Protótipo / mockup: N/A
- Discussões relacionadas: Code scanning alerts #41, #45, #46
- Referências de design: N/A
- Requisitos originais: [Alertas CodeQL no repositório](https://github.com/nfbrentano/poemas/security/code-scanning?query=is%3Aopen+branch%3Amain+severity%3Ahigh)
- Issue / PR relacionado: N/A
