# [UI] Tipografia do poema no mobile: versos longos, recuo e ritmo

## Detalhes da Atividade

- **O que precisa ser feito:** Ajustar a tipografia de `.poem-content` para telas estreitas, preservando a estrutura dos versos quando uma linha não cabe na largura.
- **Por que é necessário:** Em 375px, a coluna do poema tem 343px, com Merriweather a 16,8px e entrelinha de 1,9 (31,9px). O alinhamento padrão é centralizado (`reading-alignment = center`). Quando um verso é mais longo que a coluna, ele quebra e a continuação vira uma "linha nova" centralizada, visualmente idêntica a um verso real, e o leitor perde o desenho do poema. Os resumos da home e do "poema do dia", em itálico centralizado, formam blocos de prosa difíceis de ler no celular. A entrelinha de 1,9 também espalha estrofes curtas em muita altura.
- **Qual valor será agregado:** O poema é lido como foi escrito: quebras de verso reais se distinguem das quebras causadas pela tela.
- **Para quem é destinado:** Leitores no celular e o autor, cuja intenção formal é preservada.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Cada verso (`.line-reveal`) deve ter **recuo pendente** quando quebrar: com alinhamento à esquerda, `padding-left: 1.5em; text-indent: -1.5em`, de modo que a continuação fique recuada.
- RF02: Com alinhamento centralizado, marcar a continuação de outra forma (ex.: `text-wrap: balance` por verso e um leve recuo), ou usar à esquerda como padrão no mobile quando o poema tiver versos longos. A decisão fica com o autor.
- RF03: Aplicar `text-wrap: pretty` nos versos e `hyphens: manual` (sem hifenização automática em poesia).
- RF04: No mobile, reduzir a entrelinha padrão para cerca de 1,7, e manter a opção "Espaçamento maior" do painel de leitura.
- RF05: Garantir o espaço entre estrofes pelo separador, e não por entrelinha extra.
- RF06: Os resumos da home e do "poema do dia" no mobile devem ficar alinhados à esquerda (ou limitados a 3 linhas com `line-clamp`), sem blocos centralizados de mais de 3 linhas.

### Requisitos não-funcionais

- RNF01: Tamanho mínimo do corpo do poema de 16px no mobile (evita o zoom automático no iOS e atende a WCAG 1.4.4).
- RNF02: Contraste do texto do poema de pelo menos 7:1 em todos os temas (AAA para leitura longa). Validar sépia e claro.
- RNF03: Nenhuma mudança no conteúdo salvo no banco. Tudo é resolvido em CSS e no `formatPoemForAnimation`.

### Dependências técnicas

- `src/styles/components.css`, `src/styles/variables.css` (tamanhos de leitura), `src/utils/text-format.js`

### Recursos necessários

- 3 a 5 poemas de referência do autor, com versos curtos, longos e em prosa poética, para validação visual.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um verso com mais de 45 caracteres em 375px, quando ele quebra, então a continuação aparece recuada em relação ao início do verso.
- [ ] **CA02:** Dado um poema de versos curtos, quando o abro no celular, então a aparência é equivalente à atual.
- [ ] **CA03:** Dado o tema sépia e o claro, quando meço o contraste do texto do poema, então é ≥ 7:1.
- [ ] **CA04:** Dado a home no celular, quando vejo o "poema do dia", então o resumo tem no máximo 3 linhas.

## O que a atividade não inclui

- Não inclui trocar as famílias tipográficas.
- Não inclui mudar o layout desktop, exceto pelo recuo pendente, que também vale lá.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Verso longo | Poema de referência com um verso de 80 caracteres | Continuação recuada |
| CT02 | Versos curtos | Poema "Labirinto da Vida" | Sem mudança perceptível |
| CT03 | A+ | Fonte grande no mobile | Recuo pendente mantido |
| CT04 | Contraste | Ferramenta de contraste em 4 temas | ≥ 7:1 |
| CT05 | Screen reader | VoiceOver lendo um verso quebrado | Lido como uma única linha |

## URL Complementar

- Código: [src/styles/components.css](../src/styles/components.css), [src/styles/variables.css](../src/styles/variables.css), [src/utils/text-format.js](../src/utils/text-format.js)
- Referência: MDN, `text-wrap: pretty`, e WCAG 2.2, critério 1.4.6 (Contraste Aprimorado)
