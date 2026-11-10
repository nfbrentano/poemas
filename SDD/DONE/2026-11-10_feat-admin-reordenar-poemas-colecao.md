# [FEAT] Admin: reordenar manualmente os poemas de uma coleção

> **Status:** Concluída
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Dar ao autor, no painel administrativo, uma forma de definir a ordem em que os poemas aparecem dentro de cada coleção.
- **Problema e evidência:** Após a curadoria de novembro, 100% dos 239 poemas pertencem a alguma coleção, e as coleções ficaram maiores. A ordem de leitura de uma antologia é uma decisão editorial, mas hoje ela resulta de critérios automáticos. A reordenação por arrastar-e-soltar foi registrada como item futuro em [`SDD/DONE/2026-11-03_curadoria-e-novas-colecoes-tematicas.md`](DONE/2026-11-03_curadoria-e-novas-colecoes-tematicas.md).
- **Impacto de não fazer:** O autor não consegue construir uma sequência narrativa (abertura, desenvolvimento, fecho) nas coleções; ajustes exigem scripts manuais no banco.
- **Para quem é destinado:** Autor/administrador autenticado.
- **História de usuário:** Como autor, quero arrastar os poemas de uma coleção para a ordem que desejo, para que o leitor os percorra na sequência que planejei.
- **Como saberemos que deu certo:** Reordenar e salvar uma coleção de 30 poemas em menos de 1 minuto, sem sair do admin; a ordem pública reflete a escolha após o próximo deploy.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Na edição de uma coleção, listar seus poemas na ordem atual e permitir movê-los por arrastar-e-soltar. | P0 | CA01 |
| RF02 | Alternativa por teclado/botões ("mover para cima/baixo") para cada item. | P0 | CA02 |
| RF03 | Salvar a ordem explicitamente (botão "Salvar ordem"), com confirmação de sucesso ou mensagem de erro. | P0 | CA03, CA04 |
| RF04 | Página pública da coleção, pré-renderização e navegação anterior/próximo dentro da coleção (se existir) respeitam a ordem salva. | P0 | CA05 |
| RF05 | Coleções sem ordem manual mantêm o comportamento atual. | P0 | CA06 |
| RF06 | Poema novo adicionado a uma coleção com ordem manual entra no final. | P0 | CA07 |
| RF07 | Botão "Restaurar ordem automática" que descarta a ordem manual. | P1 | CA08 |
| RF08 | Aviso ao sair da tela com alterações não salvas. | P1 | CA09 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Apenas usuários autenticados gravam a ordem (regras do Firestore de `collection_poems`/`collections` inalteradas em permissão). | P0 | CA10 |
| RNF02 | Funciona por toque em telas ≥ 360 px de largura. | P0 | CA01 |
| RNF03 | Salvamento atômico: ou toda a nova ordem é gravada, ou nada muda. | P0 | CA04 |
| RNF04 | Sem nova dependência de biblioteca de drag-and-drop acima de 10 kB gzip. | P1 | — |

### Dependências técnicas

- [`src/pages/admin/collections.js`](../src/pages/admin/collections.js) e [`src/pages/admin/data.js`](../src/pages/admin/data.js).
- Coleções `collections` / `collection_poems` no Firestore; [`firestore.indexes.json`](../firestore.indexes.json) caso a ordenação exija índice.
- Consumidores da ordem: [`src/pages/collection.js`](../src/pages/collection.js), [`src/utils/collection-template.js`](../src/utils/collection-template.js), [`scripts/prerender.js`](../scripts/prerender.js).

### Recursos necessários

