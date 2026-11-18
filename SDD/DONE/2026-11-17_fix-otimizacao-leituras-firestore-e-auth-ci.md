# [FIX] Otimização de Leituras do Firestore no Build/Testes e Autenticação de Scripts CI com Referer

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-17 · **Atualizada em:** 2026-11-17

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Ler dinamicamente as variáveis de ambiente do Firebase em tempo de execução nos scripts de build (`scripts/generate-sitemap.js`, `scripts/generate-rss.js`, `scripts/generate-llms.js` e `scripts/prerender.js`) e garantir isolamento completo do Firestore na suíte Vitest (`src/geo-llms-txt.test.js`, `src/pages/poem.js`, `src/pages/favorites.test.js` e `src/reading-history-verse-card.test.js`).
  2. Criar um módulo compartilhado de cache de build (`scripts/build-data-cache.js`) em `node_modules/.cache/poemas-build-data.json` para que `sitemap`, `rss`, `llms` e `prerender` reutilizem em um mesmo `npm run build` os dados já buscados do Firestore (`poems`, `collections`, `collection_poems`, `mostReadPoems` e `site_settings`), eliminando leituras duplicadas por etapa.
  3. Configurar envio automático do cabeçalho HTTP `Referer: https://nfgbrentano.art.br/` nas requisições do Firebase Auth e serviços Google/Firebase em scripts Node.js (`scripts/most-read-loader.js` e `scripts/publish-scheduled-poems.js`) para compatibilidade com a restrição de *HTTP Referer* configurada na chave `VITE_FIREBASE_API_KEY`.
- **Problema e evidência:**
  Auditoria de custos e telemetria no Google Cloud Monitoring revelou que cada execução do pipeline de CI (`npm run build` + `npm test`) consome de `4.309` a `8.600+` leituras reais no Firestore porque os 4 scripts do build consultam as mesmas coleções repetidamente e o teste em `src/geo-llms-txt.test.js` executa `runGenerateLlms()` após tentar deletar `process.env.VITE_FIREBASE_API_KEY`, mas `scripts/generate-llms.js` captura `firebaseConfig` estaticamente no topo do módulo durante o `import`. Adicionalmente, após a ativação da restrição de *HTTP Referer* na chave de API do Firebase em `2026-11-16`, os workflows Node.js no GitHub Actions passaram a falhar com `FirebaseError: Firebase: Error (auth/requests-from-referer-<empty>-are-blocked.)`, quebrando `publish-scheduled.yml` e a leitura autenticada de `page_views` em `most-read-loader.js`.
- **Impacto de não fazer:**
  Desperdício recorrente da cota gratuita diária de 50.000 leituras do Firestore em múltiplos deploys ou execuções de testes locais, risco de novas cobranças no plano Blaze e falha contínua na publicação automática de poemas agendados no GitHub Actions.
- **Para quem é destinado:**
  Autor/administrador do acervo (`nfgbrentano@gmail.com` / `natanaelfernando@outlook.com`) e pipeline de CI/CD (GitHub Actions).
- **História de usuário:** Como administrador do site, quero que os testes automatizados não acessem o Firestore real, que o build compartilhe uma única leitura das coleções entre suas etapas e que os scripts Node.js enviem o `Referer` autorizado ao autenticar no Firebase, para manter os custos dentro do Free Tier e restaurar a publicação agendada.
- **Como saberemos que deu certo:**
  `npx vitest run` executa com zero leituras reais no Firestore e 100% de aprovação; `npm run lint` passa com 0 avisos; `sitemap`, `rss`, `llms` e `prerender` reutilizam o cache compartilhado em build; requisições Firebase Auth em Node.js incluem `Referer: https://nfgbrentano.art.br/`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Ler `firebaseConfig` dinamicamente em tempo de execução via `getFirebaseConfig()` em `scripts/generate-sitemap.js`, `scripts/generate-rss.js`, `scripts/generate-llms.js` e `scripts/prerender.js`. | P0 | CA01 |
| RF02 | Garantir em `src/pages/poem.js` o cancelamento de timers diferidos (`loadDeferredFeatures` e `prefetchRoutes`) em `cleanup()` e o bloqueio de consultas diferidas ao Firestore quando offline ou em ambiente Vitest isolado. | P0 | CA02 |
| RF03 | Criar `scripts/build-data-cache.js` com leitura e escrita de cache temporário em `node_modules/.cache/poemas-build-data.json` (TTL de 5 minutos, desativado por padrão sob `process.env.VITEST`) e integrá-lo em `generate-sitemap.js`, `generate-rss.js`, `generate-llms.js` e `prerender.js`. | P0 | CA03 |
| RF04 | Implementar `installFirebaseNodeReferer` e `patchFirebaseAuthReferer` em `scripts/build-data-cache.js` e aplicá-los em `scripts/most-read-loader.js`, `scripts/publish-scheduled-poems.js`, `scripts/generate-llms.js` e `scripts/prerender.js`. | P0 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A execução completa de `npx vitest run` deve realizar `0` leituras de rede no Firestore de produção. | P0 | CA01, CA02 |
| RNF02 | O cache compartilhado de build deve residir fora de `dist/` (`node_modules/.cache/`) para não ser publicado no GitHub Pages e respeitar `npm run lint` com 0 warnings. | P0 | CA03 |

### Dependências técnicas

