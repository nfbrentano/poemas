# [FIX] Mostrar a contagem real de obras na lista de coleções do admin

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-06 · **Atualizada em:** 2026-10-06

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer o selo de cada card da lista de coleções (`admin?view=collections`) exibir quantas obras a coleção tem, calculado a partir da coleção `collection_poems`.
- **Problema e evidência:** O card lê `c.collection_poems?.[0]?.count`, um resultado de junção do Supabase que o Firestore nunca devolve. O valor é sempre `undefined`, então todos os cards mostram "0 obras". A causa foi confirmada ao remover o adaptador (`SDD/DONE/2026-10-06_refactor-remover-adaptador-supabase-do-admin.md`).
- **Impacto de não fazer:** A informação exibida está errada para qualquer coleção, o que atrapalha a curadoria.
- **Para quem é destinado:** Administrador do site.
- **História de usuário:** Como administrador, quero ver quantas obras cada coleção tem, para saber quais precisam de curadoria.
- **Como saberemos que deu certo:** Cada card mostra o número igual ao de relações em `collection_poems` com aquele `collection_id`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Função pura `countPoemsByCollection(relations)` devolve um mapa `collection_id → quantidade` | P0 | CA01, CA02 |
| RF02 | A lista busca `collection_poems` junto com `collections` (em paralelo) e usa o mapa no selo | P0 | CA03 |
| RF03 | O selo usa singular/plural: "1 obra", "N obras" (inclui "0 obras") | P1 | CA04 |
| RF04 | Se a busca das relações falhar, o selo mostra "—" e a lista continua funcionando | P0 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Uma única consulta extra por abertura da lista (sem consulta por coleção) | P0 | CA03 |

### Dependências técnicas

- `src/pages/admin/collections.js`, `src/pages/admin/data.js` (`listDocs`)
- Regras do Firestore: `collection_poems` tem leitura pública, sem alteração.

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado relações de duas coleções, quando conto, então o mapa traz a quantidade de cada uma.
- [x] **CA02:** Dado lista vazia, `null`, relações sem `collection_id` ou relações de coleções inexistentes, quando conto, então não lança erro e ignora o que não se aplica.
- [x] **CA03:** Dado o admin, quando abro a lista de coleções, então cada card mostra o número de relações da coleção, com uma consulta extra.
- [x] **CA04:** Dado uma coleção com 1 obra, quando vejo o card, então lê "1 obra"; com 0 ou mais de 1, lê "N obras".
- [x] **CA05 (negativo):** Dado que a leitura de `collection_poems` falha, quando abro a lista, então as coleções aparecem e o selo mostra "—", sem mensagem de erro bloqueante.

## O que a atividade não inclui

- Contar apenas obras publicadas: o selo de origem contava relações; mudar a regra é decisão de produto.
- Mostrar a contagem em outras telas (site público): já tem lógica própria.

### Considerado para o futuro (P2)

- Separar "publicadas" e "rascunhos" no selo.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | Contar só obras publicadas? | PO | Não | Mantido: conta relações |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Contagem por coleção | unit | CA01 | 3 relações da coleção A e 1 da B | `{A: 3, B: 1}` |
| CT02 | Entradas inválidas | unit | CA02 | `null`, `[]`, itens sem `collection_id` | `{}` sem erro |
| CT03 | Rótulo singular/plural | unit | CA04 | 0, 1 e 5 | "0 obras", "1 obra", "5 obras" |
| CT04 | Falha na leitura | unit | CA05 | `counts` nulo | "—" |
| CT05 | Lista no admin | manual | CA03 | Abrir `?view=collections` logado | Números corretos por coleção |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: `SDD/DONE/2026-10-06_refactor-remover-adaptador-supabase-do-admin.md`
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: PR #11 (origem da descoberta)
