# [UI] Página do poema: ferramentas de leitura ao alcance durante a leitura

## Detalhes da Atividade

- **O que precisa ser feito:** Reorganizar a página `/poema/:slug` no mobile para que as ferramentas de leitura (tamanho da fonte, família, espaçamento, alinhamento, som ambiente, leitura imersiva) fiquem disponíveis **enquanto** o leitor lê, e não depois de todo o conteúdo secundário.
- **Por que é necessário:** Isso foi verificado em 375×812: a ordem atual é poema → compartilhar (4 botões) → reações → comentários → **só então** os botões "⚙️ Layout", "Compartilhar Card" e "Leitura Imersiva", a cerca de 1.700px do topo em um poema curto. Quem precisa de fonte maior descobre isso depois de já ter lido. Além disso, essas ações aparecem como 3 botões de largura total empilhados, o que pesa visualmente em uma página que deveria ser silenciosa.
- **Qual valor será agregado:** Leitura confortável desde o primeiro verso, principalmente para quem precisa de fonte maior, e uma página mais limpa.
- **Para quem é destinado:** Leitores no celular, com atenção a pessoas com baixa visão.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Adicionar um único botão discreto "Aa" (ajustes de leitura) logo abaixo da linha de metadados (data e tempo de leitura), alinhado ao centro.
- RF02: O botão "Aa" abre uma folha inferior (bottom sheet) com: tamanho (A-, A, A+), família (Serif, Sans, Manuscrita), espaçamento, alinhamento, som ambiente, tema (ver `2026-09-23_layout-controles-mobile-sem-cabecalho.md`) e "Leitura imersiva".
- RF03: A folha fecha ao tocar fora, ao arrastar para baixo ou com Esc, e as mudanças se aplicam ao vivo, com o texto visível atrás.
- RF04: Mover "Compartilhar Card" para dentro da seção "Compartilhar obra" (ver `2026-09-23_layout-compartilhar-e-acoes.md`).
- RF05: A nova ordem do conteúdo no mobile fica: título → meta → "Aa" → áudio (se houver) → poema → compartilhar → reações → comentários → newsletter.
- RF06: No desktop, manter os controles visíveis inline se o autor preferir, mas usando os mesmos componentes.

### Requisitos não-funcionais

- RNF01: A folha deve ter no máximo 60% da altura da viewport e respeitar `safe-area-inset-bottom`.
- RNF02: Foco preso dentro da folha enquanto ela estiver aberta, com o foco voltando ao botão "Aa" ao fechar.
- RNF03: As preferências continuam salvas nas mesmas chaves de `localStorage` (`reading-font-size` etc.).

### Dependências técnicas

- `src/pages/poem.js` (markup de `.poem-actions` e `#poem-settings-panel`), `src/styles/components.css`, `src/components/immersive-reader.js`

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema aberto no celular, quando olho a primeira tela, então vejo o botão "Aa" sem rolar.
- [ ] **CA02:** Dado a folha aberta, quando toco em "A+", então o poema aumenta imediatamente atrás da folha.
- [ ] **CA03:** Dado que ajustei para "A+", quando abro outro poema, então ele já abre em "A+".
- [ ] **CA04:** Dado a folha aberta, quando arrasto para baixo ou toco fora, então ela fecha e o foco volta ao "Aa".
- [ ] **CA05:** Dado o fim do poema no mobile, quando olho as ações, então não há mais três botões de largura total empilhados.

## O que a atividade não inclui

- Não inclui novas opções de fonte ou de som.
- Não inclui mudar o modo de leitura imersiva em si.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Acesso rápido | Abrir o poema e tocar em "Aa" | A folha abre |
| CT02 | Persistência | A+ → navegar para o próximo poema | Continua em A+ |
| CT03 | Acessibilidade | VoiceOver: abrir e fechar a folha | Foco correto e anúncios |
| CT04 | Poema com áudio | Poema com `audio_url` | "Aa" acima do player |
| CT05 | Desktop | 1280px | Sem regressão |

## URL Complementar

- Código: [src/pages/poem.js](../src/pages/poem.js), [src/styles/components.css](../src/styles/components.css) (`.poem-actions`, `.poem-settings-panel`)
- Referência: WAI-ARIA Authoring Practices, padrão "Dialog (Modal)"
