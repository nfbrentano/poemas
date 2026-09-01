# ⚙️ GitHub Actions

Todos os workflows automatizados do projeto.

## Workflows

### 1. `deploy.yml` — Deploy para GitHub Pages

| Propriedade | Valor |
|------------|-------|
| **Trigger** | Push na `main` + manual (`workflow_dispatch`) |
| **Runner** | `ubuntu-latest` |
| **Node.js** | v26 |

**O que faz:**
1. Instala dependências (`npm ci`)
2. Roda o build completo (`npm run build`)
3. Faz upload do diretório `dist/` como artefato
4. Deploya para GitHub Pages

**Secrets usados:** `VITE_FIREBASE_*` (6 variáveis)

Veja mais em [[Deploy (GitHub Pages)]].

---

### 2. `daily-poem.yml` — E-mail Diário

| Propriedade | Valor |
|------------|-------|
| **Trigger** | Cron `0 12 * * *` (9h BRT) + manual |
| **Runner** | `ubuntu-latest` |
| **Node.js** | Última versão (`'node'`) |

**O que faz:**
1. Instala dependências
2. Executa `scripts/send-daily-poem.js`
3. Seleciona um poema aleatório do Firestore
4. Envia por e-mail via Gmail SMTP

**Secrets usados:** `VITE_FIREBASE_*` + `GMAIL_USER` + `GMAIL_PASS`

Veja mais em [[Newsletter e E-mail Diário]].

---

## Configurando Secrets

1. Vá em **Settings > Secrets and variables > Actions**
2. Clique em **New repository secret**
3. Adicione cada secret:

```
VITE_FIREBASE_API_KEY        → AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN    → poemas-natanael.firebaseapp.com
VITE_FIREBASE_PROJECT_ID     → poemas-natanael
VITE_FIREBASE_STORAGE_BUCKET → poemas-natanael.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID → 123456789
VITE_FIREBASE_APP_ID         → 1:123456789:web:abc123
GMAIL_USER                   → nfgbrentano@gmail.com
GMAIL_PASS                   → xxxx xxxx xxxx xxxx (senha de app)
```

## Monitoramento

- Acesse **Actions** no repositório para ver o histórico de execuções
- Cada workflow mostra logs detalhados de cada step
- E-mails de notificação são enviados em caso de falha (configurável em Settings > Notifications)

## Trigger Manual

Ambos os workflows podem ser disparados manualmente:

1. Vá em **Actions**
2. Selecione o workflow
3. Clique em **Run workflow**
4. Selecione a branch e clique em **Run**
