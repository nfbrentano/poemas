# [CHORE] Atualização de dependências npm desatualizadas

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael · **Criada em:** 2026-11-03 · **Atualizada em:** 2026-11-03

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar as dependências de produção (`dependencies`) e de desenvolvimento (`devDependencies`) identificadas pelo comando `npm outdated` para suas versões mais recentes compatíveis (`3.7.0` de `@zumer/snapdom`, `18.0.9` de `dotenv`, `5.12.0` de `fast-xml-parser`, `13.2.0` de `firebase`, `30.1.3` de `jsdom`, `10.3.1` de `nodemailer`, `0.63.2` de `satori`, `8.3.5` de `vite` e `5.1.0` de `vitest`).
- **Problema e evidência:** A execução de `npm outdated` indicou 9 pacotes desatualizados em relação ao registro oficial do npm (`@zumer/snapdom`, `dotenv`, `fast-xml-parser`, `firebase`, `jsdom`, `nodemailer`, `satori`, `vite`, `vitest`).
- **Impacto de não fazer:** Acúmulo de débito técnico, perda de correções de bugs, melhorias de desempenho e eventuais correções de segurança nas bibliotecas utilizadas pelo projeto.
- **Para quem é destinado:** Desenvolvedores e mantenedores do projeto `sitepoemas`.
- **História de usuário:** Como desenvolvedor mantenedor do projeto, quero manter as dependências npm atualizadas nas versões mais recentes estáveis, para garantir segurança, estabilidade e compatibilidade contínua da suíte de testes e do build.
- **Como saberemos que deu certo:** `npm outdated` retorna vazio (código de saída `0`), todos os testes automatizados (`vitest run`) passam com 100% de sucesso e o build da aplicação (`vite build`) conclui sem erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar os pacotes `@zumer/snapdom`, `dotenv`, `fast-xml-parser`, `firebase`, `jsdom`, `nodemailer`, `satori`, `vite` e `vitest` em `package.json` e `package-lock.json` para suas versões `Latest`. | P0 | CA01 |
| RF02 | Garantir que a suíte de testes unitários e de integração continue passando sem regressões após a atualização. | P0 | CA02 |
| RF03 | Garantir que o empacotamento de produção (`vite build`) continue funcionando sem erros. | P1 | CA03 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhum pacote listado no `package.json` deve permanecer desatualizado na verificação `npm outdated` (0 pacotes listados). | P0 | CA01 |
| RNF02 | A atualização não deve remover ou quebrar o `overrides` existente (`@grpc/grpc-js`) em `package.json`. | P0 | CA04 |

### Dependências técnicas

- `package.json` e `package-lock.json`
- Registro público `https://registry.npmjs.org/`

### Recursos necessários

- Node.js e npm instalados no ambiente local com acesso ao registry do npm.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que as dependências do projeto foram atualizadas, quando o comando `npm outdated` for executado, então nenhum pacote deve ser listado como desatualizado e o comando deve encerrar com código `0`.
- [x] **CA02:** Dado que os pacotes atualizados estão instalados em `node_modules`, quando a suíte de testes (`npx vitest run`) for executada, então todos os arquivos de teste devem passar com 0 falhas.
- [x] **CA03:** Dado que o `vite` e demais pacotes foram atualizados, quando o build do frontend (`npx vite build`) for executado, então o diretório `dist/` deve ser gerado com sucesso sem erros de compilação.
- [x] **CA04:** Dado que o `package.json` possui configurações customizadas como `overrides`, quando os pacotes forem atualizados, então nenhuma configuração ou script existente fora das versões atualizadas deve ser removido indevidamente.

## O que a atividade não inclui

- Refatoração de código da aplicação não relacionada às atualizações: motivo: fora do escopo de manutenção de dependências.
- Adição de novas bibliotecas ao projeto: motivo: trata-se exclusivamente de atualização de pacotes já existentes.

### Considerado para o futuro (P2)

- Automação periódica de verificação de dependências via GitHub Actions / Dependabot.

## Dúvidas em aberto

N/A — escopo fechado a partir da saída do `npm outdated` validada pelo usuário.

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Verificação de pacotes desatualizados | manual | CA01 | Executar `npm outdated` na raiz do repositório | Saída vazia e exit code `0` |
| CT02 | Execução da suíte de testes automatizados | unit/integração | CA02 | Executar `npx vitest run` | Todos os testes passam sem erros |
| CT03 | Execução do build de produção Vite | integração | CA03 | Executar `npx vite build` | Build concluído com código `0` |
| CT04 | Inspeção do `git diff package.json` | manual | CA04 | Inspecionar alterações em `package.json` | Apenas as faixas de versão das dependências desatualizadas foram alteradas; `overrides` e `scripts` intactos |

## URL Complementar

- Documentação técnica: [package.json](file:///Users/natanaelfernandogattibrentano/poemas/package.json)
- Protótipo / mockup: N/A — atividade de manutenção de dependências sem alteração visual.
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação direta via comando `npm outdated`.
- Issue / PR relacionado: N/A
