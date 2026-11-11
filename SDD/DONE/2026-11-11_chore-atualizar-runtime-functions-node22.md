# [CHORE] Atualizar runtime do Cloud Functions para Node.js 22

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-11 · **Atualizada em:** 2026-11-11

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar a versão de engine declarada em [`functions/package.json`](../functions/package.json) de `"20"` para `"22"` para viabilizar o deploy da Cloud Function `sendNewsletter` em produção.
- **Problema e evidência:** Ao executar `firebase deploy --only functions --project poemas-natanael`, o Firebase CLI retornou: `Error: Runtime Node.js 20 was decommissioned on 2026-10-30. To deploy you must first upgrade your runtime version.`
- **Impacto de não fazer:** A Cloud Function `sendNewsletter` atualizada (com observabilidade de erros em `error_logs`) não pode ser implantada em produção.
- **Para quem é destinado:** Autor e administrador do projeto.
- **História de usuário:** Como administrador, quero atualizar o runtime das Cloud Functions para uma versão suportada (Node.js 22), para implantar alterações de back-end em produção sem bloqueios.
- **Como saberemos que deu certo:** `firebase deploy --only functions --project poemas-natanael` conclui com sucesso e todos os testes locais seguem passando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Alterar `engines.node` em [`functions/package.json`](../functions/package.json) para `"22"`. | P0 | CA01 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma alteração de comportamento na Cloud Function `sendNewsletter`; testes e lint seguem passando. | P0 | CA02 |

### Dependências técnicas

- [`functions/package.json`](../functions/package.json)
- [`functions/index.js`](../functions/index.js)

### Recursos necessários

- Firebase CLI autenticado no projeto `poemas-natanael`.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado [`functions/package.json`](../functions/package.json) com `"engines": { "node": "22" }`, quando executo o deploy das Cloud Functions no projeto `poemas-natanael`, então o deploy conclui sem erro de runtime descomissionado.
- [x] **CA02:** Dado o código atualizado, quando executo `npm run lint` e `npm test -- --run`, então todos os testes passam sem erros.

## O que a atividade não inclui

- Migração para Node.js 24 ou refatoração de código em `functions/index.js`: motivo: fora do escopo mínimo necessário para desbloquear o deploy.

### Considerado para o futuro (P2)

- Atualizar o workflow de CI caso passe a validar ou implantar `functions/` automaticamente.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | N/A — ajuste pontual de versão de runtime exigido pelo Firebase. | dev | Não | N/A |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Deploy em produção | manual | CA01 | Executar `firebase deploy --only functions --project poemas-natanael` | Deploy concluído com sucesso |
| CT02 | Suíte de testes e lint | unit / lint | CA02 | Executar `npm run lint` e `npm test -- --run` | 0 erros no lint; todos os testes passando |

## URL Complementar

- Documentação técnica: [`functions/package.json`](../functions/package.json)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-11_feat-observabilidade-erros-front-backend.md`](DONE/2026-11-11_feat-observabilidade-erros-front-backend.md)
- Referências de design: N/A
- Requisitos originais: erro retornado pelo Firebase CLI no deploy para produção em 2026-11-11.
- Issue / PR relacionado: N/A
