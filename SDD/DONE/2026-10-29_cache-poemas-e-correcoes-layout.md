# [FIX] [REFACTOR] Cache Unificado de Poemas e Correções de Layout, Tipografia e Navegação

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-10-29 · **Atualizada em:** 2026-10-29

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Criar o módulo `src/utils/poems-store.js` para centralizar a busca e o cache em memória de poemas publicados no Firestore (com deduplicação de requisições simultâneas, tempo de vida configurável e função de invalidação `invalidatePoemsCache`), integrando-o em `src/pages/home.js`, `src/pages/collections.js`, `src/pages/sentiments.js`, `src/pages/sentiment.js`, `src/components/search-overlay.js`, `src/components/filter-chips.js`, `src/utils/navigation.js` e invalidando-o automaticamente nas mutações do painel admin (`src/pages/admin/data.js`).
  2. Corrigir as classes de fontes de leitura (`.font-family-sans` e `.font-family-hand`) em `src/styles/components.css`, que referenciavam fontes externas não carregadas (`Inter` e `Caveat`), passando a utilizar `var(--font-ui)` para `Sans` e a variante itálica auto-hospedada `'Merriweather', 'Cormorant Garamond', Georgia, serif` para o modo manuscrito/cursivo.
  3. Corrigir a página `src/pages/sentiments.js`, que utilizava a variável CSS inexistente `var(--accent)` e estilos inline nos cards de sentimento, migrando a estilização para classes semânticas em `src/styles/components.css` com `var(--accent-subtle)` e estados de `:hover` / `:focus-visible`.
  4. Simplificar `src/components/header.js` removendo listeners de scroll, resize e touch associados ao menu gaveta legado (oculto via `display: none !important`), e exibir a assinatura do autor (`#mobile-brand`) também no desktop em páginas internas.
  5. Implementar restauração de posição de rolagem (`scrollY`) no roteador SPA (`src/router.js`) ao navegar pelo histórico do navegador (`popstate`), mantendo o scroll para o topo (`window.scrollTo(0, 0)`) em navegações diretas (`navigateTo`).
  6. Aplicar `text-wrap: balance` nos títulos principais (`h1`, `h2`, `.featured-title`, `.pod-title`) para equilibrar quebras de linha em títulos longos.

- **Problema e evidência:**
  - Cada navegação entre Home (`home.js`), Coleções (`collections.js`), Sentimentos (`sentiments.js` / `sentiment.js`) e Busca (`search-overlay.js`) dispara uma nova consulta `getDocs` completa na coleção `poems` do Firestore, gerando leituras redundantes e latência desnecessária.
  - Em `src/styles/components.css`, `.font-family-sans` define `'Inter'` e `.font-family-hand` define `'Caveat'`, mas nenhuma dessas fontes está declarada em `variables.css` ou `public/fonts/`, causando fallback inconsistente.
  - Em `src/pages/sentiments.js` (linha 101), o badge usa `color: var(--accent)` (variável inexistente) e estilos inline sem feedback visual de hover.
  - Em `src/components/header.js`, listeners de `scroll`, `resize` e `touch` continuam ativos para manipular `.site-header` e `.main-nav` mesmo com `.site-header` oculto permanentemente, enquanto páginas internas no desktop ficam sem a assinatura superior `#mobile-brand`.
  - Em `src/router.js` (linha 80), `window.scrollTo(0, 0)` é executado incondicionalmente até mesmo em eventos `popstate` (botão Voltar), fazendo o leitor perder sua posição na lista de poemas.

- **Impacto de não fazer:**
  - Consumo elevado de leituras no Firestore por sessão e re-renderizações com skeleton em trocas de aba.
  - Seletores de fonte de leitura quebrados, badges de sentimentos sem a cor de destaque do tema e perda de contexto de rolagem ao voltar de um poema para a lista.

- **Para quem é destinado:**
  - Leitores do site (melhor fluidez de navegação, tipografia consistente e restauração de rolagem) e autor/administrador (redução de leituras no Firestore e código mais limpo).

