# 🔐 Variáveis de Ambiente

Todas as variáveis de ambiente necessárias para o projeto, divididas por contexto de uso.

## Frontend (Vite)

Essas variáveis são usadas no frontend via `import.meta.env.*` e nos scripts de build via `process.env.*`.

| Variável | Descrição | Obrigatória |
|----------|-----------|:-----------:|
| `VITE_FIREBASE_API_KEY` | API Key do projeto Firebase | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth Domain do Firebase | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket do Firebase | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | App ID do Firebase | ✅ |

### Onde configurar

**Localmente:** Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=poemas-natanael.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=poemas-natanael
VITE_FIREBASE_STORAGE_BUCKET=poemas-natanael.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**No CI/CD (GitHub Actions):** Configure em **Settings > Secrets and variables > Actions** no repositório.

## E-mail (GitHub Actions — Daily Poem)

Usadas no workflow `daily-poem.yml` para envio de e-mail diário.

| Variável | Descrição | Obrigatória |
|----------|-----------|:-----------:|
| `GMAIL_USER` | Endereço Gmail do remetente | ✅ |
| `GMAIL_PASS` | Senha de App do Gmail (não a senha normal) | ✅ |

### Como gerar a Senha de App do Gmail

1. Acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Selecione "Outro" e nomeie (ex: "Poemas Daily Email")
3. Copie a senha de 16 caracteres gerada
4. Configure como secret `GMAIL_PASS` no GitHub

> ⚠️ A autenticação de dois fatores (2FA) precisa estar ativada na conta Gmail.

## Firebase Cloud Functions (Newsletter)

Usadas pela Cloud Function `sendNewsletter`, configuradas como secrets do Firebase.

| Secret | Descrição |
|--------|-----------|
| `GMAIL_USER` | Endereço Gmail do remetente |
| `GMAIL_APP_PASSWORD` | Senha de App do Gmail |
| `SENDER_NAME` | Nome que aparece como remetente (ex: "Natanael Brentano") |

### Como configurar secrets do Firebase

```bash
firebase functions:secrets:set GMAIL_USER
firebase functions:secrets:set GMAIL_APP_PASSWORD
firebase functions:secrets:set SENDER_NAME
```

## Convenção de Nomes

O prefixo `VITE_` é **obrigatório** para variáveis acessíveis no frontend. O Vite só expõe variáveis de ambiente que começam com esse prefixo.

```javascript
// ✅ Acessível no frontend
import.meta.env.VITE_FIREBASE_API_KEY

// ❌ NÃO acessível no frontend
import.meta.env.GMAIL_PASS
```

Nos scripts Node.js (`scripts/`), as variáveis são carregadas via `--env-file=.env.local`:

```bash
node --env-file=.env.local scripts/prerender.js
```

## Segurança

- O `.env.local` **nunca** deve ser commitado (já está no `.gitignore`)
- As API keys do Firebase são inherently públicas (são expostas no frontend), mas protegidas por:
  - **Security Rules** do Firestore (leitura pública apenas para poemas publicados)
  - **App Check** (se configurado)
  - **Content Security Policy** (CSP) restritiva no `index.html`
- Secrets sensíveis (GMAIL_PASS) **só existem** no GitHub Actions Secrets e Firebase Secrets
