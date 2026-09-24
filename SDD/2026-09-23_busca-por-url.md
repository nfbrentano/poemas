# [FEAT] Busca acessível pela URL (`?q=`) e links de busca compartilháveis

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer a home abrir a busca já preenchida quando a URL tiver `?q=termo`, e manter a URL sincronizada com o termo digitado no overlay de busca.
- **Por que é necessário:** A home publica um JSON-LD `WebSite` com `SearchAction` apontando para `https://nfgbrentano.art.br/?q={search_term_string}`, mas nenhum código lê o parâmetro `q`. Na prática, o Google (sitelinks search box) e qualquer link compartilhado com `?q=` caem na home sem busca. Hoje também não dá para compartilhar ou favoritar uma busca, e o botão "voltar" não fecha o overlay.
- **Qual valor será agregado:** O dado estruturado passa a corresponder ao comportamento real do site, buscas podem ser compartilhadas ("poemas sobre saudade") e a navegação fica previsível.
- **Para quem é destinado:** Leitores, mecanismos de busca e o autor, que pode divulgar links de busca.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Ao carregar `/?q=termo`, abrir o `searchOverlay` com o input preenchido e os resultados exibidos.
- RF02: Ao digitar no overlay (depois do debounce), atualizar a URL com `history.replaceState` para `?q=termo`, preservando os outros parâmetros (ex.: `tags`).
- RF03: Ao fechar o overlay ou limpar o campo, remover `q` da URL.
- RF04: O botão "voltar" do navegador com o overlay aberto deve fechá-lo em vez de sair da página (empilhar um estado ao abrir).
- RF05: O termo vindo da URL deve ser tratado como texto (sem injeção de HTML).

### Requisitos não-funcionais

- RNF01: Não criar uma entrada de histórico por tecla digitada (usar `replaceState` durante a digitação).
- RNF02: Termos com menos de 2 caracteres continuam não disparando busca (regra atual).

### Dependências técnicas

- `src/components/search-overlay.js`, `src/pages/home.js`, `src/router.js` (repasse de `searchParams` já existe)

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o link `/?q=saudade`, quando a página carrega, então o overlay abre com "saudade" no campo e os resultados correspondentes.
- [ ] **CA02:** Dado o overlay aberto, quando digito "mar", então a URL passa a ter `?q=mar` sem nova entrada no histórico por caractere.
- [ ] **CA03:** Dado o overlay aberto, quando pressiono "voltar" no navegador, então o overlay fecha e continuo na mesma página.
- [ ] **CA04:** Dado `/?q=<img src=x onerror=alert(1)>`, quando a página carrega, então nenhum script é executado e o texto aparece literalmente no campo.

## O que a atividade não inclui

- Não inclui busca no servidor ou full-text no Firestore.
- Não inclui a normalização de acentos (ver `2026-09-23_busca-sem-acentos.md`).
- Não inclui uma página dedicada `/busca`.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Deep link | Abrir `/?q=noite` | Overlay aberto com resultados |
| CT02 | Parâmetros combinados | Abrir `/?tags=Amor&q=mar`, fechar o overlay | URL volta a `/?tags=Amor` |
| CT03 | Histórico | Abrir o overlay, digitar 5 letras, voltar | Overlay fechado, sem voltar 5 vezes |
| CT04 | XSS | `?q=` com HTML | Renderizado como texto |
| CT05 | Rich Results Test | Validar a home no teste do Google | `SearchAction` válido |

## URL Complementar

- Código: [src/pages/home.js](../src/pages/home.js) (bloco `website-schema`), [src/components/search-overlay.js](../src/components/search-overlay.js)
- Referência: Google Search Central, "Sitelinks search box"
