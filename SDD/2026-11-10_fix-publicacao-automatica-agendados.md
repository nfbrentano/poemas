# [FIX] Publicação automática de poemas agendados

> **Status:** Rascunho
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer com que um poema com status "Agendado" seja de fato publicado, sem intervenção manual, quando chegar a data e hora definidas.
- **Problema e evidência:** O editor do admin ([`src/pages/admin/editor.js`](../src/pages/admin/editor.js), linhas 95–99) oferece o status "Agendado" e afirma que "o poema será publicado automaticamente", e o dashboard lista os próximos agendamentos. Porém, no repositório, nada muda o status de `scheduled` para `published` no Firestore: [`functions/index.js`](../functions/index.js) exporta apenas `sendNewsletter`, e nenhum script ou workflow em `scripts/` e `.github/workflows/` trata `scheduled` (a antiga função do backend legado anterior atuava sobre o banco SQL desativado). **A confirmar em D01** se existe algum agendador implantado fora do repositório.
- **Impacto de não fazer:** O autor agenda um poema confiando na promessa da interface e ele não vai ao ar; a regra do Firestore só libera leitura pública de `published`, então o poema fica invisível indefinidamente.
- **Para quem é destinado:** Autor/administrador (quem agenda) e leitores (quem espera a publicação).
- **História de usuário:** Como autor, quero que o poema agendado entre no ar sozinho na hora marcada, para planejar publicações sem precisar estar online.
- **Como saberemos que deu certo:** 100% dos poemas agendados ficam públicos em até 60 minutos após `scheduled_at`, incluindo página pré-renderizada, sitemap e RSS.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Processo automático e recorrente que promove a `published` todo poema `scheduled` cujo `scheduled_at` já passou. | P0 | CA01 |
| RF02 | Ao publicar, registrar a data de publicação igual ao horário agendado (não ao horário da execução) e atualizar `updated_at`. | P0 | CA02 |
| RF03 | Após a publicação, o site estático é reconstruído para que página do poema, home, sitemap, RSS e `llms.txt` o incluam. | P0 | CA03 |
| RF04 | Poemas `scheduled` com data futura ou sem `scheduled_at` não são alterados. | P0 | CA04 |
| RF05 | O dashboard do admin sinaliza poemas agendados cuja data já passou e que continuam não publicados ("atrasado"). | P1 | CA05 |
| RF06 | Poema publicado por agendamento entra normalmente no sorteio do poema do dia e nas notificações push, conforme as regras já existentes. | P1 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Atraso máximo de 60 minutos entre `scheduled_at` e a disponibilidade pública. | P0 | CA01, CA03 |
| RNF02 | Idempotente: executar duas vezes seguidas não altera datas nem dispara rebuild duplicado sem necessidade. | P0 | CA07 |
| RNF03 | Credenciais de escrita ficam apenas em secrets do servidor/CI; as regras do Firestore para leitores não são afrouxadas. | P0 | CA08 |
| RNF04 | Falhas são registradas em log e não deixam o poema em estado intermediário. | P0 | CA09 |
| RNF05 | Datas tratadas de forma consistente com o fuso do autor (America/Sao_Paulo) ao exibir, e em UTC ao comparar. | P0 | CA02 |

### Dependências técnicas

- Firestore `poems` (`status`, `scheduled_at`, data de publicação) e [`firestore.rules`](../firestore.rules).
- Mecanismo de execução agendada: Cloud Function agendada em [`functions/`](../functions/index.js) ou workflow agendado no GitHub Actions, nos moldes de [`daily-poem.yml`](../.github/workflows/daily-poem.yml) (ver D02).
- Gatilho de rebuild: [`deploy.yml`](../.github/workflows/deploy.yml) (`workflow_dispatch`).
- Desacoplado da limpeza de resquícios do backend legado (SDD 2026-11-10).

### Recursos necessários

