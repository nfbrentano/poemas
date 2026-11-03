# [FIX] Organização e Correção Estrutural das Coleções de Poemas

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-03 · **Atualizada em:** 2026-11-03

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Corrigir o layout e a hierarquia da página `/colecoes/` (`dist/colecoes/index.html` e `src/pages/collections.js`):
     - As **Coleções Temáticas** devem ser o conteúdo central e prioritário no topo da página, com cards poéticos elegantes.
     - Remover o bloco desordenado de 79 tags de sentimentos que estava inserido acima das coleções, gerando poluição visual e interceptando cliques com erros (`?tags=undefined`). Substituir por uma chamada limpa para a página dedicada de `/sentimentos/`.
     - Aprimorar o design dos cards de coleção quando não houver `image_url`: substituir o placeholder cinza genérico de 180px por um design sofisticado (gradiente suave, tipografia Cormorant Garamond e informações contextuais) que não aparente imagem quebrada.
  2. Corrigir a contagem de poemas por coleção na página pública e no admin:
     - No banco de dados Firestore, a coleção `collection_poems` contém 424 registros duplicados (cada relação foi triplicada), fazendo o cliente exibir números inflados (ex.: "357 poemas" em vez dos 119 reais).
     - Criar script idempotente para desduplicar a coleção `collection_poems` no Firestore.
     - Atualizar `src/pages/collections.js` e `src/pages/admin/collection-counts.js` para contar apenas IDs únicos de poemas publicados (`status == 'published'`).
  3. Otimizar e estabilizar a página de detalhes da coleção (`/colecao/:slug/` em `src/pages/collection.js` e `src/utils/collection-template.js`):
     - Unificar a consulta de poemas para utilizar `getPublishedPoems()`, eliminando queries múltiplas por `documentId()` que podem gerar latência ou erros no cliente.
     - Garantir consistência entre os poemas pré-renderizados no build e os carregados no cliente SPA.

- **Problema e evidência:**
  - Na página `/colecoes/`, as coleções ficavam empurradas para baixo por 79 chips de sentimentos. Ao clicar em qualquer tag, `filterChips.init` disparava uma navegação para `?tags=undefined`, quebrando a filtragem.
  - As contagens exibiam números irreais (como "357 poemas" na coleção "Amor e Conexão", sendo que o acervo inteiro possui 239 poemas), devido a 424 registros duplicados em `collection_poems`.
  - Os cards sem imagem exibiam `<div class="collection-img-placeholder"></div>` com altura fixa de 180px e aspecto de elemento quebrado/inacabado.
  - Em `/colecao/:slug/`, o carregamento client-side dependia de múltiplos batches manuais no Firestore em vez de reaproveitar o cache já disponível.

- **Impacto de não fazer:**
  - Experiência visual degradada para leitores explorando as coleções.
  - Métricas e contadores visivelmente incorretos em produção.
  - Erros de navegação ao clicar nas tags dentro da página de coleções.

- **Para quem é destinado:**
  - Leitores e visitantes do site que navegam pelas obras através de coleções temáticas e o autor no painel administrativo.

- **História de usuário:**
  - Como leitor de poesia, quero acessar a página de coleções e visualizar de forma limpa e imediata as séries temáticas de poemas com seus títulos, descrições e contagens reais de obras, para que eu possa explorar os poemas organizados por tema com facilidade.

- **Como saberemos que deu certo:**
  - Na página `/colecoes/`, os cards de coleções aparecem organizados no topo sem erros de layout ou de imagem quebrada.
  - A contagem de poemas em cada coleção reflete exatamente a quantidade de poemas publicados e únicos vinculados.
  - Nenhum link gera `?tags=undefined` no console ou na URL.
  - 100% dos testes unitários e de integração passam no Vitest.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Reorganizar a página `/colecoes/` colocando as coleções temáticas em destaque no topo, com título "Coleções" e link direcionado para `/sentimentos/`. | P0 | CA01, CA02 |
