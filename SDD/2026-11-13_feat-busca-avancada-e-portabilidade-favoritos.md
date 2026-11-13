# [FEAT] Busca avançada com filtros combináveis e portabilidade de favoritos

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Aprimorar a experiência de descoberta em [`src/components/search-overlay.js`](../src/components/search-overlay.js) com filtros combináveis (coleção, sentimento, faixa de tamanho/tempo de leitura e filtro *"Com narração em áudio"*) e evoluir [`src/pages/favorites.js`](../src/pages/favorites.js) com busca interna e exportação/importação portável dos favoritos (link compartilhável por query/hash ou arquivo `.json`).
- **Problema e evidência:**
  1. Com mais de 200 poemas catalogados (como indicado em [`src/utils/about-template.js`](../src/utils/about-template.js)), [`src/components/search-overlay.js`](../src/components/search-overlay.js) oferece apenas busca textual simples e ordenação (`relevance`/`recent`), sem filtrar por poemas com áudio narrado (`audio_url`), coleção ou extensão curta/média/longa.
  2. Os favoritos salvos em [`src/utils/favorites.js`](../src/utils/favorites.js) residem apenas no `localStorage` do navegador local: se o leitor limpar dados do site ou trocar de celular, perde toda a sua seleção pessoal em [`/favoritos/`](../src/pages/favorites.js).
- **Impacto de não fazer:** Poemas com narração em áudio ficam difíceis de descobrir em bloco; leitores que acumulam dezenas de favoritos perdem sua antologia pessoal ao trocar de dispositivo.
- **Para quem é destinado:** Leitores frequentes buscando poemas sob medida (ex.: *"poemas curtos sobre tempo com áudio"*) e usuários que alternam entre celular e computador.
- **História de usuário:** Como leitor assíduo, quero filtrar poemas combinando tema, tamanho e disponibilidade de áudio na busca, e conseguir exportar ou levar minha lista de favoritos para outro navegador sem precisar criar conta, para explorar melhor o acervo e não perder minhas escolhas.
- **Como saberemos que deu certo:** Busca suporta filtros combinados mantendo resposta `< 100ms` sobre o cache local e estado refletido na URL; exportar e importar favoritos entre dois navegadores restaura 100% dos poemas publicados válidos sem sobrescrever duplicatas.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Adicionar barra colapsável/discreta de filtros em [`src/components/search-overlay.js`](../src/components/search-overlay.js): Coleção, Sentimento, Tamanho (`curto` <= 15 versos, `médio` 16–35, `longo` > 35), e toggle **"Apenas com narração em áudio"** (`Boolean(poem.audio_url)`), permitindo buscar apenas pelos filtros mesmo sem termo textual digitado. | P0 | CA01, CA02 |
| RF02 | Sincronizar filtros ativos da busca com parâmetros de URL (`?q=`, `&col=`, `&sent=`, `&tam=`, `&audio=1`) de forma compatível com [`src/router.js`](../src/router.js) e restaurável via link/histórico. | P1 | CA03 |
| RF03 | Exibir selo sutil de áudio (`🔊`) nos resultados da busca e listas quando `poem.audio_url` existir. | P1 | CA02 |
| RF04 | Em [`src/pages/favorites.js`](../src/pages/favorites.js), adicionar campo rápido de filtro/busca dentro dos favoritos (visível quando houver `>= 5` salvos) e ações **"Exportar / Copiar link da lista"** + **"Importar favoritos"**. | P0 | CA04, CA05 |
| RF05 | Implementar em [`src/utils/favorites.js`](../src/utils/favorites.js) funções puras `exportFavoritesJson()`, `encodeFavoritesShareParam()` / `decodeFavoritesShareParam()` e `mergeFavorites(slugs)` (mescla sem duplicar e ignora slugs inválidos/não publicados). | P0 | CA05, CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A filtragem combinada em memória para 300+ poemas deve executar em `< 50ms` na thread principal sem consultas adicionais ao Firestore. | P0 | CA01 |
| RNF02 | A importação via link ou JSON deve validar rigorosamente o formato (máximo 500 slugs, regex `^[a-z0-9-]+$`) antes de gravar no `localStorage`, ignorando payloads malformados com aviso claro. | P0 | CA06, CA07 |
| RNF03 | `/favoritos/?import=...` continua marcando `noindex, nofollow` e nunca dispara escrita no Firestore. | P0 | CA05 |

### Dependências técnicas

