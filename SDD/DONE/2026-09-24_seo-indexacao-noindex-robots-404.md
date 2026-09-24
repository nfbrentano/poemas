# {SEO} Controle de indexação: noindex, robots.txt, soft 404 e slugs legados

## Detalhes da Atividade

- **O que precisa ser feito:** Impedir a indexação de páginas sem valor de busca, tratar corretamente páginas inexistentes e preservar URLs antigas.
- **Por que é necessário:**
  - `/admin`, `/login`, `/unsubscribe` e `/cancelar-inscricao` são prerenderizados, sem `noindex`, e o `robots.txt` permite tudo. Podem aparecer na busca e consomem orçamento de rastreamento.
  - Poemas/coleções inexistentes e rotas desconhecidas renderizam um 404 dentro da SPA respondendo 200 e sem `noindex`: são **soft 404** no Search Console.
  - `public/404.html` redireciona tudo para `/` por JS. O Googlebot pode interpretar URLs quebradas como a home.
  - Existem slugs numéricos herdados do WordPress (ex.: `/poema/277`) e possíveis URLs antigas (`/?p=277`, `/AAAA/MM/slug/`) com backlinks externos.
- **Qual valor será agregado:** Índice mais limpo (só páginas úteis), relatórios de cobertura sem erros e preservação da autoridade de links antigos.
- **Para quem é destinado:** Mecanismos de busca e o autor, que acompanha o Search Console.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Adicionar `<meta name="robots" content="noindex, nofollow">` no prerender e na SPA de `/admin`, `/login`, `/unsubscribe` e `/cancelar-inscricao`.
- RF02: Atualizar `public/robots.txt` com `Disallow: /admin` (manter as demais permitidas para que o `noindex` seja lido) e manter a linha `Sitemap:`.
- RF03: Remover essas páginas de qualquer sitemap.
- RF04: Quando a SPA exibir o estado "não encontrado" (rota desconhecida, poema ou coleção inexistente ou rascunho), adicionar `<meta name="robots" content="noindex">`, título "Página não encontrada — Natanael Brentano" e remover o canonical.
- RF05: Em `public/404.html`, antes de redirecionar, conferir se o caminho corresponde a uma rota conhecida (poema, coleção, sentimento, estática) a partir de uma lista gerada no build (`dist/routes.json` ou inline). Se não corresponder, exibir uma página 404 estática própria (com `noindex`, links para a home, coleções e busca), sem redirecionar para `/`, preservando o status 404 do GitHub Pages.
- RF06: Criar um mapa de redirecionamentos legados (`scripts/legacy-redirects.json`: `origem → destino`) e gerar no build `dist/<origem>/index.html` com `<link rel="canonical" href="destino">` + `<meta http-equiv="refresh" content="0; url=destino">` + link visível.
- RF07: Levantar no Search Console (relatórios "Não encontrado (404)" e "Links") as URLs antigas com impressões/backlinks para preencher o mapa.

### Requisitos não-funcionais

- RNF01: Nenhuma página indexável pode ter `noindex` por engano: teste automatizado no build que falha se uma URL do sitemap contiver `noindex`.
- RNF02: Os redirecionamentos por `meta refresh` devem ter tempo 0 (o Google os trata como redirecionamento permanente).

### Dependências técnicas

- `scripts/prerender.js`, `scripts/generate-sitemap.js`, `public/robots.txt`, `public/404.html`, `src/router.js`, `src/pages/*.js`, `src/utils/seo.js`
- `2026-09-24_seo-paginas-de-sentimentos.md` (redirecionamento `/tag/*`)

### Recursos necessários

- Acesso ao Google Search Console (relatórios de cobertura e links).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado `dist/admin/index.html`, quando o inspeciono, então contém `noindex, nofollow`.
- [x] **CA02:** Dado `robots.txt` publicado, quando o valido no testador do Search Console, então `/admin` está bloqueado e `/poema/x/` permitido.
- [x] **CA03:** Dado a URL `/poema/nao-existe/`, quando a abro, então vejo a página de "não encontrado" com `noindex` e sem canonical.
- [x] **CA04:** Dado a URL `/qualquer-coisa-inexistente`, quando faço `curl -I`, então o status é `404` e o HTML não redireciona para `/`.
- [x] **CA05:** Dado uma entrada `/?p=277 → /poema/<slug>/` no mapa legado (ou equivalente), quando acesso a origem, então chego ao destino.
- [x] **CA06:** Dado o build, quando uma URL do sitemap tem `noindex`, então o build falha com mensagem clara.

## O que a atividade não inclui

- Proteção de acesso ao `/admin` (segurança é tratada pelas regras do Firebase, não por robots).
- Mudança de hospedagem para obter redirecionamentos 301 reais.
- Remoção manual de URLs no Search Console (ação operacional do autor).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | noindex páginas privadas | `grep -l noindex dist/{admin,login,unsubscribe,cancelar-inscricao}/index.html` | 4 arquivos |
| CT02 | Sitemap limpo | Buscar `admin`/`login` no `sitemap.xml` | Nenhuma ocorrência |
| CT03 | Soft 404 SPA | Navegar via SPA para um slug inexistente | Meta `noindex` presente, título de 404 |
| CT04 | Rota válida via 404.html | Acessar em janela anônima uma rota SPA sem arquivo prerenderizado | Carrega a rota correta |
| CT05 | Rota inválida | Acessar `/xyz` | Página 404 estática, status 404 |
| CT06 | Guarda no build | Forçar `noindex` num poema e rodar build | Build falha |

## URL Complementar

- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/block-indexing
- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/http-network-errors#soft-404-errors
- Documentação técnica: https://developers.google.com/search/docs/crawling-indexing/301-redirects#metarefresh
- Protótipo / mockup: Reaproveitar o componente `not-found-page`.
- Discussões relacionadas: `SDD/DONE/2026-09-23_rascunhos-nao-publicos.md`
- Referências de design: N/A.
- Requisitos originais: Auditoria de SEO de 2026-09-24.
