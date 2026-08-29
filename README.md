# Poemas de Natanael - Documentação e Setup

Site autoral desenvolvido com Vanilla JS (Vite) + Firebase (Firestore) + GitHub Pages.

## 1. Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Ative o **Firestore Database** e configure as Regras de Segurança (Security Rules).
   - *Exemplo de Arquitetura:* Somente poemas com `status == 'published'` são lidos pelo público (anônimo). Funções administrativas (escrita, leitura de rascunhos) exigem autenticação do admin.
3. Vá nas configurações do projeto e adicione um Aplicativo Web para obter as credenciais.

## 2. Configuração do Frontend (Variáveis de Ambiente)

1. Na raiz do projeto, crie um arquivo chamado `.env.local` e insira suas credenciais do Firebase:
   ```env
   VITE_FIREBASE_API_KEY=sua_api_key_aqui
   VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain_aqui
   VITE_FIREBASE_PROJECT_ID=seu_project_id_aqui
   VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket_aqui
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id_aqui
   VITE_FIREBASE_APP_ID=seu_app_id_aqui
   ```

2. Para rodar o ambiente de desenvolvimento localmente:
   ```bash
   npm install
   npm run dev
   ```

## 3. Scripts de Build (Pré-renderização, Sitemap e RSS)

Como o site é hospedado de forma estática, usamos scripts em Node.js no processo de build para consultar o Firebase e gerar páginas ricas e indexáveis (SEO):
- **Sitemap (`generate-sitemap.js`)**: Cria o arquivo `public/sitemap.xml`.
- **RSS Feed (`generate-rss.js`)**: Cria o feed público em `public/feed.xml`.
- **Prerender (`prerender.js`)**: Modifica a saída do build (pasta `dist/`) para criar arquivos HTML individuais (ex: `dist/poema/slug/index.html`) já com as metatags OpenGraph (og:title, og:image) e marcações JSON-LD (Schema.org), permitindo excelentes _previews_ ao compartilhar o link no WhatsApp/Twitter.

Para rodar o processo de build completo:
```bash
npm run build
```

## 4. Deploy no GitHub Pages (e Domínio Customizado)

### 4.1. GitHub Actions (Deploy Automático)

1. No seu repositório, vá em **Settings > Pages** e em _Source_, escolha **GitHub Actions**.
2. O arquivo `.github/workflows/deploy.yml` orquestra a publicação. 
3. **Importante:** Configure as chaves `VITE_FIREBASE_*` nos **Secrets and variables > Actions** do repositório. O processo de build precisa delas para buscar os poemas publicados e rodar os scripts de SEO descritos acima.

### 4.2. Domínio Customizado

1. Vá em **Settings > Pages** e adicione o seu domínio em **Custom domain**.
2. Configure a zona DNS no seu provedor (Registro.br, Cloudflare, etc.) apontando os registros `A` (raiz) para os IPs do GitHub Pages:
   `185.199.108.153`
   `185.199.109.153`
   `185.199.110.153`
   `185.199.111.153`
   E um registro `CNAME` (www) para `seu-usuario.github.io`.

## 5. Geração de Arte para o Instagram

No painel Admin, ao gerenciar um poema, você conta com o recurso **"Exportar p/ Instagram"**.
Ele utiliza o CSS customizado e a biblioteca `html2canvas` para "tirar uma foto" do poema no próprio navegador (client-side) e faz o download de um PNG na proporção exata para redes sociais (1080x1080), agilizando a publicação de novos trabalhos.
