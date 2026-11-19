# [CHORE] Desativação da execução agendada do workflow Publish Scheduled Poems

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-19 · **Atualizada em:** 2026-11-19

## Detalhes da Atividade

- **O que precisa ser feito:** Desativar o gatilho de execução periódica (`schedule` / `cron`) do workflow `.github/workflows/publish-scheduled.yml`, mantendo apenas o gatilho manual (`workflow_dispatch`), para que o GitHub Actions pare de executar o fluxo automaticamente a cada hora e cesse o envio de emails de alerta de falha.
- **Problema e evidência:** O workflow `Publish Scheduled Poems` estava configurado para rodar a cada hora cheia (`cron: '0 * * * *'`). Sem credenciais de admin válidas configuradas no ambiente do runner do GitHub Actions, o script falhava sistematicamente, gerando notificações contínuas como `[nfbrentano/poemas] Run failed: Publish Scheduled Poems - main (251aea2)`.
- **Impacto de não fazer:** O GitHub Actions continuará tentando rodar o fluxo 24 vezes ao dia, consumindo cota de execução e gerando ruído e emails de falha para o mantenedor.
- **Para quem é destinado:** Mantenedor e administrador do projeto.
- **História de usuário:** Como mantenedor do repositório, quero desativar o agendamento horário do workflow Publish Scheduled Poems, para evitar execuções desnecessárias e notificações de falha recorrentes.
- **Como saberemos que deu certo:** O workflow `.github/workflows/publish-scheduled.yml` não possuirá mais gatilho `schedule` ativo, e o GitHub Actions deixará de disparar a rotina automaticamente.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Remover o gatilho `schedule` de `.github/workflows/publish-scheduled.yml`. | P0 | CA01 |
| RF02 | Preservar o gatilho `workflow_dispatch` para permitir disparos manuais sob demanda no painel de Actions. | P1 | CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Manter a sintaxe do arquivo de workflow YAML válida e íntegra. | P0 | CA01, CA02 |

### Dependências técnicas

- Arquivo de configuração `.github/workflows/publish-scheduled.yml`.

### Recursos necessários

- N/A (nenhuma credencial externa necessária para desativação do agendador).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que o workflow continha o bloco `schedule` com cron horário, quando o arquivo for atualizado, então o gatilho `schedule` não deve mais estar ativo.
- [x] **CA02:** Dado que o workflow possui o gatilho `workflow_dispatch`, quando a alteração for aplicada, então o gatilho `workflow_dispatch` deve permanecer disponível para acionamento manual.

## O que a atividade não inclui

- Exclusão do script `scripts/publish-scheduled-poems.js`: motivo: outra iniciativa; o código e a funcionalidade permanecem preservados para execução manual ou futura reativação.
- Configuração de credenciais do Firebase no repositório: motivo: fora do escopo; o usuário solicitou especificamente a desativação da rotina agendada.

### Considerado para o futuro (P2)

- Reativação do agendador (`schedule`) se e quando as credenciais e o processo de publicação automática forem revalidados em produção.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Manter a opção de disparo manual (`workflow_dispatch`)? | dev | Não | Sim, manter `workflow_dispatch` permite que o autor acione a publicação manualmente via GitHub Actions se desejar, sem ter que recriar o arquivo. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Validação da estrutura do workflow YAML | manual | CA01, CA02 | Inspecionar `.github/workflows/publish-scheduled.yml` e verificar que `on:` possui apenas `workflow_dispatch:` | Não há gatilho `schedule:` e o arquivo é um YAML válido. |
| CT02 | Execução da suíte de testes do repositório | unit | RNF01 | Executar a suíte de testes automatizados (`npx vitest run`) | Todos os testes passam sem quebras. |

## URL Complementar

- Documentação técnica: https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows
- Protótipo / mockup: N/A
- Discussões relacionadas: Conversa direta no chat
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário ("pode arrumar esse agendador para não rodar mais?")
- Issue / PR relacionado: N/A