- **História de usuário:**
  - Como leitor, quero navegar entre a lista de poemas, coleções, sentimentos e busca de forma instantânea, com posições de rolagem preservadas ao voltar e opções tipográficas funcionais, para ter uma leitura fluida e sem interrupções.

- **Como saberemos que deu certo:**
  - Navegações subsequentes na mesma sessão reutilizam o cache de `poems-store.js` realizando apenas 1 leitura no Firestore para a lista de poemas publicados.
  - 100% da suíte de testes existentes e novos passa no `vitest --run` com 0 erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Criar `src/utils/poems-store.js` com `getPublishedPoems()`, deduplicação de chamadas simultâneas e `invalidatePoemsCache()` | P0 | CA01, CA02 |
| RF02 | Integrar `getPublishedPoems()` em `home.js`, `collections.js`, `sentiments.js`, `sentiment.js`, `search-overlay.js`, `filter-chips.js` e `navigation.js`, e chamar `invalidatePoemsCache()` nas mutações de `poems` no admin (`src/pages/admin/data.js`) | P0 | CA01, CA02 |
| RF03 | Corrigir `.font-family-sans` e `.font-family-hand` em `src/styles/components.css` usando fontes disponíveis no projeto | P0 | CA03 |
| RF04 | Substituir `var(--accent)` por `var(--accent-subtle)` e mover estilos inline dos cards de `src/pages/sentiments.js` para `src/styles/components.css` | P0 | CA04 |
| RF05 | Remover listeners ociosos em `src/components/header.js` e permitir exibição de `.mobile-brand` no desktop em páginas internas | P1 | CA05 |
| RF06 | Salvar e restaurar a posição `scrollY` por caminho em navegações `popstate` no `src/router.js` | P1 | CA06 |
| RF07 | Adicionar `text-wrap: balance` aos títulos principais em `src/styles/global.css` e `src/styles/components.css` | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Reduzir a 1 única requisição Firestore (`getDocs`) de poemas publicados quando chamadas concorrentes ou sequenciais ocorrerem dentro do TTL de 5 minutos | P0 | CA01 |
| RNF02 | Preservar 100% de compatibilidade com os 33 arquivos de teste existentes no Vitest | P0 | CA08 |

### Dependências técnicas

- `src/utils/firebase.js`, `src/router.js`, `src/pages/home.js`, `src/pages/collections.js`, `src/pages/sentiments.js`, `src/pages/sentiment.js`, `src/components/search-overlay.js`, `src/components/filter-chips.js`, `src/utils/navigation.js`, `src/pages/admin/data.js`, `src/components/header.js`, `src/styles/global.css`, `src/styles/components.css`.

### Recursos necessários

- Ambiente Node.js local e suíte de testes Vitest.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que o cache de `poems-store.js` está ativo, quando múltiplas páginas ou componentes solicitam `getPublishedPoems()` sequencialmente ou em paralelo, então apenas uma consulta ao Firestore é executada e os poemas retornam ordenados por `published_at` decrescente.
- [x] **CA02:** Dado que os poemas publicados estão em cache, quando `invalidatePoemsCache()` é chamado (ou uma obra é criada, atualizada ou removida no Admin), então a próxima chamada a `getPublishedPoems()` consulta novamente o Firestore.
- [x] **CA03:** Dado que o leitor altera a tipografia de leitura para `Sans` ou `Manuscrita`, quando as classes `.font-family-sans` ou `.font-family-hand` são aplicadas, então `.font-family-sans` utiliza `var(--font-ui)` e `.font-family-hand` utiliza `'Merriweather', 'Cormorant Garamond', Georgia, serif` em itálico, sem depender de fontes externas ausentes.
- [x] **CA04:** Dado que o leitor acessa `/sentimentos/`, quando os cards de sentimentos são renderizados, então utilizam classes CSS dedicadas (`.sentiment-card`, `.sentiment-name`, `.sentiment-badge`) com `var(--accent-subtle)` e sem referência à variável inexistente `var(--accent)`.
- [x] **CA05:** Dado que o usuário acessa uma página interna no desktop ou mobile, quando a página é renderizada, então `#mobile-brand` permanece visível nas páginas internas e oculto na Home (`/`), e `header.init()` não registra listeners de rolagem/redimensionamento desnecessários para o header oculto.
- [x] **CA06:** Dado que o usuário rolou uma página (ex.: `/`) até uma posição `Y > 0` e navegou para um poema via `navigateTo`, quando retorna via evento `popstate` (botão Voltar), então a rolagem é restaurada para a posição `Y` anterior daquela rota; e quando navega para uma nova rota via `navigateTo`, a página rola para o topo `(0, 0)`.
- [x] **CA07:** Dado que títulos de poemas e cabeçalhos são exibidos, quando o CSS é carregado, então os seletores de título possuem `text-wrap: balance`.
- [x] **CA08:** Dado que todas as alterações foram aplicadas, quando `npm test -- --run` é executado, então 100% dos testes unitários e de integração passam sem erros.

