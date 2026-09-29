# [UI] Remover menu superior com o nome do autor

> **Status:** Concluída  
> **Autor:** Natanael Fernando Gatti Brentano / Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-09-29 · **Atualizada em:** 2026-09-29

## Detalhes da Atividade

- **O que precisa ser feito:** Remover a exibição do menu/cabeçalho superior (`.site-header`), que continha o nome do autor ("Natanael Fernando Gatti Brentano") e controles de navegação no desktop. A navegação do site passa a ser realizada integralmente e de forma unificada através da barra de navegação inferior (`.bottom-nav`), proporcionando um visual minimalista, elegante e focado na leitura em todas as resoluções de tela.
- **Problema e evidência:** Anteriormente, o cabeçalho superior no desktop continha o nome do autor fixado no topo esquerdo e desaparecia ao rolar a página. O autor identificou que o site fica esteticamente mais limpo e bonito sem o menu superior, aproveitando a barra inferior já existente e funcional.
- **Impacto de não fazer:** Manutenção de um elemento visual superior desnecessário que compete com a barra de navegação inferior e consome espaço vertical no desktop.
- **Para quem é destinado:** Leitores e visitantes do site em telas desktop e tablets.
- **História de usuário:** Como leitor e autor do site, quero que o menu superior com meu nome seja removido, para que as páginas tenham uma estética limpa, fluida e com leitura imersiva sem distrações no topo.
- **Como saberemos que deu certo:** O elemento `.site-header` não é visível em nenhuma resolução (estando oculto com `display: none !important;`), todo o conteúdo das páginas inicia diretamente com espaçamento adequado no topo, e a barra de navegação inferior (`.bottom-nav`) continua respondendo por 100% da navegação e ajustes.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Ocultar completamente o cabeçalho superior (`.site-header`) em todas as resoluções (desktop e mobile) via folha de estilos. | P0 | CA01 |
| RF02 | Assegurar que os atalhos globais de teclado (ex: `/` para busca rápida) e o listener do botão de busca da bottom-nav permaneçam plenamente funcionais. | P0 | CA02 |
| RF03 | Manter o espaçamento superior (`padding-top`) da área de conteúdo principal (`.site-content`) para que os títulos das páginas e seções respirem harmoniosamente sem o cabeçalho. | P0 | CA03 |
| RF04 | Atualizar a suíte de testes unitários para validar que o menu superior está oculto e que a barra inferior permanece como navegação principal. | P0 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Performance e CLS zero: a ocultação do cabeçalho não deve introduzir desvios de layout cumulativos (Cumulative Layout Shift). | P0 | CA01 |
| RNF02 | Acessibilidade: a navegação principal continua semanticamente acessível através de `<nav class="bottom-nav" aria-label="Navegação principal">`. | P0 | CA02 |

### Dependências técnicas

- Arquivos de estilo: [`src/styles/global.css`](../src/styles/global.css), [`src/styles/components.css`](../src/styles/components.css).
- Componentes e scripts: [`src/components/header.js`](../src/components/header.js), [`scripts/prerender.js`](../scripts/prerender.js).
- Suíte de testes: [`src/bottom-nav-desktop.test.js`](../src/bottom-nav-desktop.test.js).

### Recursos necessários

- Navegador web e ambiente de execução Vitest.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um usuário abre o site no desktop (largura > 768px), quando visualiza o topo da página, então nenhum menu superior ou cabeçalho `.site-header` é exibido.
- [x] **CA02:** Dado que o usuário navega pelo site no desktop, quando precisa acessar Poemas, Coleções, Buscar, Sobre ou Ajustes (tema/aleatório), então utiliza com sucesso a barra de navegação inferior fixa (`.bottom-nav`).
- [x] **CA03:** Dado que o usuário acessa qualquer página (Home, Poema, Coleções, Sobre, Sentimentos), quando a página é carregada, então o conteúdo principal possui margem superior agradável sem encostar no topo da janela.
- [x] **CA04:** Dado que a suíte de testes automatizados é executada, quando os testes de layout e navegação rodam, então 100% dos testes passam com o menu superior desativado.

## O que a atividade não inclui

- **Remoção dos dados estruturados de autor:** motivo: Os metadados de autoria (JSON-LD, meta author, etc.) devem ser integralmente preservados para SEO e GEO.
- **Alteração do rodapé:** motivo: A menção aos direitos autorais no rodapé permanece intacta.

### Considerado para o futuro (P2)

- N/A

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O componente `.site-header` deve ser ocultado via CSS mantendo compatibilidade de código ou removido fisicamente do DOM? | Dev | Não | Ocultado via `display: none !important;` no CSS, preservando os listeners globais de teclado (como a busca `/`) e retrocompatibilidade com prerender. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Menu superior oculto no desktop | visual / unit | CA01 | Inspecionar `.site-header` no CSS | Regra `.site-header { display: none !important; }` aplicada. |
| CT02 | Navegação funcional via bottom-nav | unit | CA02 | Interagir com os botões da barra inferior | Todos os 5 botões funcionam normalmente. |
| CT03 | Suíte de testes | automatizado | CA04 | Executar `npx vitest run` | Todos os testes passam. |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário: "pode até tirar o menu superior com meu nome. acho que ficará mais bonito!"
