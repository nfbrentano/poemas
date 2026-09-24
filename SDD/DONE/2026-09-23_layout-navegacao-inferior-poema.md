# [UI] Página do poema: "Anterior/Próximo" cobre a navegação principal

## Detalhes da Atividade

- **O que precisa ser feito:** Integrar a navegação entre poemas (`.poem-nav`) ao layout mobile sem esconder a barra inferior principal (`.bottom-nav`), e arrumar o empilhamento dos elementos fixos (voltar ao topo e barra de progresso).
- **Por que é necessário:** Isso foi verificado em 375×812: `.poem-nav` é `position: fixed; bottom: 0; z-index: 1000` com cerca de 69px de altura, e aparece por cima da `.bottom-nav` (56px). Enquanto ela está visível, o leitor perde o acesso a Poemas, Coleções, Buscar e Sobre. O `.nav-btn` tem `margin-bottom: 48px` dentro de uma barra fixa, e o botão "voltar ao topo" flutua a 16px da barra, ocupando o canto em que fica o "Próximo →". Em um poema sem anterior, a barra mostra só um botão solto à esquerda.
- **Qual valor será agregado:** Navegação previsível: o menu principal é sempre acessível e passar de um poema para o outro fica natural no polegar.
- **Para quem é destinado:** Leitores no celular que leem vários poemas em sequência.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: No mobile, **não fixar** "Anterior/Próximo". Renderizá-los como um bloco no fim do poema (antes do compartilhamento), em duas colunas: "← título anterior" e "próximo título →", cada um com o título completo em até 2 linhas.
- RF02: Como alternativa aceitável, manter a barra fixa, mas posicioná-la **acima** da `.bottom-nav` (`bottom: calc(56px + safe-area)`), com menos de 48px de altura e visível só perto do fim do poema.
- RF03: Remover o `margin-bottom: var(--space-xl)` do `.nav-btn` no contexto da barra.
- RF04: Esconder o "voltar ao topo" na página do poema no mobile (poemas são curtos, e a barra de progresso já dá orientação), ou posicioná-lo sem sobrepor nenhum botão.
- RF05: Quando só houver um lado (primeiro ou último poema), o bloco deve ocupar a largura com o alinhamento correto, sem espaço vazio estranho.
- RF06: Manter o gesto de swipe e as setas do teclado (já existentes) funcionando.

### Requisitos não-funcionais

- RNF01: Definir uma escala de `z-index` em `variables.css` (ex.: `--z-nav`, `--z-overlay`, `--z-modal`, `--z-toast`) e usá-la nos elementos fixos, em vez de valores soltos (990, 1000, 3000).
- RNF02: O `padding-bottom` do conteúdo deve considerar a soma real dos elementos fixos, para nada ficar escondido atrás deles.

### Dependências técnicas

- `src/pages/poem.js` (`.poem-nav`, lógica `showedNext` no scroll), `src/components/back-to-top.js`, `src/styles/components.css`, `src/styles/variables.css`

### Recursos necessários

- Decisão do autor entre RF01 (bloco no fim) e RF02 (barra acima da navegação).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado qualquer ponto de rolagem na página do poema no celular, quando olho a base da tela, então os 4 itens da barra inferior estão visíveis e tocáveis.
- [ ] **CA02:** Dado o fim do poema, quando vejo a navegação, então aparecem os títulos do anterior e do próximo, tocáveis com pelo menos 44px de altura.
- [ ] **CA03:** Dado o primeiro poema publicado, quando chego ao fim, então só aparece "Próximo", sem espaço vazio.
- [ ] **CA04:** Dado o celular, quando rolo até o fim, então nenhum elemento fixo cobre texto ou botões.

## O que a atividade não inclui

- Não inclui mudar o critério de ordem (cronológica) do anterior/próximo.
- Não inclui poemas relacionados (ver `2026-09-23_poema-sentimentos-colecoes-relacionados.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Sobreposição | 375px, rolar até o fim | `.bottom-nav` visível |
| CT02 | Títulos longos | Poema com um vizinho de título de 60 caracteres | Quebra em 2 linhas com reticências |
| CT03 | Extremos | Primeiro e último poema | Um só botão, bem alinhado |
| CT04 | iPhone com notch | Safari iOS | Respeita a safe area |
| CT05 | Swipe | Deslizar para a esquerda no texto | Vai para o próximo |

## URL Complementar

- Código: [src/styles/components.css](../src/styles/components.css) (`.poem-nav`, `.nav-btn`, `.back-to-top-btn`, `.bottom-nav`), [src/pages/poem.js](../src/pages/poem.js)
