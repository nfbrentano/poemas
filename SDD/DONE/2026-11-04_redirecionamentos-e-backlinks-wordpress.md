# [SEO] Mapeamento de Redirecionamentos Legados do WordPress e Otimização de Backlinks Externos

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-04 · **Atualizada em:** 2026-11-04

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Extrair e mapear todas as 321 URLs legadas de posts do blog antigo no WordPress (`poemasdenatanael.wordpress.com`) contidas no arquivo de exportação oficial (`scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml`), integrando-as no arquivo de configuração [`scripts/legacy-redirects.json`](../scripts/legacy-redirects.json).
  2. Implementar redirecionamento dinâmico resiliente no roteador SPA ([`src/router.js`](../src/router.js)) e na página de fallback ([`public/404.html`](../public/404.html)) para interceptar qualquer URL no formato de permalink de data do WordPress (`/<ano>/<mes>/<dia>/<slug>/` ou `/<ano>/<mes>/<dia>/<slug>`) ou formato de query parameter (`/?p=<id>`), direcionando automaticamente para `/poema/<slug>/`.
  3. Garantir que o script de pré-renderização estática ([`scripts/prerender.js`](../scripts/prerender.js)) crie arquivos `index.html` estáticos de redirecionamento com `<link rel="canonical">` e `<meta http-equiv="refresh" content="0; url=/poema/<slug>/">` no diretório `dist/` para que o Googlebot receba resposta imediata mesmo sem executar JavaScript.
  4. Disponibilizar um guia de instruções com código pronto para ser inserido no painel do WordPress antigo (`poemasdenatanael.wordpress.com`), permitindo que visitantes e robôs sejam direcionados para o novo site canônico.

- **Problema e evidência:**
  - O relatório do Google Search Console identificou `https://poemasdenatanael.wordpress.com/` como "Página com link" / "Página de referência" (*Referring page*) para o domínio `nfgbrentano.art.br`.
  - No entanto, o arquivo `scripts/legacy-redirects.json` continha apenas 1 único poema mapeado manualmente (`/?p=277` e `/2021/02/18/277/`), enquanto 160 outros posts do WordPress antigo (`/2015/12/23/como-falar/`, `/2015/12/23/carinho/`, etc.) não estavam registrados.
  - Se robôs do Google ou visitantes chegassem a essas rotas antigas através dos links do WordPress, recebiam a página de erro 404 em vez de serem encaminhados para a obra correspondente, desperdiçando a autoridade externa (*PageRank* acumulado).

- **Impacto de não fazer:**
  - Visitantes e rastreadores que seguem links de permalinks antigos encontram erro 404.
  - Perda do valor de autoridade dos backlinks históricos do WordPress para o domínio novo.

- **Para quem é destinado:**
  - Leitores do blog antigo e robôs de busca (Googlebot, Bingbot) que chegam por meio de links externos ou favoritos legados.

- **História de usuário:**
  - Como leitor ou buscador vindo de um link do blog antigo do WordPress, quero ser redirecionado de forma transparente e imediata para o poema equivalente no novo site oficial, para ter acesso ao conteúdo sem encontrar página de erro.

- **Como saberemos que deu certo:**
  - 100% das 161 obras do WordPress histórico mapeadas com redirecionamento funcional para `/poema/<slug>/`.
  - Suíte de testes automatizados com novos testes cobrindo redirecionamento estático e dinâmico passando com 100% de sucesso.
  - Build de produção (`npm run build`) gerando páginas estáticas de redirecionamento sem erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Mapear todas as URLs de posts legados do WordPress (`scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml`) em `scripts/legacy-redirects.json` associando-as ao padrão `/poema/<slug>/` | P0 | CA01, CA02 |
