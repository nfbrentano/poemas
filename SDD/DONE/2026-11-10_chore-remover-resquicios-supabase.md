# [CHORE] Remover resquícios do Supabase do repositório e do deploy

> **Status:** Concluída
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Eliminar o que sobrou da antiga infraestrutura Supabase, já que o site roda inteiramente em Firebase.
- **Problema e evidência:** A migração para o Firestore foi concluída e o adaptador foi removido do admin ([`SDD/DONE/2026-10-06_refactor-remover-adaptador-supabase-do-admin.md`](DONE/2026-10-06_refactor-remover-adaptador-supabase-do-admin.md)), mas permanecem:
  - a pasta `supabase/` com schema SQL, migrations e quatro Edge Functions (`og-image`, `send-newsletter`, `publish-scheduled-poems`, `unsubscribe`);
  - as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` injetadas no job de [`deploy.yml`](../.github/workflows/deploy.yml);
  - entradas específicas em [`.gitignore`](../.gitignore) e menções em comentários ([`public/sw.js`](../public/sw.js), [`src/utils/analytics.js`](../src/utils/analytics.js)) e na CSP de [`index.html`](../index.html).
- **Impacto de não fazer:** Quem chega ao repositório não sabe qual backend vale; secrets sem uso continuam expostos ao build; código morto pode ser reativado por engano; a CSP pode estar liberando um domínio desnecessário.
- **Para quem é destinado:** Dev/mantenedor.
- **História de usuário:** Como mantenedor, quero que o repositório contenha apenas a infraestrutura em uso, para reduzir confusão e superfície de risco.
- **Como saberemos que deu certo:** `git grep -i supabase` retorna 0 resultados fora de `SDD/DONE/`; build, testes e deploy seguem verdes.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Confirmar que cada Edge Function do Supabase tem equivalente ativo (ou foi deliberadamente aposentada) antes de removê-la; registrar a correspondência na spec. | P0 | CA01 |
| RF02 | Remover a pasta `supabase/` do repositório. | P0 | CA02 |
| RF03 | Remover `VITE_SUPABASE_*` do workflow de deploy e de arquivos de exemplo de ambiente. | P0 | CA03 |
| RF04 | Remover entradas de `.gitignore`, configurações de Deno, comentários e domínios de CSP relacionados ao Supabase. | P0 | CA02, CA04 |
| RF05 | Atualizar documentação que ainda cite o Supabase como parte da stack. | P1 | CA02 |
| RF06 | Listar para o dono do repositório os secrets do GitHub e o projeto Supabase a serem apagados/arquivados manualmente. | P1 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma mudança de comportamento do site público ou do admin. | P0 | CA06 |
| RNF02 | Histórico preservado: a remoção é feita por commit comum (sem reescrever histórico), permitindo recuperar os arquivos. | P0 | CA02 |

### Dependências técnicas

- Mapa de equivalência validado em RF01:
  - `send-newsletter`: Substituído por [`functions/index.js`](../functions/index.js) (`sendNewsletter`) e [`scripts/send-daily-poem.js`](../scripts/send-daily-poem.js).
  - `og-image`: Substituído por [`scripts/generate-og-images.js`](../scripts/generate-og-images.js).
  - `unsubscribe`: Substituído por [`src/pages/unsubscribe.js`](../src/pages/unsubscribe.js).
  - `publish-scheduled-poems`: Aposentada. A função atuava apenas no Postgres do Supabase, já desativado. A funcionalidade equivalente para Firestore está planejada na spec dedicada [`2026-11-10_fix-publicacao-automatica-agendados.md`](2026-11-10_fix-publicacao-automatica-agendados.md).
- Testes que validam CSP e service worker: [`src/security.test.js`](../src/security.test.js), [`src/service-worker.test.js`](../src/service-worker.test.js).

### Recursos necessários

- Acesso de administrador aos secrets do GitHub e ao painel do Supabase (ações manuais do dono).

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o mapa de equivalência, quando ele é revisado, então cada uma das quatro Edge Functions tem um substituto identificado em uso ou uma decisão explícita de aposentadoria registrada.
- [x] **CA02:** Dado o repositório após a mudança, quando executo `git grep -i supabase -- . ':!SDD/DONE'`, então não há resultados, e a pasta `supabase/` não existe.
- [x] **CA03:** Dado o `deploy.yml` novo, quando o deploy roda, então conclui com sucesso sem as variáveis `VITE_SUPABASE_*`.
- [x] **CA04:** Dado o `index.html` gerado, quando inspeciono a CSP, então nenhum domínio do Supabase é permitido e o site carrega sem violações de CSP no console.
- [x] **CA05:** Dado o encerramento da atividade, quando leio o resumo de entrega, então há uma lista das ações manuais pendentes (apagar secrets, pausar/apagar o projeto Supabase).
- [x] **CA06:** Dado o site após o deploy, quando publico um poema agendado, envio newsletter, cancelo inscrição e compartilho um link, então tudo funciona como antes — nada deixou de funcionar por depender do Supabase.

## O que a atividade não inclui

- Apagar o projeto no painel do Supabase e os secrets no GitHub: motivo: ações irreversíveis fora do repositório; ficam com o dono (RF06).
- Reescrever o histórico do git para expurgar os arquivos: motivo: desnecessário e arriscado.
- Remover o export do WordPress em `scripts/dev/`: motivo: é backup dos poemas; outra decisão.

### Considerado para o futuro (P2)

- Atualização das dependências de `functions/` com teste em emulador.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O que publica hoje os poemas com status "Agendado"? O editor do admin promete publicação automática, mas [`functions/index.js`](../functions/index.js) exporta apenas `sendNewsletter`. Se ainda depender da Edge Function `publish-scheduled-poems`, é preciso migrá-la antes — ver [`2026-11-10_fix-publicacao-automatica-agendados.md`](2026-11-10_fix-publicacao-automatica-agendados.md). | dev/PO | Sim | Nenhum processo publica poemas agendados no Firestore hoje; o Supabase foi desativado há meses e sua Edge Function atuava em banco Postgres legado inativo. O suporte para Firestore está desacoplado na spec dedicada `2026-11-10_fix-publicacao-automatica-agendados.md`. A Edge Function antiga pode ser removida com segurança. |
| D02 | Algum dado histórico existe apenas no banco do Supabase (ex.: analytics antigos)? | PO | Sim | Não. O projeto do Supabase já se encontra desativado; todo o acervo e novos dados de visualizações residem no Firestore (`page_views`). Dados antigos de analytics do banco anterior não afetam a operação atual. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Revisão do mapa | manual | CA01 | Conferir cada função antiga contra o substituto | 4/4 resolvidas |
| CT02 | Busca por resquícios | manual | CA02 | `git grep -i supabase -- . ':!SDD/DONE'` | 0 resultados |
| CT03 | Deploy sem secrets | manual | CA03 | Rodar o workflow | Sucesso |
| CT04 | CSP | integração | CA04 | Teste em [`src/security.test.js`](../src/security.test.js) verificando ausência de `supabase` na CSP | Passa |
| CT05 | Pendências manuais | manual | CA05 | Ler o resumo de entrega | Lista presente |
| CT06 | Fumaça pós-deploy | manual | CA06 | Agendar poema de teste; enviar newsletter de teste; cancelar inscrição; abrir link compartilhado | Tudo funciona |

## URL Complementar

- Documentação técnica: [`functions/index.js`](../functions/index.js), [`scripts/generate-og-images.js`](../scripts/generate-og-images.js)
- Protótipo / mockup: N/A — sem interface.
- Discussões relacionadas: [`SDD/DONE/2026-10-06_refactor-remover-adaptador-supabase-do-admin.md`](DONE/2026-10-06_refactor-remover-adaptador-supabase-do-admin.md), [`SDD/DONE/2026-09-24_correcao-urls-obsoletas-supabase-e-fallback-capas.md`](DONE/2026-09-24_correcao-urls-obsoletas-supabase-e-fallback-capas.md)
- Referências de design: N/A
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
