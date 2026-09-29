# [FEAT] Implementar barra de navegação inferior (Bottom Nav) no desktop mantendo nome no topo à esquerda

> **Status:** Concluída  
> **Autor:** Natanael Brentano / Antigravity · **Revisor:** Natanael Brentano · **Criada em:** 2026-09-29 · **Atualizada em:** 2026-09-29

## Detalhes da Atividade

- **O que precisa ser feito:** Adotar a barra de navegação inferior fixa (`.bottom-nav`) na versão desktop (`viewport > 768px`) da mesma forma que funciona no mobile (com atalhos para Poemas, Coleções, Buscar, Sobre e Ajustes com bottom sheet de tema e aleatório), mantendo o nome do autor ("Natanael Brentano") fixado na parte superior esquerda da página.
- **Problema e evidência:** Ao rolar a página na versão desktop, o menu superior tradicional deixa de responder ou falha na interação com o usuário. Além disso, a experiência móvel com barra inferior fixa (`.bottom-nav`) e folha de ajustes (`bottom-sheet`) provou ser muito mais consistente, direta e livre de falhas de rolagem/sticky.
- **Impacto de não fazer:** Usuários que navegam em telas maiores (desktop e notebooks) perdem a capacidade de usar o menu de navegação ao rolar o conteúdo das páginas, gerando frustração e sensação de interface quebrada.
- **Para quem é destinado:** Leitores e visitantes que acessam o site em desktops, notebooks e telas médias/grandes (> 768px).
- **História de usuário:** Como leitor navegando no desktop, quero ter o nome do autor visível na parte superior esquerda e a barra de navegação acessível na parte inferior da tela, para navegar pelas seções e alternar temas de maneira confiável em qualquer ponto da rolagem.
- **Como saberemos que deu certo:** A barra inferior (`.bottom-nav`) permanece sempre visível e interativa no rodapé no desktop; o nome "Natanael Brentano" permanece no canto superior esquerdo; todos os 5 botões (Poemas, Coleções, Buscar, Sobre, Ajustes) funcionam perfeitamente no topo ou após rolagem profunda; e o conteúdo das páginas não sofre sobreposição pelo rodapé fixo.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Exibir o nome do autor ("Natanael Brentano") no canto superior esquerdo no desktop, funcionando como link navegável para a Home (`/`). | P0 | CA01 |
| RF02 | Habilitar a barra de navegação inferior fixa (`.bottom-nav`) no desktop (resoluções > 768px), mantendo a mesma estrutura de ícones e legendas da versão mobile. | P0 | CA02 |
| RF03 | Manter os 5 botões funcionais na barra inferior desktop: Poemas (`/`), Coleções (`/colecoes/`), Buscar (abre modal/overlay de busca), Sobre (`/sobre/`) e Ajustes (abre painel de ajustes). | P0 | CA02, CA03, CA04 |
| RF04 | O botão "Ajustes" na barra inferior deve abrir o painel com as opções de tema (Claro, Sépia, Escuro, Alto Contraste) e ação de "Poema Aleatório", funcionando em qualquer posição de rolagem. | P0 | CA04 |
| RF05 | Ajustar a área de conteúdo (`.site-content` e `.site-footer`) no desktop para ter compensação inferior (`padding-bottom`) adequada, evitando que o conteúdo final fique oculto atrás da barra fixa. | P0 | CA05 |
| RF06 | Remover do cabeçalho desktop os links horizontais e controles redundantes que agora residem na barra inferior, mantendo o topo limpo e focado na identidade visual à esquerda. | P1 | CA01, CA06 |
| RF07 | Destacar visualmente o item ativo na barra inferior de acordo com a rota atual (ex.: "Poemas" na Home, "Coleções" em `/colecoes/`, "Sobre" em `/sobre/`). | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Responsividade e centralização: no desktop, os itens da barra inferior devem manter proporção elegante, centralizada e com largura máxima harmoniosa (ex.: largura contida ou distribuição proporcional). | P0 | CA02 |
| RNF02 | Acessibilidade (WCAG 2.1 AA): todos os botões e links da barra inferior devem ter rótulos descritivos (`aria-label`), estados visíveis de foco (`:focus-visible`) e alvos de clique adequados (mínimo 44×44px). | P0 | CA02, CA03 |
| RNF03 | Camada de empilhamento (`z-index`): a barra inferior fixa deve respeitar os tokens definidos em `variables.css` (`--z-nav: 500` ou `--z-overlay: 1000`), sem sobrepor indevidamente modais ou toasts (`--z-modal: 2000`). | P0 | CA03, CA04 |
| RNF04 | Desempenho e fluidez: transições suaves de abertura do painel de ajustes e de clique sem repinturas desnecessárias de layout. | P0 | CA04 |

### Dependências técnicas

- Componente de cabeçalho: [`src/components/header.js`](../src/components/header.js).
- Ponto de entrada e layout base: [`src/main.js`](../src/main.js).
- Estilos de navegação e layout: [`src/styles/components.css`](../src/styles/components.css) e [`src/styles/global.css`](../src/styles/global.css).
- Utilidades de navegação: [`src/utils/navigation.js`](../src/utils/navigation.js).

### Recursos necessários

