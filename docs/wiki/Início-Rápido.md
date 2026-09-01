# 🚀 Início Rápido

Guia para configurar o ambiente de desenvolvimento e rodar o projeto localmente.

## Pré-requisitos

| Ferramenta | Versão Mínima | Verificar |
|-----------|--------------|-----------|
| Node.js | 20+ (LTS recomendado) | `node --version` |
| npm | 9+ | `npm --version` |
| Git | 2.30+ | `git --version` |

Você também precisará de:
- Um projeto no [Firebase Console](https://console.firebase.google.com/) com **Firestore** ativado
- Credenciais do Firebase (API Key, Auth Domain, etc.)

## 1. Clonar o Repositório

```bash
git clone https://github.com/nfbrentano/poemas.git
cd poemas
```

## 2. Instalar Dependências

```bash
npm install
```

Isso instala tanto as dependências do frontend quanto as devDependencies (Vite, Vitest, etc.).

## 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

> ⚠️ **Nunca commite este arquivo!** Ele já está no `.gitignore`.

Veja mais detalhes em [[Variáveis de Ambiente]].

## 4. Rodar o Servidor de Desenvolvimento

```bash
npm run dev
```

O Vite iniciará um servidor em `http://localhost:5173` (ou outra porta disponível) com Hot Module Replacement (HMR).

## 5. Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build completo: sitemap → RSS → Vite → prerender |
| `npm run preview` | Visualizar o build de produção localmente |
| `npm run test` | Rodar testes com Vitest |
| `npm run sitemap` | Gerar apenas o sitemap.xml |
| `npm run rss` | Gerar apenas o feed.xml |
| `npm run deploy` | Build + deploy para GitHub Pages (via gh-pages) |

## 6. Estrutura de Diretórios

```
poemas/
├── src/                  # Código-fonte principal
│   ├── components/       # Componentes UI reutilizáveis
│   ├── pages/            # Páginas (home, poem, admin, about, etc.)
│   ├── styles/           # CSS (variables, global, components)
│   ├── utils/            # Firebase, SEO, analytics, navegação
│   ├── main.js           # Entry point — layout base + init
│   └── router.js         # Roteamento SPA com View Transitions
├── scripts/              # Scripts de build (Node.js)
│   ├── prerender.js      # Pré-renderização de páginas de poemas
│   ├── generate-sitemap.js
│   ├── generate-rss.js
│   └── send-daily-poem.js
├── functions/            # Firebase Cloud Functions (newsletter)
├── public/               # Arquivos estáticos (ícones, manifest, etc.)
├── .github/workflows/    # GitHub Actions (deploy + e-mail diário)
└── dist/                 # Saída do build (gerado automaticamente)
```

## Próximos Passos

- [[Arquitetura do Projeto]] — Entender as decisões técnicas
- [[Design System]] — Conhecer o sistema de design
- [[Deploy (GitHub Pages)]] — Configurar o deploy automático
