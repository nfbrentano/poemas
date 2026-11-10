# [DOCS] Atualizar o README para refletir o estado atual do projeto

> **Status:** Concluída
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Revisar o [`README.md`](../README.md) para que descreva corretamente funcionalidades, stack, scripts e fluxo de trabalho do projeto.
- **Problema e evidência:** O README ficou para trás em relação a ~70 atividades concluídas em `SDD/DONE/`:
  - diz que a exportação para Instagram usa `html2canvas`, mas o código usa `@zumer/snapdom` ([`src/utils/social-export.js`](../src/utils/social-export.js));
  - a lista de funcionalidades tem 5 itens e omite coleções, páginas de sentimentos, busca, comentários com moderação, reações, áudio, leitura imersiva, notificações push, PWA, painel admin e analytics;
  - a tabela de scripts não cita `sitemap`, `rss`, `llms`, `redirects`, `export:wxr` nem `migrate:updated-at`, e a ordem descrita do build ("sitemap → RSS → Vite → prerender") difere da de [`package.json`](../package.json) (Vite → sitemap → RSS → llms → prerender);
  - a estrutura de pastas não menciona `SDD/`, `docs/` nem `src/data/`, e o fluxo Spec Driven Development (obrigatório segundo [`CLAUDE.md`](../CLAUDE.md)) não aparece.
- **Impacto de não fazer:** Colaboradores e o próprio autor, meses depois, partem de informação errada; o repositório público subcomunica o que o projeto faz.
- **Para quem é destinado:** Colaborador novo e visitante do repositório no GitHub.
- **História de usuário:** Como colaborador novo, quero um README fiel ao projeto, para configurar o ambiente e entender o que existe sem ler todo o código.
- **Como saberemos que deu certo:** Todo comando citado no README existe em `package.json`; todo link relativo resolve; nenhuma tecnologia citada está ausente das dependências.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Lista de funcionalidades atualizada com o que está em produção. | P0 | CA01 |
| RF02 | Stack e bibliotecas corrigidas (snapdom, Firebase Functions, Web Push, Clarity). | P0 | CA02 |
| RF03 | Tabela de scripts cobrindo todos os scripts de `package.json`, com a ordem real do build. | P0 | CA03 |
| RF04 | Estrutura de pastas atualizada (`SDD/`, `docs/`, `src/data/`, `functions/`). | P0 | CA04 |
| RF05 | Seção curta sobre o fluxo SDD, apontando para [`SDD/modelo_feature.md`](modelo_feature.md) e `CLAUDE.md`. | P0 | CA05 |
| RF06 | Lista de variáveis de ambiente e secrets conferida com [`.env.example`](../.env.example) e os workflows. | P1 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhum segredo, chave ou e-mail pessoal no README. | P0 | CA07 |
| RNF02 | Todos os links relativos resolvem para arquivos existentes. | P0 | CA08 |
| RNF03 | Documento em português, mantendo o tom e o formato atuais (badges, tabelas). | P1 | — |

### Dependências técnicas

- Convém executar depois de [`2026-11-10_chore-remover-resquicios-supabase.md`](2026-11-10_chore-remover-resquicios-supabase.md) e [`2026-11-10_chore-ci-pull-requests-lint-dependabot.md`](2026-11-10_chore-ci-pull-requests-lint-dependabot.md), para documentar o estado final (não bloqueante).

### Recursos necessários

- Revisão do autor sobre como descrever o projeto publicamente.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o README novo, quando comparo a lista de funcionalidades com as rotas e componentes de `src/`, então coleções, sentimentos, busca, comentários, reações, áudio, leitura imersiva, push, PWA e admin estão descritos.
- [x] **CA02:** Dado o README novo, quando procuro por `html2canvas`, então não há ocorrência, e toda biblioteca citada consta em `package.json` ou `functions/package.json`.
- [x] **CA03:** Dado o README novo, quando comparo a tabela de scripts com `package.json`, então todos os scripts estão listados e a ordem do build coincide com a do script `build`.
- [x] **CA04:** Dado o README novo, quando comparo a árvore de pastas com o repositório, então toda pasta citada existe e `SDD/`, `docs/` e `src/data/` constam.
- [x] **CA05:** Dado o README novo, quando leio a seção de contribuição, então encontro o fluxo SDD resumido com link para o modelo.
- [x] **CA06:** Dado o README novo, quando comparo as variáveis citadas com `.env.example` e os workflows, então não há variável faltando nem variável obsoleta.
- [x] **CA07:** Dado o README novo, quando o reviso, então não contém valores de chaves, tokens ou e-mails pessoais.
- [x] **CA08:** Dado o README novo, quando verifico cada link relativo, então nenhum aponta para arquivo inexistente.

## O que a atividade não inclui

- Reescrever `CONTRIBUTING.md`, `SECURITY.md` ou `GEMINI.md`: motivo: outra iniciativa; só ajustar se um link do README quebrar.
- Site de documentação ou wiki: motivo: prematuro para o tamanho do projeto.
- Capturas de tela: motivo: envelhecem rápido; baixo impacto agora.

### Considerado para o futuro (P2)

- Teste automatizado que valida os links relativos e os scripts citados no README.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O painel admin e o analytics próprio devem ser mencionados no README público? | PO | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Funcionalidades | manual | CA01 | Conferir lista contra `src/pages/` e `src/components/` | Itens presentes |
| CT02 | Bibliotecas | manual | CA02 | `grep -i html2canvas README.md`; conferir nomes nos `package.json` | 0 ocorrências; tudo existe |
| CT03 | Scripts | manual | CA03 | Comparar tabela com `npm run` | Correspondência total |
| CT04 | Estrutura | manual | CA04 | Comparar árvore com `ls` | Sem pasta inexistente |
| CT05 | Fluxo SDD | manual | CA05 | Ler seção | Resumo e link presentes |
| CT06 | Variáveis | manual | CA06 | Comparar com `.env.example` e workflows | Sem divergência |
| CT07 | Sem segredos | manual | CA07 | Revisão visual / busca por padrões de chave | Nada sensível |
| CT08 | Links | manual | CA08 | Abrir cada link relativo | Todos resolvem |

## URL Complementar

- Documentação técnica: [`README.md`](../README.md), [`package.json`](../package.json), [`docs/notificacoes-push-vapid.md`](../docs/notificacoes-push-vapid.md)
- Protótipo / mockup: N/A — documentação.
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
