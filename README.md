# Poemas de Natanael - Documentação e Setup

Site autoral desenvolvido com Vanilla JS (Vite) + Supabase + GitHub Pages.

## 1. Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Vá até o **SQL Editor** e rode o conteúdo do arquivo `supabase/schema.sql` para criar as tabelas e políticas RLS.
3. Obtenha a URL do projeto e a _anon key_ pública.

## 2. Configuração do Frontend (Variáveis de Ambiente)

1. Na raiz do projeto, crie um arquivo chamado `.env.local` e insira suas credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

### 2.1. Arquitetura de Segurança
Este projeto utiliza **Row Level Security (RLS)** no Supabase para proteger os dados.
- **Anon Key**: É pública e exposta no cliente por design. Ela permite apenas operações autorizadas (ex: ler poemas publicados, inscrever novos e-mails).
- **Poemas**: Somente poemas com `status = 'published'` são visíveis ao público. Rascunhos são protegidos.
- **Assinantes**: O público pode apenas se inscrever (`INSERT`). A lista de e-mails é privada e acessível apenas pelo administrador autenticado.
- **Admin**: As permissões de gerenciamento são restritas a usuários com o papel `admin` na tabela `public.profiles`.
2. Para rodar localmente:
   ```bash
   npm install
   npm run dev
   ```

## 3. Configuração do E-mail (Gmail SMTP via Edge Functions)

Para que o site consiga disparar e-mails para os assinantes quando um poema é publicado, usamos o Gmail SMTP e as Edge Functions do Supabase.

### 3.1. Gerar App Password do Gmail

1. Acesse sua Conta Google > Segurança.
2. Ative a Verificação em 2 Etapas.
3. Busque por "Senhas de app" e crie uma nova para "Supabase". Copie a senha gerada (16 letras).

### 3.2. Configurar a Edge Function no Supabase

Você pode usar o `npx` para rodar os comandos do Supabase sem precisar instalá-lo globalmente (evitando erros de permissão).

1. Faça o login na sua conta: `npx supabase login`
2. Vincule o repositório local ao seu projeto do Supabase: `npx supabase link --project-ref <seu_ref_id>`
   _(O `ref_id` é o código de letras aleatórias que aparece na URL do seu painel do Supabase. Por exemplo: se a URL for `https://supabase.com/dashboard/project/abcdefghijk`, o ref_id é `abcdefghijk`)_
3. Configure os "secrets" (variáveis de ambiente) rodando no terminal:
   ```bash
   npx supabase secrets set SMTP_USERNAME=seu_email@gmail.com
   npx supabase secrets set SMTP_PASSWORD=sua_senha_de_app_aqui
   ```
4. Faça o deploy da função:
   ```bash
   npx supabase functions deploy send-newsletter
   ```

## 4. Importar Poemas do WordPress (XML/WXR)

1. Exporte seus posts do WordPress (Ferramentas > Exportar > Posts). Salve o arquivo `.xml`.
2. Rode o script utilitário do projeto, passando a URL do Supabase e a **Service Role Key** (você acha no painel do Supabase, em Settings > API). A Service Role Key é necessária para burlar temporariamente o RLS e injetar os dados de fora.
   ```bash
   SUPABASE_URL="sua_url" SUPABASE_SERVICE_ROLE_KEY="sua_service_role" node scripts/import_wp.js /caminho/para/arquivo.xml
   ```

## 5. Deploy no GitHub Pages (e Domínio Customizado)

### 5.1. GitHub Actions (Deploy Automático)

1. Suba este projeto para um repositório no GitHub.
2. No repositório, vá em **Settings > Pages**. Em _Source_, escolha **GitHub Actions**.
3. Crie um arquivo em `.github/workflows/deploy.yml` (veja a documentação do Vite sobre GitHub Pages) ou use as actions pré-configuradas do GitHub para projetos estáticos Node.js.
4. Lembre-se de adicionar as _Environment Variables_ `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações de _Secrets and variables_ > _Actions_ do GitHub, para que elas sejam injetadas no momento do build.

**Nota:** Como usamos `vite build && cp dist/index.html dist/404.html` no script de build, o GitHub Pages lidará com o roteamento corretamente sem gerar erros 404 em rotas como `/poema/slug`.

### 5.2. Domínio Customizado (CNAME)

1. Vá em **Settings > Pages** no GitHub.
2. No campo **Custom domain**, digite seu domínio (ex: `natanael.com.br`) e clique em Save. Isso forçará o GitHub a criar um arquivo `CNAME` no branch de deploy.
3. No painel onde você comprou o domínio (Registro.br, GoDaddy, Cloudflare, etc.), configure a zona DNS:
   - Crie um registro **CNAME** apontando `www` para `seu-usuario.github.io`.
   - Crie registros **A** (ou ALIAS) apontando a raiz `@` para os IPs do GitHub Pages:
     `185.199.108.153`
     `185.199.109.153`
     `185.199.110.153`
     `185.199.111.153`

> O HTTPS será ativado automaticamente pelo GitHub Pages assim que a propagação do DNS for concluída.

## 6. Geração de Arte para o Instagram

No painel Admin, ao editar ou visualizar um poema publicado, você verá um botão **"Exportar p/ Instagram"**.
Ele utiliza o CSS da classe `.social-card-layout` e a biblioteca `html2canvas` para "tirar uma foto" invisível do poema e baixar um PNG nas proporções `1080x1080` (fundo preto e estilo premium), pronto para postar, preservando totalmente a privacidade das suas credenciais já que ocorre do lado do cliente e só expõe dados já públicos do poema.

# poemas
