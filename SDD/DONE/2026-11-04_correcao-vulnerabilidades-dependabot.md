# [CHORE] Correção de Vulnerabilidades no minimatch, glob e fflate (Dependabot)

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-04 · **Atualizada em:** 2026-11-04

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Remediar os alertas de segurança do GitHub Dependabot associados aos pacotes transitivos:
     - `minimatch` (`GHSA-g3hv-75wg-m249`): Potencial negação de serviço via amplificação de globparts (afeta versões `< 11.0.1`).
     - `glob` (`GHSA-3g3m-2fjr-6pw4`): Bypass de cancelamento com AbortSignal permitindo travessia pós-timeout e dependência de minimatch vulnerável.
     - `fflate` (`GHSA-px8p-9vwx-vf98`): Loop infinito no parsing de arquivos ZIP64 malformados (afeta versões `0.7.0 - 0.7.4`).
  2. Configurar a diretiva `overrides` em `functions/package.json` e no `package.json` raiz para forçar versões corrigidas seguras de `minimatch`, `glob` e `fflate`.
  3. Atualizar e sincronizar `functions/package-lock.json` e `package-lock.json` raiz.
  4. Validar que todos os testes automatizados (`npx vitest run`) continuam passando com 100% de sucesso e que o build de produção (`npm run build`) e a geração das Cloud Functions permanecem sem erros ou regressões.

- **Problema e evidência:**
  - O GitHub Dependabot e o comando `npm audit` reportaram vulnerabilidades moderadas:
    - Em `functions/`: `minimatch <11.0.1` e `glob 3.0.0 - 14.0.1` trazidos transitivamente por `firebase-admin` -> `@google-cloud/firestore` -> `google-gax` -> `rimraf` -> `glob`.
    - No projeto raiz: `fflate 0.7.3` trazido transitivamente pelo pacote `satori` para renderização de cards OG.
- **Impacto de não fazer:**
  - Dependências vulneráveis ativas no repositório, mantendo alertas de segurança abertos no GitHub Dependabot.

- **Para quem é destinado:**
  - Mantenedores do projeto, garantindo conformidade com padrões de segurança e estabilidade na cadeia de suprimentos de software.

- **História de usuário:**
  - Como mantenedor do repositório, quero que as dependências transitivas `minimatch`, `glob` e `fflate` sejam atualizadas para versões seguras, para eliminar os alertas do Dependabot sem introduzir regressões no site ou nas Cloud Functions.

- **Como saberemos que deu certo:**
  - O comando `npm audit` em `functions/` e no projeto raiz não reporta mais vulnerabilidades para `minimatch`, `glob` ou `fflate`.
  - 100% dos testes da suíte Vitest passam com sucesso.
  - O comando `npm run build` executa e conclui com 0 erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Configurar `overrides` em `functions/package.json` para garantir versões não vulneráveis de `minimatch` (`^11.0.4` ou `^10.2.6`) e `glob` (`^14.0.3` ou `^11.0.3`) | P0 | CA01 |
| RF02 | Configurar `overrides` no `package.json` raiz para fixar `fflate` em versão corrigida (`^0.8.3`) | P0 | CA02 |
| RF03 | Regenerar e sincronizar `functions/package-lock.json` e `package-lock.json` via npm | P0 | CA01, CA02 |
| RF04 | Validar toda a suíte de testes unitários e de integração (`npx vitest run`) | P0 | CA03 |
| RF05 | Validar a execução completa do pipeline de build (`npm run build`) | P0 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma quebra funcional na geração de imagens Open Graph (Satori) ou na inicialização das Cloud Functions | P0 | CA03, CA04 |
| RNF02 | Build idempotente e sem introdução de novas vulnerabilidades | P0 | CA01, CA02 |
| RNF03 | Tempo de execução de build e testes estável | P1 | CA03, CA04 |

### Dependências técnicas

- `package.json`, `package-lock.json`
- `functions/package.json`, `functions/package-lock.json`

### Recursos necessários

- Acesso ao npm registry (rede com `BypassSandbox: true`).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que executo `npm audit` na pasta `functions/`, quando as dependências forem atualizadas, então zero vulnerabilidades relacionadas ao `minimatch` e `glob` são reportadas.
- [x] **CA02:** Dado que executo `npm audit` na raiz do projeto, quando as dependências forem atualizadas, então zero vulnerabilidades relacionadas ao `fflate` são reportadas.
- [x] **CA03:** Dado que todas as dependências foram atualizadas e sincronizadas, quando executo `npx vitest run`, então todos os 38 arquivos de teste passam com 100% de sucesso.
- [x] **CA04:** Dado que todas as dependências foram atualizadas, quando executo `npm run build`, então a compilação do Vite, pré-renderização estática e sitemaps completam com sucesso.

## O que a atividade não inclui

- Atualizações de pacotes para novas versões major de bibliotecas principais (ex: Vite 9 ou Firebase 14) sem necessidade de segurança.

### Considerado para o futuro (P2)

- Ativação de workflow agendado no GitHub Actions para checagem semanal preventiva de `npm audit`.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | As diretivas de `overrides` são suportadas nativamente pelo npm 8+? | dev | Não | Sim, npm suporta nativamente o campo `overrides` tanto no projeto raiz quanto em subdiretórios com `package.json`. |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Auditoria npm em functions | Segurança | CA01 | Rodar `cd functions && npm audit` | 0 vulnerabilidades em minimatch e glob |
| CT02 | Auditoria npm na raiz | Segurança | CA02 | Rodar `npm audit` na raiz | 0 vulnerabilidades em fflate |
| CT03 | Suíte de testes automatizados | Regressão | CA03 | Rodar `npx vitest run` | 38/38 arquivos passam |
| CT04 | Build de produção | Integração | CA04 | Rodar `npm run build` | Conclui com código 0 |

## URL Complementar

- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/advisories/GHSA-3g3m-2fjr-6pw4
- https://github.com/advisories/GHSA-px8p-9vwx-vf98
