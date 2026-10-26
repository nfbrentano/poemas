# [CHORE] Atualização da dependência de desenvolvimento Vitest para 5.0.5

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael · **Criada em:** 2026-10-19 · **Atualizada em:** 2026-10-19

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar a dependência de desenvolvimento `vitest` da versão `5.0.4` para `5.0.5` no `package.json` e `package-lock.json`.
- **Problema e evidência:** O comando `npm outdated` identificou que o pacote `vitest` está na versão `5.0.4`, enquanto a versão mais recente compatível (`Wanted` e `Latest`) é `5.0.5`.
- **Impacto de não fazer:** Manter dependência de testes desatualizada, deixando de receber correções de bugs e melhorias de estabilidade da versão de patch `5.0.5`.
- **Para quem é destinado:** Desenvolvedores do projeto.
- **História de usuário:** Como desenvolvedor do projeto, quero manter o `vitest` atualizado na versão `5.0.5`, para garantir correções recentes no executor de testes sem quebras na suíte existente.
- **Como saberemos que deu certo:** `npm outdated` retorna 0 pacotes desatualizados (código de saída 0) e a suíte de testes (`vitest run`) executa com 100% de aprovação.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar a versão de `vitest` em `package.json` para `^5.0.5` e atualizar a árvore de dependências em `package-lock.json` | P0 | CA01, CA02 |
| RF02 | Garantir que todos os testes automatizados existentes continuem passando após a atualização | P0 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma regressão na suíte de testes (0 falhas ao rodar `vitest run`) | P0 | CA03 |

### Dependências técnicas

- Node.js e npm instalados no ambiente local.

### Recursos necessários

- Acesso ao registro oficial do npm para resolução do pacote `vitest@5.0.5`.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que o projeto possui `vitest` listado em `devDependencies`, quando a atualização para `5.0.5` é aplicada, então `package.json` especifica `"vitest": "^5.0.5"` e `package-lock.json` registra a versão `5.0.5` instalada.
- [x] **CA02:** Dado que as dependências foram atualizadas, quando o comando `npm outdated` é executado, então nenhum pacote é listado como desatualizado.
- [x] **CA03:** Dado que `vitest` está na versão `5.0.5`, quando a suíte de testes é executada em modo não-interativo (`vitest run`), então todos os testes existentes passam sem erros e nenhuma configuração existente do projeto é quebrada.

## O que a atividade não inclui

- Atualização de outros pacotes além do `vitest`: motivo: nenhum outro pacote foi apontado como desatualizado pelo `npm outdated`.
- Criação ou refatoração de testes unitários: motivo: fora do escopo de atualização de dependências de patch.

### Considerado para o futuro (P2)

- N/A — trata-se apenas de atualização pontual de versão de patch.

## Dúvidas em aberto

N/A — não há dúvidas abertas para a atualização de patch do `vitest`.

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Verificar versão instalada e `package.json` | manual | CA01 | Conferir `package.json` e `npm list vitest` | `vitest@5.0.5` instalado e declarado como `^5.0.5` |
| CT02 | Verificar ausência de pacotes desatualizados | manual | CA02 | Executar `npm outdated` | Saída vazia e código de retorno 0 |
| CT03 | Executar suíte de testes automatizados | unit | CA03 | Executar `npx vitest run` | Todos os testes existentes passam com 0 erros |

## URL Complementar

- Documentação técnica: https://vitest.dev/
- Protótipo / mockup: N/A — atividade de infraestrutura sem interface visual.
- Discussões relacionadas: N/A — solicitada diretamente após verificação de `npm outdated`.
- Referências de design: N/A — sem impacto visual.
- Requisitos originais: Atualização do pacote listado em `npm outdated`.
- Issue / PR relacionado: N/A.
