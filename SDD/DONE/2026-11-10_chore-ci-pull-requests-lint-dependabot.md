# [CHORE] CI em pull requests, lint e correção do Dependabot

> **Status:** Concluída
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer com que problemas sejam detectados antes de chegar à `main`: rodar build e testes em pull requests, adotar lint e corrigir a configuração do Dependabot.
- **Problema e evidência:**
  1. O único workflow de validação é o [`deploy.yml`](../.github/workflows/deploy.yml), que roda apenas em push na `main` — um teste que falha só é descoberto no momento do deploy. "Rodar os testes também em PRs" ficou como item futuro em [`SDD/DONE/2026-10-04_chore-testes-no-deploy.md`](DONE/2026-10-04_chore-testes-no-deploy.md).
  2. O repositório não tem configuração de ESLint. Já houve duas rodadas de correção de alertas do CodeQL ligadas a `innerHTML` ([`2026-09-29_fix-alertas-code-scanning-codeql.md`](DONE/2026-09-29_fix-alertas-code-scanning-codeql.md), [`2026-10-26_correcao-codeql-html-seo.md`](DONE/2026-10-26_correcao-codeql-html-seo.md)), e a regra `no-unsanitized/property` foi anotada como prevenção futura.
  3. [`.github/dependabot.yml`](../.github/dependabot.yml) está com `package-ecosystem: ""` (modelo não preenchido), portanto não abre PRs de atualização de versão; desde setembro houve seis atividades manuais de atualização de dependências/vulnerabilidades. O diretório [`functions/`](../functions/package.json) não é coberto por nada.
- **Impacto de não fazer:** Regressões continuam chegando à `main` e bloqueando o deploy; atualizações de dependência seguem manuais e reativas.
- **Para quem é destinado:** Dev/mantenedor do repositório e colaboradores que abrirem PRs.
- **História de usuário:** Como mantenedor, quero que cada PR seja validado automaticamente, para integrar mudanças com confiança e sem quebrar o deploy.
- **Como saberemos que deu certo:** Todo PR exibe checks de lint, build e testes; o Dependabot abre PRs semanais para raiz, `functions/` e GitHub Actions; `npm run lint` termina com 0 erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Workflow disparado em `pull_request` para `main` que executa instalação, lint, build e testes, sem publicar nada. | P0 | CA01, CA02 |
| RF02 | Script `npm run lint` com ESLint configurado para o código de `src/`, `scripts/` e `functions/`. | P0 | CA03 |
| RF03 | Regra que bloqueia atribuição a `innerHTML`/`outerHTML` com conteúdo não sanitizado, reconhecendo os helpers de [`src/utils/html.js`](../src/utils/html.js). | P0 | CA04 |
| RF04 | `dependabot.yml` válido cobrindo `npm` na raiz, `npm` em `/functions` e `github-actions`, com periodicidade semanal e agrupamento de atualizações menores. | P0 | CA05 |
| RF05 | O deploy também executa o lint antes do build. | P1 | CA06 |
| RF06 | Documentar em [`CONTRIBUTING.md`](../CONTRIBUTING.md) os comandos de validação local. | P1 | CA07 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O workflow de PR conclui em menos de 5 minutos. | P0 | CA01 |
| RNF02 | PRs de forks rodam sem acesso a secrets e sem falhar por ausência deles. | P0 | CA02 |
| RNF03 | Permissões do workflow de PR limitadas a `contents: read`. | P0 | CA02 |
| RNF04 | A adoção do lint não altera o comportamento do site (apenas correções mecânicas ou supressões justificadas). | P0 | CA08 |

### Dependências técnicas

- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml), [`.github/dependabot.yml`](../.github/dependabot.yml), [`package.json`](../package.json).
- Os testes de SEO/segurança leem `dist/` e por isso rodam após o build; o build consulta o Firestore (ver D01).

### Recursos necessários