- Credencial de serviço do Firebase com permissão de escrita em `poems`, como secret.
- Confirmação do autor sobre o comportamento observado hoje em produção.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema `scheduled` com `scheduled_at` no passado, quando o processo automático executa, então o status passa a `published` em até 60 minutos após o horário agendado.
- [ ] **CA02:** Dado um poema agendado para 08:00 (horário de Brasília) e processado às 08:20, quando consulto o documento, então a data de publicação corresponde a 08:00 e `updated_at` foi atualizado.
- [ ] **CA03:** Dado um poema recém-publicado por agendamento, quando o rebuild termina, então `/poema/<slug>/` existe pré-renderizado e o poema consta na home, no sitemap e no RSS.
- [ ] **CA04:** Dado um poema `scheduled` com data futura e outro sem `scheduled_at`, quando o processo executa, então nenhum dos dois é alterado.
- [ ] **CA05:** Dado um poema `scheduled` com data vencida há mais de 60 minutos, quando abro o dashboard do admin, então ele aparece marcado como atrasado.
- [ ] **CA06:** Dado um poema publicado por agendamento, quando o sorteio do poema do dia roda nos dias seguintes, então ele é elegível como qualquer publicado.
- [ ] **CA07:** Dado que o processo acabou de publicar um poema, quando executa novamente sem novos agendamentos vencidos, então nenhum documento é modificado e nenhum rebuild é disparado.
- [ ] **CA08:** Dado um leitor anônimo, quando tenta ler um poema `scheduled` ou escrever em `poems`, então o Firestore nega a operação.
- [ ] **CA09:** Dado que a gravação falha no meio da execução, quando consulto o poema, então ele permanece `scheduled` íntegro e o erro consta no log da execução.

## O que a atividade não inclui

- Envio automático de newsletter ou push no momento da publicação agendada: motivo: outra iniciativa; os envios seguem os fluxos atuais.
- Agendar despublicação ou edição futura: motivo: baixo impacto.
- Precisão de minuto: motivo: 60 minutos de tolerância bastam para o uso editorial e evitam custo de execução frequente.

### Considerado para o futuro (P2)

- Publicação com precisão de minutos via tarefa agendada por poema.
- Notificação ao autor quando um agendamento for publicado ou falhar.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Hoje, em produção, poemas agendados estão sendo publicados? Existe algum agendador implantado fora do repositório (Cloud Scheduler, cron externo)? | PO | Sim | |
| D02 | Cloud Function agendada (exige plano Blaze) ou GitHub Actions com cron (gratuito, atraso variável)? | PO/dev | Sim | |
| D03 | Qual campo guarda a data de publicação exibida ao leitor (`published_at`, `created_at`)? | dev | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Vencido é publicado | unit | CA01 | Selecionar poemas a publicar com relógio fixo | Apenas o vencido é retornado |
| CT02 | Data preservada | unit | CA02 | Publicar com `scheduled_at` 08:00 e "agora" 08:20 | Publicação = 08:00 |
| CT03 | Rebuild inclui o poema | manual | CA03 | Agendar poema de teste; aguardar; abrir URL, sitemap e RSS | Presente nos três |
| CT04 | Futuro e sem data | unit | CA04 | Poema com data futura e outro com `null` | Inalterados |
| CT05 | Selo de atraso | integração (jsdom) | CA05 | Renderizar dashboard com agendado vencido | Marcação "atrasado" |
| CT06 | Poema do dia | unit | CA06 | [`src/utils/poemOfDay.test.js`](../src/utils/poemOfDay.test.js) com poema publicado por agendamento | Elegível |
| CT07 | Idempotência | unit | CA07 | Executar duas vezes | Segunda execução: 0 escritas, sem rebuild |
| CT08 | Regras | integração | CA08 | [`src/firestore-rules.test.js`](../src/firestore-rules.test.js): leitura anônima de `scheduled` e escrita | Negadas |
| CT09 | Falha de gravação | unit | CA09 | Mock rejeitando a escrita | Poema segue `scheduled`; erro registrado |

## URL Complementar

- Documentação técnica: [`src/pages/admin/editor.js`](../src/pages/admin/editor.js)
- Protótipo / mockup: N/A — sem interface nova além do selo de atraso.
- Discussões relacionadas: [`SDD/DONE/2026-09-23_rascunhos-nao-publicos.md`](DONE/2026-09-23_rascunhos-nao-publicos.md), [`SDD/DONE/2026-09-23_poema-do-dia-fuso-e-sorteio.md`](DONE/2026-09-23_poema-do-dia-fuso-e-sorteio.md)
- Referências de design: N/A
- Requisitos originais: achado durante o levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
