# [FEAT] Paridade de selos (áudio/favorito) com hidratação em páginas pré-renderizadas e controle explícito de newsletter ao publicar no Editor

> **Status:** Concluído
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-24 · **Atualizada em:** 2026-11-24

## Detalhes da Atividade

- **O que precisa ser feito:**
  1. Garantir paridade visual dos indicadores de poema favoritado (`🔖`) e poema com narração em áudio (`🔊`) em todas as listagens do site: card "Poema do Dia" na Home ([`src/pages/home.js`](../src/pages/home.js)), página de sentimento ([`src/pages/sentiment.js`](../src/pages/sentiment.js)), seção "Obras do Acervo" em [`src/pages/collections.js`](../src/pages/collections.js) e pré-renderização ([`scripts/prerender.js`](../scripts/prerender.js)).
  2. Hidratar dinamicamente os selos de favorito (`🔖`) no cliente quando o leitor acessa diretamente páginas pré-renderizadas (`/colecao/<slug>/`, `/sentimento/<slug>/`), sem descartar o DOM estático (`isPrerendered`).
  3. No Editor Admin ([`src/pages/admin/editor.js`](../src/pages/admin/editor.js)), mover a opção `"Enviar newsletter automaticamente ao publicar"` (`#notify-newsletter-on-publish`) para a seção de notificações de publicação (`#publish-notifications-fields`, ao lado do checkbox de Web Push) e respeitar seu estado (`checked`) ao clicar em **"Publicar Agora"** (`#publish-btn`), evitando disparos acidentais de e-mail em massa ao publicar obras de acervo.
- **Problema e evidência:**
  1. Enquanto [`src/utils/collection-template.js`](../src/utils/collection-template.js) e a lista da Home exibem `🔖` e `🔊`, [`src/pages/sentiment.js`](../src/pages/sentiment.js) (linha 183) e [`scripts/prerender.js`](../scripts/prerender.js) (linha 1127) omitem o selo `🔊` de áudio; [`src/pages/collections.js`](../src/pages/collections.js) (linha 220) omite ambos (`🔖` e `🔊`); e o card "Poema do Dia" em [`src/pages/home.js`](../src/pages/home.js) (linha 407) exibe `🔖` mas omite `🔊`.
  2. Em [`src/pages/collection.js`](../src/pages/collection.js) (linha 143) e [`src/pages/sentiment.js`](../src/pages/sentiment.js) (linha 135), quando a página vem pré-renderizada (`data-prerendered`), o código preserva o HTML estático gerado no servidor (onde não há `localStorage`). Como consequência, no carregamento inicial direto de `/colecao/<slug>/` ou `/sentimento/<slug>/`, nenhum poema favoritado pelo leitor exibe o selo `🔖`.
  3. Em [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) (linhas 219–223 e 864–880), o checkbox `#notify-newsletter-on-publish` está escondido dentro de `#scheduling-fields` (só aparece quando `status === 'scheduled'`), mas ao clicar em `#publish-btn` ("Publicar Agora" a partir de um rascunho), a linha 866 chama `callFunction('sendNewsletter', { poemId })` **incondicionalmente**, sem permitir publicar silenciosamente sem enviar e-mail a todos os assinantes.
