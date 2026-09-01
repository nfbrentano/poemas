# 🔍 SEO e Pré-renderização

Como o projeto resolve o desafio de SEO em uma SPA hospedada como site estático.

## O Problema

SPAs renderizadas no client-side têm um problema fundamental de SEO: crawlers e scrapers de redes sociais (WhatsApp, Twitter, Facebook) **não executam JavaScript**. Eles veem apenas o HTML inicial — que, numa SPA, está praticamente vazio.

## A Solução: Pré-renderização no Build

Em vez de usar SSR (Server-Side Rendering), que exigiria um servidor Node.js, o projeto gera **HTML estático pré-renderizado durante o build**. Isso mantém o hosting 100% estático e gratuito (GitHub Pages).

### Pipeline de SEO

```
npm run build
    │
    ├── 1. generate-sitemap.js → public/sitemap.xml
    │
    ├── 2. generate-rss.js → public/feed.xml
    │
    ├── 3. vite build → dist/ (bundle JS/CSS)
    │
    └── 4. prerender.js
           │
           ├── Consulta Firestore (todos os poemas publicados)
           │
           └── Para cada poema:
               ├── Clona o dist/index.html
               ├── Substitui <title>
               ├── Substitui <meta name="description">
               ├── Substitui tags OpenGraph (og:title, og:description, og:url, og:image, og:type)
               ├── Substitui tags Twitter Card
               ├── Adiciona metatags de artigo (article:published_time, article:tag)
               ├── Injeta JSON-LD (Schema.org CreativeWork)
               ├── Inline CSS (performance)
               └── Salva em dist/poema/<slug>/index.html
```

## Metatags Geradas

### OpenGraph

```html
<meta property="og:title" content="Primeiro Verso — Natanael Brentano" />
<meta property="og:description" content="O silêncio entre as palavras..." />
<meta property="og:url" content="https://nfbrentano.github.io/poemas/poema/primeiro-verso" />
<meta property="og:image" content="https://poemas-natanael.web.app/og-image?slug=primeiro-verso" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2025-06-15T12:00:00.000Z" />
<meta property="article:tag" content="silêncio" />
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Primeiro Verso — Natanael Brentano" />
<meta name="twitter:description" content="O silêncio entre as palavras..." />
<meta name="twitter:image" content="..." />
```

### JSON-LD (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "genre": "Poetry",
  "inLanguage": "pt-BR",
  "headline": "Primeiro Verso",
  "description": "O silêncio entre as palavras...",
  "author": {
    "@type": "Person",
    "name": "Natanael Brentano",
    "sameAs": ["https://instagram.com/nfgbrentano"]
  },
  "datePublished": "2025-06-15T12:00:00.000Z",
  "url": "https://nfbrentano.github.io/poemas/poema/primeiro-verso"
}
```

## SEO Dinâmico (Client-side)

Além da pré-renderização, o módulo `seo.js` atualiza as metatags **dinamicamente** durante a navegação SPA, para que o compartilhamento de links funcione corretamente mesmo quando o usuário navega dentro da SPA (embora isso seja principalmente para consistência — os crawlers usam o HTML estático).

```javascript
import { updateSEO } from './utils/seo.js';

updateSEO({
  title: poem.title,
  description: excerpt,
  url: `${baseUrl}/poema/${poem.slug}`,
  type: 'article',
  publishedTime: poem.published_at,
  tags: poem.tags
});
```

## Sitemap

O `sitemap.xml` é gerado automaticamente com todas as URLs:

- **Home page** — prioridade 1.0, frequência diária
- **Cada poema** — prioridade 0.8, frequência mensal, com `<lastmod>`

## RSS Feed

O `feed.xml` segue o padrão RSS 2.0 com namespace Atom, incluindo:

- Título, link e descrição do canal
- `<atom:link>` com `rel="self"` (padrão de auto-referência)
- Um `<item>` por poema com título, link, GUID, descrição e data de publicação

## Otimizações

1. **CSS Inline** — O prerender inline o CSS do bundle Vite diretamente no HTML de cada poema, eliminando uma requisição de rede extra
2. **Canonical URL** — Cada página tem `<link rel="canonical">` apontando para a URL correta
3. **Content Security Policy** — CSP restritiva configurada no `index.html`
4. **Preconnect** — `<link rel="preconnect">` para Google Fonts e Firebase

## Verificação

O site está verificado no Google Search Console via metatag:

```html
<meta name="google-site-verification" content="wPQzoAupcNdkEpgcqnBO0GKAYr5wKYOg3gTPjQ_QWXE" />
```
