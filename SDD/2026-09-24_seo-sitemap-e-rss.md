# {SEO} Sitemap e RSS: lastmod real, datas de atualização e feed completo

## Detalhes da Atividade

- **O que precisa ser feito:** Tornar o sitemap e o feed RSS fontes confiáveis de descoberta e atualização de conteúdo.
- **Por que é necessário:**
  - O `<lastmod>` dos poemas usa `published_at`: edições posteriores nunca são sinalizadas. Home e coleções não têm `lastmod`.
  - Os poemas não têm `updated_at` (nenhum código grava ou lê esse campo).
  - `changefreq` e `priority` são ignorados pelo Google e só aumentam o arquivo.
  - `public/sitemap.xml` e `public/feed.xml` estão versionados e desatualizados (feed com `lastBuildDate` de 16/09), gerando diffs e risco de publicar dados velhos.
  - O RSS só tem excerto de 160 caracteres, sem `content:encoded`, autor, categorias e imagem do canal. O `lastBuildDate` é a data do poema mais recente, não a do build.
  - Os logs do script de sitemap ainda dizem "Supabase".
- **Qual valor será agregado:** Recrawl mais rápido de conteúdos novos e editados, feed útil para agregadores (que geram backlinks e tráfego) e menos manutenção manual.
- **Para quem é destinado:** Mecanismos de busca, leitores de RSS e agregadores de poesia.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Gravar `updated_at` (serverTimestamp) sempre que um poema for criado ou editado pelo painel admin; script único de migração que preenche `updated_at = published_at` nos poemas existentes.
- RF02: Sitemap: `lastmod` do poema = `updated_at ?? published_at`; da coleção = maior `lastmod` entre seus poemas; da home e de `/sentimento/*` = maior `lastmod` dos poemas listados; das páginas estáticas = data de modificação do arquivo fonte (ou omitir).
- RF03: Remover `changefreq` e `priority`.
- RF04: Dividir em índice de sitemaps (`sitemap.xml` → `sitemap-poemas.xml`, `sitemap-colecoes.xml`, `sitemap-paginas.xml`, `sitemap-sentimentos.xml`) para facilitar a análise de cobertura por tipo no Search Console.
- RF05: Gerar sitemap e feed diretamente em `dist/` (não em `public/`) e remover `public/sitemap.xml` e `public/feed.xml` do git, adicionando-os ao `.gitignore`.
- RF06: RSS: adicionar namespaces `content`, `dc` e `atom`; por item, incluir `content:encoded` com o poema completo em CDATA (HTML sanitizado), `dc:creator`, uma `category` por sentimento e `link`/`guid` canônicos; no canal, `atom:link rel="self"`, `image`, `language pt-BR` e `lastBuildDate` = horário do build.
- RF07: Limitar o feed aos 50 poemas mais recentes.
- RF08: Corrigir as mensagens de log "Supabase" → "Firestore".
- RF09: Após o deploy, pingar o IndexNow (Bing/Yandex) com as URLs novas/alteradas desde o último build (opcional, atrás de flag).

### Requisitos não-funcionais

- RNF01: Sitemap válido segundo o XSD do sitemaps.org; feed válido no W3C Feed Validator.
- RNF02: Somente poemas `status == 'published'` em ambos (manter a regra de `SDD/DONE/2026-09-23_rascunhos-nao-publicos.md`).
- RNF03: Todas as URLs no formato canônico com barra final (`2026-09-24_seo-urls-canonicas-barra-final.md`).

### Dependências técnicas

- `scripts/generate-sitemap.js`, `scripts/generate-rss.js`, `package.json` (ordem do `build`), painel admin (gravação de poemas), `.gitignore`
- `fast-xml-parser` (já instalado) para testes de validação

### Recursos necessários

- Acesso ao Search Console para reenviar o índice de sitemaps.
- Chave IndexNow (arquivo `.txt` na raiz), se RF09 for implementado.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que edito um poema no admin, quando rodo o build, então o `lastmod` desse poema no sitemap é a data da edição.
- [ ] **CA02:** Dado o build, quando abro `dist/sitemap.xml`, então é um `sitemapindex` que aponta para os sitemaps por tipo, todos válidos.
- [ ] **CA03:** Dado o sitemap gerado, quando procuro `changefreq` ou `priority`, então não há ocorrências.
- [ ] **CA04:** Dado `dist/feed.xml`, quando o valido no W3C, então é válido e cada item tem `content:encoded` com o poema completo.
- [ ] **CA05:** Dado o repositório, quando rodo `git status` após o build, então `sitemap.xml` e `feed.xml` não aparecem como alterados.
- [ ] **CA06:** Dado um rascunho, quando gero sitemap e feed, então ele não aparece em nenhum dos dois.

## O que a atividade não inclui

- Sitemap de imagens ou de vídeo (as imagens OG não são conteúdo principal).
- Newsletter por RSS (o envio já é feito pela função `sendNewsletter`).
- Feeds por coleção ou sentimento (possível feature futura).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Unitário lastmod | Poema com `updated_at` > `published_at` | `lastmod` = `updated_at` |
| CT02 | lastmod de coleção | Coleção com poemas de datas diferentes | Maior data entre eles |
| CT03 | XSD | Validar os XMLs gerados com `fast-xml-parser` + schema | Válidos |
| CT04 | Feed completo | Parsear `feed.xml` | ≤ 50 itens, cada um com `content:encoded`, `dc:creator` e categorias |
| CT05 | Migração | Rodar script de `updated_at` duas vezes | Idempotente, não sobrescreve valores existentes |
| CT06 | Git limpo | `npm run build && git status --porcelain` | Nenhum arquivo de `public/` alterado |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Documentação técnica: https://www.rssboard.org/rss-specification ; https://validator.w3.org/feed/
- Documentação técnica: https://www.indexnow.org/documentation
- Protótipo / mockup: N/A — sem interface.
- Discussões relacionadas: `SDD/DONE/2026-09-23_rascunhos-nao-publicos.md`
- Referências de design: N/A.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