- **Impacto de não fazer:** Inconsistência visual dos selos `🔊` e `🔖` dependendo da rota ou do carregamento inicial pré-renderizado; impossibilidade de publicar um rascunho pelo botão "Publicar Agora" sem disparar e-mail para toda a base de assinantes.
- **Para quem é destinado:** Leitores que utilizam favoritos e buscam poemas narrados em áudio, e o autor ao publicar novas obras ou textos de arquivo no painel administrativo.
- **História de usuário:** Como leitor, quero ver consistentemente quais poemas têm áudio (`🔊`) e quais já favoritei (`🔖`) em qualquer página (mesmo no primeiro acesso direto); e como autor, quero escolher explicitamente se desejo enviar newsletter e/ou Web Push ao clicar em "Publicar Agora".
- **Como saberemos que deu certo:** Todas as listagens (`/`, `/colecoes/`, `/colecao/<slug>/`, `/sentimento/<slug>/`) mostram `🔊` e `🔖` de forma consistente; páginas pré-renderizadas hidratam `🔖` a partir do `localStorage` sem substituir o DOM; clicar em "Publicar Agora" no editor só chama `sendNewsletter` quando `#notify-newsletter-on-publish` estiver marcado.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Exibir o selo de áudio (`<span class="audio-badge" aria-label="Com narração em áudio" title="Com narração em áudio">🔊</span>`) quando `poem.audio_url` estiver preenchido no card "Poema do Dia" ([`src/pages/home.js`](../src/pages/home.js)), nas listagens de sentimento ([`src/pages/sentiment.js`](../src/pages/sentiment.js) e [`scripts/prerender.js`](../scripts/prerender.js)) e na listagem de obras de [`src/pages/collections.js`](../src/pages/collections.js) (junto com o selo `🔖` de favorito). | P1 | CA01 |
| RF02 | Criar utilitário `hydrateFavoriteBadges(container)` (ex.: em [`src/utils/favorites.js`](../src/utils/favorites.js)) e invocá-lo em [`src/pages/collection.js`](../src/pages/collection.js) e [`src/pages/sentiment.js`](../src/pages/sentiment.js) quando `isPrerendered` for `true`, injetando/atualizando `.favorite-badge` nos links `.poem-row-link` cujos slugs constem em `getFavoriteSlugs()`. | P0 | CA02 |
| RF03 | Em [`src/pages/admin/editor.js`](../src/pages/admin/editor.js), posicionar `#notify-newsletter-on-publish` dentro de `#publish-notifications-fields` (visível para `draft` e `scheduled`, junto com `#notify-push-on-publish`) e condicionar a chamada `callFunction('sendNewsletter', { poemId })` no clique de `#publish-btn` a `Boolean(notifyNewsletterInput && notifyNewsletterInput.checked)`. | P0 | CA03, CA04 |
| RF04 | Atualizar o texto de confirmação e o resumo final de `#publish-btn` em [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) para refletir com clareza se o poema será apenas publicado ou se também enviará newsletter e/ou Web Push. | P1 | CA03, CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | A hidratação de `hydrateFavoriteBadges(container)` em páginas pré-renderizadas não deve recriar o container nem causar Cumulative Layout Shift (`CLS`), apenas anexando `<span class="favorite-badge">` nos títulos `.poem-row-title` que ainda não o possuam. | P0 | CA02 |
| RNF02 | Nenhuma chamada `innerHTML` com dados dinâmicos deve violar a regra `no-unsanitized/property` do ESLint (`npm run lint` com 0 warnings). | P0 | CA01, CA02 |

### Dependências técnicas

- [`src/utils/favorites.js`](../src/utils/favorites.js), [`src/pages/home.js`](../src/pages/home.js), [`src/pages/collection.js`](../src/pages/collection.js), [`src/pages/collections.js`](../src/pages/collections.js), [`src/pages/sentiment.js`](../src/pages/sentiment.js) e [`scripts/prerender.js`](../scripts/prerender.js).
- [`src/pages/admin/editor.js`](../src/pages/admin/editor.js) e [`src/pages/admin/editor.test.js`](../src/pages/admin/editor.test.js).

### Recursos necessários

