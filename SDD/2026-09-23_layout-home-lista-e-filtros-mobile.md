# [UI] Home no mobile: alvos de toque da lista e filtros de sentimentos

## Detalhes da Atividade

- **O que precisa ser feito:** Revisar o layout da lista de poemas e dos chips de sentimentos da home (e de `/colecoes`) para o uso com o polegar.
- **Por que é necessário:** Isso foi medido em 375×812:
  - Cada item da lista (`.poem-row-link`) tem **26,6px de altura**, abaixo do mínimo de 44px recomendado, e isso em 229 itens seguidos, o que causa toques errados.
  - A página tem **cerca de 26.600px** de altura. O newsletter, o "Poema aleatório" e o rodapé ficam no fim.
  - São 20 chips de sentimentos em uma faixa horizontal (`scrollWidth` de 2.229px em uma área de 257px). Só 2 aparecem ("Amor", "Sentimentos"), sem nenhuma indicação de que há mais para o lado.
  - O botão "Todos" fica fora da área rolável e ocupa espaço fixo.
- **Qual valor será agregado:** Navegação mais precisa e descoberta dos sentimentos, que hoje ficam escondidos.
- **Para quem é destinado:** Leitores no celular.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Área de toque de cada item da lista com pelo menos 44px (via `padding` vertical no link), mantendo a estética minimalista.
- RF02: Em cada item, o título pode ocupar até 2 linhas, com o ano alinhado à direita na primeira linha.
- RF03: Os chips devem indicar que rolam, com um gradiente de fade na borda direita e `scroll-snap`. Como alternativa, exibir 2 linhas de chips com quebra e um chip "+ mais" que expande.
- RF04: O chip "Todos" deve fazer parte da mesma faixa rolável.
- RF05: O chip ativo deve rolar automaticamente para ficar visível quando a página abrir com `?tags=`.
- RF06: A extensão total da home é tratada em `2026-09-23_home-paginacao-lista.md`, que é pré-requisito para o RF01 não aumentar ainda mais a página.

### Requisitos não-funcionais

- RNF01: Chips com pelo menos 36px de altura visual e 44px de área de toque.
- RNF02: Sem barra de rolagem visível nos chips (`scrollbar-width: none`), sem prejuízo para o teclado (setas e Tab).

### Dependências técnicas

- `src/pages/home.js`, `src/components/filter-chips.js`, `src/styles/components.css` (`.poem-row*`, `.filter-chip*`)
- Pré-requisito: `2026-09-23_home-paginacao-lista.md`

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado a lista no celular, quando meço cada link, então ele tem ≥ 44px de altura.
- [ ] **CA02:** Dado a faixa de chips, quando a página carrega, então há uma pista visual de que existem mais chips à direita.
- [ ] **CA03:** Dado `/?tags=Saudade`, quando a página abre, então o chip "Saudade" está visível e marcado.
- [ ] **CA04:** Dado um leitor de teclado, quando navego com Tab pelos chips, então todos são alcançáveis e a faixa rola até o foco.

## O que a atividade não inclui

- Não inclui a paginação da lista (outra especificação).
- Não inclui mudar o destaque (`.poem-featured`) nem o "poema do dia".

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Alvo de toque | DevTools 375px: medir `.poem-row-link` | ≥ 44px |
| CT02 | Título longo | Poema com título de 50 caracteres | 2 linhas, ano alinhado |
| CT03 | Chips | Carregar a home | Fade na borda direita |
| CT04 | Chip ativo | `/?tags=<último chip>` | Chip rolado para a vista |
| CT05 | Coleções | `/colecoes` no mobile | Mesmo comportamento dos chips |

## URL Complementar

- Código: [src/pages/home.js](../src/pages/home.js), [src/components/filter-chips.js](../src/components/filter-chips.js), [src/styles/components.css](../src/styles/components.css)
- Referência: WCAG 2.2, critério 2.5.8 (Target Size) e Apple HIG (44pt)
