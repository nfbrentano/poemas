# 🪶 Poemas de Natanael

[![Deploy](https://github.com/nfbrentano/poemas/actions/workflows/deploy.yml/badge.svg)](https://github.com/nfbrentano/poemas/actions/workflows/deploy.yml)
[![Daily Poem](https://github.com/nfbrentano/poemas/actions/workflows/daily-poem.yml/badge.svg)](https://github.com/nfbrentano/poemas/actions/workflows/daily-poem.yml)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](LICENSE.md)

Site autoral de poesia — um espaço pessoal e acolhedor para publicar, compartilhar e preservar poemas originais. Desenvolvido com **Vanilla JS (Vite)**, **Firebase (Firestore, Auth e Cloud Functions)** e hospedado estaticamente no **GitHub Pages** com pré-renderização completa para SEO e redes sociais.

---

## ✨ Funcionalidades

- 📖 **Leitura fluida e SPA**: Navegação rápida com roteamento customizado no cliente, permalinks amigáveis, transições suaves e suporte a navegação anterior/próximo e poema aleatório.
- 🧘 **Leitura imersiva**: Modo de leitura com foco total no texto, livre de distrações visuais, com opções de personalização tipográfica, tamanho de fonte e contraste.
- 🎧 **Player de áudio**: Reprodução de áudio/declamação integrada diretamente nas páginas dos poemas com gravação autoral.
- 💬 **Comentários com moderação**: Seção para feedback da comunidade nos poemas, com fila de análise, aprovação e controle no painel administrativo.
- ❤️ **Reações expressivas**: Leitores podem registrar reações interativas em tempo real (emojis) em cada poema com persistência no Firestore.
- 🔍 **Busca instantânea**: Overlay de busca em tempo real com atalho pelo teclado (`/` ou atalho rápido), permitindo pesquisar por título, versos ou temas.
- 📚 **Coleções temáticas curadas**: Poemas organizados em livros, coletâneas e antologias com capas, contagem de obras e descrições exclusivas.
- 🎭 **Navegação por sentimentos**: Exploração categorizada por estados de espírito e emoções (ex.: amor, saudade, melancolia, esperança, reflexão).
- 🎨 **Exportação para redes sociais**: Geração client-side de cartões elegantes em formato 1080×1080 (feed e stories) via `@zumer/snapdom`.
- 📬 **E-mail diário e notificações push**: Poema do dia entregue na caixa de entrada dos inscritos (GitHub Actions + Nodemailer) e notificações Web Push no navegador via Firebase Messaging (VAPID).
- 📱 **PWA & Modo Offline**: Progressive Web App instalável (celular e desktop), com Service Worker, cache de assets estáticos e página offline dedicada.
- 🌗 **Tema claro e escuro**: Alternância de tema com detecção da preferência do sistema operacional e persistência em `localStorage`.
- 🛠️ **Painel administrativo completo**: Interface protegida por autenticação (Firebase Auth) para criação/edição de poemas (com agendamento de publicação), moderação de comentários, gerenciamento de coleções, controle de inscritos na newsletter, métricas de leitura e exportação WXR (WordPress).
- 🌐 **SEO completo & GEO (Generative Engine Optimization)**: Pré-renderização HTML de cada página e poema, metatags OpenGraph/Twitter Cards dinâmicas, dados estruturados Schema.org (JSON-LD), sitemap XML, feed RSS 2.0, arquivos `llms.txt` / `llms-full.txt` e notificações automáticas via IndexNow.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Descrição |
| --- | --- | --- |
| **Frontend** | Vanilla JS (ES Modules) + Vite | Aplicação SPA rápida sem o overhead de frameworks |
| **Estilos** | CSS nativo modular | Variáveis CSS (design tokens), layout responsivo e temas claro/escuro |
| **Banco de Dados** | Firebase Firestore | Armazenamento de poemas, coleções, comentários, reações e inscritos |
| **Autenticação** | Firebase Auth | Autenticação segura para acesso ao painel administrativo |
| **Serverless Backend** | Firebase Cloud Functions | Funções Node.js para moderação e automações (`functions/`) |
| **Card Social** | `@zumer/snapdom` | Renderização e exportação client-side de imagens para redes sociais |
| **Push Notifications** | Web Push / VAPID (FCM) | Notificações push via Service Worker no navegador |
| **Hospedagem** | GitHub Pages | Distribuição estática de alta disponibilidade com CDN |
| **CI/CD** | GitHub Actions | Workflows automatizados de build, testes, deploy e e-mail diário |
| **E-mail** | Nodemailer (Gmail SMTP) | Disparo diário do poema do dia para assinantes |
| **Analytics** | Microsoft Clarity | Métricas anônimas de usabilidade e leitura |
| **SEO & OpenGraph** | Satori + Resvg | Geração de metatags e imagens sociais durante o build |

---

## 🚀 Primeiros Passos

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 20+ recomendada)
- [npm](https://www.npmjs.com/)
- Projeto configurado no [Firebase Console](https://console.firebase.google.com/) com Firestore e Firebase Auth ativados

### Instalação

```bash
git clone https://github.com/nfbrentano/poemas.git
cd poemas
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto baseado no [.env.example](.env.example):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY="sua_api_key"
VITE_FIREBASE_AUTH_DOMAIN="seu-projeto.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="seu-projeto"
VITE_FIREBASE_STORAGE_BUCKET="seu-projeto.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="seu_messaging_sender_id"
VITE_FIREBASE_APP_ID="seu_app_id"
VITE_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# Web Push Notifications (VAPID) — Opcional
VITE_VAPID_PUBLIC_KEY="sua_chave_publica_vapid"

# Facebook / Open Graph — Opcional
VITE_FB_APP_ID="seu_fb_app_id"

# E-mail Diário (GitHub Actions Secrets ou ambiente local)
GMAIL_USER="seu_email@gmail.com"
GMAIL_PASS="sua_senha_de_app"
```

> [!NOTE]
> Para habilitar o envio de notificações push no navegador, consulte o guia passo a passo em [docs/notificacoes-push-vapid.md](docs/notificacoes-push-vapid.md) sobre como gerar e configurar a chave VAPID.

### Desenvolvimento Local

```bash
npm run dev       # Inicia o servidor local de desenvolvimento (Vite)
npm run test      # Executa a suíte de testes unitários e de integração (Vitest)
npm run build     # Executa o pipeline completo de build
npm run preview   # Pré-visualiza o resultado do build de produção
```

---

## 📦 Estrutura do Projeto

```
poemas/
├── .github/workflows/    # Workflows do GitHub Actions (deploy e e-mail diário)
├── docs/                 # Guias técnicos e documentações complementares
├── functions/            # Firebase Cloud Functions (Node.js)
├── public/               # Arquivos estáticos servidos diretamente (manifest, sw, robots.txt, 404.html)
├── scripts/              # Scripts de build, SEO, migrações e automação
│   └── dev/              # Backup histórico e dados legados do WordPress
├── SDD/                  # Especificações de Spec Driven Development
│   ├── DONE/             # Especificações de atividades implementadas e validadas
│   └── modelo_feature.md # Modelo obrigatório para novas especificações
├── src/                  # Código-fonte da aplicação
│   ├── assets/           # Imagens e vetores estáticos
│   ├── components/       # Componentes modulares de interface
│   ├── data/             # Dados estáticos (definições de sentimentos e coleções)
│   ├── pages/            # Telas da aplicação (Home, Poema, Sobre, Coleções, Sentimentos)
│   │   └── admin/        # Módulos e telas do painel administrativo
│   ├── styles/           # CSS modular, design tokens e temas claro/escuro
│   ├── utils/            # Utilitários, serviços Firebase, analytics, store e SEO
│   ├── main.js           # Ponto de entrada da aplicação
│   └── router.js         # Roteamento SPA e redirecionamento de rotas legadas
├── index.html            # Ponto de montagem HTML
├── package.json          # Dependências e scripts do projeto
├── vite.config.js        # Configuração do bundler Vite
└── vitest.config.js      # Configuração da suíte de testes Vitest
```

---

## 🔧 Scripts do Projeto

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento local com Vite. |
| `npm run build` | Pipeline completo de produção: **Vite → sitemap → RSS → llms → prerender**. |
| `npm run preview` | Servidor local para pré-visualização do diretório de produção `dist/`. |
| `npm run test` | Executa todos os testes automatizados com o Vitest. |
| `npm run lint` | Executa a verificação estática de código com ESLint nas pastas `src`, `scripts` e `functions`. |
| `npm run deploy` | Executa o build completo e publica o diretório `dist/` na branch `gh-pages`. |
| `npm run sitemap` | Gera `public/sitemap.xml` a partir dos poemas publicados no Firestore. |
| `npm run rss` | Gera o feed RSS 2.0 em `public/feed.xml`. |
| `npm run llms` | Gera `public/llms.txt` e `public/llms-full.txt` para assistentes de IA (GEO). |
| `npm run publish:scheduled` | Promove poemas agendados vencidos para status publicado no Firestore. |
| `npm run redirects` | Reconstrói o mapa de redirecionamentos do WordPress em `scripts/legacy-redirects.json`. |
| `npm run export:wxr` | Exporta o acervo de poemas do Firestore no formato WordPress eXtended RSS (WXR). |
| `npm run migrate:updated-at` | Script de migração para padronizar timestamps `updatedAt` no Firestore. |

### Fluxo do Pipeline de Build

O comando `npm run build` executa as seguintes etapas em ordem:
1. **`vite build`**: Empacota e otimiza os assets frontend (JavaScript, CSS e assets) para o diretório `dist/`.
2. **`npm run sitemap` (`scripts/generate-sitemap.js`)**: Consulta os poemas publicados no Firestore e gera o `public/sitemap.xml`.
3. **`npm run rss` (`scripts/generate-rss.js`)**: Cria o feed RSS atualizado em `public/feed.xml`.
4. **`npm run llms` (`scripts/generate-llms.js`)**: Produz as versões textuais `public/llms.txt` e `public/llms-full.txt`.
5. **`prerender` (`scripts/prerender.js`)**: Gera páginas HTML individuais em `dist/poema/<slug>/index.html` e demais rotas principais, injetando metatags OpenGraph/Twitter Cards e metadados estruturados Schema.org (JSON-LD) para indexação por motores de busca e crawlers sociais.

---

## 🌍 Deploy e CI/CD

### Deploy Automático (GitHub Actions)

O repositório está configurado para deploy contínuo em cada push na branch `main`:
1. Em **Settings > Pages** do repositório, configure o *Source* como **GitHub Actions**.
2. Configure as seguintes variáveis e segredos em **Settings > Secrets and variables > Actions**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_VAPID_PUBLIC_KEY` (opcional, para Web Push)
   - `GMAIL_USER` e `GMAIL_PASS` (para o workflow de e-mail diário)
3. A cada push na branch `main`, o workflow [deploy.yml](.github/workflows/deploy.yml) realiza a instalação limpa, executa o build com pré-renderização, roda a suíte de testes e publica o site estático no GitHub Pages.

### Domínio Customizado

Para utilizar um domínio próprio, configure as seguintes entradas DNS no seu provedor:

| Tipo | Nome | Valor |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `nfbrentano.github.io` |

---

## 📬 E-mail Diário

O workflow [daily-poem.yml](.github/workflows/daily-poem.yml) é executado diariamente às 9h BRT (12h UTC), selecionando o poema do dia e enviando para os assinantes cadastrados via Nodemailer. Requer os secrets `GMAIL_USER` e `GMAIL_PASS` configurados no repositório.

---

## ⏰ Publicação Automática de Poemas Agendados

O workflow [publish-scheduled.yml](.github/workflows/publish-scheduled.yml) é executado a cada hora cheia (via cron e `workflow_dispatch`). Ele busca no Firestore poemas com status `scheduled` cuja data agendada (`scheduled_at`) já passou. Ao encontrar:
1. Promove os poemas para `published`, preservando a data agendada em `published_at` e atualizando `updated_at`.
2. Dispara automaticamente o workflow [deploy.yml](.github/workflows/deploy.yml) para reconstruir o site estático, garantindo a página pré-renderizada do poema, atualização da home, sitemaps, RSS e `llms.txt`.

---

## 📐 Metodologia: Spec Driven Development (SDD)

Todas as novas funcionalidades, correções, refatorações ou tarefas de documentação devem seguir o fluxo **Spec Driven Development (SDD)**:

1. **Especificação prévia**: Nenhuma linha de código deve ser escrita antes da especificação estar criada.
2. **Criar a spec**: Copie o arquivo modelo [`SDD/modelo_feature.md`](SDD/modelo_feature.md) para `SDD/AAAA-MM-DD_nome-da-feature.md`.
3. **Preencher todos os requisitos**: Detalhes, requisitos funcionais e não-funcionais, critérios de aceitação no formato *"Dado que [contexto], quando [ação], então [resultado esperado]"* e casos de teste.
4. **Implementar e testar**: Desenvolva as alterações e garanta a aprovação nos testes (`npm run test`).
5. **Arquivar como concluída**: Mova a especificação para a pasta [`SDD/DONE/`](SDD/DONE/) ao finalizar.

Para mais orientações de desenvolvimento e regras de projeto, veja [`GEMINI.md`](GEMINI.md) ou [`CLAUDE.md`](CLAUDE.md).

---

## 🤝 Contribuindo

Contribuições técnicas ao código, infraestrutura e documentação são bem-vindas! Consulte o guia em [CONTRIBUTING.md](CONTRIBUTING.md) e nosso [Código de Conduta](CODE_OF_CONDUCT.md) antes de enviar um Pull Request.

> [!NOTE]
> Os poemas publicados são obras autorais protegidas pela licença CC BY-NC-ND 4.0. Aceitamos apenas contribuições voltadas à engenharia de software e ao ecossistema do projeto.

---

## 📄 Licença

Este projeto está licenciado sob a licença **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**. Consulte [LICENSE.md](LICENSE.md) para mais detalhes.

---

## 🔒 Segurança

Para reportar vulnerabilidades ou preocupações de segurança, consulte nossa [Política de Segurança](SECURITY.md).

---

Feito com 💜 por [Natanael Fernando Gatti Brentano](https://github.com/nfbrentano)