- Navegadores desktop (Chrome, Safari, Firefox) para homologar a fixação da barra inferior e cliques após rolagem profunda.
- Servidor de desenvolvimento (`npm run dev`) e build de pré-visualização (`npm run preview`).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que estou no desktop (largura > 768px), quando visualizo o topo da página, então o nome "Natanael Brentano" aparece fixado ou posicionado no canto superior esquerdo e, ao ser clicado, redireciona para a página inicial (`/`).
- [x] **CA02:** Dado que estou no desktop, quando olho para a parte inferior da tela, então a barra de navegação inferior (`.bottom-nav`) está visível, fixa no rodapé e com visual integrado e elegante para telas largas.
- [x] **CA03:** Dado que estou no desktop com a página rolada para baixo (ex.: 500px ou mais), quando clico em "Coleções" ou "Sobre" na barra inferior, então a navegação para a respectiva página ocorre imediatamente.
- [x] **CA04:** Dado que estou no desktop com a página rolada, quando clico em "Ajustes" na barra inferior, então o painel de ajustes abre permitindo alternar entre os temas (Claro, Sépia, Escuro, Alto Contraste) ou sortear um Poema Aleatório.
- [x] **CA05:** Dado que rolo qualquer página (Home, Poema, Sobre) até o final no desktop, quando chego ao rodapé, então todo o texto e informações do rodapé são legíveis sem ficarem cobertos pela barra inferior fixa.
- [x] **CA06:** Dado que estou no desktop, quando observo o cabeçalho superior, então não há duplicação confusa de links nem menus quebrados após a rolagem.
- [x] **CA07:** Dado que navego para a rota `/colecoes/`, quando olho para a barra inferior, então o ícone e texto de "Coleções" recebem o estado visual ativo (`.active`).

## O que a atividade não inclui

- **Criação de novos temas ou novas páginas:** motivo: O escopo restringe-se à unificação da navegação na barra inferior para o desktop.
- **Alteração do funcionamento do leitor imersivo de poemas:** motivo: A barra inferior já possui regras de ocultação/exibição no modo imersivo que devem ser preservadas.
- **Remoção de funcionalidades existentes no mobile:** motivo: A versão mobile deve continuar funcionando exatamente como está, sem regressões.

### Considerado para o futuro (P2)

- Adicionar atalhos de teclado (ex.: números 1 a 5 ou teclas mnemônicas) associados diretamente aos itens da barra inferior no desktop.
- Tooltips discretos com dicas de atalho ao passar o mouse sobre os itens da barra no desktop.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Qual formato de menu mobile deve ser adotado na versão desktop? | PO / Natanael | Sim | **Definido:** Barra inferior fixa (Bottom Nav) no desktop também (igual ao mobile) e nome do autor mantido na parte superior esquerda. |
| D02 | No desktop, a barra inferior deve ocupar toda a largura da janela ou ter uma largura máxima centralizada (ex.: estilo "floating pill" ou barra contida de até 600px–800px)? | Design / PO | Não | Pode ocupar 100% com itens centralizados ou com `max-width` harmonioso, garantindo elegância estética em telas ultrawide. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Visibilidade do nome e da barra inferior no desktop | UI / manual | CA01, CA02 | Abrir `/` em viewport desktop (1280×800) | Nome "Natanael Brentano" visível no canto superior esquerdo; barra inferior visível e fixa no rodapé. |
| CT02 | Navegação por links após rolagem na Home | manual / e2e | CA03 | Na Home, rolar 800px; clicar no item "Coleções" na barra inferior | Navega instantaneamente para `/colecoes/` sem falhas de clique. |
| CT03 | Navegação a partir da página de Poema | manual / e2e | CA03 | Abrir `/poema/<slug>`, rolar o poema até o meio; clicar em "Sobre" na barra inferior | Navega com sucesso para `/sobre/`. |
| CT04 | Abertura de busca pela barra inferior | manual | CA03 | Em qualquer página rolada, clicar em "Buscar" na barra inferior | Overlay de busca abre com foco no campo de texto. |
| CT05 | Painel de Ajustes e troca de tema no desktop | manual | CA04 | Com a página rolada, clicar em "Ajustes"; selecionar "Sépia" e depois "Escuro" | Painel abre, tema troca em tempo real e estado persiste no `localStorage`. |
| CT06 | Verificação de não sobreposição do rodapé | UI / manual | CA05 | Rolar até o fim de `/sobre/` e da Home | Informações de copyright e links do rodapé ficam visíveis acima da barra inferior. |
| CT07 | Indicador de item ativo | manual | CA07 | Navegar entre "/", "/colecoes/" e "/sobre/" | O respectivo item na barra inferior recebe a classe `.active`. |
| CT08 | Regressão no mobile | manual / regressão | CA02, CA04 | Redimensionar para 375×812 e testar todas as funções da barra | Comportamento móvel intacto e idêntico ao atual. |

## URL Complementar

- Documentação técnica: [MDN — Position Fixed](https://developer.mozilla.org/pt-BR/docs/Web/CSS/position#fixed_positioning)
- Protótipo / mockup: N/A — reutiliza o componente `.bottom-nav` e `.bottom-sheet` já projetados para o projeto.
- Discussões relacionadas: [`SDD/DONE/2026-09-23_layout-controles-mobile-sem-cabecalho.md`](DONE/2026-09-23_layout-controles-mobile-sem-cabecalho.md), [`SDD/DONE/2026-09-24_fix-menu-desktop-apos-rolagem.md`](DONE/2026-09-24_fix-menu-desktop-apos-rolagem.md).
- Referências de design: Navegação por barra inferior editorial inspirada em apps de leitura modernos com apoio no rodapé.
- Requisitos originais: Solicitação do usuário em 2026-09-29: "se eu rolar a pagina o menu superior para de funcionar, acredito que o melhor caminho é implementar o menu mobile na versão desktip também, porém mantendo meu nome na parte superior esquerda" e confirmação da opção de Barra Inferior Fixa (Bottom Nav).
