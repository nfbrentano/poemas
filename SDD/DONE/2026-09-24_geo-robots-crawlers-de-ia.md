# {GEO} Política explícita para crawlers de IA no robots.txt

## Detalhes da Atividade

- **O que precisa ser feito:** Declarar no `public/robots.txt` uma política explícita para os crawlers dos motores de IA, separando os robôs de **busca/citação** (que trazem tráfego) dos robôs de **treinamento** de modelos. Também é preciso bloquear rotas privadas que hoje não estão no robots e garantir que o site esteja registrado nos índices que alimentam as buscas com IA.
- **Por que é necessário:**
  - O `robots.txt` atual tem só `User-agent: *` / `Disallow: /admin`. Os robôs de IA ficam liberados por omissão, mas sem uma decisão consciente do autor sobre treinamento × citação. Algumas ferramentas de auditoria de GEO pontuam negativamente a ausência de regras explícitas.
  - As rotas `/login`, `/analytics` e `/unsubscribe` existem na SPA (`src/pages/`) e não estão bloqueadas.
  - A busca do ChatGPT usa o índice do Bing, e o Copilot também. O script `scripts/ping-indexnow.js` existe, mas não há critério garantindo que o site esteja verificado no Bing Webmaster Tools.
- **Qual valor será agregado:** Um canal de tráfego vindo de ChatGPT Search, Perplexity, Claude, Gemini/AI Overviews e Copilot. O autor também passa a controlar explicitamente o uso da obra para treinamento.
- **Para quem é destinado:** O autor (controle sobre a obra) e os leitores que chegam por respostas de assistentes de IA.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Adicionar ao `robots.txt` blocos explícitos com `Allow: /` para os robôs de busca/citação de IA: `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `DuckAssistBot` e `Bingbot`.
- RF02: Adicionar blocos para os robôs de treinamento (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `meta-externalagent`, `Bytespider`) conforme a **decisão do autor** (ver Dependências). O padrão proposto é permitir, para maximizar a presença nos modelos. A alternativa é `Disallow: /`, preservando a obra de treinamento sem afetar a citação em buscas.
- RF03: Em todos os blocos, bloquear `/admin`, `/login`, `/analytics` e `/unsubscribe`.
- RF04: Manter a linha `Sitemap: https://nfgbrentano.art.br/sitemap.xml` e adicionar um comentário apontando para `/llms.txt` (ver `2026-09-24_geo-llms-txt.md`).
- RF05: Garantir que o `scripts/ping-indexnow.js` rode após o deploy (workflow `.github/workflows/deploy.yml`) com as URLs novas/alteradas, e que a chave IndexNow esteja publicada em `public/`.

### Requisitos não-funcionais

- RNF01: O `robots.txt` deve ser válido segundo a RFC 9309 (um grupo por `User-agent`, sem diretivas desconhecidas que quebrem parsers).
- RNF02: Não usar `noindex` nem bloquear `Googlebot`/`Bingbot` em páginas públicas. A decisão sobre treinamento não pode afetar o SEO clássico.
- RNF03: Adicionar um teste automatizado (vitest) que lê `public/robots.txt` e valida os RFs.

### Dependências técnicas

- **Decisão do autor:** permitir ou bloquear robôs de treinamento (RF02).
- Verificação do domínio no Bing Webmaster Tools e no Google Search Console (já existe a meta `google-site-verification`).
- `scripts/ping-indexnow.js` e `.github/workflows/deploy.yml`.

### Recursos necessários

- Acesso ao Bing Webmaster Tools e ao Google Search Console.
- Acesso aos secrets do GitHub Actions, se a chave IndexNow precisar ser configurada.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o site publicado, quando acesso `https://nfgbrentano.art.br/robots.txt`, então vejo grupos explícitos para os robôs de busca de IA listados em RF01, todos com `Allow: /`.
- [x] **CA02:** Dado o `robots.txt` publicado, quando o avalio para `GPTBot`, `ClaudeBot` e `Google-Extended`, então o resultado corresponde à decisão registrada pelo autor.
- [x] **CA03:** Dado qualquer `User-agent`, quando testo `/admin`, `/login`, `/analytics` e `/unsubscribe`, então todas estão bloqueadas.
- [x] **CA04:** Dado que fiz um deploy com um poema novo, quando o workflow termina, então o log mostra o ping do IndexNow com a URL do poema.
- [x] **CA05:** Dado o domínio, quando consulto o Bing Webmaster Tools, então o site está verificado e o sitemap foi enviado.

## O que a atividade não inclui

- Criação do `llms.txt` (tarefa própria: `2026-09-24_geo-llms-txt.md`).
- Bloqueio de robôs por firewall/WAF ou por user-agent no servidor (hospedagem GitHub Pages não permite).
- Mudanças em meta robots das páginas (já tratado em `SDD/DONE/2026-09-24_seo-indexacao-noindex-robots-404.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Parser de robots | Rodar teste vitest com um parser RFC 9309 para cada user-agent listado | Allow/Disallow conforme RF01–RF03 |
| CT02 | Rotas privadas | Avaliar `/admin/x`, `/login`, `/analytics` para `*`, `GPTBot` e `OAI-SearchBot` | Bloqueadas |
| CT03 | Páginas públicas | Avaliar `/poema/com-voce/` para `Googlebot`, `Bingbot` e `OAI-SearchBot` | Permitidas |
| CT04 | Validador externo | Colar o robots no validador do Google Search Console | Sem erros |
| CT05 | IndexNow | Rodar `node scripts/ping-indexnow.js` com uma URL de teste | Resposta 200/202 da API |

## URL Complementar

- Documentação técnica: [OpenAI — crawlers](https://platform.openai.com/docs/bots), [Anthropic — crawlers](https://support.anthropic.com/en/articles/8896518), [Perplexity — crawlers](https://docs.perplexity.ai/guides/bots), [Google — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers), [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309), [IndexNow](https://www.indexnow.org/)
- Protótipo / mockup: N/A — arquivo de configuração, sem interface.
- Discussões relacionadas: `SDD/DONE/2026-09-24_seo-indexacao-noindex-robots-404.md`, `SDD/DONE/2026-09-24_seo-sitemap-e-rss.md`
- Referências de design: N/A — sem interface.
- Requisitos originais: relatório de auditoria em 2026-09-24: "A sua Otimização de Motores de Geração poderia ser melhor… garantir que os LLMs e motores de busca de IA possam efetivamente rastrear o seu conteúdo".