- Permissão de administrador no repositório para tornar os checks obrigatórios (proteção de branch).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um PR aberto contra a `main`, quando o workflow roda, então lint, build e testes são executados e o resultado aparece como check no PR em menos de 5 minutos.
- [x] **CA02:** Dado um PR vindo de um fork, quando o workflow roda, então ele não recebe secrets, não publica nada e não falha apenas por falta de credenciais.
- [x] **CA03:** Dado o repositório na `main`, quando executo `npm run lint`, então o comando termina com 0 erros.
- [x] **CA04:** Dado um arquivo que atribui uma string interpolada não escapada a `innerHTML`, quando executo `npm run lint`, então o lint falha apontando a linha.
- [x] **CA05:** Dado o `dependabot.yml` novo, quando o GitHub o valida, então não há erro de configuração e os três ecossistemas constam em Insights › Dependency graph › Dependabot.
- [x] **CA06:** Dado um push na `main` com erro de lint, quando o deploy roda, então ele falha antes da publicação.
- [x] **CA07:** Dado o `CONTRIBUTING.md`, quando o leio, então encontro os comandos de lint, build e teste a executar antes de abrir um PR.
- [x] **CA08:** Dado o conjunto de mudanças desta atividade, quando rodo a suíte de testes e comparo o `dist/` gerado, então todos os testes passam e não há mudança de comportamento do site.

## O que a atividade não inclui

- Prettier / formatação automática do código: motivo: geraria um diff enorme sem relação com o problema.
- Migração para TypeScript: motivo: outra iniciativa.
- Testes e2e em navegador (Playwright): motivo: prematuro; a suíte atual em jsdom cobre o essencial.
- CSP mais restrita e Trusted Types: motivo: complexo demais agora; tratar em atividade própria.

### Considerado para o futuro (P2)

- `npm audit` semanal agendado.
- Auto-merge de PRs do Dependabot de patch com checks verdes.
- Lighthouse CI em PRs.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O build de PR pode consultar o Firestore de produção (leituras públicas), ou deve usar fixtures? Em forks não há secrets `VITE_FIREBASE_*`. | dev | Sim | O build e pré-render agora usam fallback local gracioso (`scripts/fallback-data.js` derivado do WXR do WordPress) quando `VITE_FIREBASE_API_KEY` estiver ausente ou o Firestore inacessível, permitindo que PRs de forks sem segredos e builds offline rodem lint, build e todos os 334 testes com sucesso. |
| D02 | Quantos erros o lint aponta hoje com a regra de `innerHTML`? Se for volume alto, começar como `warn` em arquivos legados? | dev | Não | Configurado `no-unsanitized/property: 'warn'` para `src/pages/admin/**` e `src/pages/analytics.js`, e `off` para `**/*.test.js`, enquanto o código de produção voltado ao usuário (`src/`) possui enforcement estrito com nível `error` e reconhecimento de `escapeHtml`, `stripHtml`, `sanitizeUrl` e `unwrapSafeHTML`. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | PR verde | manual | CA01 | Abrir PR trivial | Checks executados e aprovados em < 5 min |
| CT02 | PR de fork | manual | CA02 | Abrir PR a partir de fork | Roda sem secrets; nada publicado |
| CT03 | Lint limpo | manual | CA03 | `npm run lint` na `main` | 0 erros |
| CT04 | Regra de innerHTML | manual | CA04 | Criar arquivo temporário com ``el.innerHTML = `${x}` `` e rodar lint | Falha na linha indicada |
| CT05 | Dependabot válido | manual | CA05 | Conferir aba Dependabot após o merge | 3 ecossistemas ativos, sem erro |
| CT06 | Deploy bloqueia lint | manual | CA06 | Em branch de teste, simular o job com erro de lint | Job falha antes do upload |
| CT07 | Documentação | manual | CA07 | Ler `CONTRIBUTING.md` | Comandos presentes |
| CT08 | Sem regressão | integração | CA08 | `npm run build && npm test -- --run` | Tudo passa |

## URL Complementar

- Documentação técnica: https://docs.github.com/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file
- Protótipo / mockup: N/A — atividade de infraestrutura.
- Discussões relacionadas: [`SDD/DONE/2026-10-04_chore-testes-no-deploy.md`](DONE/2026-10-04_chore-testes-no-deploy.md), [`SDD/DONE/2026-11-04_correcao-vulnerabilidades-dependabot.md`](DONE/2026-11-04_correcao-vulnerabilidades-dependabot.md)
- Referências de design: N/A
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
