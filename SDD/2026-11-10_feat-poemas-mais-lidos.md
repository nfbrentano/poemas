# [FEAT] Seção "Mais lidos" com os poemas mais visitados

> **Status:** Rascunho
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Exibir ao leitor uma seleção dos poemas mais lidos do período recente, como porta de entrada para o acervo.
- **Problema e evidência:** O site já registra visualizações em `page_views` ([`src/utils/analytics.js`](../src/utils/analytics.js)) e as mostra ao autor em [`src/pages/analytics.js`](../src/pages/analytics.js), mas esse dado não chega ao leitor. A home ([`src/pages/home.js`](../src/pages/home.js)) oferece lista paginada, filtros por tag e poema do dia; quem chega pela primeira vez não tem indicação de por onde começar entre 239 poemas.
- **Impacto de não fazer:** Visitantes novos saem sem conhecer os poemas de maior ressonância; os mais lidos não recebem reforço de links internos.
- **Para quem é destinado:** Visitante de primeira viagem; secundariamente, buscadores (malha de links internos).
- **História de usuário:** Como visitante novo, quero ver quais poemas são mais lidos, para começar pelos que mais tocaram outros leitores.
- **Como saberemos que deu certo:** Seção presente no HTML pré-renderizado da home; aumento de páginas por sessão a partir da home, medido no Clarity 30 dias antes × 30 dias depois.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Seção "Mais lidos" na home com os 5 poemas publicados mais visualizados nos últimos 30 dias. | P0 | CA01 |
| RF02 | Cada item mostra posição, título e link para o poema; não exibe números de visualização. | P0 | CA01, CA02 |
| RF03 | Só entram poemas com status `published`; visitas a páginas que não são de poema são ignoradas. | P0 | CA03 |
| RF04 | Se houver menos de 5 poemas com visualizações no período, a seção completa a lista com o período total; se ainda assim não houver dados, a seção não é exibida. | P0 | CA04 |
| RF05 | Empates resolvidos pelo poema publicado mais recentemente. | P1 | CA05 |
| RF06 | A lista aparece também em `llms.txt` como "poemas em destaque". | P1 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Leitores não autenticados continuam sem acesso de leitura a `page_views` (regras do Firestore inalteradas). | P0 | CA07 |
| RNF02 | A seção faz parte do HTML pré-renderizado, com links `<a href>` rastreáveis. | P0 | CA08 |
| RNF03 | Nenhuma requisição adicional ao Firestore no carregamento da home pelo leitor. | P0 | CA07 |
| RNF04 | Indisponibilidade dos dados de visualização no build não derruba o build; a seção é omitida. | P0 | CA09 |

### Dependências técnicas

- Coleção `page_views` e regras em [`firestore.rules`](../firestore.rules) (leitura restrita a autenticados).
- Pipeline de build: [`scripts/prerender.js`](../scripts/prerender.js), [`scripts/generate-llms.js`](../scripts/generate-llms.js).
- [`src/pages/home.js`](../src/pages/home.js).

### Recursos necessários

- Credencial de leitura de `page_views` no ambiente de build (ver D01).
- Título e microtexto da seção.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que existem visualizações registradas nos últimos 30 dias, quando abro a home, então vejo a seção "Mais lidos" com 5 poemas ordenados do mais para o menos visualizado, cada um com link para sua página.
- [ ] **CA02:** Dado que a seção está visível, quando a inspeciono, então nenhuma contagem de visualizações é exibida ao leitor.
- [ ] **CA03:** Dado que o poema mais visualizado do período foi despublicado, quando a lista é gerada, então ele não aparece e o próximo colocado ocupa a vaga.
- [ ] **CA04:** Dado que não há nenhuma visualização registrada, quando abro a home, então a seção não é renderizada (sem título órfão nem lista vazia).
- [ ] **CA05:** Dado que dois poemas têm a mesma contagem, quando a lista é gerada, então o publicado mais recentemente vem primeiro.
- [ ] **CA06:** Dado o build de produção, quando abro `llms.txt`, então os poemas em destaque constam com título e URL canônica.
- [ ] **CA07:** Dado um leitor anônimo, quando carrego a home, então não há leitura de `page_views` na rede e as regras do Firestore seguem negando essa leitura.
- [ ] **CA08:** Dado o build de produção, quando leio `dist/index.html` sem executar JavaScript, então a seção e seus 5 links `<a href="/poema/.../">` estão presentes.
- [ ] **CA09:** Dado que a leitura de `page_views` falha durante o build, quando o build termina, então ele conclui com sucesso, registra um aviso e a home é gerada sem a seção.

## O que a atividade não inclui

- Contador público de visualizações por poema: motivo: decisão editorial; evita competição entre poemas.
- Ranking em tempo real: motivo: exigiria abrir leitura de `page_views` ou criar agregação no servidor; a atualização a cada deploy é suficiente.
- Seletor de período pelo leitor: motivo: prematuro.

### Considerado para o futuro (P2)

- "Mais lidos" por coleção e por sentimento.
- Agregação diária agendada (Cloud Function ou GitHub Action) para atualizar o ranking sem depender de deploy.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Como o build lê `page_views`, se a leitura exige autenticação? Conta de serviço como secret no GitHub Actions, ou um documento agregado público em `site_settings` atualizado pelo admin? | dev/PO | Sim | |
| D02 | O workflow diário ([`daily-poem.yml`](../.github/workflows/daily-poem.yml)) deve disparar um rebuild para manter o ranking fresco? | PO | Não | |
| D03 | Posição da seção na home: antes ou depois da lista principal? | design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Ranking básico | unit | CA01, CA02 | Agregar visualizações fictícias de 7 poemas | Top 5 em ordem; saída sem contagens |
| CT02 | Despublicado fora | unit | CA03 | Incluir visualizações de poema `draft` | Não consta |
| CT03 | Sem dados | unit | CA04 | Agregar lista vazia | Seção omitida |
| CT04 | Empate | unit | CA05 | Dois poemas com mesma contagem | Mais recente primeiro |
| CT05 | llms.txt | integração (pós-build) | CA06 | Ler `dist/llms.txt` | Destaques presentes |
| CT06 | Regras | integração | CA07 | [`src/firestore-rules.test.js`](../src/firestore-rules.test.js): leitura anônima de `page_views` | Negada |
| CT07 | HTML estático | integração (pós-build) | CA08 | Ler `dist/index.html` | Seção e 5 links |
| CT08 | Falha no build | unit | CA09 | Fazer a leitura lançar erro | Aviso; resultado sem seção |

## URL Complementar

- Documentação técnica: [`src/utils/analytics.js`](../src/utils/analytics.js), [`firestore.rules`](../firestore.rules)
- Protótipo / mockup: N/A — segue o estilo de lista existente na home.
- Discussões relacionadas: [`SDD/DONE/2026-11-03_otimizacao-rastreamento-e-indexacao-google.md`](DONE/2026-11-03_otimizacao-rastreamento-e-indexacao-google.md)
- Referências de design: [`SDD/DONE/2026-09-23_layout-home-lista-e-filtros-mobile.md`](DONE/2026-09-23_layout-home-lista-e-filtros-mobile.md)
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