| RF02 | No roteador SPA (`src/router.js`), reconhecer padrões de data `^/\\d{4}/\\d{2}/\\d{2}/([^/]+)/?$` e redirecionar dinamicamente para `/poema/<slug>/` | P0 | CA01 |
| RF03 | Na página `public/404.html`, detectar padrões `^/\\d{4}/\\d{2}/\\d{2}/([^/]+)/?$` e `?p=<id>` e redirecionar imediatamente para a URL canônica `/poema/<slug>/` | P0 | CA01, CA02 |
| RF04 | Na pré-renderização (`scripts/prerender.js`), gerar arquivos estáticos de redirecionamento em `dist/` para as rotas do WordPress, contendo `<link rel="canonical">` e meta refresh | P0 | CA03 |
| RF05 | Manter integridade com redirecionamentos já existentes (`/sobre-mim`, `/?p=277`, `/tag/*`) | P0 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O redirecionamento estático deve responder com meta refresh imediato (`content="0; url=..."`) e canonical correto | P0 | CA03 |
| RNF02 | O script de geração e o build devem ser idempotentes e não interferir nas rotas públicas normais | P0 | CA03 |
| RNF03 | 100% dos testes do projeto devem passar com sucesso (`npx vitest run`) | P0 | CA05 |

### Dependências técnicas

- `scripts/dev/poemasdenatanael.WordPress.2026-04-25.xml`
- `scripts/legacy-redirects.json`
- `src/router.js`
- `public/404.html`
- `scripts/prerender.js`

### Recursos necessários

- N/A (dados locais já presentes no repositório).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um usuário ou robô acessa uma URL no formato de data do WordPress (`/2015/12/23/como-falar/` ou `/2015/12/23/como-falar`), quando a requisição é processada, então é redirecionado para `/poema/como-falar/`.
- [x] **CA02:** Dado que um usuário ou robô acessa uma URL legada por parâmetro de ID (`/?p=2`), quando a página é carregada, então é redirecionado para `/poema/como-falar/`.
- [x] **CA03:** Dado que o build é executado (`npm run build`), quando `scripts/prerender.js` processa os redirecionamentos legados, então arquivos estáticos `index.html` com canonical e meta refresh são gerados nas pastas de ano/mês/dia correspondentes em `dist/`.
- [x] **CA04:** Dado que um usuário acessa rotas legadas previamente suportadas como `/sobre-mim` ou `/tag/amor`, quando a requisição é feita, então continua sendo redirecionado para `/sobre/` e `/sentimento/amor/` respectivamente.
- [x] **CA05:** Dado que todas as alterações foram implementadas, quando executo `npx vitest run`, então todos os testes passam sem regressão.

## O que a atividade não inclui

- Alteração direta nos servidores da Automattic / WordPress.com: motivo: ambiente SaaS externo fora do escopo do repositório local (será fornecido guia passo a passo para o autor).

### Considerado para o futuro (P2)

- Script automatizado com autenticação na API do WordPress.com para atualização de conteúdo remoto caso credenciais sejam disponibilizadas.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Como lidar com slugs que sofreram pequena alteração ortográfica na migração? | dev | Não | O mapeamento explícito de `legacy-redirects.json` associa cada `post_name` do WordPress ao slug correspondente no acervo atual. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Redirecionamento por permalink de data | Unitário / Integração | CA01 | Simular rota `/2015/12/23/como-falar/` no roteador | Redireciona para `/poema/como-falar/` |
| CT02 | Redirecionamento por query param `?p=2` | Unitário / Integração | CA02 | Simular requisição com `search="?p=2"` | Redireciona para `/poema/como-falar/` |
| CT03 | Redirecionamento dinâmico por padrão de regex | Unitário | CA01 | Simular rota de data não listada expressamente mas com slug válido | Redireciona para `/poema/<slug>/` |
| CT04 | Validação dos arquivos estáticos em `dist/` | Build | CA03 | Executar build e verificar se `dist/2015/12/23/como-falar/index.html` existe | Arquivo presente com meta refresh |

## URL Complementar

- Documentação Google Search Central sobre redirecionamentos e migração de sites: https://developers.google.com/search/docs/crawling-indexing/301-redirects