- Acesso de administrador ao Firestore de produção para validar.
- Ícone de "alça" de arrasto.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que estou autenticado e editando uma coleção com poemas, quando arrasto um poema da posição 5 para a posição 1 (mouse ou toque), então a lista passa a exibi-lo em primeiro e os demais se deslocam.
- [x] **CA02:** Dado que o foco está num item da lista, quando aciono "mover para cima" pelo teclado, então o item sobe uma posição e o foco o acompanha.
- [x] **CA03:** Dado que reordenei a lista, quando clico em "Salvar ordem", então recebo confirmação e, ao recarregar o admin, a ordem persiste.
- [x] **CA04:** Dado que a gravação falha (rede ou permissão), quando clico em "Salvar ordem", então vejo mensagem de erro, a ordem no banco permanece a anterior e minha ordenação na tela não é perdida.
- [x] **CA05:** Dado que salvei uma ordem manual, quando o site é reconstruído e abro a página pública da coleção, então os poemas aparecem exatamente nessa ordem, inclusive no HTML pré-renderizado.
- [x] **CA06:** Dado uma coleção que nunca foi ordenada manualmente, quando abro sua página pública, então a ordem é idêntica à de antes desta atividade.
- [x] **CA07:** Dado uma coleção com ordem manual, quando vinculo um novo poema a ela, então ele aparece na última posição.
- [x] **CA08:** Dado uma coleção com ordem manual, quando aciono "Restaurar ordem automática" e confirmo, então a coleção volta ao comportamento padrão.
- [x] **CA09:** Dado que há alterações não salvas, quando tento sair da tela, então sou avisado antes de perder as mudanças.
- [x] **CA10:** Dado um usuário não autenticado, quando tenta gravar a ordem diretamente no Firestore, então a escrita é negada.

## O que a atividade não inclui

- Reordenar as coleções entre si na página `/colecoes/`: motivo: outra iniciativa.
- Reordenar poemas na home ou nas páginas de sentimento: motivo: essas listas têm critério cronológico/automático por definição.
- Editar o conteúdo dos poemas a partir dessa tela: motivo: já existe o editor.

### Considerado para o futuro (P2)

- Seções/capítulos dentro de uma coleção.
- Capas ilustradas por coleção (`image_url`).

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | `collection_poems` já tem campo de posição? Qual é exatamente o critério de ordenação atual (data, título)? | dev | Sim | O modelo de `collection_poems` suporta opcionalmente o campo numérico `order` (1-based ou 0-based), já consumido por `scripts/prerender.js` e `src/pages/collection.js`. Quando `order` não está preenchido ou é nulo, o critério de ordenação padrão é a data cronológica de publicação (`published_at asc`). |
| D02 | A mudança de ordem deve disparar deploy automaticamente ou esperar o próximo push? | PO | Não | Não dispara deploy automaticamente; a ordem salva no Firestore é consumida dinamicamente pela SPA imediatamente em `src/pages/collection.js` e refletida no HTML pré-renderizado no próximo deploy/rebuild de `main`. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Mover item | unit | CA01, CA02 | Função de reordenação: mover índice 4 → 0 e subir uma posição | Arrays resultantes corretos |
| CT02 | Arrastar por toque | manual | CA01 | Em celular, arrastar item | Reordena sem rolar a página indevidamente |
| CT03 | Persistência | integração | CA03 | Mock do Firestore; salvar; recarregar dados | Ordem preservada |
| CT04 | Falha atômica | integração | CA04 | Mock rejeitando o batch | Erro exibido; estado remoto intacto; tela mantém ordem |
| CT05 | Ordem pública | integração (pós-build) | CA05 | Fixture com ordem manual; gerar HTML da coleção | Links na ordem salva |
| CT06 | Retrocompatibilidade | unit | CA06 | Coleção sem posições | Ordem igual à atual |
| CT07 | Novo poema ao final | unit | CA07 | Vincular poema a coleção ordenada | Última posição |
| CT08 | Restaurar | unit | CA08 | Restaurar ordem automática | Posições removidas |
| CT09 | Saída com pendências | manual | CA09 | Reordenar e navegar para outra view | Aviso exibido |
| CT10 | Regras | integração | CA10 | [`src/firestore-rules.test.js`](../src/firestore-rules.test.js): escrita anônima | Negada |

## URL Complementar

- Documentação técnica: [`src/pages/admin/collections.js`](../src/pages/admin/collections.js)
- Protótipo / mockup: N/A — lista simples com alça de arrasto.
- Discussões relacionadas: [`SDD/DONE/2026-11-03_curadoria-e-novas-colecoes-tematicas.md`](DONE/2026-11-03_curadoria-e-novas-colecoes-tematicas.md), [`SDD/DONE/2026-11-03_organizacao-e-correcao-de-colecoes.md`](DONE/2026-11-03_organizacao-e-correcao-de-colecoes.md)
- Referências de design: [`SDD/DONE/2026-09-23_pagina-colecao-seo-e-ordenacao.md`](DONE/2026-09-23_pagina-colecao-seo-e-ordenacao.md)
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
