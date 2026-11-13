# [FEAT] Autosave local e gestão integrada de coleções no editor de poemas

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Evoluir [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) com rascunho automático local (autosave) e recuperação após queda de sessão, seletor multi-coleções integrado diretamente no formulário do poema (sincronizando `collection_poems` e `poem.collection_slugs`), contador editorial ao vivo (versos, estrofes, tempo de leitura) e opção de disparo de newsletter/push na publicação.
- **Problema e evidência:** Hoje [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) não salva rascunho local enquanto o autor escreve (se a aba fechar, o token expirar ou a rede cair, os versos são perdidos). Além disso, para vincular um poema recém-criado a uma coleção, o autor precisa sair do editor e ir manualmente à tela [`src/pages/admin/collections.js`](../src/pages/admin/collections.js), que tampouco preenche `poem.collection_slugs`.
- **Impacto de não fazer:** Risco real de perda de produção poética durante a escrita no navegador e fricção editorial (múltiplas telas para publicar um único poema dentro de uma coleção).
- **Para quem é destinado:** Autor/administrador do site escrevendo e publicando poemas no desktop ou celular.
- **História de usuário:** Como autor, quero que meus versos em edição sejam salvos automaticamente no navegador e poder vincular o poema às coleções na mesma tela de publicação, para escrever com segurança e publicar em menos etapas.
- **Como saberemos que deu certo:** Recarregar a página durante a edição preserva e oferece restaurar o texto digitado; ao salvar/publicar o poema com coleções marcadas, tanto `collection_poems` quanto `poem.collection_slugs` são atualizados em sincronia; 0 erros no fluxo do editor.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Salvar rascunho de edição em `localStorage` (`admin_draft_${poemId || 'new'}`) com debounce (`<= 1000ms`), armazenando título, slug, conteúdo, resumo, tags, coleções selecionadas, status, data e timestamp `savedAt`. | P0 | CA01, CA02 |
| RF02 | Ao reabrir o editor, detectar se há rascunho local válido mais recente/diferente dos dados carregados e exibir banner discreto com ações "Restaurar rascunho local" e "Descartar". | P0 | CA02, CA03 |
| RF03 | Limpar o rascunho local automaticamente somente após salvamento bem-sucedido no Firestore. | P0 | CA04 |
| RF04 | Adicionar seção "Coleções" no formulário de [`editor.js`](../src/pages/admin/editor.js) listando as coleções cadastradas/curadas (checkboxes), atualizando `collection_poems` (adicionando com ordem automática ao final e removendo desmarcados) e gravando `collection_slugs` no documento do poema. | P0 | CA05 |
| RF05 | Exibir barra discreta de estatísticas ao vivo durante a escrita: número de estrofes, número de versos, palavras e tempo estimado de leitura (com a mesma fórmula de [`poem-template.js`](../src/utils/poem-template.js)). | P1 | CA06 |
| RF06 | Incluir opção de disparar Web Push junto ao checkbox existente de envio de newsletter quando o status final for `published`, além de aviso se o slug digitado já estiver em uso por outro poema. | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O autosave e a contagem ao vivo não podem causar travamento de digitação em textos longos (`<= 16ms` por atualização visual após debounce). | P1 | CA01, CA06 |
| RNF02 | Falha de `localStorage` (modo privado ou cota cheia) não impede edição nem salvamento no Firestore. | P0 | CA01 |
| RNF03 | Não permitir publicação/atualização com slug duplicado de outro poema já existente. | P0 | CA07 |

### Dependências técnicas

- [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) e [`src/pages/admin/data.js`](../src/pages/admin/data.js).
- [`src/pages/admin/collections.js`](../src/pages/admin/collections.js) e [`src/utils/collection-order.js`](../src/utils/collection-order.js).
- [`src/utils/poems-store.js`](../src/utils/poems-store.js) (invalidação de cache após salvar).

### Recursos necessários

- N/A — componentes de UI reutilizam estilos e formulários já existentes no admin.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou digitando um novo poema ou editando um existente no admin, quando paro de digitar por 1 segundo, então o estado atual do formulário é salvo no `localStorage`.
- [ ] **CA02:** Dado que fechei ou recarreguei a aba sem salvar no Firestore, quando volto ao editor na mesma rota, então um banner informa data/hora do rascunho local e "Restaurar" preenche novamente os campos.
- [ ] **CA03:** Dado o banner de rascunho local disponível, quando clico em "Descartar", então a entrada no `localStorage` é removida e os dados oficiais do Firestore permanecem intactos.
- [ ] **CA04:** Dado um rascunho local ativo durante edição, quando salvo o poema no Firestore com sucesso, então o rascunho local correspondente é apagado automaticamente.
- [ ] **CA05:** Dado que marquei duas coleções no formulário do editor e salvei o poema, quando verifico o banco, então `poem.collection_slugs` contém os 2 slugs e `collection_poems` possui os dois vínculos sem duplicar entradas pré-existentes.
- [ ] **CA06:** Dado um poema com 3 estrofes e 12 versos digitado no textarea, quando a prévia/estatística atualiza, então exibe `3 estrofes · 12 versos`.
- [ ] **CA07:** Dado que tento salvar um novo poema com um slug pertencente a outra obra já existente, quando submeto (ou saio do campo slug), então o editor bloqueia a gravação e exibe aviso indicando conflito de slug.

## O que a atividade não inclui

- Versionamento histórico multi-revisões no servidor (`poem_revisions` no Firestore): motivo: complexo demais agora diante da baixa frequência de edição retrospectiva.
- Edição colaborativa em tempo real: motivo: site de autor único.

### Considerado para o futuro (P2)

- Histórico de versões no Firestore com diff simples antes de sobrescrever poemas publicados.
- Importação de arquivo `.txt`/`.md` direto para o editor por drag-and-drop.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O aviso ao detectar rascunho local deve também bloquear fechamento acidental da aba via `beforeunload` quando houver alterações não salvas? | PO/dev | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Persistência e restauração de rascunho | unit/integração (jsdom) | CA01, CA02, CA03 | Digitar conteúdo, avançar timer, recarregar `renderEditor` e clicar Restaurar / Descartar | Campos restaurados e limpeza correta no Descartar |
| CT02 | Limpeza após save | integração | CA04 | Salvar poema com mock de `insertDocs`/`updateDocById` | Chave de rascunho removida do `localStorage` |
| CT03 | Vínculo multi-coleções | unit/integração | CA05 | Marcar/desmarcar coleções no editor e submeter | Atualiza `poem.collection_slugs` e adiciona/remove docs em `collection_poems` |
| CT04 | Contagem de estrofes e versos | unit | CA06 | Passar texto com 3 estrofes separadas por linha em branco | Retorna `3` estrofes e contagem exata de linhas não vazias |
| CT05 | Prevenção de slug duplicado | integração | CA07 | Submeter slug já presente na lista mockada com outro ID | Exibe erro e não chama `insertDocs`/`updateDocById` |

## URL Complementar

- Documentação técnica: [`src/pages/admin/editor.js`](../src/pages/admin/editor.js), [`src/pages/admin/collections.js`](../src/pages/admin/collections.js), [`src/utils/collection-order.js`](../src/utils/collection-order.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-10_feat-admin-reordenar-poemas-colecao.md`](DONE/2026-11-10_feat-admin-reordenar-poemas-colecao.md)
- Referências de design: [`src/pages/admin/editor.js`](../src/pages/admin/editor.js)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
