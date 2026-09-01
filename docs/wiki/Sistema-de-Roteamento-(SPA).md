# 🧭 Sistema de Roteamento (SPA)

O projeto implementa um roteador SPA (Single Page Application) customizado, sem dependência de bibliotecas externas.

## Rotas Disponíveis

| Rota | Página | Módulo | Descrição |
|------|--------|--------|-----------|
| `/` | Home | `pages/home.js` | Listagem de poemas publicados |
| `/poema/:slug` | Poema | `pages/poem.js` | Leitura de um poema individual |
| `/sobre` | Sobre | `pages/about.js` | Sobre o autor |
| `/colecoes` | Coleções | `pages/collections.js` | Listagem de coleções |
| `/colecao/:slug` | Coleção | `pages/collection.js` | Poemas de uma coleção |
| `/admin` | Admin | `pages/admin.js` | Painel administrativo |
| `/login` | Login | `pages/login.js` | Autenticação do admin |
| `/unsubscribe` | Cancelar | `pages/unsubscribe.js` | Cancelar inscrição na newsletter |
| `/cancelar-inscricao` | Cancelar | `pages/unsubscribe.js` | Alias em português |
| `/aleatorio` | — | (redirect) | Navega para um poema aleatório |
| `/explore` | — | (redirect) | Redireciona para `/colecoes` |

## Como Funciona

### 1. Definição de Rotas

As rotas são definidas como um objeto simples, com **lazy loading** via `import()` dinâmico:

```javascript
export const routes = {
  '/': () => import('./pages/home.js').then(m => m.default),
  '/poema/:slug': () => import('./pages/poem.js').then(m => m.default),
  '/admin': () => import('./pages/admin.js').then(m => m.default),
  // ...
};
```

Cada módulo de página exporta um objeto `default` com:
- `render(container, params)` — renderiza a página no container
- `cleanup()` (opcional) — limpa event listeners ao sair
- `meta` (opcional) — título e metadados para SEO

### 2. Matching de Rotas

O router suporta tanto rotas estáticas quanto **rotas com parâmetros dinâmicos** (`:slug`):

```
Rota definida: /poema/:slug
URL acessada: /poema/meu-primeiro-poema
Parâmetros extraídos: { slug: 'meu-primeiro-poema' }
```

O matching funciona comparando segmento a segmento:
1. Se o segmento da rota começa com `:`, ele é tratado como parâmetro
2. Caso contrário, é comparado literalmente

### 3. View Transitions API

A navegação usa a **View Transitions API** nativa do browser para animações suaves entre páginas:

```javascript
if (document.startViewTransition) {
  const transition = document.startViewTransition(() => updateView());
  // ...
} else {
  updateView(); // Fallback sem animação
}
```

### 4. Navegação por Links

Links internos usam o atributo `data-link` para interceptar cliques:

```html
<a href="/poema/meu-poema" data-link>Ler poema</a>
```

O router intercepta o clique, faz `history.pushState()` e re-renderiza sem recarregar a página.

### 5. Fallback para GitHub Pages (SPA 404)

O GitHub Pages não suporta nativamente rotas SPA. O workaround funciona assim:

1. Um arquivo `404.html` customizado salva a URL em `sessionStorage` e redireciona para `index.html`
2. No `initRouter()`, a URL salva é restaurada via `history.replaceState()`

```javascript
const redirect = sessionStorage.getItem('redirect');
if (redirect) {
  sessionStorage.removeItem('redirect');
  window.history.replaceState(null, null, redirect);
}
```

## Acessibilidade

O router inclui um **route announcer** para leitores de tela:

```html
<div id="route-announcer" role="status" aria-live="polite" aria-atomic="true" class="sr-only"></div>
```

A cada navegação, o texto "Navegando para: [título da página]" é inserido nesse elemento, permitindo que leitores de tela anunciem a mudança de página.

## Tracking

O router registra visualizações de página via `analytics.js` (usando `requestIdleCallback` para não impactar performance), excluindo rotas administrativas:

```javascript
if (path !== '/admin' && path !== '/login' && !path.includes('/poema/')) {
  // Poemas têm tracking próprio
  trackPageView(path);
}
```

## Tratamento de Erros

- **Erro de módulo dinâmico**: Se um chunk falha ao carregar (ex: deploy durante navegação), o router faz `window.location.reload()` automaticamente
- **Rota não encontrada**: Exibe uma página 404 elegante com link para voltar ao início
