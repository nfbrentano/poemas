# [FEAT] Leitura offline do acervo de poemas

> **Status:** Concluída
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-11

## Detalhes da Atividade

- **O que precisa ser feito:** Garantir que o leitor que já visitou o site consiga abrir e ler poemas sem conexão, inclusive poemas que ainda não tinha aberto.
- **Problema e evidência:** O service worker ([`public/sw.js`](../public/sw.js)) pré-cacheia apenas o shell (`/`, `index.html`, `offline.html`, ícones e duas fontes) e guarda páginas HTML somente depois de visitadas. Offline, uma página não visitada cai em `index.html`, cujo conteúdo depende do Firestore, e o cache de poemas ([`src/utils/poems-store.js`](../src/utils/poems-store.js)) vive só em memória — a própria spec de cache registrou a persistência como item futuro ([`SDD/DONE/2026-10-29_cache-poemas-e-correcoes-layout.md`](DONE/2026-10-29_cache-poemas-e-correcoes-layout.md)). O site é instalável (tem `manifest.json`), mas o app instalado não entrega leitura offline do acervo.
- **Impacto de não fazer:** Quem instala o PWA ou lê em trânsito (metrô, avião, sinal fraco) encontra tela de offline ou lista vazia; a promessa de "app" não se cumpre.
- **Para quem é destinado:** Leitor recorrente em mobile, especialmente quem instalou o PWA.
- **História de usuário:** Como leitor, quero ler os poemas mesmo sem internet, para aproveitar o site em qualquer lugar.
- **Como saberemos que deu certo:** Após uma visita online, 100% dos poemas publicados abrem em modo avião; nenhum erro não tratado no console offline.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Após uma visita online, o texto de todos os poemas publicados fica disponível offline no dispositivo. | P0 | CA01 |
| RF02 | Home, página de poema, coleções e sentimentos renderizam offline a partir dos dados locais. | P0 | CA01, CA02 |
| RF03 | Indicação discreta de "você está offline" enquanto não houver conexão. | P0 | CA03 |
| RF04 | Recursos que dependem de rede (comentar, reagir, newsletter, áudio não baixado, busca remota se houver) ficam desabilitados ou informam a indisponibilidade, sem erro. | P0 | CA04 |
| RF05 | Ao voltar a conexão, os dados locais são atualizados e poemas despublicados deixam de ser exibidos. | P0 | CA05 |
| RF06 | Fontes de leitura selecionáveis nas preferências ficam disponíveis offline. | P1 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Dados locais do acervo ≤ 5 MB (texto, sem áudio nem capas). | P0 | CA07 |
| RNF02 | O armazenamento offline não bloqueia a primeira renderização: LCP da home não piora mais que 100 ms em relação ao atual. | P0 | CA08 |
| RNF03 | Rascunhos e agendados nunca são armazenados no dispositivo de leitores. | P0 | CA09 |
| RNF04 | Falha ou indisponibilidade do armazenamento local não impede o uso online. | P0 | CA10 |

### Dependências técnicas

- [`public/sw.js`](../public/sw.js) (estratégias de cache e versão `CACHE_NAME`).
- [`src/utils/poems-store.js`](../src/utils/poems-store.js) e [`src/utils/firebase.js`](../src/utils/firebase.js).
- Testes existentes: [`src/service-worker.test.js`](../src/service-worker.test.js), [`src/utils/poems-store.test.js`](../src/utils/poems-store.test.js).

### Recursos necessários

