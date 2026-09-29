# [UI] Ocultar nome do autor no cabeçalho desktop ao rolar a página

> **Status:** Concluída  
> **Autor:** Natanael Brentano / Antigravity · **Revisor:** Natanael Brentano · **Criada em:** 2026-09-29 · **Atualizada em:** 2026-09-29

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer com que o nome do autor ("Natanael Brentano") posicionado no cabeçalho superior na versão desktop (`viewport > 768px`) desapareça suavemente com transição de opacidade ao rolar a página para baixo, reaparecendo quando o usuário retornar ao topo (`scrollY = 0`).
- **Problema e evidência:** Após a implementação da barra inferior fixa (`.bottom-nav`), todas as ações de navegação e ajustes estão acessíveis no rodapé. Manter o nome do autor fixo no topo durante toda a rolagem ocupa espaço visual e pode dispersar a atenção durante a leitura contínua dos poemas.
- **Impacto de não fazer:** A área superior da tela continua retendo um elemento fixo durante a leitura longa, reduzindo a sensação de imersão minimalista e editorial do projeto.
- **Para quem é destinado:** Leitores e visitantes que navegam no desktop e notebooks.
- **História de usuário:** Como leitor navegando no desktop, quero que o nome do autor no cabeçalho desapareça suavemente enquanto leio e rolo a página, para ter uma experiência de leitura limpa e focada no conteúdo poético.
- **Como saberemos que deu certo:** Ao rolar a página para baixo (`window.scrollY > 20`), o nome do autor desaparece suavemente com transição de opacidade e desabilita eventos de ponteiro (`pointer-events: none`); ao rolar de volta para o topo da página, o nome reaparece suavemente no canto superior esquerdo.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | No desktop (`> 768px`), quando a página for rolada para baixo (`window.scrollY > 20`), o nome do autor ("Natanael Brentano") no cabeçalho deve transicionar para invisível (`opacity: 0`) e desativar cliques (`pointer-events: none`). | P0 | CA01, CA02 |
| RF02 | Quando o usuário rolar de volta para o topo da página (`window.scrollY <= 20`), o nome do autor deve reaparecer com transição suave (`opacity: 1`, `pointer-events: auto`). | P0 | CA03 |
| RF03 | Quando oculto, o cabeçalho não deve interceptar eventos de ponteiro de elementos que passam por baixo de sua área. | P0 | CA04 |
| RF04 | A barra inferior (`.bottom-nav`) deve continuar 100% visível e interativa, independente da rolagem ou do desaparecimento do nome no topo. | P0 | CA02, CA03 |
| RF05 | O comportamento no mobile (`<= 768px`) deve permanecer inalterado, respeitando a estrutura já consolidada da marca móvel e da barra inferior. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Transição visual suave: animação de opacidade e leve deslocamento sutil (`transform: translateY(-6px)`) de aproximadamente 0.3s com função de easing editorial (`var(--transition-fast)` ou `cubic-bezier(0.16, 1, 0.3, 1)`). | P0 | CA02, CA03 |
| RNF02 | Desempenho: listener de rolagem passivo (`{ passive: true }`), evitando repinturas excessivas ou reflows de layout. | P0 | CA02 |
| RNF03 | Acessibilidade: o link continua presente na árvore de acessibilidade no topo da página com foco acessível via teclado (`Tab`). | P0 | CA01 |

### Dependências técnicas

- Componente de cabeçalho: [`src/components/header.js`](../src/components/header.js).
- Estilos globais: [`src/styles/global.css`](../src/styles/global.css).
- Estilos de componentes: [`src/styles/components.css`](../src/styles/components.css).

### Recursos necessários

- Servidor de desenvolvimento local (`npm run dev`) e suíte de testes Vitest.
- Navegadores desktop para validação da suavidade da transição e ausência de bloqueio de cliques.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que estou no desktop na posição inicial da página (`scrollY = 0`), quando observo o topo à esquerda, então o nome "Natanael Brentano" está nítido, visível e clicável (redireciona para a Home).
- [x] **CA02:** Dado que estou no desktop, quando rolo a página para baixo além de 20px, então o nome no cabeçalho superior desaparece suavemente com transição de opacidade e não recebe cliques.
- [x] **CA03:** Dado que estou no desktop com a página rolada, quando rolo de volta para o topo da página, então o nome reaparece suavemente no cabeçalho superior.
- [x] **CA04:** Dado que o cabeçalho está com o nome oculto após a rolagem, quando interajo com elementos que estejam na área superior da tela, então os cliques e seleções de texto funcionam livremente sem interferência do cabeçalho.
- [x] **CA05:** Dado que estou no celular (largura <= 768px), quando rolo a página, então a navegação e a experiência móvel continuam funcionando sem anomalias.

## O que a atividade não inclui

- **Ocultar a barra inferior (`.bottom-nav`):** motivo: A barra inferior deve permanecer sempre visível e acessível para garantir a navegação rápida.
- **Remoção do elemento do DOM:** motivo: O nome deve continuar no DOM para fins de SEO, acessibilidade e para reaparecer quando o usuário voltar ao topo.
- **Alteração do leitor imersivo em poemas:** motivo: O leitor imersivo já possui suas próprias regras de esmaecimento de elementos.

### Considerado para o futuro (P2)

- Efeito opcional de reexibir o nome ao rolar para cima rapidamente (scroll up reveal), caso desejado no futuro.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Ao rolar, o fundo do cabeçalho deve desaparecer junto com o nome, deixando o topo 100% transparente? | PO / Natanael | Não | Sim, o cabeçalho e o nome desaparecem juntos (`opacity: 0` e `pointer-events: none`), deixando a área superior totalmente limpa para o texto. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Visibilidade inicial no topo | UI / unit | CA01 | Acessar `/` com `scrollY = 0` no desktop | `.logo` com `opacity: 1` e interativo. |
| CT02 | Desaparecimento ao rolar | UI / unit | CA02 | Rolar a página 100px para baixo | Cabeçalho / logo recebe classe `.scrolled`, `opacity: 0` e `pointer-events: none`. |
| CT03 | Reaparecimento ao voltar ao topo | UI / unit | CA03 | Rolar de volta para `scrollY = 0` | Cabeçalho / logo perde a classe `.scrolled` e volta a ter `opacity: 1`. |
| CT04 | Não interceptação de cliques no estado oculto | manual | CA04 | Com a página rolada, clicar em links ou texto no topo do viewport | Interação direta com o conteúdo sem bloqueio de camadas. |
| CT05 | Regressão mobile | manual | CA05 | Redimensionar para 375×812 e rolar a página | Sem regressões na exibição da marca móvel ou bottom-nav. |

## URL Complementar

- Documentação técnica: [MDN — CSS Transitions](https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- Protótipo / mockup: N/A — efeito de fade out editorial no topo.
- Discussões relacionadas: [`SDD/DONE/2026-09-29_menu-mobile-no-desktop.md`](DONE/2026-09-29_menu-mobile-no-desktop.md).
- Referências de design: Layouts editoriais de leitura (Substack, Medium, blogs literários) com cabeçalho limpo no topo.
- Requisitos originais: Solicitação do usuário em 2026-09-29: "quando rolar a página o nome que está no menu superior pode desaparecer".
