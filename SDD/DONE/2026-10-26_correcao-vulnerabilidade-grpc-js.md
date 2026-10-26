# [FIX] Correção de Vulnerabilidades no @grpc/grpc-js (Dependabot #29 e #30)

> **Status:** Concluída
> **Autor:** Natanael Fernando Gatti Brentano (com Antigravity) · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-10-26 · **Atualizada em:** 2026-10-26

## Detalhes da Atividade

- **O que precisa ser feito:** Remediar os alertas de segurança do GitHub Dependabot #29 e #30 associados ao pacote transitivo `@grpc/grpc-js` no projeto raiz, atualizando a dependência para uma versão corrigida (`1.14.5` ou superior) via diretiva de `overrides` no `package.json` e sincronizando o `package-lock.json`, garantindo a passagem de todos os testes automatizados e compilação do build de produção.
- **Problema e evidência:** O GitHub Dependabot sinalizou duas vulnerabilidades no pacote transitivo `@grpc/grpc-js` através do `package-lock.json`:
  1. Dependabot #30 (High, CVE-2026-101916): `@grpc/grpc-js: In certain configurations, getAuthContext can return unauthorized certificates as though they were authorized`. Afeta versões `< 1.13.6` e `>= 1.14.0 < 1.14.5`.
  2. Dependabot #29 (Low, CVE-2026-101915 / GHSA-f596-whhp-79r4): `@grpc/grpc-js: The server transmits some error messages thrown by method handlers to the client in status messages`. Afeta versões `< 1.13.6` e `>= 1.14.0 < 1.14.5`.
  O `package-lock.json` raiz estava fixando `@grpc/grpc-js@1.9.16` trazido como dependência transitiva do `@firebase/firestore@4.18.0` (que especifica `"@grpc/grpc-js": "~1.9.0"`).
- **Impacto de não fazer:** Manter vulnerabilidades conhecidas na árvore de dependências do projeto, gerando riscos de segurança e alertas ativos no GitHub Dependabot.
- **Para quem é destinado:** Mantenedores do projeto, assegurando conformidade de segurança e estabilidade contínua na cadeia de suprimentos de dependências.
- **História de usuário:** Como mantenedor do site, quero que a dependência transitiva `@grpc/grpc-js` seja atualizada para uma versão sem vulnerabilidades, para resolver os alertas Dependabot #29 e #30 sem causar quebras no Firebase ou no build da aplicação.
- **Como saberemos que deu certo:**
  - O arquivo `package-lock.json` na raiz passa a referenciar `@grpc/grpc-js` na versão `1.14.5` (ou superior não vulnerável).
  - Nenhuma versão vulnerável de `@grpc/grpc-js` permanece instalada no projeto raiz.
  - 100% dos testes automatizados existentes (33 arquivos e 294 testes) passam com sucesso (`npm test -- --run`).
  - O comando `npm run build` completa a compilação do Vite, a geração de sitemaps, RSS, LLMs e a pré-renderização estática sem erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Configurar a diretiva de `overrides` no `package.json` para forçar `@grpc/grpc-js` na versão `1.14.5` (ou versão segura compatível). | P0 | CA01, CA04 |
| RF02 | Atualizar o `package-lock.json` para sincronizar a versão do `@grpc/grpc-js` e resolver os alertas do Dependabot. | P0 | CA01, CA04 |
| RF03 | Validar a interoperabilidade com o `@firebase/firestore` e toda a suíte de testes unitários e de integração. | P0 | CA02 |
| RF04 | Validar o pipeline de build de produção (`vite build`, pré-renderização e scripts utilitários). | P0 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma quebra ou regressão nas funcionalidades do site, scripts de build ou acesso a dados do Firebase. | P0 | CA02, CA03 |
| RNF02 | O tempo de compilação do build e de execução dos testes deve permanecer estável. | P1 | CA02, CA03 |
| RNF03 | Nenhuma nova vulnerabilidade crítica introduzida pelo `package-lock.json`. | P0 | CA04 |

### Dependências técnicas

- Arquivos `package.json` e `package-lock.json` na raiz do projeto.
- Node.js e npm instalados no ambiente.

### Recursos necessários

- N/A (resolução via npm overrides e sincronização local).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que a diretiva de overrides de `@grpc/grpc-js` para `^1.14.5` foi configurada em `package.json`, quando o `package-lock.json` for atualizado, então a versão resolvida de `@grpc/grpc-js` na raiz deve ser `1.14.5` (ou superior corrigida).
- [x] **CA02:** Dado que `@grpc/grpc-js` foi atualizado para uma versão segura, quando os testes automatizados forem executados com `npm test -- --run`, então todos os testes passam sem falhas (código de saída 0).
- [x] **CA03:** Dado que o lockfile foi sincronizado, quando `npm run build` for executado, então a compilação e a pré-renderização estática concluem com êxito.
- [x] **CA04:** Dado que os alertas do Dependabot #29 e #30 afetam versões `< 1.13.6` e `>= 1.14.0 < 1.14.5`, quando verificado o `package-lock.json` na raiz, então não há ocorrência de `@grpc/grpc-js` em versão vulnerável.

## O que a atividade não inclui

- Atualização de pacotes do subdiretório `functions/`: motivo: o `functions/package-lock.json` já está com `@grpc/grpc-js@1.14.5` e possui ciclo de vida isolado.
- Alteração em regras do Firestore (`firestore.rules`): motivo: a vulnerabilidade é puramente de dependência de código do cliente/transitiva do gRPC e não afeta as regras do Cloud Firestore.
- Refatoração de código de produto: motivo: escopo restrito à segurança de dependências.

### Considerado para o futuro (P2)

- Monitorar futuros lançamentos do Firebase SDK para remover o override quando o `@firebase/firestore` adotar nativamente uma versão atualizada do `@grpc/grpc-js`.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O `@firebase/firestore` apresenta incompatibilidade em tempo de execução ao usar `@grpc/grpc-js` 1.14.5 via override? | dev | Não | Verificado: APIs de conexão e rotinas de pré-renderização e testes funcionam normalmente. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Sincronização do override de `@grpc/grpc-js` | integração | CA01, CA04 | Configurar override e sincronizar lockfile | `@grpc/grpc-js` atualizado para `1.14.5` no `package-lock.json` |
| CT02 | Execução da suíte completa de testes automatizados | unit/integração | CA02 | Executar `export PATH="/usr/local/bin:$PATH" && npm test -- --run` | 33 arquivos de teste e 294 testes aprovados |
| CT03 | Execução do build completo de produção | integração | CA03 | Executar `export PATH="/usr/local/bin:$PATH" && npm run build` | Compilação do Vite e pré-renderização concluídas sem erros |

## URL Complementar

- Documentação técnica: https://github.com/grpc/grpc-node, https://github.com/advisories/GHSA-f596-whhp-79r4
- Protótipo / mockup: N/A
- Discussões relacionadas: Dependabot alerts #29 e #30
- Referências de design: N/A
- Requisitos originais: Dependabot security alerts no repositório `nfbrentano/poemas`
- Issue / PR relacionado: https://github.com/nfbrentano/poemas/security/dependabot/29, https://github.com/nfbrentano/poemas/security/dependabot/30
