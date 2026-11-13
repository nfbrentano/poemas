# [FEAT] Leitura contínua em coleção (Modo Antologia e impressão de série)

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Permitir que o leitor percorra uma coleção como uma série contínua — respeitando a ordem curada de [`src/utils/collection-order.js`](../src/utils/collection-order.js) nos links "Anterior / Próximo", exibindo barra discreta de contexto/progresso na série e oferecendo impressão/exportação em PDF da coleção inteira ou da lista de favoritos (aproveitando a estrutura editorial de `#print-library-container` já esboçada em [`src/styles/components.css`](../src/styles/components.css)).
- **Problema e evidência:** Hoje [`src/pages/collection.js`](../src/pages/collection.js) ordena os poemas de uma coleção conforme `collection_poems`, mas ao clicar em qualquer poema, [`src/pages/poem.js`](../src/pages/poem.js) calcula `Anterior` e `Próximo` exclusivamente pela ordem global cronológica de todo o acervo. Quem está lendo a série *"Alma e Autoconhecimento"* acaba desviado para poemas de outra temática ao avançar. Além disso, [`src/styles/components.css`](../src/styles/components.css) possui regras `@media print` órfãs para `#print-library-container` sem nenhuma interface conectada.
- **Impacto de não fazer:** A experiência de ler uma coleção como um livro/capítulo temático se quebra no primeiro clique; o leitor não enxerga onde está dentro da série e não consegue imprimir ou guardar uma antologia curada ou sua seleção de favoritos.
- **Para quem é destinado:** Leitores interessados em leitura imersiva por tema e leitores recorrentes que montam antologias em `/favoritos/`.
- **História de usuário:** Como leitor explorando uma coleção temática, quero ler os poemas na ordem da coleção sabendo em que posição estou (e poder imprimir a coleção ou meus favoritos como livreto), para vivenciar a série como um livro contínuo.
- **Como saberemos que deu certo:** Navegar de `/colecao/<slug>/` para um poema preserva o contexto da série; `Anterior/Próximo` seguem 100% a ordem de `collection_poems`; botão "Imprimir / Salvar Livreto PDF" gera páginas com quebra por poema sem perder a URL canônica para SEO.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Preservar contexto de série quando o poema é aberto a partir de `/colecao/<slug>/` (via query `?colecao=<slug>` ou estado de navegação SPA mantendo URL canônica limpa para SEO). | P0 | CA01, CA06 |
| RF02 | Quando em contexto de coleção válida, exibir faixa discreta no topo/rodapé do poema (*"Série: <Nome da Coleção> · Poema X de Y"*, com link de volta para `/colecao/<slug>/`) e adaptar `prevSlug`/`nextSlug` + navegação por teclado/swipe para seguir `sortPoemsByCollectionRelations()`. | P0 | CA01, CA02, CA03 |
| RF03 | Na página [`src/pages/collection.js`](../src/pages/collection.js), adicionar botão **"Começar leitura"** (abre o 1º poema da série em modo coleção) e **"Imprimir / Salvar PDF da Coleção"**. | P1 | CA04 |
| RF04 | Conectar o botão de impressão/livreto (tanto em `/colecao/<slug>/` quanto em [`src/pages/favorites.js`](../src/pages/favorites.js)) populando temporariamente `#print-library-container` com capa (título, autor, descrição), cada poema escapado com `escapeHtml` e acionando `window.print()`, limpando o container no evento `afterprint`. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A presença de `?colecao=<slug>` na URL nunca deve alterar `<link rel="canonical">`, `og:url` nem o JSON-LD, que permanecem apontando para `https://nfgbrentano.art.br/poema/<slug>/`. | P0 | CA06 |
| RNF02 | Se `?colecao=<slug>` apontar para coleção inexistente ou sem o poema atual, a página faz fallback transparente para navegação global cronológica sem exibir erro ao leitor. | P0 | CA07 |
| RNF03 | O conteúdo injetado em `#print-library-container` deve usar sanitização/escape estrito e a página de coleção pré-renderizada deve continuar funcionando caso `JS` leve até `1s` para hidratar. | P0 | CA05 |

### Dependências técnicas

- [`src/utils/collection-order.js`](../src/utils/collection-order.js) e [`src/data/collections.js`](../src/data/collections.js).
- [`src/utils/collection-template.js`](../src/utils/collection-template.js), [`src/pages/collection.js`](../src/pages/collection.js), [`src/pages/poem.js`](../src/pages/poem.js), [`src/pages/favorites.js`](../src/pages/favorites.js).
- [`src/styles/components.css`](../src/styles/components.css) (`#print-library-container`) + correção prévia de `@media print` (ver SDD [`2026-11-13_fix-impressao-e-paridade-prerender-seo.md`](2026-11-13_fix-impressao-e-paridade-prerender-seo.md)).
- [`src/utils/seo.js`](../src/utils/seo.js) (`cleanCanonicalUrl`).

