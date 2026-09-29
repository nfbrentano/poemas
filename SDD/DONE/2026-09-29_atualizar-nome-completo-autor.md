# [UI] [SEO] Atualizar nome do autor para "Natanael Fernando Gatti Brentano" em toda a aplicação

> **Status:** Concluída  
> **Autor:** Natanael Brentano / Antigravity · **Revisor:** Natanael Brentano · **Criada em:** 2026-09-29 · **Atualizada em:** 2026-09-29

## Detalhes da Atividade

- **O que precisa ser feito:** Substituir todas as ocorrências públicas e estruturais do nome do autor de "Natanael Brentano" para "Natanael Fernando Gatti Brentano", abrangendo interface (cabeçalho, rodapé, páginas Sobre, Home, Coleções, Sentimentos, Poemas), metadados (SEO, tags Open Graph, Schema.org JSON-LD, feeds RSS, llms.txt), manifestos, scripts de pré-renderização, funções de notificação e testes automatizados.
- **Problema e evidência:** O autor deseja que sua autoria seja formal e consistentemente creditada com seu nome completo ("Natanael Fernando Gatti Brentano") em todos os canais do projeto (UI, buscadores, feeds, IA generativa e redes sociais). Atualmente o sistema exibe "Natanael Brentano" de forma abreviada.
- **Impacto de não fazer:** Inconsistência na identidade do autor e na atribuição dos direitos autorais entre as diferentes páginas, motores de busca e modelos de IA (GEO).
- **Para quem é destinado:** Leitores, buscadores (Google, Bing), sistemas de IA (ChatGPT, Perplexity, Gemini) e assinantes da newsletter.
- **História de usuário:** Como autor e proprietário do site, quero que meu nome completo "Natanael Fernando Gatti Brentano" apareça em todos os lugares do site, para garantir a assinatura formal e correta de todas as minhas obras e da plataforma.
- **Como saberemos que deu certo:** Nenhuma ocorrência de "Natanael Brentano" (sem os sobrenomes intermediários "Fernando Gatti") existirá no código da aplicação, templates, metadados ou testes ativos, e toda a suíte de testes do Vitest passará com sucesso.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar o logotipo/marca no cabeçalho desktop (`.site-header .logo`) e no mobile (`.mobile-brand`) para "Natanael Fernando Gatti Brentano". | P0 | CA01 |
| RF02 | Atualizar o rodapé (`.site-footer`) com a mensagem de copyright exibindo "Natanael Fernando Gatti Brentano". | P0 | CA02 |
| RF03 | Atualizar as páginas institucionais e editoriais (Home, Sobre, Coleções, Sentimentos e Poemas) para referenciar "Natanael Fernando Gatti Brentano". | P0 | CA03 |
| RF04 | Atualizar os metadados de SEO (tags `<title>`, `<meta name="author">`, Open Graph, Twitter Cards) e Schema.org JSON-LD em `src/utils/seo.js` e `src/utils/structured-data.js`. | P0 | CA04 |
| RF05 | Atualizar os arquivos estáticos e de feeds: `index.html`, `public/manifest.json`, `public/404.html`, `src/utils/rss-builder.js`, `src/utils/llms-builder.js` e `scripts/prerender.js`. | P0 | CA05 |
| RF06 | Atualizar os scripts de envio e background (`scripts/send-daily-poem.js`, `functions/index.js`, `supabase/functions/send-newsletter/index.ts`). | P1 | CA06 |
| RF07 | Atualizar as suítes de testes do Vitest para validar o novo nome completo "Natanael Fernando Gatti Brentano". | P0 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Responsividade tipográfica: garantir que o nome mais longo (33 caracteres) mantenha boa legibilidade no cabeçalho e na marca móvel sem quebras indesejadas em telas de diferentes larguras. | P0 | CA01 |
| RNF02 | Consistência de dados: todas as saídas de Schema.org (`Person`, `Author`, `Publisher`) devem conter exatamente o mesmo nome canônico. | P0 | CA04 |
| RNF03 | Desempenho e regressão zero: todas as suítes de teste (25 arquivos, >220 testes) devem passar sem regressões. | P0 | CA07 |

### Dependências técnicas

