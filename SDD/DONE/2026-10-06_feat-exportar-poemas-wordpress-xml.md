# [FEAT] Exportar os poemas atuais em XML no formato de exportação do WordPress

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-06 · **Atualizada em:** 2026-10-06

## Detalhes da Atividade

- **O que precisa ser feito:** Criar um comando que gera um arquivo XML no formato WXR 1.2 (o mesmo do export original `scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml`) com todos os poemas que existem hoje no site.
- **Problema e evidência:** O único backup completo dos poemas é o XML de abril de 2026, com 161 itens. O site tem hoje 236 poemas publicados, ou seja, mais de 70 poemas não estão em nenhum backup fora do banco.
- **Impacto de não fazer:** Se o banco for perdido ou alterado por engano, os poemas escritos depois da migração só existem no Firestore.
- **Para quem é destinado:** Autor/administrador do site.
- **História de usuário:** Como autor, quero gerar um arquivo XML com todos os meus poemas atuais no mesmo formato do export original, para ter um backup portátil que também possa ser importado no WordPress.
- **Como saberemos que deu certo:** O XML gerado é válido (`xmllint`), tem um item para cada poema publicado, e cada item tem a mesma estrutura de elementos do item do export original.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | `buildWxr({ poems, siteUrl, now })` (módulo puro em `src/utils/wxr-builder.js`) devolve o XML WXR 1.2 com o cabeçalho, o autor e um `<item>` por poema, ordenados do mais antigo ao mais novo | P0 | CA01, CA02 |
| RF02 | Cada item traz: `title`, `link` (`<site>/poema/<slug>`), `pubDate`, `dc:creator`, `guid`, `content:encoded`, `excerpt:encoded`, `wp:post_id`, datas (`post_date`, `_gmt`, `post_modified`, `_gmt`), `wp:post_name`, `wp:status`, `wp:post_type` e categorias | P0 | CA02 |
| RF03 | Conteúdo em texto puro é escapado e envolvido no bloco de verso do original (`<!-- wp:verse {"textAlign":"center"} --><pre class="wp-block-verse has-text-align-center">…</pre><!-- /wp:verse -->`); conteúdo que já é HTML é mantido como está | P0 | CA03, CA04 |
| RF04 | Tags viram `<category domain="post_tag" nicename="…">`; todo item mantém também a categoria `sem-categoria`, como no original | P0 | CA05 |
| RF05 | Status: `published` → `publish`, `draft` → `draft`, `scheduled` → `future` | P1 | CA06 |
| RF06 | O script `scripts/export-wordpress-xml.js` busca os poemas no Firestore, gera o arquivo em `exports/` (ignorado pelo git) e aceita `--out <caminho>`; atalho `npm run export:wxr` | P0 | CA07 |
| RF07 | Textos com `]]>` não quebram o XML (a sequência é dividida em dois blocos CDATA) | P0 | CA08 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O arquivo gerado é XML bem-formado (valida com `xmllint --noout`) e legível por `fast-xml-parser` | P0 | CA01 |
| RNF02 | Nenhuma credencial é pedida ou gravada; o script só usa as variáveis públicas do Firebase já usadas pelos outros scripts | P0 | CA07 |
| RNF03 | Datas locais em `America/Sao_Paulo`, datas GMT em UTC | P1 | CA02 |

### Dependências técnicas

- `src/utils/url.js` (`SITE_URL`), `src/utils/tags.js` (`slugifyTag`), Firestore (leitura pública de poemas publicados)

### Recursos necessários

- `.env.local` com as variáveis `VITE_FIREBASE_*` (já existe no projeto)

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o arquivo gerado, quando valido com `xmllint --noout`, então não há erro; e quando leio com `fast-xml-parser`, então há um item por poema.
- [x] **CA02:** Dado um poema, quando gero o item, então contém todos os elementos do RF02, na mesma ordem do item do export original, com datas coerentes.
- [x] **CA03:** Dado um poema em texto puro com `&`, `<` ou `>`, quando gero o item, então esses caracteres vêm escapados dentro do `<pre>` e o bloco de verso envolve o texto.
- [x] **CA04:** Dado um poema cujo conteúdo já é HTML (`<pre>`, `<br>`, `<strong>`), quando gero o item, então o HTML é mantido sem escape adicional.
- [x] **CA05:** Dado um poema com tags, quando gero o item, então cada tag é uma categoria `post_tag` com `nicename` em slug, além de `sem-categoria`.
- [x] **CA06:** Dado poemas `published`, `draft` e `scheduled`, quando gero, então o `wp:status` é `publish`, `draft` e `future`.
- [x] **CA07:** Dado `.env.local`, quando rodo `npm run export:wxr`, então é criado `exports/poemas-AAAA-MM-DD.xml` com os poemas publicados e o terminal informa a quantidade.
- [x] **CA08 (negativo):** Dado um conteúdo com `]]>`, quando gero o XML, então ele continua válido.
- [x] **CA09 (negativo):** Dado o repositório, quando verifico o git, então a pasta `exports/` não é versionada.

## O que a atividade não inclui

- Rascunhos e agendados: só os poemas publicados são legíveis sem login de administrador, e o script não pede nem guarda senha. Fica como P2 (exportar a partir do admin logado).
- Comentários (`wp:comment`) e imagens/mídia: o escopo são os poemas.
- Os metadados internos do WordPress/Jetpack (`_publicize_*`, `_elasticsearch_*`, etc.): são ruído técnico do WordPress.com, sem valor para os poemas.
- Reproduzir os IDs originais do WordPress: os `wp:post_id` são sequenciais a partir de 1.

### Considerado para o futuro (P2)

- Botão "Exportar XML" no admin, incluindo rascunhos e agendados.
- Incluir comentários aprovados.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | Há rascunhos que também devem entrar no backup? | PO | Não | Fora desta entrega (ver P2) |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Estrutura do item | unit | CA02 | `buildWxr` com 1 poema; comparar ordem dos elementos | Igual ao original |
| CT02 | Texto puro | unit | CA03 | Conteúdo com `&`, `<`, `>` | Escapado e dentro do bloco de verso |
| CT03 | HTML existente | unit | CA04 | Conteúdo com `<pre>` e `<br>` | Mantido |
| CT04 | Tags e categorias | unit | CA05 | Poema com 2 tags | 2 `post_tag` + `sem-categoria` |
| CT05 | Status | unit | CA06 | 3 poemas | `publish`, `draft`, `future` |
| CT06 | CDATA seguro | unit | CA08 | Conteúdo com `]]>` | XML válido |
| CT07 | Datas | unit | CA02 | `published_at` UTC | Local −3h, GMT inalterado |
| CT08 | Execução real | manual | CA01, CA07 | `npm run export:wxr && xmllint --noout exports/*.xml` | Sem erro; contagem igual à do banco |
| CT09 | Git | manual | CA09 | `git status` | `exports/` ausente |

## URL Complementar

- Documentação técnica: https://wordpress.org/documentation/article/tools-export-screen/
- Protótipo / mockup: N/A
- Discussões relacionadas: `SDD/DONE/2026-10-06_chore-limpar-scripts-dev.md` (manteve o export original)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