- N/A — utiliza os componentes, estilos e endpoints existentes.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado um poema publicado com `audio_url` válido e favoritado pelo leitor, quando ele aparece no "Poema do Dia" na Home, em `/sentimento/<slug>/` ou em "Obras do Acervo" em `/colecoes/`, então exibe tanto o selo `🔖` quanto o selo `🔊`.
- [x] **CA02:** Dado que o leitor favoritou `o-abraco` no `localStorage` e acessa diretamente o HTML pré-renderizado de `/colecao/amor-e-conexao/` ou `/sentimento/amor/` (`data-prerendered`), quando a página hidrata sem substituir o DOM estático, então o item `o-abraco` passa a exibir o selo `🔖`.
- [x] **CA03:** Dado um rascunho no Editor Admin com `#notify-newsletter-on-publish` desmarcado e `#notify-push-on-publish` desmarcado, quando o autor clica em "Publicar Agora" e confirma, então o poema é publicado (`status: 'published'`) e **nenhuma** chamada a `sendNewsletter` ou `sendPushNotification` é disparada.
- [x] **CA04:** Dado um rascunho no Editor Admin com `#notify-newsletter-on-publish` marcado, quando o autor clica em "Publicar Agora" e confirma, então o poema é publicado e a Cloud Function `sendNewsletter` é invocada para o `poemId` publicado.

## O que a atividade não inclui

- Alteração no layout ou template HTML dos e-mails enviados pela newsletter: motivo: template já validado e testado em `functions/newsletter-helpers.js`.
- Sincronização de favoritos em nuvem: motivo: favoritos são armazenados localmente por design (sem login para leitores).

### Considerado para o futuro (P2)

- Pré-visualização do e-mail da newsletter dentro do modal/painel do Editor antes de confirmar a publicação.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O checkbox `#notify-newsletter-on-publish` deve iniciar desmarcado (`false`) por padrão ao criar uma nova obra, igual ao `#notify-push-on-publish`? | PO/dev | Não | Sim — `poem.notify_newsletter_on_publish` já inicia como `false` no estado padrão do `editor.js` (linha 30), prevenindo envios acidentais e mantendo compatibilidade com o agendamento. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Selos `🔊` e `🔖` em Home (Poema do Dia), Sentimento e Coleções | integração (jsdom) | CA01 | Renderizar `home.js`, `sentiment.js` e `collections.js` com poema tendo `audio_url` e favoritado | `.audio-badge` (`🔊`) e `.favorite-badge` (`🔖`) presentes nas três páginas |
| CT02 | Hidratação de favoritos em DOM pré-renderizado | integração (jsdom) | CA02 | Montar container com `data-prerendered` sem selos, salvar favorito no `localStorage` e executar `collection.render` e `sentiment.render` | Selo `.favorite-badge` é adicionado ao poema favoritado sem recriar o container |
| CT03 | Publicar Agora sem disparar newsletter quando desmarcado | integração (jsdom) | CA03 | Abrir `renderEditor` com rascunho, manter `#notify-newsletter-on-publish` desmarcado e confirmar `#publish-btn` | `updateDocById` grava `status: 'published'` e `callFunction('sendNewsletter')` não é chamado |
| CT04 | Publicar Agora disparando newsletter quando marcado | integração (jsdom) | CA04 | Abrir `renderEditor` com rascunho, marcar `#notify-newsletter-on-publish` e confirmar `#publish-btn` | `callFunction('sendNewsletter', { poemId })` é chamado após publicar |

## URL Complementar

- Documentação técnica: [`src/pages/home.js`](../src/pages/home.js), [`src/pages/sentiment.js`](../src/pages/sentiment.js), [`src/pages/collection.js`](../src/pages/collection.js), [`src/pages/collections.js`](../src/pages/collections.js), [`src/pages/admin/editor.js`](../src/pages/admin/editor.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-13_feat-busca-avancada-e-portabilidade-favoritos.md`](DONE/2026-11-13_feat-busca-avancada-e-portabilidade-favoritos.md), [`SDD/DONE/2026-11-13_feat-envio-web-push-publicacao.md`](DONE/2026-11-13_feat-envio-web-push-publicacao.md)
- Referências de design: [`src/utils/collection-template.js`](../src/utils/collection-template.js)
- Requisitos originais: Auditoria técnica de falhas e melhorias no código em 2026-11-24.
- Issue / PR relacionado: N/A
