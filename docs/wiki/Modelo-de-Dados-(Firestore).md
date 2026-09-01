# 🗄️ Modelo de Dados (Firestore)

Estrutura das coleções e documentos no Firebase Firestore.

## Coleções

### `poems`

Armazena todos os poemas (publicados, rascunhos).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `title` | `string` | Título do poema |
| `slug` | `string` | Slug para URL (ex: `meu-primeiro-poema`) |
| `content` | `string` | Corpo do poema (pode conter HTML básico) |
| `excerpt` | `string` | Trecho/resumo para SEO e previews |
| `status` | `string` | `'published'` ou `'draft'` |
| `published_at` | `timestamp` | Data de publicação |
| `tags` | `array<string>` | Tags/categorias do poema |
| `collection` | `string` | Slug da coleção a que pertence (se houver) |

**Exemplo:**
```json
{
  "title": "Primeiro Verso",
  "slug": "primeiro-verso",
  "content": "O silêncio entre as palavras\né onde mora o poema.",
  "excerpt": "O silêncio entre as palavras é onde mora o poema.",
  "status": "published",
  "published_at": "2025-06-15T12:00:00Z",
  "tags": ["silêncio", "palavras", "reflexão"],
  "collection": "primeiras-impressoes"
}
```

---

### `subscribers`

Armazena inscritos na newsletter.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `email` | `string` | Endereço de e-mail do assinante |
| `active` | `boolean` | Se está ativo (`true`) ou cancelou (`false`) |
| `unsubscribe_token` | `string` | Token único para cancelar inscrição via link |
| `subscribed_at` | `timestamp` | Data da inscrição |

**Regras de negócio:**
- Apenas assinantes com `active == true` recebem newsletters
- Quando um envio de e-mail falha, o assinante é automaticamente desativado
- O `unsubscribe_token` é enviado no link de cancelamento em cada e-mail

---

### `email_campaign_logs`

Logs de campanhas de e-mail enviadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `poem_id` | `string` | ID do poema enviado |
| `status` | `string` | `'success'` ou `'failed'` |
| `details` | `string` | Detalhes do envio (contagem de sucesso/falhas) |
| `created_at` | `timestamp` | Data/hora do envio (server timestamp) |

---

## Regras de Segurança (Firestore Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Poemas: leitura pública somente dos publicados
    match /poems/{poemId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null; // Apenas admin autenticado
    }

    // Assinantes: apenas Cloud Functions podem ler/escrever
    match /subscribers/{subId} {
      allow read, write: if false; // Acesso via Admin SDK
    }

    // Logs de campanha: apenas via Admin SDK
    match /email_campaign_logs/{logId} {
      allow read, write: if false;
    }
  }
}
```

### Princípios

1. **Mínimo privilégio** — O frontend anônimo só lê poemas publicados
2. **Admin autenticado** — Criação/edição de poemas requer `request.auth`
3. **Dados sensíveis protegidos** — Subscribers e logs são acessíveis apenas via Admin SDK (Cloud Functions)

## Índices

Os queries que combinam filtro + ordenação precisam de índices compostos:

| Coleção | Campos | Tipo |
|---------|--------|------|
| `poems` | `status` (ASC) + `published_at` (DESC) | Composto |
| `subscribers` | `active` (ASC) | Simples |

> 💡 O Firebase cria automaticamente índices simples. Índices compostos são criados via Firebase Console ou `firestore.indexes.json`.