- Scripts de build ESM em `scripts/` (`generate-sitemap.js`, `generate-rss.js`, `generate-llms.js`, `prerender.js`, `most-read-loader.js`, `publish-scheduled-poems.js`).
- SDK `firebase/auth` e `firebase/firestore` (`v13.2.0`) em ambiente Node.js (`fetch` global e `_getAdditionalHeaders`).
- Runner `vitest` e linter `eslint --max-warnings 0`.

### Recursos necessários

- N/A — alterações puramente no código-fonte e testes automatizados locais com mocks.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que `process.env.VITE_FIREBASE_API_KEY` é removido antes de invocar `runGenerateLlms`, `runGenerateSitemap` ou `runGenerateRss`, quando a função é executada, então ela lê a configuração dinamicamente, utiliza o fallback local e não inicializa nem consulta o Firestore.
- [x] **CA02:** Dado que `poemPage.render()` é executado em ambiente offline ou `poemPage.cleanup()` é chamado antes do disparo diferido, quando os timers de `loadDeferredFeatures` e `prefetchRoutes` venceriam, então os timers são cancelados e nenhuma consulta diferida ao Firestore é disparada.
- [x] **CA03:** Dado que uma etapa do build (`generate-sitemap.js`) buscou `poems`, `collections` e `collection_poems` no Firestore e gravou no cache temporário dentro do TTL, quando as etapas seguintes (`generate-rss.js`, `generate-llms.js` e `prerender.js`) executam na sequência, então elas reutilizam o cache sem repetir as consultas ao Firestore.
- [x] **CA04:** Dado que a chave de API do Firebase possui restrição de *HTTP Referer* para `https://nfgbrentano.art.br/`, quando scripts Node.js (`publish-scheduled-poems.js` ou `most-read-loader.js`) autenticam ou chamam endpoints Google/Firebase, então o cabeçalho `Referer: https://nfgbrentano.art.br/` é enviado automaticamente.

## O que a atividade não inclui

- Alterações nas políticas ou regras de segurança do Firebase Console (`API Key restrictions` no GCP) ou remoção manual de Cloud Functions legadas (`send-newsletter`): motivo: ações manuais de infraestrutura fora do escopo do repositório.
- Paginação ou reestruturação da coleção `page_views` no painel administrativo cliente: motivo: outro escopo de evolução de produto para não alterar fluxos de UI admin neste fix.

### Considerado para o futuro (P2)

- Uso de Firebase Admin SDK com Service Account dedicada no GitHub Actions para eliminar dependência de `VITE_FIREBASE_API_KEY` e senha admin em scripts Node.js.
- Paginação/agregação incremental de `page_views` via Cloud Function agendada para reduzir leituras ao abrir o painel admin.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O cabeçalho `Referer` enviado via Node.js `fetch` e `auth._getAdditionalHeaders` é preservado mesmo com `referrerPolicy: 'strict-origin-when-cross-origin'` no `@firebase/auth`? | Dev | Não | Sim, validado diretamente no runtime Node.js com `Request`/`undici`: cabeçalho explícito `Referer` em `headers` é preservado e enviado na requisição. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Leitura dinâmica de `firebaseConfig` e fallback sem consultas ao Firestore em `runGenerateLlms` | unit | CA01 | Remover `process.env.VITE_FIREBASE_API_KEY` após o import do módulo e chamar `runGenerateLlms`, `runGenerateSitemap` e `runGenerateRss` | Fallback local acionado; zero chamadas ao Firestore e zero `Encontrados 239 poemas publicados.` no console |
| CT02 | Cancelamento de timers e bloqueio de leitura diferida em `poem.js` | unit | CA02 | Renderizar `poemPage` e chamar `cleanup()`, avançando timers falsos ou executando offline | Nenhuma chamada diferida a Firestore (`reactions`, `comments`, `related`) é executada |
| CT03 | Reutilização de cache de build entre scripts dentro do TTL e expiração após TTL | unit | CA03 | Gravar payload via `writeBuildDataCache` e executar `readBuildDataCache`, `runGenerateSitemap`, `runGenerateRss` e `runGenerateLlms` com `forceEnableInTest: true` | Dados reutilizados dentro do TTL sem iniciar Firestore; retorna `null` quando TTL expira |
| CT04 | Injeção de `Referer` em requisições Google/Firebase e em `auth._getAdditionalHeaders` | unit | CA04 | Invocar `installFirebaseNodeReferer` com mock de `fetch` e `patchFirebaseAuthReferer` em objeto `auth` simulado | Requisições para `identitytoolkit.googleapis.com` recebem `Referer: https://nfgbrentano.art.br/`; origens externas não são alteradas |
| CT05 | Regressão completa da suíte e verificação do linter | integração | CA01, CA02, CA03, CA04 | Executar `npx vitest run` e `npm run lint` | Todos os testes aprovados sem conexões reais ao Firestore e 0 avisos no ESLint |

## URL Complementar

- Documentação técnica: [`SDD/modelo_feature.md`](../modelo_feature.md), [`scripts/generate-sitemap.js`](../../scripts/generate-sitemap.js), [`scripts/generate-llms.js`](../../scripts/generate-llms.js), [`scripts/prerender.js`](../../scripts/prerender.js), [`scripts/publish-scheduled-poems.js`](../../scripts/publish-scheduled-poems.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: Auditoria de custos e leituras do projeto `poemas-natanael` em 2026-11-17
- Referências de design: N/A
- Requisitos originais: "validar os gastos do firebase e me diga porque sai do plano free e tive 500mil acessos em um dia só" / "poe gerar o sdd e corrigir na sequencia"
- Issue / PR relacionado: N/A