## O que a atividade não inclui

- Novas features de produto (Favoritos/Minha Antologia, Playlist de áudio, Busca com histórico, Navegação sequencial por coleção): motivo: o usuário solicitou focar exclusivamente na melhoria técnica e nas correções apontadas.
- Alteração no modelo de dados do Firestore ou nas regras de segurança (`firestore.rules`): motivo: o cache ocorre inteiramente no cliente sobre a estrutura atual.

### Considerado para o futuro (P2)

- Persistência opcional do cache de poemas em `IndexedDB` ou `sessionStorage` para hidratação entre recarregamentos de aba.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Como evitar que o cache em memória interfira em testes legados que alteram mocks entre casos de teste? | dev | Não | Por padrão, o cache em memória fica ativo em produção/navegador e pode ser controlado explicitamente via `setPoemsCacheEnabled(true)` nos testes unitários do store. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Cache e deduplicação em `poems-store.js` | unit | CA01 | Habilitar cache, chamar `getPublishedPoems()` duas vezes seguidas e duas vezes em paralelo | `getDocs` do Firestore é chamado apenas 1 vez e retorna lista ordenada |
| CT02 | Invalidação de cache em `poems-store.js` | unit | CA02 | Popular cache, chamar `invalidatePoemsCache()` e chamar `getPublishedPoems()` novamente | `getDocs` é chamado uma segunda vez |
| CT03 | Fontes de leitura e `text-wrap: balance` no CSS | unit | CA03, CA07 | Inspecionar `src/styles/components.css` e `src/styles/global.css` | `.font-family-sans` usa `var(--font-ui)`, `.font-family-hand` usa `Merriweather` itálico, e títulos possuem `text-wrap: balance` |
| CT04 | Estilização sem `var(--accent)` em `/sentimentos/` | unit | CA04 | Renderizar `sentiments.render(container)` e verificar classes e estilos | Cards possuem `.sentiment-card` e `.sentiment-badge`, sem `var(--accent)` inline |
| CT05 | Restauração de rolagem no `router.js` em `popstate` | unit | CA06 | Simular scroll em `/`, navegar com `navigateTo('/sobre/')` e disparar `popstate` de volta para `/` | `navigateTo` faz `scrollTo(0, 0)` e `popstate` restaura o `scrollY` salvo |
| CT06 | Regressão completa da suíte | integração | CA05, CA08 | Executar `vitest --run` | Todos os arquivos de teste passam com 0 falhas |

## URL Complementar

- Documentação técnica: `GEMINI.md` (Fluxo SDD)
- Protótipo / mockup: N/A — correções técnicas e de consistência visual existentes.
- Discussões relacionadas: Revisão arquitetural e de layout realizada na conversa atual.
- Referências de design: `src/styles/variables.css` e `src/styles/components.css`.
- Requisitos originais: Solicitação direta do usuário ("fazer a melhoria técnica só e as correções").
- Issue / PR relacionado: N/A.
