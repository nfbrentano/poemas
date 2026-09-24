# [UI] Compartilhamento e ações do poema coerentes com o layout de leitura

## Detalhes da Atividade

- **O que precisa ser feito:** Redesenhar a seção "Compartilhar obra" e o tooltip de trecho selecionado da página do poema para o mobile.
- **Por que é necessário:** Isso foi verificado em 375×812:
  - A seção mostra 4 botões com cores de marca: WhatsApp em verde `#25D366`, X em preto `#000`, Facebook em azul `#1877F2` e "Copiar Link" em dourado. Eles quebram a paleta "Minimalismo Noturno" logo abaixo do poema e disputam a atenção com o texto. O X preto em fundo `#050505` quase some.
  - Os botões quebram em 2 linhas desalinhadas (3 + 1).
  - O botão do `navigator.share` aparece como "Compartilhar..." no markup, mas no dispositivo testado foi exibido como "Copiar Link". No celular, o compartilhamento nativo já cobre WhatsApp, X, Instagram e outros.
  - O tooltip de trecho selecionado (`#highlight-tooltip`) tem botões de **25px de altura** (Copiar, Compartilhar, Gerar Card), pequenos demais para o toque, e disputa espaço com o menu nativo de seleção do iOS e do Android.
  - "Compartilhar Card" fica separado do compartilhamento, junto das ferramentas de leitura.
- **Qual valor será agregado:** Uma página mais bonita e silenciosa, e um compartilhamento mais simples, que é o principal meio de divulgação do site.
- **Para quem é destinado:** Leitores que compartilham poemas e o autor, que ganha alcance.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: No mobile com `navigator.share` disponível, exibir **um** botão principal "Compartilhar", que abre o compartilhamento nativo, e um botão secundário "Gerar card para Stories".
- RF02: Sem `navigator.share` (desktop), exibir botões **monocromáticos** no estilo `btn-secondary` com ícone: WhatsApp, X, Facebook e Copiar link, em uma grade de largura igual.
- RF03: Mover "Compartilhar Card" para esta seção.
- RF04: Tooltip de seleção: botões com ≥ 44px de altura, posicionados acima da seleção sem cobri-la. No mobile, avaliar trocar o tooltip por um botão flutuante "Compartilhar trecho" que aparece enquanto houver seleção, sem competir com o menu nativo.
- RF05: A mensagem "Link copiado" deve usar o `toast` existente.

### Requisitos não-funcionais

- RNF01: As cores de marca só podem aparecer nos ícones (opcional), nunca como fundo.
- RNF02: Contraste mínimo de 4,5:1 nos rótulos em todos os temas.
- RNF03: Os botões devem ter `aria-label` descritivo ("Compartilhar no WhatsApp").

### Dependências técnicas

- `src/pages/poem.js` (markup e handlers de compartilhamento e highlight), `src/styles/components.css` (`.share-*`, `.highlight-*`), `src/utils/social-export.js`
- Relacionada a `2026-09-23_layout-barra-de-leitura-poema.md` (remove "Compartilhar Card" de `.poem-actions`)

### Recursos necessários

- Ícones SVG monocromáticos (podem ir em `public/icons.svg`, que já existe).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um celular com Web Share, quando chego ao fim do poema, então vejo um botão "Compartilhar", e ao tocar abre a folha nativa com o título e a URL.
- [ ] **CA02:** Dado o desktop, quando vejo a seção, então os 4 botões são monocromáticos e alinhados em uma linha.
- [ ] **CA03:** Dado que seleciono um trecho no celular, quando aparece a ação de compartilhar trecho, então ela tem ≥ 44px e não cobre o texto selecionado.
- [ ] **CA04:** Dado os 4 temas, quando vejo a seção, então nenhuma cor de fundo de marca aparece.

## O que a atividade não inclui

- Não inclui mudar o design do card gerado (`social-card.css`).
- Não inclui novas redes sociais.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Web Share | Chrome Android e Safari iOS | Folha nativa abre |
| CT02 | Fallback | Firefox desktop | Grade de 4 botões |
| CT03 | Copiar | Tocar em "Copiar link" | Toast "Link copiado" |
| CT04 | Trecho | Selecionar 2 versos no iOS | Ação de trecho utilizável |
| CT05 | Tema claro | Ver a seção | Contraste ≥ 4,5:1 |

## URL Complementar

- Código: [src/pages/poem.js](../src/pages/poem.js), [src/styles/components.css](../src/styles/components.css) (`.share-btn.*` na linha 566)
- Referência: MDN, Web Share API
