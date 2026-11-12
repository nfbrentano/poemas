# [FIX] Isolar módulo de log de erros das Cloud Functions para execução de testes no CI

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-11 · **Atualizada em:** 2026-11-12

## Detalhes da Atividade

- **O que precisa ser feito:** Extrair a lógica pura de formatação, sanitização e persistência de erros das Cloud Functions ([`functions/index.js`](../functions/index.js)) para um módulo próprio sem dependências externas ([`functions/error-logger.js`](../functions/error-logger.js)), atualizar [`src/error-observability.test.js`](../src/error-observability.test.js) para testá-lo sem depender de `functions/node_modules` e atualizar os imports do `firebase-admin` v14 em [`functions/index.js`](../functions/index.js) (`firebase-admin/app` e `firebase-admin/firestore`).
- **Problema e evidência:** O workflow de deploy ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml), runs `43084348535` e `43093622896`) falhou na etapa `Test` (`npm test -- --run`), pois o CI instala apenas as dependências da raiz (`npm ci`) e não as de `functions/`. Ao executar `import('../functions/index.js')` no `CT03` de [`src/error-observability.test.js`](../src/error-observability.test.js), o carregamento falhava por ausência de `firebase-functions` e `firebase-admin` no ambiente da raiz. Adicionalmente, o `firebase-admin` v14.3.0 instalado em `functions/` removeu `admin.firestore()` da raiz do pacote, exigindo import modular (`firebase-admin/firestore`).
- **Impacto de não fazer:** O deploy automático do front-end no GitHub Pages permanece bloqueado na etapa de testes do CI.
- **Para quem é destinado:** Pipeline de CI/CD e administrador do projeto.
- **História de usuário:** Como administrador, quero que os testes de observabilidade das Cloud Functions rodem de forma isolada e sem depender de `functions/node_modules` na raiz, para que o deploy no GitHub Pages conclua com sucesso.
- **Como saberemos que deu certo:** O workflow `Deploy static content to Pages` no GitHub Actions conclui com status `success` após o push em `main`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Extrair `sanitizeFunctionErrorText`, `truncateText`, `buildFunctionErrorPayload` e `logBackendFunctionError` para [`functions/error-logger.js`](../functions/error-logger.js) sem imports de `firebase-functions` ou `firebase-admin`. | P0 | CA01 |
| RF02 | Reutilizar [`functions/error-logger.js`](../functions/error-logger.js) em [`functions/index.js`](../functions/index.js) e testar diretamente no `CT03` de [`src/error-observability.test.js`](../src/error-observability.test.js). | P0 | CA01, CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Preservar integralmente o comportamento da Cloud Function `sendNewsletter` e todas as regras do ESLint (`npm run lint`). | P0 | CA02, CA03 |

### Dependências técnicas

- [`functions/index.js`](../functions/index.js)
- [`src/error-observability.test.js`](../src/error-observability.test.js)
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

### Recursos necessários

- N/A — refatoração local e redeploy de `functions` e GitHub Pages.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o ambiente de execução da raiz sem `functions/node_modules`, quando executo `npm test -- --run`, então o `CT03` importa [`functions/error-logger.js`](../functions/error-logger.js) e passa sem erro de módulo ausente.
- [x] **CA02:** Dado o código atualizado, quando executo `npm run lint`, `npm run build` e `npm test -- --run`, então todos os checks passam sem erros.
- [x] **CA03:** Dado o push em `main` e o deploy de Cloud Functions no Firebase, quando verifico o workflow `Deploy static content to Pages` no GitHub Actions, então o deploy conclui com status `success`.

## O que a atividade não inclui

- Alterar [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) ou [`pr.yml`](../.github/workflows/pr.yml) para rodar `npm ci` dentro de `functions/`: motivo: desnecessário e aumentaria o tempo de build do CI quando um módulo puro resolve o isolamento de forma mais limpa.

### Considerado para o futuro (P2)

- N/A

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | N/A — causa-raiz identificada diretamente nos logs de passos do workflow `43093622896`. | dev | Não | N/A |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Import isolado de `functions/error-logger.js` | unit | CA01 | Executar `CT03` em [`src/error-observability.test.js`](../src/error-observability.test.js) | Payload formatado e sanitizado sem depender de `firebase-functions` |
| CT02 | Lint, build e testes locais | unit / integração | CA02 | Executar `npm run lint && npm run build && npm test -- --run` | 0 erros e todos os testes passando |
| CT03 | Pipeline de deploy no GitHub Pages | integração (CI) | CA03 | Push em `main` e consultar run do GitHub Actions | `Deploy static content to Pages` com `conclusion: success` |

## URL Complementar

- Documentação técnica: [`functions/index.js`](../functions/index.js), [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-11_feat-observabilidade-erros-front-backend.md`](DONE/2026-11-11_feat-observabilidade-erros-front-backend.md)
- Referências de design: N/A
- Requisitos originais: falha no step `Test` do workflow `Deploy static content to Pages` (run `43093622896`).
- Issue / PR relacionado: N/A
