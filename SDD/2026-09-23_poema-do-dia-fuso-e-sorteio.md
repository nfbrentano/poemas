# [FIX] Poema do dia com fuso horário de Brasília e sorteio bem distribuído

## Detalhes da Atividade

- **O que precisa ser feito:** Refazer o cálculo do "poema do dia" em `src/pages/home.js` para usar a data de `America/Sao_Paulo` e uma função de hash com boa distribuição.
- **Por que é necessário:**
  - A data vem de `new Date().toISOString()`, que é UTC. Para o leitor brasileiro, o poema do dia troca às 21h (horário de Brasília), não à meia-noite.
  - A semente é a soma dos códigos dos caracteres de `AAAA-MM-DD`. Dias consecutivos geram sementes consecutivas (e datas como `2026-09-30` e `2026-10-02` colidem), então o poema do dia anda em sequência pela lista e repete.
  - O índice é aplicado sobre a lista ordenada por data. Quando um poema novo é publicado, o índice desloca e o poema do dia muda no meio do dia.
- **Qual valor será agregado:** Um poema do dia estável ao longo do dia local, variado e coerente com o e-mail diário.
- **Para quem é destinado:** Leitores que voltam diariamente à home.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Obter a data local com `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })`.
- RF02: Usar um hash com boa dispersão (ex.: FNV-1a ou mulberry32) sobre a string da data.
- RF03: Sortear sobre uma lista estável (ex.: ordenada por `id` ou `slug`), para que novas publicações não troquem o poema do dia já exibido.
- RF04: Extrair a lógica para uma função pura testável, ex.: `getPoemOfDay(poems, date)` em `src/utils/`.
- RF05: *(Opcional)* Se `scripts/send-daily-poem.js` enviar "o poema do dia", reutilizar a mesma função para que o site e o e-mail mostrem o mesmo poema.

### Requisitos não-funcionais

- RNF01: A função deve ser determinística: mesma data e mesma lista geram o mesmo poema.
- RNF02: Em 30 dias consecutivos com 150 poemas, não deve haver repetições em sequência nem padrões lineares óbvios.

### Dependências técnicas

- `src/pages/home.js`, novo utilitário em `src/utils/`, `scripts/send-daily-poem.js` (opcional)

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que são 22h em Brasília, quando abro a home, então o poema do dia ainda é o mesmo das 10h do mesmo dia.
- [ ] **CA02:** Dado que um poema novo foi publicado hoje, quando recarrego a home, então o poema do dia não muda.
- [ ] **CA03:** Dado 30 datas consecutivas, quando calculo o poema do dia, então os índices não formam uma sequência de +1.
- [ ] **CA04:** Dado que rodo `npm test`, quando os testes terminam, então os testes de `getPoemOfDay` passam.

## O que a atividade não inclui

- Não inclui a curadoria manual do poema do dia pelo painel admin.
- Não inclui mudanças no layout do bloco "poema do dia".

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Virada de fuso | `getPoemOfDay` com `2026-09-23T23:30:00-03:00` e `2026-09-23T10:00:00-03:00` | Mesmo poema |
| CT02 | Determinismo | Chamar 2x com os mesmos dados | Mesmo resultado |
| CT03 | Estabilidade | Adicionar um poema novo à lista | Mesmo resultado |
| CT04 | Distribuição | 365 datas, 150 poemas | Cada poema aparece ≤ 7 vezes |
| CT05 | Lista vazia | `getPoemOfDay([], date)` | `null`, sem exceção |

## URL Complementar

- Código: [src/pages/home.js](../src/pages/home.js) (bloco "Poem of the Day Logic"), [scripts/send-daily-poem.js](../scripts/send-daily-poem.js)
- Referência: MDN, `Intl.DateTimeFormat` com a opção `timeZone`
