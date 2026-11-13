# [FEAT] Evolução do player de áudio (MediaSession + preferências) e otimização de cache offline

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Aprimorar [`src/components/audio-player.js`](../src/components/audio-player.js) para persistir velocidade, volume e som ambiente preferido, integrar a `MediaSession` API para controles na tela bloqueada, tornar os sons ambiente disponíveis offline no [`public/sw.js`](../public/sw.js) com versionamento automático de cache no build e otimizar a persistência dupla de [`src/utils/poems-store.js`](../src/utils/poems-store.js).
- **Problema e evidência:**
  1. Em [`src/components/audio-player.js`](../src/components/audio-player.js), ao trocar de poema a velocidade volta para `1x` e o volume volta ao padrão; além disso, não há integração com `navigator.mediaSession`, impedindo play/pause e exibição de título/autor na tela bloqueada do celular.
  2. [`public/sw.js`](../public/sw.js) não inclui `/sounds/rain.mp3` nem `/sounds/fire.mp3` em `STATIC_ASSETS`, fazendo a reprodução de som ambiente falhar quando o leitor está offline (e usa `CACHE_NAME = 'poemas-cache-v22'` atualizado manualmente).
  3. [`src/utils/poems-store.js`](../src/utils/poems-store.js) grava o array completo de poemas (com conteúdo integral) simultaneamente no `IndexedDB` e no `localStorage` sem checagem efetiva do limite de 5 MB citado em `savePersistentPoems()`, correndo risco de `QuotaExceededError` conforme o acervo cresce.
- **Impacto de não fazer:** Leitores que ouvem múltiplos poemas narrados precisam reconfigurar `1.25x`/`1.5x` e volume a cada página e não conseguem pausar pela tela de bloqueio; sons ambiente anunciados no leitor quebram sem internet; o `localStorage` pode estourar cota silenciosamente no crescimento do acervo.
- **Para quem é destinado:** Leitores mobile/desktop que utilizam narração em áudio, som ambiente ou leitura offline em trânsito.
- **História de usuário:** Como leitor, quero que minhas preferências de áudio permaneçam entre poemas, que a narração apareça na tela bloqueada do meu celular e que o acervo e sons ambiente funcionem de forma confiável mesmo offline, para desfrutar da poesia sem atrito.
- **Como saberemos que deu certo:** Velocidade e volume persistem após navegar para outro poema; `navigator.mediaSession.metadata` preenchido ao reproduzir narração; som ambiente funciona em modo avião após visita; `localStorage` fica limitado a metadados leves ou guarda estrita `< 4.5 MB` enquanto `IndexedDB` guarda o conteúdo completo.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Persistir em `localStorage` (`audio-playback-rate`, `audio-volume`, `audio-muted`, `ambient-sound-mode`) e restaurar automaticamente ao inicializar [`AudioPlayer`](../src/components/audio-player.js) (com fallback seguro se áudio não iniciar por política de autoplay). | P0 | CA01, CA02 |
| RF02 | Integrar `navigator.mediaSession` quando a narração iniciar: definir `MediaMetadata` (`title`, `artist: 'Natanael Fernando Gatti Brentano'`, `album: 'Poemas Brasileiros'`, `artwork`) e handlers `play`, `pause`, `seekto`, `previoustrack`, `nexttrack` (quando houver poemas adjacentes). | P0 | CA03 |
| RF03 | Tornar `/sounds/rain.mp3` e `/sounds/fire.mp3` utilizáveis offline (armazenando sob demanda via Cache API no primeiro uso ou precache condicional após `load`, com botão/indicador de pronto offline) no [`public/sw.js`](../public/sw.js). | P1 | CA04 |
| RF04 | Automatizar o sufixo/versão de `CACHE_NAME` em `dist/sw.js` durante o build (baseado em hash/timestamp de build) para eliminar esquecimentos manuais de bump de `'poemas-cache-vXX'`. | P1 | CA05 |
| RF05 | Otimizar [`src/utils/poems-store.js`](../src/utils/poems-store.js): priorizar `IndexedDB` para o conteúdo completo (`content`) e restringir o fallback em `localStorage` a uma verificação estrita de bytes (`<= 4 MB` UTF-16/UTF-8) ou resumo indexável, sem estourar cota. | P0 | CA06 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O precache/cache dos MP3s de ambiente não deve bloquear o evento `install` do Service Worker nem atrasar o primeiro carregamento (`LCP`). | P0 | CA04 |
| RNF02 | Toda leitura/escrita de preferências em `localStorage` e uso de `navigator.mediaSession` deve checar suporte do navegador e capturar exceções sem quebrar a renderização do poema. | P0 | CA01, CA03 |
| RNF03 | O tamanho armazenado em `localStorage` por [`poems-store.js`](../src/utils/poems-store.js) nunca deve exceder `4.5 MB`, mantendo funcionamento completo quando o `IndexedDB` estiver disponível. | P0 | CA06 |

