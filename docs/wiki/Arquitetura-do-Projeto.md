# 🏗️ Arquitetura do Projeto

Visão geral da arquitetura, camadas e decisões técnicas do projeto.

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                          │
│              (Hospedagem Estática)                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   SPA (Vite) │  │  Sitemap.xml │  │   Feed.xml    │  │
│  │  Vanilla JS  │  │              │  │   (RSS)       │  │
│  └──────┬───────┘  └──────────────┘  └───────────────┘  │
│         │                                                │
│         │ Firestore SDK                                  │
│         ▼                                                │
│  ┌──────────────────────────────────────────────────┐    │
│  │             Firebase Firestore                    │    │
│  │  ┌──────────┐  ┌─────────────┐  ┌────────────┐  │    │
│  │  │  poems   │  │ subscribers │  │  campaign   │  │    │
│  │  │          │  │             │  │   _logs     │  │    │
│  │  └──────────┘  └─────────────┘  └────────────┘  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                  GitHub Actions                          │
│  ┌──────────────────┐  ┌────────────────────────────┐   │
│  │  deploy.yml       │  │  daily-poem.yml            │   │
│  │  Build + Deploy   │  │  E-mail diário (cron)      │   │
│  └──────────────────┘  └────────────────────────────┘   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│            Firebase Cloud Functions                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │  sendNewsletter (onCall)                          │   │
│  │  Envio de newsletter para assinantes via SMTP     │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | Vanilla JS (ES Modules) | Zero overhead de framework, controle total, performance máxima |
| **Bundler** | Vite | Build rápido, HMR instantâneo, suporte nativo a ES Modules |
| **Banco de Dados** | Firebase Firestore | Realtime, serverless, SDK leve para client-side |
| **Hosting** | GitHub Pages | Gratuito, integrado ao repositório, CDN global |
| **CI/CD** | GitHub Actions | Automação de deploy e tarefas agendadas |
| **E-mail** | Nodemailer + Gmail SMTP | Simples, gratuito para volume baixo |
| **Analytics** | Microsoft Clarity | Heatmaps e gravações de sessão sem custo |
| **Cloud Functions** | Firebase Functions (v2) | Newsletter serverless com autenticação |

## Decisões de Design

### Por que Vanilla JS?

O projeto é intencionalmente **sem framework**. As razões:

1. **Performance** — Zero kilobytes de runtime de framework
2. **Simplicidade** — O escopo do projeto (exibir poemas) não justifica a complexidade de React/Vue
3. **Longevidade** — APIs nativas do browser são estáveis e não sofrem breaking changes
4. **Aprendizado** — O código serve como estudo de padrões web nativos

### Por que SPA sem SSR?

O site é uma **Single Page Application** hospedada como arquivos estáticos:

- A navegação entre páginas usa a **History API** com **View Transitions API** para animações suaves
- O **SEO** é resolvido via **pré-renderização no build** (não em runtime), gerando HTML estático com metatags para cada poema
- Isso evita a necessidade de um servidor Node.js (SSR) e mantém o hosting 100% estático e gratuito

### Carregamento Lazy de Módulos Firebase

```javascript
// Auth, Storage e Functions são carregados sob demanda
export const getFirebaseAuth = async () => {
  if (!authInstance) {
    const { getAuth } = await import('firebase/auth');
    authInstance = getAuth(app);
  }
  return authInstance;
};
```

Apenas `Firestore` é carregado imediatamente (necessário para listar poemas). `Auth`, `Storage` e `Functions` são importados dinamicamente quando necessário, reduzindo o bundle inicial.

## Fluxo de Build

```
npm run build
    │
    ├── 1. npm run sitemap
    │      → Consulta Firestore → Gera public/sitemap.xml
    │
    ├── 2. npm run rss
    │      → Consulta Firestore → Gera public/feed.xml
    │
    ├── 3. vite build
    │      → Bundle JS/CSS → Gera dist/
    │
    └── 4. prerender.js
           → Consulta Firestore
           → Para cada poema publicado:
              → Injeta metatags OG, Twitter, JSON-LD
              → Inline CSS no HTML
              → Gera dist/poema/<slug>/index.html
```

## Diagrama de Componentes

```
main.js (Entry Point)
├── header.js         → Navegação principal + busca
├── router.js         → Roteamento SPA
│   ├── home.js       → Listagem de poemas
│   ├── poem.js       → Página individual do poema
│   ├── about.js      → Sobre o autor
│   ├── collections.js → Listagem de coleções
│   ├── collection.js → Poemas de uma coleção
│   ├── admin.js      → Painel administrativo (autenticado)
│   ├── login.js      → Tela de login
│   └── unsubscribe.js → Cancelar inscrição da newsletter
├── back-to-top.js    → Botão "voltar ao topo"
└── (componentes lazy)
    ├── search-overlay.js  → Busca com overlay fullscreen
    ├── theme-toggle.js    → Alternância de tema (dark/light/sepia)
    ├── audio-player.js    → Player de áudio para poemas
    ├── filter-chips.js    → Filtros por tag/categoria
    ├── newsletter.js      → Formulário de inscrição
    ├── poem-comments.js   → Comentários em poemas
    ├── immersive-reader.js → Modo leitura imersiva
    ├── push-toggle.js     → Toggle de notificações push
    └── toast.js           → Notificações toast
```

## Páginas Relacionadas

- [[Sistema de Roteamento (SPA)]] — Detalhes do router
- [[Design System]] — Tokens e temas
- [[SEO e Pré-renderização]] — Pipeline de SEO
