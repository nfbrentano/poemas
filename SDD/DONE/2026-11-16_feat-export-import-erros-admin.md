# [FEAT] Exportação e Resolução em Lote de Erros de Observabilidade para Gemini e Admin

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-16 · **Atualizada em:** 2026-11-16

## Detalhes da Atividade

- **O que precisa ser feito:** Criar funcionalidades na tela de Observabilidade de Erros ([`/admin?view=errors`](../src/pages/admin/errors.js)) para:
  1. Exportar todos os erros em aberto consolidados (em formato Markdown pronto para envio ao Gemini e em formato JSON para download);
  2. Importar resoluções ou resolver em lote erros por lista de IDs (colando texto/JSON ou upload de arquivo) e botão de resolução rápida de todos os erros em aberto;
  3. Prevenir a criação redundante de erros a cada hora em [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) quando as credenciais administrativas do ambiente estiverem ausentes.
- **Problema e evidência:**
  1. O autor precisa analisar e tratar múltiplos erros de observabilidade que se acumulam no painel de erros ([`/admin?view=errors`](https://nfgbrentano.art.br/admin/?view=errors)). Hoje, para passar erros para o Gemini/IA, é necessário abrir e copiar o diagnóstico de cada erro individualmente via modal.
  2. Após o Gemini analisar o problema e orientar a correção, o autor precisa clicar manualmente em cada um dos erros para marcá-los como "resolvido" um a um.
  3. Quando os secrets `FIREBASE_ADMIN_EMAIL` e `FIREBASE_ADMIN_PASSWORD` não estão configurados no GitHub Actions, o script [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) executa sem autenticação a cada hora cheia, tenta ler poemas agendados no Firestore, falha por permissão e registra um novo log repetido de erro em `error_logs`, inflando a lista de erros em aberto desnecessariamente.
- **Impacto de não fazer:** Dificuldade e lentidão para triar e corrigir falhas do sistema com o auxílio do Gemini; interface administrativa saturada com logs repetidos de scripts sem credenciais; retrabalho manual para marcar dezenas de erros como resolvidos.
- **Para quem é destinado:** Autor e mantenedor do acervo (`natanaelfernando@outlook.com` / `nfgbrentano@gmail.com`).
- **História de usuário:** Como administrador do site, quero exportar todos os erros em aberto em um formato otimizado para o Gemini e poder importar a lista de IDs resolvidos para atualização em lote no Firestore, para diagnosticar e sanar pendências do sistema com máxima agilidade.
- **Como saberemos que deu certo:**
  - Exportação em 1 clique gera relatório Markdown consolidado com instruções para o Gemini e JSON estruturado com todos os erros em aberto.
  - Caixa de diálogo de importação/resolução em lote permite colar IDs/JSON e atualiza o status de todos no Firestore, decrementando os KPIs em tempo real.
  - Script de poemas agendados não registra erro fatal nem gera lixo no Firestore quando rodar em ambiente sem secrets de admin configurados.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Adicionar função `formatBulkErrorsMarkdown(logs)` para gerar um relatório estruturado de todos os erros em aberto com instruções para análise do Gemini e bloco de IDs para retorno. | P0 | CA01 |
| RF02 | Adicionar botão "Exportar para IA (Gemini)" na barra de ferramentas de [`src/pages/admin/errors.js`](../src/pages/admin/errors.js) que copia para a área de transferência e disponibiliza download `.md` do relatório consolidado de erros em aberto. | P0 | CA01 |
| RF03 | Adicionar botão "Baixar JSON" que exporta os erros em aberto em arquivo `.json` estruturado. | P1 | CA02 |
| RF04 | Criar modal de "Resolver em Lote" permitindo colar lista de IDs (formato JSON `["id1", "id2"]` ou linhas de texto), processar a atualização em massa para `status: 'resolved'` e atualizar a UI. | P0 | CA03 |
| RF05 | Adicionar ação rápida "Marcar todos em aberto como resolvidos" com confirmação explícita na UI. | P0 | CA04 |
| RF06 | Ajustar [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js) para que, na ausência de credenciais administrativas, emita aviso informativo sem tentar consulta não autorizada nem registrar erro redundante em `error_logs`. | P0 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A exportação e a resolução em lote devem ser resilientes a listas vazias ou com mais de 50 erros sem travar a interface. | P0 | CA01, CA03 |
| RNF02 | Sanitização estrita contra XSS em todas as mensagens e dados exibidos nas novas caixas de diálogo. | P0 | CA03 |
| RNF03 | 100% dos testes automatizados (`npx vitest run`) devem passar sem falhas e o linter deve manter zero warnings. | P0 | CA01 a CA05 |

### Dependências técnicas

- [`src/pages/admin/errors.js`](../src/pages/admin/errors.js), [`src/pages/admin/data.js`](../src/pages/admin/data.js).
- [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js).
- [`src/error-observability.test.js`](../src/error-observability.test.js).

### Recursos necessários

- Acesso ao repositório local e ambiente de testes.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que existem erros com status `open` na lista, quando o usuário clica em "Exportar para IA (Gemini)", então um relatório Markdown consolidado é gerado contendo o sumário, a lista de IDs para resolução e os diagnósticos completos de cada erro, copiando para o clipboard e disparando download de arquivo `.md`.
- [x] **CA02:** Dado que existem erros em aberto, quando o usuário clica em "Baixar JSON", então um arquivo `erros-em-aberto-AAAA-MM-DD.json` é baixado com todos os dados brutos estruturados dos erros filtrados.
- [x] **CA03:** Dado uma lista de IDs de erros (em formato JSON array ou um ID por linha) colada no modal de resolução em lote, quando o usuário clica em "Aplicar resoluções", então todos os registros correspondentes têm seu status alterado para `resolved` no Firestore e a interface reflete a nova contagem nos KPIs e na tabela.
- [x] **CA04:** Dado múltiplos erros com status `open` exibidos na tabela, quando o usuário aciona "Marcar todos em aberto como resolvidos" e confirma a operação, então todos os erros em aberto da coleção são atualizados para `resolved`.
- [x] **CA05:** Dado que o script `scripts/publish-scheduled-poems.js` é executado sem `FIREBASE_ADMIN_EMAIL` e `FIREBASE_ADMIN_PASSWORD`, quando a rotina inicia, então ela registra aviso no console e finaliza graciosamente com `publishedCount: 0` sem disparar erro fatal nem poluir `error_logs` no Firestore.

## O que a atividade não inclui

- Sistema de auto-cura automática por IA no client-side em tempo de execução: motivo: a análise e o conserto de código exigem intervenção deliberada no código-fonte.
- Alteração no schema da coleção `error_logs`: motivo: os campos existentes (`status: 'open' | 'resolved' | 'ignored'`) já atendem plenamente.

### Considerado para o futuro (P2)

- Webhook direto para disparo de issue no GitHub a partir de um clique no erro.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O relatório exportado para o Gemini deve conter uma instrução pronta sobre como devolver a resposta? | dev/PO | Não | Sim, incluir cabeçalho solicitando que o Gemini liste os IDs resolvidos em formato JSON `["id1", "id2"]` para que o usuário possa colar diretamente no modal de resolução em lote. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Geração de relatório consolidado em Markdown | unit | CA01 | Chamar `formatBulkErrorsMarkdown` com array de logs | Markdown contém título, bloco de IDs e diagnósticos individuais |
| CT02 | Resolução em lote por IDs | unit/integração | CA03 | Injetar IDs no modal de resolução em lote e disparar confirmação | `updateDocById` chamado para cada ID e KPI atualizado |
| CT03 | Resolução rápida de todos os abertos | unit/integração | CA04 | Clicar em "Marcar todos em aberto como resolvidos" | Todos os logs abertos recebem status `resolved` |
| CT04 | Execução segura de publish-scheduled sem auth | unit | CA05 | Executar `publishDuePoems` ou `main` sem credenciais admin | Nenhuma exceção de permissão adicionada a `error_logs` |
| CT05 | Suite completa de testes | integração | CA01 a CA05 | Executar `npx vitest run` | 100% dos testes aprovados |

## URL Complementar

- Documentação técnica: [`src/pages/admin/errors.js`](../src/pages/admin/errors.js), [`scripts/publish-scheduled-poems.js`](../scripts/publish-scheduled-poems.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-15_fix-permissoes-admin-dashboard.md`](DONE/2026-11-15_fix-permissoes-admin-dashboard.md)
- Referências de design: Padrões UI do painel administrativo existentes (`Escrivaninha`)
- Requisitos originais: Solicitação do usuário para exportar erros em aberto para o Gemini e importar consertos/marcar como resolvidos.
- Issue / PR relacionado: N/A