### Dependências técnicas

- [`src/components/audio-player.js`](../src/components/audio-player.js) e [`src/pages/poem.js`](../src/pages/poem.js).
- [`public/sw.js`](../public/sw.js) e [`vite.config.js`](../vite.config.js) / pipeline de build.
- [`src/utils/poems-store.js`](../src/utils/poems-store.js).

### Recursos necessários

- Verificar tamanho atual dos arquivos `public/sounds/rain.mp3` e `public/sounds/fire.mp3` antes de decidir entre precache imediato vs cache sob demanda após `load`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que o leitor ajustou a velocidade para `1.5x` e o volume para `0.6` na narração de um poema, quando navega para outro poema com narração, então os controles e o elemento `<audio>` iniciam já em `1.5x` e volume `0.6`.
- [ ] **CA02:** Dado que o navegador bloqueia autoplay ao tentar restaurar um som ambiente ativo após troca de rota, quando o bloqueio ocorre, então nenhuma exceção não tratada vai para `error_logs` e a UI reflete corretamente o estado pausado/pronto para toque.
- [ ] **CA03:** Dado um navegador com suporte a `navigator.mediaSession`, quando o usuário pressiona Play na narração, então `mediaSession.metadata.title` reflete o título do poema e os action handlers de play/pause/seek respondem corretamente.
- [ ] **CA04:** Dado que o usuário já visitou o site (ou reproduziu um som ambiente online uma vez), quando fica offline e ativa "Chuva" ou "Fogueira", então o áudio é servido do cache do Service Worker sem erro de conexão.
- [ ] **CA05:** Dado uma nova execução de `npm run build`, quando inspeciono `dist/sw.js`, então `CACHE_NAME` contém identificador único da versão compilada em vez de string manual estática.
- [ ] **CA06:** Dado um catálogo cuja serialização ultrapassa o limite seguro de `localStorage` (simulado em teste), quando `savePersistentPoems` é executado, então o `IndexedDB` recebe o acervo completo e o `localStorage` não gera `QuotaExceededError` nem corrompe dados existentes.

## O que a atividade não inclui

- Narração automática por síntese de voz (Web Speech API / TTS) em poemas sem áudio gravado: motivo: decisão artística/editorial separada quanto à voz do poeta.
- Cache offline automático de todas as dezenas/centenas de narrações `.mp3` do Storage: motivo: consumo excessivo de banda/armazenamento sem solicitação explícita do leitor.

### Considerado para o futuro (P2)

- Botão "Baixar áudio para ouvir offline" por poema ou por coleção na Cache API.
- Crossfade suave entre som ambiente de chuva/fogueira ao pausar ou trocar de poema sem interromper a música ambiente durante navegação SPA.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O som ambiente (chuva/fogueira) deve tentar manter reprodução contínua ao navegar entre poemas via SPA (movendo `<audio id="ambient-audio">` para fora de `#main-content`) ou apenas lembrar a seleção para o próximo play? | design/PO | Não | |
| D02 | Os MP3s de `public/sounds/` são leves o suficiente para cache em segundo plano após `load` ou devem ser cacheados apenas após o primeiro clique? | dev | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Persistência de velocidade/volume | unit/integração (jsdom) | CA01 | Simular cliques de velocidade/volume e reinicializar `AudioPlayer.init` | `<audio>` e botões restauram `1.5x` e volume salvo |
| CT02 | Autoplay bloqueado | unit | CA02 | Mockar `.play()` retornando `DOMException('NotAllowedError')` | Estado volta para silêncio/pausado sem reportar erro |
| CT03 | Integração MediaSession | unit | CA03 | Mockar `navigator.mediaSession`, iniciar narração e disparar `pause`/`seekto` | `metadata` atualizado e callbacks atuam sobre `<audio>` |
| CT04 | Cache de sons no SW | integração | CA04 | Simular fetch de `/sounds/rain.mp3` em `sw.js` e depois offline | Segunda requisição offline retorna resposta `200` do cache |
| CT05 | Versionamento automático de `sw.js` | integração (pós-build) | CA05 | Rodar build e ler `dist/sw.js` | `CACHE_NAME` atualizado sem placeholder estático |
| CT06 | Guarda de tamanho no `localStorage` | unit | CA06 | Passar array grande excedendo limite configurado para `savePersistentPoems` | IDB recebe tudo e `localStorage` aplica guarda sem erro |

## URL Complementar

- Documentação técnica: [`src/components/audio-player.js`](../src/components/audio-player.js), [`public/sw.js`](../public/sw.js), [`src/utils/poems-store.js`](../src/utils/poems-store.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-10_feat-leitura-offline-acervo.md`](DONE/2026-11-10_feat-leitura-offline-acervo.md)
- Referências de design: [`src/styles/components.css`](../src/styles/components.css)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