| RF02 | Corrigir a contagem de poemas em `src/pages/collections.js` e `src/pages/admin/collection-counts.js` para considerar apenas poemas publicados e com IDs únicos. | P0 | CA03 |
| RF03 | Fornecer script idempotente para desduplicar a tabela `collection_poems` no Firestore, preservando uma única relação por par `(collection_id, poem_id)`. | P0 | CA04 |
| RF04 | Aprimorar o estilo dos cards de coleção sem imagem (`image_url: null`), proporcionando uma apresentação visual editorial elegante sem parecer placeholder quebrado. | P0 | CA01 |
| RF05 | Otimizar `src/pages/collection.js` para carregar poemas via `getPublishedPoems()`, mantendo ordenação poética e excertos. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Manter compatibilidade com pré-renderização estática (`dist/colecoes/index.html` e `dist/colecao/*/index.html`). | P0 | CA01, CA05 |
| RNF02 | Acessibilidade (WCAG AA): contraste de cores nos cards e links sem barreiras visuais. | P0 | CA01 |
| RNF03 | Zero erros no console durante a navegação entre coleções e poemas. | P0 | CA02 |

### Dependências técnicas

- Firestore Collections: `collections`, `collection_poems`, `poems`.
- Componentes e templates: `src/pages/collections.js`, `src/pages/collection.js`, `src/utils/collections-template.js`, `src/utils/collection-template.js`, `scripts/prerender.js`.

### Recursos necessários

- Acesso ao Firestore do projeto via credenciais locais para validação e desduplicação.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que o usuário acessa `/colecoes/`, quando a página carrega, então ele visualiza no topo as coleções temáticas em formato de grid elegante com nome, descrição, contagem real de poemas e sem elementos que pareçam imagens quebradas.
- [ ] **CA02:** Dado que o usuário interage com a página `/colecoes/`, quando clica nos links de navegação ou filtros, então nenhuma URL é alterada para `?tags=undefined` e a navegação ocorre de forma fluida.
- [ ] **CA03:** Dado que uma coleção possui poemas associados, quando sua contagem é exibida (no card de `/colecoes/`, no cabeçalho de `/colecao/:slug/` e no admin), então o número exibido corresponde estritamente à quantidade de poemas publicados únicos vinculados àquela coleção.
- [ ] **CA04:** Dado que o script de deduplicação é executado, quando concluído, então a tabela `collection_poems` no Firestore passa a ter apenas 1 documento por par único `(collection_id, poem_id)`.
- [ ] **CA05:** Dado que o usuário acessa uma coleção individual `/colecao/:slug/`, quando a página carrega no SPA, então os poemas são exibidos com título, excerto e ano, respeitando a ordenação definida.

## O que a atividade não inclui

- Exclusão ou criação de novas coleções temáticas no banco de dados (o escopo é organizar e corrigir as coleções existentes e sua apresentação).
- Alteração no schema fundamental do Firestore para coleções.

### Considerado para o futuro (P2)

- Funcionalidade no admin para drag-and-drop de reordenação de poemas dentro de uma coleção.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | As coleções sem capa devem ter imagem gerada automaticamente ou estilo poético tipográfico? | Design/Dev | Não | Estilo tipográfico elegante com gradiente sutil e tipografia Cormorant Garamond, integrando perfeitamente ao tema escuro/claro. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Renderização dos cards de coleção na página `/colecoes/` | Unit/Integração | CA01, CA02 | Executar `renderCollectionsPageMarkup` com dados reais | Cards de coleção aparecem no topo com contagem correta e sem botões quebrados de tags |
| CT02 | Contagem desduplicada de poemas por coleção | Unit | CA03 | Chamar lógica de contagem com array de relações contendo duplicatas | Contagem retorna apenas IDs únicos de poemas publicados |
| CT03 | Detalhes da coleção individual `/colecao/:slug/` | Unit/Integração | CA05 | Carregar `collection.render` no container de teste | Renderiza poemas com excerto e contagem sem erros |
| CT04 | Deduplicação idempotente de `collection_poems` | Script/Unit | CA04 | Executar deduplicação sobre mapa com chaves repetidas | Preserva exatamente 1 registro por par |

## URL Complementar

- Documentação técnica: Firestore Documentation (Queries and Data Modeling)
- Rotas afetadas: `/colecoes/`, `/colecao/:slug/`, `/admin?view=collections`
