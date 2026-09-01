# 📬 Newsletter e E-mail Diário

O projeto possui dois sistemas de envio de e-mail: o **e-mail diário automático** (GitHub Actions) e a **newsletter sob demanda** (Firebase Cloud Functions).

## 1. E-mail Diário (GitHub Actions)

### Funcionamento

O workflow `daily-poem.yml` roda todos os dias às **12:00 UTC (9:00 BRT)** via cron do GitHub Actions:

```yaml
on:
  schedule:
    - cron: '0 12 * * *'
  workflow_dispatch: # Permite trigger manual
```

### Fluxo

1. Checkout do repositório
2. Setup do Node.js e instalação de dependências
3. Execução de `scripts/send-daily-poem.js`:
   - Consulta o Firestore por poemas publicados
   - Escolhe um poema **aleatório** (`Math.random()`)
   - Envia por e-mail via **Nodemailer + Gmail SMTP**

### Template do E-mail

O e-mail segue um design minimalista noturno:

- Fundo `#050505` (preto profundo)
- Texto `#e2e2e2` (off-white)
- Tipografia Georgia, serif
- Layout centralizado com tabelas (compatibilidade com clientes de e-mail)
- Botão "Ler no site" com link para a versão web
- Assinatura "Natanael Brentano"

### Secrets Necessários

| Secret | Descrição |
|--------|-----------|
| `VITE_FIREBASE_*` | Credenciais Firebase (para consultar Firestore) |
| `GMAIL_USER` | E-mail Gmail do remetente |
| `GMAIL_PASS` | Senha de App do Gmail |

---

## 2. Newsletter (Firebase Cloud Functions)

### Funcionamento

A Cloud Function `sendNewsletter` é acionada sob demanda pelo painel Admin (via `onCall`):

```javascript
exports.sendNewsletter = onCall({
  region: "southamerica-east1",
  secrets: [gmailUser, gmailAppPassword, senderName],
}, async (request) => { ... });
```

### Fluxo

1. **Autenticação obrigatória** — Apenas admins autenticados podem chamar a função
2. **Busca o poema** pelo `poemId` no Firestore
3. **Busca assinantes** com `active == true` (ou usa `targetEmail` para teste)
4. **Envia e-mails em batch** — Grupos de 5 por vez via `Promise.allSettled()`
5. **Trata falhas** — Assinantes com envio falhado são automaticamente desativados
6. **Registra log** — Salva resultado na coleção `email_campaign_logs`

### Template do E-mail

Similar ao e-mail diário, com diferenças:

- Cabeçalho "Novo poema publicado" (em vez de "Poema do Dia")
- **Link de cancelamento de inscrição** no rodapé (usando `unsubscribe_token`)
- **Versão text/plain** como fallback

### Envio em Batch

Para evitar limites de rate do Gmail SMTP, os e-mails são enviados em grupos de 5:

```javascript
const BATCH_SIZE = 5;
for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
  const batch = subscribers.slice(i, i + BATCH_SIZE);
  await Promise.allSettled(batch.map(async (sub) => {
    await transporter.sendMail(mailOptions);
  }));
}
```

### Desativação Automática

Quando o envio falha para um assinante (e-mail inválido, caixa cheia, etc.), ele é automaticamente desativado:

```javascript
await subQuery.docs[0].ref.update({ active: false });
```

### Cancelamento de Inscrição

O link de cancelamento aponta para `/unsubscribe?token=<token>`, que verifica o token e desativa o assinante no Firestore.

---

## Configuração do Gmail SMTP

| Configuração | Valor |
|-------------|-------|
| Host | `smtp.gmail.com` |
| Porta | `465` (SSL) |
| Timeout de conexão | 5000ms |
| Timeout de greeting | 5000ms |
| Timeout de socket | 10000ms |

> ⚠️ O Gmail tem um limite de ~500 e-mails/dia para contas pessoais. Para volumes maiores, considere migrar para um serviço como SendGrid ou Amazon SES.
