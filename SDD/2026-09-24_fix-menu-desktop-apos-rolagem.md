# [FIX] Menu do cabeçalho desktop para de funcionar após rolar a página

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir o menu de navegação do cabeçalho na versão desktop (`.site-header`, largura > 768px). Hoje ele só funciona com a página na posição inicial (`scrollY = 0`). Depois que o usuário rola a página, os itens do menu (Poemas, Coleções, Sobre) e os controles do cabeçalho (busca, Aleatório, alternar tema) deixam de responder ao clique.
- **Por que é necessário:** O cabeçalho é `position: sticky` e continua visível durante a rolagem, então o usuário espera poder usá-lo a qualquer momento. Um menu que aparece mas não responde passa a impressão de site quebrado e obriga o usuário a voltar ao topo para navegar.
- **Qual valor será agregado:** A navegação desktop fica consistente em qualquer posição de rolagem. Isso reduz o atrito para trocar de página, melhora a percepção de qualidade e evita que o usuário abandone o site.
- **Para quem é destinado:** Leitores que acessam o site em desktop ou notebook (viewport > 768px).

### Contexto técnico (levantamento inicial)

- Componente: [`src/components/header.js`](../src/components/header.js). O listener de `scroll` alterna a classe `.scrolled` no `.site-header` quando `window.scrollY > 10`.
- Estilos:
  - [`src/styles/global.css`](../src/styles/global.css): `.site-header` com `position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px)`, e `.site-header.scrolled`, que muda `background-color`, `border-bottom-color` e `opacity: 0.98`.
  - [`src/styles/components.css`](../src/styles/components.css): `.nav-overlay` (fixed, `z-index: 998`), `.menu-toggle` (`z-index: 1001`) e o drawer mobile (`.main-nav` fixed, só em `max-width: 768px`).
- Elementos fixos que podem sobrepor o cabeçalho ao rolar: `.scroll-progress-container` (fixed, `z-index: 1000`, com `pointer-events: none`), `.poem-nav` (`z-index: var(--z-nav)`), botão "voltar ao topo" (`back-to-top.js`), `search-overlay` e `immersive-reader`.
- Hipóteses a investigar:
  1. Um elemento fixo ou transparente passa a cobrir a área do cabeçalho depois da rolagem, com `z-index` maior e sem `pointer-events: none`.
  2. `opacity: 0.98` na classe `.scrolled`, junto com `backdrop-filter`, cria um novo *stacking context*. Com isso, o cabeçalho (`z-index: 100`) pode ficar abaixo de outros elementos da página.
  3. Estado residual do menu mobile: `body.nav-open`, `body.style.overflow = 'hidden'` ou `.nav-overlay.active` não é limpo ao redimensionar de mobile para desktop.
  4. `body` com `overflow: hidden auto` (visto no DOM) faz o `body` virar o contêiner de rolagem em alguns navegadores. Isso pode afetar o `sticky`, o `window.scrollY` e o *hit-testing*.
  5. Diferença entre o build de produção e o dev, ou entre navegadores (Safari/Firefox tratam `sticky` + `backdrop-filter` de formas diferentes).
- Tentativa de reprodução em 2026-09-24: **não foi reproduzido** no servidor de dev (Vite, `localhost:5173`) em Chromium, com viewports 1280×800 e 900×700, nas páginas Home, Coleções, Sobre e Poema. Nesses testes, `document.elementFromPoint` apontou para os próprios links do cabeçalho após rolar, e cliques reais navegaram normalmente. O primeiro passo da implementação é reproduzir o bug no ambiente em que ele ocorre (produção, navegador e resolução usados).

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Os links do menu desktop (Poemas, Coleções, Sobre) devem ser clicáveis e navegar corretamente em qualquer posição de rolagem.
- RF02: Os controles do cabeçalho desktop (busca, Aleatório, alternar tema) devem funcionar em qualquer posição de rolagem.
- RF03: Nenhum elemento sobreposto (overlays, barra de progresso, navegação do poema, botão voltar ao topo) pode interceptar cliques na área do cabeçalho enquanto estiver inativo ou invisível.
- RF04: Ao passar de viewport mobile para desktop (redimensionando a janela), qualquer estado do drawer mobile (`nav-open`, `overflow: hidden`, overlay ativo) deve ser limpo.
- RF05: O efeito visual de rolagem (`.scrolled`: fundo e borda inferior) deve continuar funcionando.

### Requisitos não-funcionais

- RNF01: A correção não pode alterar o comportamento do menu mobile (drawer, gesto de arrastar, ESC e *focus trap*).
- RNF02: O listener de scroll não pode degradar a rolagem: usar `{ passive: true }` e evitar consultar o DOM a cada evento (guardar a referência do cabeçalho).
- RNF03: Manter a acessibilidade: foco visível, navegação por teclado (Tab) nos itens do menu em qualquer posição de rolagem e `aria-expanded` coerente.
- RNF04: A camada (`z-index`) do cabeçalho deve usar os tokens de `src/styles/variables.css` (`--z-nav`, `--z-overlay` etc.) em vez de números soltos, quando a correção envolver camadas.

