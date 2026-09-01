# 🚀 Deploy (GitHub Pages)

Como funciona o deploy automático e a configuração de domínio customizado.

## Deploy Automático via GitHub Actions

O workflow `deploy.yml` é disparado automaticamente a cada push na branch `main`.

### Fluxo do Workflow

```
Push na main
    │
    ├── 1. Checkout do código
    ├── 2. Setup Node.js (v26) com cache npm
    ├── 3. npm ci (instalação limpa de dependências)
    ├── 4. npm run build
    │      ├── Gera sitemap.xml (consulta Firestore)
    │      ├── Gera feed.xml (consulta Firestore)
    │      ├── Vite build (bundle JS/CSS → dist/)
    │      └── Prerender (HTML estático por poema → dist/poema/*)
    ├── 5. Configure Pages
    ├── 6. Upload artifact (pasta dist/)
    └── 7. Deploy to GitHub Pages
```

### Configuração

1. No repositório, vá em **Settings > Pages**
2. Em _Source_, selecione **GitHub Actions**
3. Configure os secrets em **Settings > Secrets and variables > Actions**:

| Secret | Necessário Para |
|--------|----------------|
| `VITE_FIREBASE_API_KEY` | Build (scripts de SEO) |
| `VITE_FIREBASE_AUTH_DOMAIN` | Build |
| `VITE_FIREBASE_PROJECT_ID` | Build |
| `VITE_FIREBASE_STORAGE_BUCKET` | Build |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Build |
| `VITE_FIREBASE_APP_ID` | Build |

### Concorrência

```yaml
concurrency:
  group: 'pages'
  cancel-in-progress: false
```

Apenas um deploy roda por vez. Deploys enfileirados esperam o anterior terminar (não cancela deploy em progresso para evitar estado inconsistente).

### Permissões

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

O token do GitHub Actions recebe permissões mínimas: leitura do código + escrita no Pages.

---

## Domínio Customizado

### Configuração DNS

Configure os seguintes registros no seu provedor de DNS:

| Tipo | Nome | Valor |
|------|------|-------|
| A | @ | `185.199.108.153` |
| A | @ | `185.199.109.153` |
| A | @ | `185.199.110.153` |
| A | @ | `185.199.111.153` |
| CNAME | www | `nfbrentano.github.io` |

### Configuração no GitHub

1. Vá em **Settings > Pages**
2. Em **Custom domain**, adicione seu domínio
3. Marque **Enforce HTTPS**

### CNAME File

O arquivo `public/CNAME` (se existir) é incluído automaticamente no build. Ele contém apenas o domínio customizado:

```
seudominio.com.br
```

---

## SPA Fallback (404.html)

O GitHub Pages não suporta nativamente rotas SPA. A solução é um `404.html` customizado que:

1. Captura a URL que o servidor tentou servir
2. Salva em `sessionStorage`
3. Redireciona para `index.html`
4. O router SPA restaura a URL correta

---

## Troubleshooting

### Build falha por credenciais Firebase

**Causa:** Os secrets `VITE_FIREBASE_*` não estão configurados no GitHub.

**Solução:** Configure todos os 6 secrets em Settings > Secrets and variables > Actions.

### Páginas retornam 404

**Causa:** GitHub Pages não sabe que é uma SPA.

**Solução:** Verifique se o `404.html` existe na pasta `public/` e contém o script de redirect.

### CSS não carrega na pré-renderização

**Causa:** Paths relativos incorretos no HTML gerado.

**Solução:** O `prerender.js` inline o CSS automaticamente. Verifique se o `vite build` completou antes do prerender.
