# Guia de Configuração de Notificações Push (VAPID)

Este documento detalha o processo de obtenção, configuração e validação da chave pública **VAPID** (*Voluntary Application Server Identity*) necessária para o funcionamento das notificações Web Push no site **Poemas de Natanael**.

---

## 📌 O que é VAPID e por que é necessário?

O protocolo VAPID é o padrão Web Push (RFC 8292) que permite aos navegadores identificar de forma segura qual servidor de aplicação está enviando mensagens de notificação push via Service Worker.

No projeto:
- O utilitário [`src/utils/push.js`](file:///Users/natanaelfernandogattibrentano/poemas/src/utils/push.js) utiliza a variável de ambiente `VITE_VAPID_PUBLIC_KEY` ao chamar `registration.pushManager.subscribe()`.
- Sem essa chave pública configurada, o navegador não consegue emitir o token de inscrição (*push subscription*), gerando um aviso no sistema de que as notificações não estão configuradas.

---

## 🔑 Passo a Passo: Gerando a Chave VAPID no Firebase

Para gerar o par de chaves VAPID (*Web Push Certificate*):

1. Acesse o [Firebase Console](https://console.firebase.google.com/).
2. Selecione o projeto **poemas-natanael** (ou o projeto Firebase correspondente ao ambiente).
3. No menu lateral esquerdo, clique no ícone de engrenagem ⚙️ ao lado de **Visão geral do projeto** e selecione **Configurações do projeto**.
4. Clique na aba superior **Cloud Messaging** (Mensagens na nuvem).
5. Role a página até a seção **Configuração da Web** (*Web configuration*) / **Certificados do Web Push** (*Web Push certificates*).
6. Se ainda não houver um par de chaves, clique no botão **Gerar par de chaves** (*Generate key pair*).
7. Uma linha será exibida com a **Chave pública** (uma sequência longa em formato Base64 URL-safe, ex: `BMX8...`). Copie essa chave pública.

---

## 💻 Configuração no Ambiente Local (`.env.local`)

1. Abra ou crie o arquivo `.env.local` na raiz do repositório.
2. Adicione a variável `VITE_VAPID_PUBLIC_KEY` com o valor da chave pública copiada:

```env
VITE_VAPID_PUBLIC_KEY="SUA_CHAVE_PUBLICA_COPIADA_DO_FIREBASE"
```

3. Reinicie o servidor de desenvolvimento para que o Vite carregue a nova variável de ambiente:

```bash
npm run dev
```

---

## ☁️ Configuração em Produção (GitHub Pages / Actions)

O build do projeto em produção é realizado via GitHub Actions (`.github/workflows/deploy.yml`). Como o Vite injeta variáveis `VITE_*` durante a etapa de build estático, a chave precisa ser configurada nos secrets do repositório:

1. No repositório do GitHub, vá em **Settings** > **Secrets and variables** > **Actions**.
2. Clique em **New repository secret**.
3. Defina:
   - **Name**: `VITE_VAPID_PUBLIC_KEY`
   - **Secret**: A chave pública VAPID gerada no Firebase.
4. Clique em **Add secret**.
5. No próximo deploy (seja por push na `main` ou execução manual do workflow), o Vite incluirá a chave pública na compilação.

---

## 🧪 Como Testar e Validar (Caso de Teste CT01)

1. Com a chave configurada no `.env.local` e o servidor local rodando (`npm run dev`):
2. Abra no navegador qualquer página de poema (ex: `http://localhost:5173/poema/<slug>`).
3. Localize o componente de notificações no final da página (com o botão "Ativar Notificações" e o ícone 🔔).
4. Clique no botão **Ativar Notificações**:
   - O navegador solicitará permissão para exibir notificações. Clique em **Permitir**.
   - O botão deve atualizar seu estado para **Notificações Ativas** (com o ícone 🔕).
   - A mensagem *"Você receberá avisos sobre novos poemas!"* será exibida.
5. Verificação no Firebase:
   - Abra o Firebase Console > Firestore Database.
   - Verifique se na coleção `push_subscriptions` foi criado um novo documento contendo o objeto de `subscription` correspondente ao seu navegador.
6. Clique novamente no botão para testar o cancelamento:
   - O botão deve voltar para **Ativar Notificações**.
   - O documento correspondente em `push_subscriptions` será removido.

---

## ⚠️ Resolução de Problemas Comuns

| Problema | Causa Provável | Solução |
| -------- | -------------- | ------- |
| **"Recurso de notificações não configurado no servidor"** | A variável `VITE_VAPID_PUBLIC_KEY` não está presente no `.env.local` ou o servidor Vite não foi reiniciado após adicioná-la. | Adicione a variável ao `.env.local` e reinicie com `npm run dev`. |
| **"Permissão de notificação negada"** | O usuário clicou em "Bloquear" no pop-up de permissão do navegador. | Clique no ícone de cadeado na barra de endereços do navegador, redefina a permissão de "Notificações" para "Permitir" e recarregue a página. |
| **Service Worker não registrado** | Notificações push exigem contexto seguro (HTTPS) ou `localhost`. | Certifique-se de testar em `localhost` ou sob HTTPS. Verifique no DevTools > Application > Service Workers se o SW está ativo. |