- Componentes e páginas: [`src/components/header.js`](../src/components/header.js), [`src/pages/about.js`](../src/pages/about.js), [`src/pages/home.js`](../src/pages/home.js), [`src/pages/poem.js`](../src/pages/poem.js), [`src/pages/collection.js`](../src/pages/collection.js), [`src/pages/collections.js`](../src/pages/collections.js), [`src/pages/sentiment.js`](../src/pages/sentiment.js), [`src/pages/sentiments.js`](../src/pages/sentiments.js).
- Utilitários: [`src/utils/seo.js`](../src/utils/seo.js), [`src/utils/structured-data.js`](../src/utils/structured-data.js), [`src/utils/rss-builder.js`](../src/utils/rss-builder.js), [`src/utils/llms-builder.js`](../src/utils/llms-builder.js), [`src/utils/social-export.js`](../src/utils/social-export.js), [`src/utils/about-template.js`](../src/utils/about-template.js), [`src/utils/poem-template.js`](../src/utils/poem-template.js).
- Scripts: [`scripts/prerender.js`](../scripts/prerender.js), [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js).
- HTMLs e Manifestos: [`index.html`](../index.html), [`public/manifest.json`](../public/manifest.json), [`public/404.html`](../public/404.html).

### Recursos necessários

- Suíte de testes Vitest (`npx vitest run`).
- Navegador local para conferência visual.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que um usuário acessa qualquer página no desktop ou mobile, quando visualiza o cabeçalho superior ou a marca no topo, então o nome exibido é "Natanael Fernando Gatti Brentano".
- [x] **CA02:** Dado que um usuário rola até o rodapé de qualquer página, quando visualiza a linha de direitos autorais, então lê "© 2026 Natanael Fernando Gatti Brentano. Todos os direitos reservados.".
- [x] **CA03:** Dado que um usuário navega pelas páginas Sobre, Home, Coleções, Sentimentos e Poemas, quando lê os textos biográficos e títulos de autoria, então o autor é referenciado como "Natanael Fernando Gatti Brentano".
- [x] **CA04:** Dado que um motor de busca ou crawler inspeciona os metadados e tags estruturadas JSON-LD, quando lê os campos de autor/pessoa, então encontra "Natanael Fernando Gatti Brentano".
- [x] **CA05:** Dado que um sistema consome os feeds RSS ou arquivos `llms.txt` / `llms-full.txt`, quando analisa o autor/criador, então encontra "Natanael Fernando Gatti Brentano".
- [x] **CA06:** Dado que um leitor recebe um e-mail de poema diário ou newsletter, quando visualiza a assinatura e remetente, então consta "Natanael Fernando Gatti Brentano".
- [x] **CA07:** Dado que a suíte completa de testes é executada com `npx vitest run`, quando os testes de SEO, cabeçalho, GEO e estruturação de dados rodam, então 100% dos testes passam com o novo nome.

## O que a atividade não inclui

- **Alteração do e-mail de contato:** motivo: O e-mail `nfgbrentano@gmail.com` e a conta de Instagram `@nfgbrentano` já contêm a sigla `nfgb` e permanecem inalterados.
- **Alteração de slugs de URLs:** motivo: As URLs das páginas continuam as mesmas (`/sobre/`, `/colecoes/`, `/`, etc.) para preservar o SEO já indexado.
- **Edição retroativa de arquivos SDD arquivados em `SDD/DONE/`:** motivo: Arquivos em `SDD/DONE/` são registros históricos de atividades concluídas em datas anteriores.

### Considerado para o futuro (P2)

- N/A — substituição pontual e definitiva de nomenclatura de autor.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O identificador do Instagram `@nfgbrentano` e o e-mail `nfgbrentano@gmail.com` devem ser mantidos? | PO / Natanael | Não | Sim, as iniciais "NFGB" correspondem exatamente a Natanael Fernando Gatti Brentano. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Logotipo e cabeçalho desktop/mobile | UI / unit | CA01 | Renderizar o cabeçalho | O elemento `.logo` contém "Natanael Fernando Gatti Brentano". |
| CT02 | Copyright no rodapé | UI / unit | CA02 | Verificar rodapé | Contém "© 2026 Natanael Fernando Gatti Brentano". |
| CT03 | Metadados SEO e Structured Data | unit | CA04 | Executar testes de SEO e structured-data | Todos os nós de autor retornam "Natanael Fernando Gatti Brentano". |
| CT04 | llms.txt e RSS | unit | CA05 | Executar testes de llms-txt e sitemap-rss | Saídas geradas contêm "Natanael Fernando Gatti Brentano". |
| CT05 | Suíte de testes completa | automatizado | CA07 | Executar `npx vitest run` | Todos os testes passam sem falhas. |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário: "mudar em todos os lugares de Natanael Brentano para Natanael Fernando Gatti Brentano"
