# [FEAT] Botão "Exportar XML" no admin, incluindo rascunhos e agendados

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-06 · **Atualizada em:** 2026-10-06

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar à tela de obras do admin (`admin?view=list`) um botão que baixa um XML no formato WXR 1.2 (o mesmo gerado por `npm run export:wxr`) com **todas** as obras, inclusive rascunhos e agendadas.
- **Problema e evidência:** O comando `npm run export:wxr` só enxerga poemas publicados, pois só eles são legíveis sem login (`SDD/DONE/2026-10-06_feat-exportar-poemas-wordpress-xml.md`). Rascunhos e agendados ficam fora do backup.
- **Impacto de não fazer:** Rascunhos e obras agendadas só existem no Firestore, sem cópia portátil.
- **Para quem é destinado:** Administrador logado.
- **História de usuário:** Como autora/autor, quero baixar pelo admin um XML com todas as minhas obras, para ter um backup completo sem usar o terminal.
- **Como saberemos que deu certo:** Ao clicar no botão, o navegador baixa `poemas-AAAA-MM-DD.xml` com um item por obra da lista, com o `wp:status` correspondente a cada uma.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | A tela de obras exibe o botão "Exportar XML" ao lado da contagem de obras | P0 | CA01 |
| RF02 | O clique gera o XML com `buildWxr` a partir de **todas** as obras carregadas na tela (ignora os filtros de busca, estado e sentimento) e inicia o download | P0 | CA02, CA03 |
| RF03 | O arquivo se chama `poemas-AAAA-MM-DD.xml` (data do dia) e tem tipo `application/xml` | P0 | CA02 |
| RF04 | Após o clique o botão confirma o sucesso por alguns segundos ("Baixado: N obras") e volta ao normal | P1 | CA04 |
| RF05 | Sem obras na lista, o botão fica desabilitado | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Sem nova consulta ao Firestore e sem envio de dados a terceiros: o XML é gerado e baixado no próprio navegador | P0 | CA06 |
| RNF02 | A URL temporária do download (`blob:`) é liberada após o uso | P1 | CA02 |

### Dependências técnicas

- `src/utils/wxr-builder.js` (já existente), `src/pages/admin/list.js`

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o admin logado, quando abro "Obras", então vejo o botão "Exportar XML".
- [x] **CA02:** Dado a lista carregada, quando clico no botão, então um arquivo `poemas-AAAA-MM-DD.xml` é baixado e a URL temporária é liberada.
- [x] **CA03:** Dado obras publicadas, rascunhos e agendadas, quando exporto, então o XML tem um item para cada uma, com `wp:status` `publish`, `draft` e `future`.
- [x] **CA04:** Dado o clique, quando o download começa, então o botão mostra "Baixado: N obras" e depois volta ao texto original.
- [x] **CA05 (caso-limite):** Dado que não há obras, quando abro a tela, então o botão está desabilitado.
- [x] **CA06 (negativo):** Dado o clique no botão, então não ocorre nenhuma chamada adicional ao Firestore nem requisição de rede.
- [x] **CA07 (negativo):** Dado que há filtros ativos na lista (por exemplo só "Rascunhos"), quando exporto, então o arquivo contém todas as obras, não apenas as filtradas.

## O que a atividade não inclui

- Comentários, mídia e metadados do WordPress/Jetpack: mesmo escopo do comando de terminal.
- Importar um XML de volta no admin: atividade própria e de maior risco.
- Exportar apenas as obras filtradas: o objetivo é backup completo.

### Considerado para o futuro (P2)

- Incluir comentários aprovados.
- Opção de exportar só os filtrados.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | N/A | | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Botão visível | integração | CA01 | Renderizar a lista com dados simulados | Botão presente |
| CT02 | Download | integração | CA02, CA06 | Clicar; observar `Blob`/âncora | Arquivo com nome e tipo corretos; `revokeObjectURL` chamado; Firestore sem novas chamadas |
| CT03 | Todos os estados | integração | CA03 | 3 obras (publicada, rascunho, agendada) | 3 itens com status `publish`/`draft`/`future` |
| CT04 | Feedback | integração | CA04 | Clicar e avançar o tempo | Texto muda e volta |
| CT05 | Lista vazia | integração | CA05 | Renderizar sem obras | Botão desabilitado |
| CT06 | Filtro ativo | integração | CA07 | Filtrar por "Rascunhos" e exportar | Todas as obras no XML |
| CT07 | Manual | manual | CA01–CA03 | Logado no admin, abrir Obras e clicar | Arquivo baixa e valida com `xmllint --noout` |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: `SDD/DONE/2026-10-06_feat-exportar-poemas-wordpress-xml.md`
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: PR #14
