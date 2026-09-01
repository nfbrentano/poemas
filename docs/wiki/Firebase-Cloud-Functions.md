# ☁️ Firebase Cloud Functions

Funções serverless hospedadas no Firebase para operações que exigem backend.

## Função: `sendNewsletter`

Envia a newsletter com um poema para todos os assinantes ativos.

### Especificações

| Propriedade | Valor |
|------------|-------|
| **Tipo** | `onCall` (v2) |
| **Região** | `southamerica-east1` (São Paulo) |
| **Runtime** | Node.js |
| **Autenticação** | Obrigatória |

### Parâmetros de Entrada

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|:-----------:|-----------|
| `poemId` | `string` | ✅ | ID do documento do poema no Firestore |
| `targetEmail` | `string` | ❌ | E-mail para envio de teste (ignora lista de subscribers) |

### Resposta

```json
{
  "success": true,
  "count": 42,
  "message": "Opcional, apenas quando não há assinantes"
}
```

### Fluxo de Execução

```
1. Verifica autenticação (request.auth)
2. Busca o poema por poemId
3. Se targetEmail → envia apenas para esse e-mail (teste)
   Se não → busca todos subscribers com active == true
4. Monta o HTML do e-mail
5. Envia em batches de 5 via Gmail SMTP
6. Para cada falha → desativa o subscriber
7. Registra log em email_campaign_logs
8. Retorna contagem de envios
```

### Secrets

Configure via Firebase CLI:

```bash
firebase functions:secrets:set GMAIL_USER
firebase functions:secrets:set GMAIL_APP_PASSWORD
firebase functions:secrets:set SENDER_NAME
```

### Deploy

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Chamando via Admin Panel

No frontend (painel admin), a função é chamada via Firebase SDK:

```javascript
import { getFirebaseFunctions } from '../utils/firebase.js';
import { httpsCallable } from 'firebase/functions';

const functions = await getFirebaseFunctions();
const sendNewsletter = httpsCallable(functions, 'sendNewsletter');

const result = await sendNewsletter({
  poemId: 'abc123',
  targetEmail: 'teste@exemplo.com' // Opcional
});
```

### Limites e Custos

| Métrica | Limite (Spark/Gratuito) |
|---------|------------------------|
| Invocações | 125K/mês |
| GB-seconds | 40K/mês |
| CPU-seconds | 40K/mês |
| Outbound networking | 5GB/mês |

> Para volume alto de e-mails (>500/dia), considere migrar de Gmail SMTP para um serviço dedicado (SendGrid, Mailgun, SES).