- [`src/components/search-overlay.js`](../src/components/search-overlay.js), [`src/utils/html.js`](../src/utils/html.js) (`normalizeForSearch`), [`src/utils/poems-store.js`](../src/utils/poems-store.js).
- [`src/utils/favorites.js`](../src/utils/favorites.js) e [`src/pages/favorites.js`](../src/pages/favorites.js).
- [`src/data/collections.js`](../src/data/collections.js) e [`src/data/sentiments.js`](../src/data/sentiments.js).

### Recursos necessários

- N/A — dados já carregados em memória pelo cache de poemas publicados.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o overlay de busca aberto, quando seleciono o filtro "Com narração em áudio" e tamanho "Curto" sem digitar termo textual, então são listados apenas poemas publicados que atendem simultaneamente aos dois critérios.
- [ ] **CA02:** Dado uma busca combinando termo `"luz"` + sentimento `"amor"`, quando os resultados renderizam, então exibem somente poemas que contêm `"luz"` (sem acento) e a tag correspondente, mostrando ícone de áudio nos que possuem `audio_url`.
- [ ] **CA03:** Dado uma URL aberta com `/?q=tempo&audio=1` (ou filtros na URL), quando a SPA inicializa, então o overlay restaura os filtros selecionados e exibe os resultados filtrados.
- [ ] **CA04:** Dado que tenho 6 poemas favoritados e digito um termo na busca interna de `/favoritos/`, quando filtro, então apenas os favoritos correspondentes permanecem visíveis sem alterar os dados salvos.
- [ ] **CA05:** Dado que exporto meus 4 favoritos como JSON ou link `/favoritos/?import=...` e abro em outro navegador que já tinha 1 favorito diferente, quando confirmo a importação, então a lista mesclada passa a conter os 5 poemas únicos válidos.
- [ ] **CA06:** Dado um arquivo JSON ou parâmetro `?import=` contendo slugs inexistentes, rascunhos ou caracteres inválidos (`<script>`), quando tento importar, então os itens inválidos são descartados e apenas slugs publicados válidos são adicionados (ou exibe erro se nada for válido).
- [ ] **CA07:** Dado que o usuário clica em "Limpar filtros" na busca, quando acionado, então todos os selects/toggles retornam ao padrão e a URL é limpa mantendo o foco no campo de busca.

## O que a atividade não inclui

- Busca semântica por embeddings / IA vetorial externa: motivo: exigiria API externa paga ou modelo pesado no cliente, enquanto busca léxica + filtros já atende ao volume atual.
- Contas de usuário com sincronização automática em nuvem: motivo: decisão arquitetural de manter leitura 100% anônima sem login.

### Considerado para o futuro (P2)

- Coleções personalizadas locais ("Estantes/Pastas" criadas pelo leitor dentro de `/favoritos/`).

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Os filtros combináveis na busca devem ficar visíveis por padrão ou recolhidos atrás de um botão "Filtros" para preservar o visual minimalista do overlay? | design | Não | |
| D02 | Os critérios de tamanho (`curto`/`médio`/`longo`) fazem mais sentido por número de versos (`<= 15`, `16–35`, `> 35`) ou por tempo de leitura estimado (`<= 1 min`, `2 min`, `3+ min`)? | PO/design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Filtragem combinada multi-critério | unit | CA01, CA02, CA07 | Testar motor de busca/filtro com conjunto mockado variando áudio, versos, coleção e tags | Interseção exata retornada; limpar filtros restaura conjunto completo |
| CT02 | Sincronia com URL | integração (jsdom) | CA03 | Abrir overlay com `window.location.search = '?q=mar&audio=1'` | Input e checkbox inicializam marcados e resultados filtrados |
| CT03 | Busca interna em `/favoritos/` | integração (jsdom) | CA04 | Renderizar 6 favoritos e simular input no filtro local | Lista visível reduzida sem chamar `removeFavorite` |
| CT04 | Exportar, mesclar e validar importação | unit | CA05, CA06 | Gerar export JSON e share param, mesclar com lista existente e injetar slugs inválidos/`<script>` | Mescla sem duplicatas, descarta inválidos e mantém `noindex` |

## URL Complementar

- Documentação técnica: [`src/components/search-overlay.js`](../src/components/search-overlay.js), [`src/utils/favorites.js`](../src/utils/favorites.js), [`src/pages/favorites.js`](../src/pages/favorites.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-09-23_busca-por-url.md`](DONE/2026-09-23_busca-por-url.md), [`SDD/DONE/2026-09-23_busca-sem-acentos.md`](DONE/2026-09-23_busca-sem-acentos.md), [`SDD/DONE/2026-11-10_feat-favoritos-poemas.md`](DONE/2026-11-10_feat-favoritos-poemas.md)
- Referências de design: N/A
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
