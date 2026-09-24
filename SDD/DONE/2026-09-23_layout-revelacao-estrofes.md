# [UI] Poema visível já no primeiro carregamento (animação de revelação mais leve)

## Detalhes da Atividade

- **O que precisa ser feito:** Ajustar a animação de entrada das estrofes (`.stagger-reveal` / `.line-reveal`) para que o poema nunca apareça em branco na primeira tela, e deixar o efeito mais sutil no celular.
- **Por que é necessário:** Isso foi observado em 375×812: cerca de 3 segundos depois de abrir um poema pela home, a tela mostrava só o título e a data, e o espaço do poema estava todo preto, embora o texto já estivesse no DOM a 278px do topo. Cada linha começa com `opacity: 0`, `translateY(8px)` e `filter: blur(2px)`, com transição de 0,8s, e só é revelada por um `IntersectionObserver` com `threshold: 0.1` e `rootMargin: -10%`. Com isso, a leitura depende do observer disparar, o `blur` em muitas linhas pesa em celulares simples, e o prerender feito para SEO (commit `794393d`) fica invisível até o JavaScript rodar.
- **Qual valor será agregado:** O leitor vê o poema imediatamente. A animação continua como detalhe estético, sem ser uma barreira.
- **Para quem é destinado:** Todos os leitores, principalmente em celulares modestos ou em conexões lentas.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: A primeira estrofe (e qualquer estrofe já na viewport ao carregar) deve ficar visível de imediato, sem esperar o observer.
- RF02: As estrofes abaixo da dobra podem ser reveladas ao rolar, com `threshold: 0` e sem `rootMargin` negativo.
- RF03: Remover o `filter: blur()` da animação e manter só a opacidade mais um deslocamento de até 4px, com duração de até 0,4s.
- RF04: Sem JavaScript (ou se o script falhar), o texto deve estar visível. O estado oculto só pode ser aplicado depois de o JS adicionar uma classe (ex.: `html.js-reveal`).
- RF05: Continuar respeitando `prefers-reduced-motion` (já implementado).

### Requisitos não-funcionais

- RNF01: O LCP da página do poema no mobile deve ser o próprio texto, e não pode piorar em relação ao atual.
- RNF02: Sem layout shift causado pela animação (CLS = 0 no bloco do poema).

### Dependências técnicas

- `src/pages/poem.js` (`setupStanzaAnimation`), `src/utils/text-format.js` (`formatPoemForAnimation`), `src/styles/components.css` (`.line-reveal`, `.stanza + .stanza::before`)

### Recursos necessários

- Lighthouse ou PageSpeed para medir LCP e CLS antes e depois.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que abro um poema no celular, quando a página termina de carregar, então os primeiros versos estão legíveis em menos de 500ms após o render.
- [ ] **CA02:** Dado o JavaScript desabilitado em uma página pré-renderizada, quando abro o poema, então o texto está visível.
- [ ] **CA03:** Dado `prefers-reduced-motion: reduce`, quando abro o poema, então não há animação.
- [ ] **CA04:** Dado que rolo até estrofes abaixo da dobra, quando elas entram na tela, então aparecem com um fade curto e sem desfoque.

## O que a atividade não inclui

- Não inclui remover a animação por completo.
- Não inclui mudar o separador "·" entre estrofes (só a sua animação acompanha a nova regra).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Primeira dobra | Abrir um poema e fazer screenshot em 1s | Versos visíveis |
| CT02 | Sem JS | Desabilitar o JS e abrir o HTML pré-renderizado | Texto visível |
| CT03 | Poema longo | Rolar até o fim | Todas as estrofes reveladas |
| CT04 | Performance | Lighthouse mobile | LCP e CLS iguais ou melhores |
| CT05 | Reduced motion | Emular a preferência | Sem transição |

## URL Complementar

- Código: [src/pages/poem.js](../src/pages/poem.js) (`setupStanzaAnimation`), [src/styles/components.css](../src/styles/components.css) (`.stagger-reveal`)
- Commit relacionado: `794393d` (injeção do poema no HTML pré-renderizado)
- Referência: web.dev, "Largest Contentful Paint"
