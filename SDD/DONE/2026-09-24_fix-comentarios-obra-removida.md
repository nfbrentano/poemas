# [FIX] Resolução do título do poema nos comentários da moderação administrativa

## Detalhes da Atividade

- **O que precisa ser feito:** Corrigir a listagem de comentários na tela administrativa (`admin?view=comments`), fazendo a junção/resolução em memória entre a coleção `poem_comments` e a coleção `poems` do Firestore, garantindo que o título do poema (e link para a obra) seja exibido corretamente em vez do texto genérico "Obra removida".
- **Por que é necessário:** O Firestore é um banco de documentos NoSQL e não suporta joins relacionais SQL (`poems(title)` na sintaxe PostgREST/Supabase). Como o adapter de migração do Supabase para o Firebase em `admin.js` apenas mapeia os campos do documento `poem_comments` (que contém apenas `poem_id`), a propriedade `c.poems` ficava sempre `undefined`, fazendo com que a interface exibisse sempre "Em: Obra removida", impossibilitando o moderador de saber em qual obra o comentário foi publicado.
- **Qual valor será agregado:** O administrador conseguirá identificar imediatamente a qual poema pertence cada comentário recebido, podendo visualizar o poema e moderar (aprovar/excluir) com total contexto da obra.
- **Para quem é destinado:** Administrador e moderador do site.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: No método `renderComments` de `src/pages/admin.js`, carregar concorrentemente (via `Promise.all`) a lista de comentários de `poem_comments` e a lista de obras da coleção `poems` (`id, title, slug`).
- RF02: Mapear e associar cada comentário ao seu poema correspondente utilizando `c.poem_id` como chave contra o `id` (ou `slug`) dos poemas.
- RF03: Exibir o título real do poema no cabeçalho do comentário. Se o poema tiver `slug`, renderizar o título como link (`target="_blank"`) para a página do poema (`/poema/{slug}`).
- RF04: Caso o `poem_id` do comentário não corresponda a nenhum poema existente no banco (ou seja, a obra foi de fato excluída), manter de forma graciosa e destacada o texto "Obra removida".

### Requisitos não-funcionais

- RNF01: Desempenho: a busca dos poemas e comentários deve ocorrer em paralelo com `Promise.all` para não aumentar o tempo de carregamento da aba.
- RNF02: Segurança e higienização: o título do poema e slug devem ser devidamente escapados com `escapeHtml` para prevenir vulnerabilidades de XSS.

### Dependências técnicas

- `src/pages/admin.js` (método `renderComments`)
- Coleções `poem_comments` e `poems` no Firestore

### Recursos necessários

- Acesso ao painel administrativo `/admin?view=comments`.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um comentário cujo `poem_id` existe na coleção `poems`, quando a tela de comentários do admin é carregada, então é exibido "Em: [Título do Poema]" com link direto para `/poema/[slug]`.
- [x] **CA02:** Dado um comentário cujo poema associado foi realmente excluído do banco ou não possui correspondência, quando a tela de comentários é carregada, então é exibido "Em: Obra removida".
- [x] **CA03:** Dado que o administrador aprova ou exclui um comentário, quando a tabela é recarregada, então a resolução dos títulos dos poemas continua funcionando normalmente.

## O que a atividade não inclui

- Alteração na criação de comentários (`poem-comments.js`) ou nas regras de segurança do Firestore (`firestore.rules`), preservando o esquema restrito existente.
- Alteração na coleção de poemas ou no fluxo de aprovação/exclusão de comentários.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Comentário vinculado a poema existente | Carregar `renderComments` com comentários possuindo `poem_id` válido | Exibe título do poema e link clicável para `/poema/{slug}` |
| CT02 | Comentário órfão (obra excluída) | Carregar `renderComments` com `poem_id` inexistente na lista de poemas | Exibe "Em: Obra removida" |
| CT03 | Teste automatizado de resolução de comentários | Executar teste unitário validando a função de junção e mapeamento dos comentários com poemas | Teste passa com 100% de sucesso |

## URL Complementar

- Documentação técnica: N/A (Firestore não suporta joins relacionais, padrão similar já adotado em `renderEmailHistory` no mesmo arquivo)
- Protótipo / mockup: N/A
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Relato do usuário reportando que em comentários todos os itens mostram "Em: Obra removida".
