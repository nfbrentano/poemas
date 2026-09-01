# 🪶 Poemas de Natanael

[![Deploy](https://github.com/nfbrentano/poemas/actions/workflows/deploy.yml/badge.svg)](https://github.com/nfbrentano/poemas/actions/workflows/deploy.yml)
[![Daily Poem](https://github.com/nfbrentano/poemas/actions/workflows/daily-poem.yml/badge.svg)](https://github.com/nfbrentano/poemas/actions/workflows/daily-poem.yml)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg)](LICENSE.md)

Site autoral de poesia — um espaço pessoal para publicar, compartilhar e preservar poemas originais. Desenvolvido com **Vanilla JS (Vite)**, **Firebase (Firestore)** e hospedado no **GitHub Pages**.

## ✨ Funcionalidades

- 📖 **Leitura de poemas** — navegação fluida com roteamento SPA
- 📧 **E-mail diário** — um poema por dia na caixa de entrada dos inscritos (GitHub Actions + Nodemailer)
- 🎨 **Exportação para Instagram** — gera imagens 1080×1080 prontas para redes sociais via `html2canvas`
- 🔍 **SEO completo** — pré-renderização de páginas individuais com OpenGraph, JSON-LD (Schema.org), sitemap e RSS feed
- 🌐 **Domínio customizado** — suporte a domínio próprio via GitHub Pages

## 🛠️ Stack Tecnológica

| Camada     | Tecnologia                        |
| ---------- | --------------------------------- |
| Frontend   | Vanilla JS + Vite                 |
| Banco      | Firebase Firestore                |
| Hosting    | GitHub Pages                      |
| CI/CD      | GitHub Actions                    |
| E-mail     | Nodemailer (Gmail)                |
| Analytics  | Microsoft Clarity                 |

## 🚀 Primeiros Passos

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- Projeto configurado no [Firebase Console](https://console.firebase.google.com/)
- Firestore ativado com regras de segurança configuradas

### Instalação

```bash
git clone https://github.com/nfbrentano/poemas.git
cd poemas
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### Desenvolvimento

```bash
npm run dev       # Servidor de desenvolvimento (Vite)
npm run build     # Build completo (sitemap + RSS + Vite + prerender)
npm run test      # Testes (Vitest)
```

## 📦 Estrutura do Projeto

```
poemas/
├── src/                  # Código-fonte principal
│   ├── components/       # Componentes reutilizáveis
│   ├── pages/            # Páginas da aplicação
│   ├── styles/           # Estilos CSS
│   ├── utils/            # Utilitários e helpers
│   ├── main.js           # Ponto de entrada
│   └── router.js         # Roteamento SPA
├── scripts/              # Scripts de build (sitemap, RSS, prerender, e-mail)
├── public/               # Arquivos estáticos
├── functions/            # Firebase Cloud Functions
├── .github/workflows/    # CI/CD (deploy + e-mail diário)
└── dist/                 # Saída do build
```

## 🔧 Scripts de Build

| Comando          | Descrição                                                      |
| ---------------- | -------------------------------------------------------------- |
| `npm run dev`    | Servidor de desenvolvimento local                              |
| `npm run build`  | Build completo: sitemap → RSS → Vite → prerender              |
| `npm run deploy` | Build + deploy para GitHub Pages                               |
| `npm run test`   | Executa os testes com Vitest                                   |

### Detalhes do Build

- **`generate-sitemap.js`** — gera `public/sitemap.xml` consultando o Firestore
- **`generate-rss.js`** — gera `public/feed.xml` com os poemas publicados
- **`prerender.js`** — cria HTMLs individuais em `dist/poema/<slug>/index.html` com metatags OG e JSON-LD

## 🌍 Deploy

### GitHub Actions (Automático)

1. Em **Settings > Pages**, selecione **GitHub Actions** como _Source_
2. Configure os secrets `VITE_FIREBASE_*` em **Settings > Secrets and variables > Actions**
3. Cada push na `main` dispara o deploy automaticamente

### Domínio Customizado

Configure os registros DNS no seu provedor:

| Tipo    | Nome | Valor                                     |
| ------- | ---- | ----------------------------------------- |
| A       | @    | `185.199.108.153`                         |
| A       | @    | `185.199.109.153`                         |
| A       | @    | `185.199.110.153`                         |
| A       | @    | `185.199.111.153`                         |
| CNAME   | www  | `nfbrentano.github.io`                    |

## 📬 E-mail Diário

O workflow `daily-poem.yml` envia um poema por e-mail todos os dias às 9h (BRT). Requer os secrets `GMAIL_USER` e `GMAIL_PASS` configurados no repositório.

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia o guia em [CONTRIBUTING.md](CONTRIBUTING.md) antes de começar.

## 📄 Licença

Este projeto está licenciado sob a **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International**. Veja [LICENSE.md](LICENSE.md) para detalhes.

## 🔒 Segurança

Para reportar vulnerabilidades, consulte nossa [política de segurança](SECURITY.md).

---

Feito com 💜 por [Natanael Brentano](https://github.com/nfbrentano)
