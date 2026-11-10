# [CHORE] Corrigir vulnerabilidade de DoS no minimatch (#46)

> **Status:** Em andamento
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar a dependência transitiva `minimatch` para uma versão $\ge 11.0.1$ através do campo `overrides` em `package.json`, eliminando a vulnerabilidade de Denial of Service (DoS) por amplificação de globparts reportada no alerta Dependabot #46.
- **Problema e evidência:** O Dependabot reportou a vulnerabilidade #46 informando que `minimatch` 10.2.6 (introduzido transitivamente via `eslint@10.14.0` e `@eslint/config-array@0.23.5`) é vulnerável a DoS por padrão de glob controlado pelo invasor (`firstPhasePreProcess()` com amplificação de globparts em loop e comparação quadrática em `secondPhasePreProcess()`). Versões afetadas: `>= 7.0.0, < 11.0.1`. Versão corrigida: $\ge 11.0.1$.
- **Impacto de não fazer:** O alerta de segurança permanece aberto no repositório; risco de esgotamento de CPU/memória ao processar expressões glob maliciosas.
- **Para quem é destinado:** Desenvolvedor e mantenedor do repositório.
- **História de usuário:** Como mantenedor do repositório, quero manter todas as dependências transitivas livres de vulnerabilidades conhecidas, para garantir a integridade da pipeline de desenvolvimento, CI e build.
- **Como saberemos que deu certo:** `npm ls minimatch` no diretório raiz reporta versão $\ge 11.0.1$ sem ocorrências de versões vulneráveis, `npm run lint` executa sem erros e a suíte de testes e build passam com 100% de sucesso.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Adicionar override no `package.json` para forçar `minimatch: "^11.0.1"` (ou superior). | P0 | CA01 |
| RF02 | Atualizar o lockfile (`package-lock.json`) garantindo a resolução da versão corrigida. | P0 | CA02 |
| RF03 | Validar que o linter (`npm run lint`), testes (`npm test -- --run`) e build (`npm run build`) continuem íntegros. | P0 | CA03, CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Zero novas vulnerabilidades introduzidas. | P0 | CA02 |
| RNF02 | Total compatibilidade com o ESLint 10.14.0 e plugins existentes. | P0 | CA03 |

### Dependências técnicas

- `package.json`, `package-lock.json`.
- `eslint@10.14.0`, `@eslint/config-array@0.23.5`.

### Recursos necessários

- Acesso ao registro npm para baixar a versão atualizada do pacote `minimatch`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o arquivo `package.json`, quando inspeciono a seção `overrides`, então `minimatch` está configurado para `^11.0.1`.
- [ ] **CA02:** Dado o repositório após a atualização, quando executo `npm ls minimatch`, então todas as instâncias no projeto raiz estão na versão $\ge 11.0.1$ e não há nenhuma versão afetada.
- [ ] **CA03:** Dado o projeto com o `minimatch` atualizado, quando executo `npm run lint`, então o ESLint conclui com sucesso e sem erros de execução.
- [ ] **CA04:** Dado o projeto com o `minimatch` atualizado, quando executo `npm test -- --run` e `npm run build`, então todos os 42 arquivos de teste passam e o build de produção é gerado com sucesso.

## O que a atividade não inclui

- Atualizações de versões major do ESLint ou alterações estruturais de regras de linting: motivo: foco estrito na correção da vulnerabilidade de segurança apontada pelo Dependabot #46.

### Considerado para o futuro (P2)

- N/A — auditorias contínuas automatizadas via Dependabot já configuradas no CI.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O ESLint 10.14.0 e `@eslint/config-array` funcionam perfeitamente com `minimatch ^11.0.1`? | dev | Não | Sim, o `minimatch` v11 mantém compatibilidade com os métodos consumidos pelo ESLint para resolução de padrões glob. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Verificação de versão do minimatch | CLI | CA01, CA02 | `npm ls minimatch` na raiz | Versão $\ge 11.0.1$ sem versões legadas |
| CT02 | Execução do Linter | CLI | CA03 | `npm run lint` | Conclui com sucesso |
| CT03 | Suite de testes e Build | CLI | CA04 | `npm test -- --run` e `npm run build` | 100% dos testes e build verdes |

## URL Complementar

- Documentação técnica: Dependabot Alert #46 (`minimatch`), GitHub Security Advisory
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-04_correcao-vulnerabilidades-dependabot.md`](DONE/2026-11-04_correcao-vulnerabilidades-dependabot.md)
- Referências de design: N/A
- Requisitos originais: Dependabot Alert #46
- Issue / PR relacionado: Alerta #46