### Dependências técnicas

- Acesso ao ambiente onde o bug ocorre (URL de produção e navegador/versão usados) para reproduzir antes de corrigir.
- DevTools do navegador (painel Layers / Elements) para identificar qual elemento recebe o clique (`document.elementFromPoint`).

### Recursos necessários

- Servidor de dev (`npm run dev`) e build de produção local (`npm run build && npm run preview`).
- Navegadores desktop: Chrome, Safari e Firefox.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou no desktop (viewport > 768px) na Home, quando rolo a página para baixo e clico em "Coleções" no cabeçalho, então sou levado para `/colecoes`.
- [ ] **CA02:** Dado que estou no desktop lendo um poema com a página rolada até o meio ou o fim, quando clico em "Poemas" ou "Sobre" no cabeçalho, então a navegação acontece normalmente.
- [ ] **CA03:** Dado que estou no desktop com a página rolada, quando clico no botão de busca, em "Aleatório" ou em alternar tema, então a ação correspondente é executada.
- [ ] **CA04:** Dado que abri o menu mobile e depois redimensionei a janela para desktop, quando rolo a página e clico em um item do menu, então o clique funciona e a página não fica com rolagem travada.
- [ ] **CA05:** Dado que estou no desktop com a página rolada, quando inspeciono o centro de cada item do menu com `document.elementFromPoint`, então o elemento retornado é o próprio item (ou um filho dele).
- [ ] **CA06:** Dado que estou no desktop, quando rolo mais de 10px, então o cabeçalho continua ganhando fundo e borda (`.scrolled`) como antes.
- [ ] **CA07:** Dado que estou no mobile (viewport ≤ 768px), quando uso o drawer (abrir, fechar, ESC, arrastar), então o comportamento é o mesmo de antes da correção.

## O que a atividade não inclui

- Redesenho visual do cabeçalho ou do menu (cores, tipografia, espaçamentos).
- Alterações na navegação inferior mobile (`.bottom-nav`) ou na navegação entre poemas (`.poem-nav`), exceto ajustes de `z-index`/`pointer-events` necessários para não bloquearem o cabeçalho.
- Criação de novos itens de menu ou submenus.
- Comportamento de esconder/mostrar o cabeçalho conforme a direção da rolagem.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Menu após rolar na Home | Abrir `/` em 1280×800, rolar ~1000px, clicar em "Coleções" | Navega para `/colecoes` |
| CT02 | Menu após rolar no poema | Abrir `/poema/<slug>`, rolar até o fim (barra de progresso e `.poem-nav` visíveis), clicar em "Sobre" | Navega para `/sobre` |
| CT03 | Controles após rolar | Com a página rolada, clicar em busca, "Aleatório" e alternar tema | Abre a busca, abre um poema aleatório e alterna o tema, respectivamente |
| CT04 | Hit-test automatizado | Rolar a página e rodar `document.elementFromPoint` no centro de cada link do cabeçalho | Retorna o próprio link em todas as páginas (Home, Coleções, Coleção, Poema, Sobre) |
| CT05 | Transição mobile → desktop | Em 375px, abrir o drawer; redimensionar para 1280px; rolar e clicar em "Poemas" | Clique funciona; `body` sem `overflow: hidden` e sem `nav-open` |
| CT06 | Build de produção | `npm run build && npm run preview`, repetir CT01–CT03 | Mesmo resultado do dev |
| CT07 | Navegadores | Repetir CT01–CT03 no Chrome, Safari e Firefox | Funciona em todos |
| CT08 | Larguras intermediárias | Repetir CT01 em 769px, 1024px e 1440px | Funciona em todas as larguras |
| CT09 | Teclado | Com a página rolada, usar Tab até os itens do menu e pressionar Enter | Foco visível e navegação funcionando |
| CT10 | Regressão mobile | Em 375px, abrir/fechar o drawer por botão, overlay, ESC e gesto de arrastar | Comportamento inalterado |

## URL Complementar

- Documentação técnica: [MDN — Stacking context](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context), [MDN — position: sticky](https://developer.mozilla.org/pt-BR/docs/Web/CSS/position#sticky_positioning)
- Protótipo / mockup: N/A — correção de comportamento, sem mudança visual.
- Discussões relacionadas: specs anteriores de layout em `SDD/DONE/` (ex.: `2026-09-23_layout-controles-mobile-sem-cabecalho.md`, `2026-09-23_layout-barra-de-leitura-poema.md`, `2026-09-23_layout-navegacao-inferior-poema.md`), que introduziram elementos fixos que podem sobrepor o cabeçalho.
- Referências de design: N/A — mantém o design atual do cabeçalho.
- Requisitos originais: relato do usuário em 2026-09-24: "ao rolar a página ele [o menu desktop] para de funcionar, só funciona se a página está na posição inicial".