- Texto do aviso de offline.
- Dispositivo móvel real (ou DevTools em modo offline) para validação manual.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que visitei a home online uma vez, quando fico offline e abro um poema que nunca tinha aberto, então o poema é exibido por completo.
- [x] **CA02:** Dado que estou offline após uma visita online, quando navego para a home, uma coleção e um sentimento, então as listas aparecem com os poemas correspondentes.
- [x] **CA03:** Dado que estou offline, quando qualquer página é exibida, então um aviso de offline está visível; e quando a conexão volta, o aviso some sem recarregar.
- [x] **CA04:** Dado que estou offline, quando tento comentar, reagir ou assinar a newsletter, então recebo uma mensagem de indisponibilidade e nenhum erro não tratado aparece no console.
- [x] **CA05:** Dado que um poema foi despublicado enquanto eu estava offline, quando volto a ficar online e os dados são atualizados, então ele deixa de aparecer nas listas.
- [x] **CA06:** Dado que escolhi uma fonte de leitura diferente da padrão, quando leio offline, então a fonte escolhida é aplicada.
- [x] **CA07:** Dado o acervo atual, quando inspeciono o armazenamento do site após a primeira visita, então os dados de poemas ocupam no máximo 5 MB.
- [x] **CA08:** Dado o build de produção, quando comparo o LCP da home antes e depois da mudança (mesmo perfil de rede), então a diferença é de no máximo 100 ms.
- [x] **CA09:** Dado um leitor não autenticado, quando inspeciono os dados locais, então não há nenhum poema com status diferente de `published`.
- [x] **CA10:** Dado que o armazenamento local está indisponível, quando uso o site online, então tudo funciona como hoje, sem mensagens de erro.

## O que a atividade não inclui

- Áudio offline: motivo: arquivos grandes; estouraria o orçamento de armazenamento.
- Enfileirar comentários/reações para envio posterior (background sync): motivo: complexo demais agora.
- Admin offline: motivo: fora do público-alvo.

### Considerado para o futuro (P2)

- Baixar o áudio dos favoritos para ouvir offline.
- Botão explícito "baixar acervo" com indicação de espaço usado.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Persistir via cache local do SDK do Firestore, via IndexedDB próprio ou via um JSON estático gerado no build? (Conferir o que [`src/utils/firebase.js`](../src/utils/firebase.js) já habilita.) | dev | Não | Definido: Persistência gerenciada no `src/utils/poems-store.js` (IndexedDB com graceful degradation para storage/memória) e suporte a leitura offline em `src/pages/poem.js` buscando do acervo local quando offline ou em falha de rede. |
| D02 | O acervo deve ser baixado na primeira visita de qualquer leitor ou só depois de instalar o PWA / segunda visita? | PO | Não | Definido: Na primeira visita de qualquer leitor, em background após a renderização inicial (o acervo em texto tem apenas ~131 KB e não onera rede nem degrada o LCP). |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Poema não visitado offline | manual | CA01 | Visitar home online; ativar modo offline; abrir poema nunca aberto | Poema completo |
| CT02 | Listas offline | manual | CA02 | Offline, abrir home, coleção e sentimento | Listas preenchidas |
| CT03 | Aviso de conexão | integração (jsdom) | CA03 | Disparar eventos `offline` e `online` | Aviso aparece e some |
| CT04 | Ações de rede offline | integração | CA04 | Simular falha de rede e acionar comentar/reagir/newsletter | Mensagem amigável; sem exceção |
| CT05 | Reidratação | unit | CA05 | Popular armazenamento com poema X; atualizar com lista sem X | X removido |
| CT06 | Fonte offline | manual | CA06 | Trocar fonte; ficar offline; recarregar | Fonte aplicada |
| CT07 | Orçamento de armazenamento | manual | CA07 | DevTools › Application › Storage | ≤ 5 MB |
| CT08 | Desempenho | manual | CA08 | Lighthouse antes/depois | ΔLCP ≤ 100 ms |
| CT09 | Sem rascunhos locais | unit | CA09 | Persistir lista mista de status | Só `published` gravado |
| CT10 | Storage indisponível | unit | CA10 | Fazer a abertura do armazenamento falhar | Fluxo online intacto |

## URL Complementar

- Documentação técnica: [`public/sw.js`](../public/sw.js), [`src/utils/poems-store.js`](../src/utils/poems-store.js)
- Protótipo / mockup: N/A — apenas um aviso textual.
- Discussões relacionadas: [`SDD/DONE/2026-10-29_cache-poemas-e-correcoes-layout.md`](DONE/2026-10-29_cache-poemas-e-correcoes-layout.md), [`SDD/DONE/2026-09-24_correcao-service-worker-fetch-promise.md`](DONE/2026-09-24_correcao-service-worker-fetch-promise.md)
- Referências de design: [`public/offline.html`](../public/offline.html)
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