### Recursos necessários

- N/A — depende apenas do acervo, ordem de coleções e estilos já presentes no repositório.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou em `/colecao/amor-e-conexao/` e abro o 1º poema da lista ordenada, quando o poema renderiza, então vejo o indicador `Poema 1 de N` da coleção e o botão "Próximo" aponta para o 2º poema dessa coleção.
- [ ] **CA02:** Dado que estou no 1º poema da coleção, quando verifico a navegação de série, então não há botão "Anterior na coleção" (ou aponta para voltar ao índice da coleção sem sair silenciosamente para outro poema fora da série).
- [ ] **CA03:** Dado que avanço pelos poemas via swipe ou setas de teclado (`ArrowRight`/`ArrowLeft`) dentro de uma coleção, quando mudo de poema, então o contexto `?colecao=<slug>` e a ordem curada são mantidos.
- [ ] **CA04:** Dado uma coleção com 3 ou mais poemas, quando clico em "Começar leitura", então navego diretamente para o 1º poema da coleção com o contexto de série ativo.
- [ ] **CA05:** Dado que aciono "Imprimir / Salvar PDF da Coleção" em `/colecao/<slug>/` ou em `/favoritos/`, quando a impressão é disparada, então `#print-library-container` contém apenas os poemas visíveis daquela lista com capa, classe `is-printing-anthology` no `body` durante a impressão, e é removido após `afterprint`.
- [ ] **CA06:** Dado que acesso `/poema/o-abraco/?colecao=amor-e-conexao`, quando inspeciono `<head>`, então `<link rel="canonical">` e `og:url` permanecem exatamente `https://nfgbrentano.art.br/poema/o-abraco/`.
- [ ] **CA07:** Dado que acesso `/poema/o-abraco/?colecao=colecao-inexistente`, quando a página carrega, então nenhum banner de série inválida é exibido e os links `Anterior/Próximo` usam normalmente o acervo global.

## O que a atividade não inclui

- Geração de arquivo `.epub` ou PDF binário server-side no Cloud Functions: motivo: impressão nativa via CSS Paged Media já gera PDF limpo sem dependências pesadas no backend.
- Coleções privadas criadas dinamicamente pelo leitor na nuvem: motivo: o site não possui login de leitores.

### Considerado para o futuro (P2)

- "Progresso de leitura da série" salvo em `localStorage` marcando automaticamente poemas já lidos dentro de cada coleção.
- Exportação de livreto em Markdown/ePub no navegador para leitores de e-ink (Kindle/Kobo).

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O contexto da coleção deve ficar visível na URL (`?colecao=slug`) para permitir compartilhar o link da trilha, ou apenas em `history.state`/`sessionStorage`? (`?colecao=` facilita recarregar a página sem perder o progresso, e `cleanCanonicalUrl` já remove query strings do canonical.) | PO/dev | Sim | |
| D02 | Ao finalizar o último poema de uma coleção, devemos exibir sugestão de "Próxima coleção recomendada" ou botão "Voltar ao índice da coleção"? | design/PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Cálculo de adjacentes na coleção | unit | CA01, CA02 | Passar coleção ordenada `[pA, pB, pC]` e `pB` para helper de navegação | Retorna `prev = pA`, `next = pC`, `index = 2`, `total = 3`; em `pA`, `prev = null` |
| CT02 | Fallback com coleção inválida | unit | CA07 | Passar `?colecao=nao-existe` ou poema fora da coleção | Retorna contexto `null` e usa ordem global |
| CT03 | Preservação de canonical SEO | integração (jsdom) | CA06 | Renderizar poema com `?colecao=amor-e-conexao` e inspecionar `document.head` | `canonical` e `og:url` sem query string |
| CT04 | Montagem e limpeza do livreto de impressão | integração (jsdom) | CA05 | Mockar `window.print`, acionar exportação em coleção/favoritos e disparar `afterprint` | `#print-library-container` populado com os poemas certos e removido após `afterprint` |
| CT05 | Navegação swipe/teclado em série | integração (jsdom) | CA03, CA04 | Clicar em "Começar leitura" e simular `ArrowRight` no poema | Navega para 2º poema mantendo `?colecao=` |

## URL Complementar

- Documentação técnica: [`src/utils/collection-order.js`](../src/utils/collection-order.js), [`src/pages/collection.js`](../src/pages/collection.js), [`src/pages/poem.js`](../src/pages/poem.js), [`src/styles/components.css`](../src/styles/components.css)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-09-23_pagina-colecao-seo-e-ordenacao.md`](DONE/2026-09-23_pagina-colecao-seo-e-ordenacao.md), [`SDD/DONE/2026-11-10_feat-admin-reordenar-poemas-colecao.md`](DONE/2026-11-10_feat-admin-reordenar-poemas-colecao.md)
- Referências de design: [`src/utils/collection-template.js`](../src/utils/collection-template.js)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
