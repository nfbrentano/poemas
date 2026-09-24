# [UI] Recolocar no mobile os controles que sumiram com o cabeçalho oculto

## Detalhes da Atividade

- **O que precisa ser feito:** Dar um lugar no layout mobile para os controles que só existem no cabeçalho: **troca de tema** (escuro, claro, sépia, alto contraste), **poema aleatório** e a identidade do site (nome "Natanael Brentano").
- **Por que é necessário:** O commit `eb077c4` escondeu o `.site-header` abaixo de 768px (`display: none !important`), o que foi uma decisão consciente para ganhar espaço de leitura. O efeito colateral, verificado em 375×812, é que `#mode-toggle` e `#random-poem-btn` ficam com 0×0 e não há outro caminho para eles no celular. O leitor não consegue sair do tema escuro nem ativar o alto contraste (acessibilidade), e o "Aleatório" só aparece no fim da home, depois de cerca de 26.000px de rolagem. Também não há nenhuma indicação de marca no topo das páginas.
- **Qual valor será agregado:** Temas de leitura (o sépia e o claro são importantes para ler de dia) e descoberta aleatória voltam a estar ao alcance do polegar, sem trazer o cabeçalho de volta.
- **Para quem é destinado:** Leitores no celular, especialmente quem depende do alto contraste ou prefere o fundo claro.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Manter o cabeçalho oculto no mobile (respeitando a decisão do commit `eb077c4`).
- RF02: Adicionar a troca de tema em um local acessível no mobile. Opções, em ordem de preferência:
  1. dentro do painel de leitura da página do poema (ver `2026-09-23_layout-barra-de-leitura-poema.md`), mais um item na página "Sobre";
  2. ou um 5º item "Ajustes" na barra inferior, abrindo uma folha (bottom sheet) com tema e aleatório.
- RF03: Oferecer o "Poema aleatório" no mobile em um ponto visível, por exemplo como ação no painel da opção 2 ou como link logo abaixo do "poema do dia".
- RF04: Mostrar a identidade do site de forma discreta no topo das páginas internas (ex.: "Natanael Brentano" em versalete pequeno, não fixo, rolando junto com o conteúdo).
- RF05: O controle de tema deve exibir o nome do tema atual por extenso ("Tema: Sépia"), e não só um ícone que alterna entre 4 estados.

### Requisitos não-funcionais

- RNF01: Sem aumentar a área fixa da tela: a barra inferior continua com 56px mais a safe area.
- RNF02: Alvos de toque com pelo menos 44×44px.
- RNF03: A lógica de tema deve continuar centralizada em `theme-toggle.js`, sem duplicar o estado.

### Dependências técnicas

- `src/components/header.js`, `src/components/theme-toggle.js`, `src/main.js` (barra inferior), `src/styles/global.css`, `src/styles/components.css`
- Relacionada a `2026-09-23_layout-barra-de-leitura-poema.md`

### Recursos necessários

- Decisão do autor entre as opções 1 e 2 do RF02.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o celular (375px), quando quero mudar para sépia, então consigo em no máximo 2 toques a partir de qualquer página.
- [ ] **CA02:** Dado o celular, quando procuro "Aleatório", então encontro o botão sem rolar até o fim da home.
- [ ] **CA03:** Dado que troquei o tema no mobile, quando abro o site no desktop do mesmo navegador, então o tema é o mesmo (mesma chave `site-mode`).
- [ ] **CA04:** Dado o desktop (≥ 769px), quando abro o site, então o cabeçalho continua como hoje.

## O que a atividade não inclui

- Não inclui reexibir o cabeçalho completo no mobile.
- Não inclui criar temas novos.
- Não inclui mudar o menu hambúrguer do desktop ou do tablet.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Tema no mobile | 375px → ponto de acesso escolhido → Sépia | Tema aplicado e salvo |
| CT02 | Alto contraste | Ativar pelo mobile | `data-high-contrast="true"` no `<html>` |
| CT03 | Aleatório | Tocar em Aleatório no mobile | Abre um poema |
| CT04 | Leitor de tela | VoiceOver no controle de tema | Anuncia o tema atual |
| CT05 | Desktop | 1280px | Cabeçalho intacto |

## URL Complementar

- Commit de referência: `eb077c4` ("hide site header and update mobile content padding")
- Código: [src/components/header.js](../src/components/header.js), [src/components/theme-toggle.js](../src/components/theme-toggle.js), [src/main.js](../src/main.js)
