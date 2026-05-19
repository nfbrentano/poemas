# Relatório de Validação e Melhorias — Site Poemas

Este relatório apresenta a análise técnica do projeto **Poemas**, identificando bugs críticos, inconsistências de código, problemas de compatibilidade e oportunidades de melhoria técnica e de experiência do usuário (UX).

---

## 🟢 Status de Validação dos Testes

Durante a validação inicial, a execução dos testes automatizados (`npm test`) falhou devido a duas causas principais:
1. **Ausência da dependência `jsdom`:** O Vitest estava configurado para simular o ambiente de browser via `jsdom`, mas essa biblioteca não constava no `package.json`.
2. **Asserções desatualizadas no `seo.test.js`:** O teste de SEO esperava o caractere `|` e um formato de OG Title diferente do que a função `updateSEO` realmente gerava (que utiliza o travessão `—` e anexa o nome do autor).

### Ações já executadas:
* [x] **Instalação do `jsdom`:** Adicionado às dependências de desenvolvimento (`devDependencies`).
* [x] **Correção das asserções de teste:** Atualizado o arquivo [seo.test.js](file:///Users/natanaelbrentano/sitepoemas/src/utils/seo.test.js) para alinhar-se ao comportamento correto da função de SEO.
* **Resultado:** O comando `npm test` agora executa e passa com **100% de sucesso**.

---

## 🛑 Bugs Críticos Encontrados (Pendentes de Correção)

Aqui estão elencados os erros identificados no código que podem comprometer a estabilidade ou quebrar funcionalidades em cenários reais.

### 1. Possível Crash no Campo de Busca (RegEx Injection)
* **Local:** [search-overlay.js:L39-L43](file:///Users/natanaelbrentano/sitepoemas/src/components/search-overlay.js#L39-L43)
* **Descrição:** Ao destacar o termo pesquisado no overlay de busca, a string de busca do usuário é passada diretamente para o construtor `new RegExp()`. Se um usuário digitar caracteres especiais de expressão regular (como `?`, `*`, `[`, `]`, `(`, `)`), a aplicação lançará um erro de sintaxe (`SyntaxError: Invalid regular expression`) no console e quebrará a execução da busca/UI.
* **Impacto:** Alto (quebra a interface de busca).
* **Solução recomendada:** Escapar os caracteres especiais de regex antes de gerar a expressão regular:
  ```javascript
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedQuery = escapeRegExp(query);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  ```

### 2. Tooltips do Gráfico de Analytics Não Funcionam (Script via `innerHTML`)
* **Local:** [analytics.js:L43-L85](file:///Users/natanaelbrentano/sitepoemas/src/pages/analytics.js#L43-L85)
* **Descrição:** A função `buildChart` retorna uma string HTML contendo uma tag `<script>` interna que associa os eventos de hover/interação aos elementos do gráfico (tooltips). No entanto, de acordo com o padrão HTML5, **tags `<script>` inseridas dinamicamente usando `innerHTML` não são executadas pelos navegadores**. Com isso, o código de interação nunca roda e as tooltips de visualização diária ficam completamente inoperantes.
* **Impacto:** Médio (funcionalidade de estatísticas incompleta).
* **Solução recomendada:** Remover a tag `<script>` do retorno de `buildChart` e realizar o bind dos listeners diretamente em JavaScript no escopo da página após a injeção do HTML no container:
  ```javascript
  // No render / loadData, após atualizar o innerHTML:
  const tt = container.querySelector('#chart-tooltip');
  container.querySelectorAll('.chart-dot').forEach(dot => {
    dot.addEventListener('mouseenter', ...);
    dot.addEventListener('mousemove', ...);
    dot.addEventListener('mouseleave', ...);
  });
  ```

### 3. URL do Supabase Hardcoded no Analytics
* **Local:** [analytics.js:L17](file:///Users/natanaelbrentano/sitepoemas/src/utils/analytics.js#L17)
* **Descrição:** A chamada de rede para obter dados de IP geográfico (`geo-ip`) está apontando para uma URL fixa: `'https://ejorjxvjglkkxnusdrzl.supabase.co/functions/v1/geo-ip'`. Se o projeto for migrado para outra instância do Supabase, essa chamada continuará batendo no servidor antigo.
* **Impacto:** Médio (dependência externa oculta, quebra em migrações).
* **Solução recomendada:** Usar a variável de ambiente centralizada ou, melhor ainda, a biblioteca do cliente Supabase para invocar a Edge Function:
  ```javascript
  const { data, error } = await supabase.functions.invoke('geo-ip');
  ```

### 4. Crash na Inicialização do Push Notification (Variável Indefinida)
* **Local:** [push.js:L53](file:///Users/natanaelbrentano/sitepoemas/src/utils/push.js#L53)
* **Descrição:** Ao tentar converter a chave pública VAPID na função `urlBase64ToUint8Array`, o código lê `base64String.length`. No entanto, a variável `import.meta.env.VITE_VAPID_PUBLIC_KEY` não está definida no arquivo `.env.local`. Isso causa uma exceção do tipo `TypeError: Cannot read properties of undefined (reading 'length')` no momento em que o usuário clica para se inscrever.
* **Impacto:** Médio (bloqueia o fluxo de push notification).
* **Solução recomendada:** Tratar o caso em que a chave não está presente na variável de ambiente e exibir um aviso amigável no console/UI, ou desativar o toggle de push caso ela não exista.

### 5. Script de Integração Quebrado por Dependências Faltantes
* **Local:** [test-site.js:L1](file:///Users/natanaelbrentano/sitepoemas/test-site.js#L1)
* **Descrição:** O script `test-site.js` requer o módulo `puppeteer`, que não está instalado nem declarado nas dependências do projeto.
* **Impacto:** Baixo (script acessório de teste).
* **Solução recomendada:** Instalar o `puppeteer` como devDependency ou remover o script caso ele não esteja mais em uso.

---

## 💡 Sugestões de Melhorias Técnicas e de UX (Premium)

### 1. Evitar Flash de Tema Incorreto (FOUC - Flash of Unstyled Content)
* **Contexto:** O tema do site (Light / Dark) é definido pelo script `theme-toggle.js`, que executa de forma assíncrona após o carregamento total do DOM. Como o visual padrão nas variáveis CSS é escuro, usuários que preferem o tema claro verão uma tela preta por uma fração de segundo antes de a interface mudar para branco.
* **Solução:** Inserir um pequeno script inline síncrono imediatamente na tag `<head>` do [index.html](file:///Users/natanaelbrentano/sitepoemas/index.html) para aplicar o tema antes que o corpo da página seja desenhado:
  ```html
  <script>
    (function() {
      const saved = localStorage.getItem('site-mode');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const mode = saved || (prefersDark ? 'dark' : 'light');
      if (mode === 'light') document.documentElement.setAttribute('data-theme', 'light');
      if (mode === 'contrast') document.documentElement.setAttribute('data-high-contrast', 'true');
    })();
  </script>
  ```

### 2. Padronização na Invocação de Edge Functions
* **Contexto:** No arquivo [newsletter.js](file:///Users/natanaelbrentano/sitepoemas/src/components/newsletter.js#L45-L53), a chamada à Edge Function `loops-subscribe` é feita via `fetch` nativo, injetando manualmente cabeçalhos de autorização e URLs cruas. Já no arquivo [poem.js](file:///Users/natanaelbrentano/sitepoemas/src/pages/poem.js#L435), o método `supabase.functions.invoke()` é utilizado corretamente.
* **Solução:** Substituir a chamada `fetch` manual no módulo de newsletter para usar o wrapper oficial `supabase.functions.invoke('loops-subscribe', { body: { email } })`. Isso mantém o código limpo, seguro e consistente.

### 3. Fallback Seguro para `crypto.randomUUID()`
* **Contexto:** Em [reactions.js](file:///Users/natanaelbrentano/sitepoemas/src/utils/reactions.js#L8), usa-se `crypto.randomUUID()` para gerar um ID de sessão para as reações aos poemas. Embora seja padrão em navegadores modernos, a API `crypto` em alguns browsers requer um contexto seguro (HTTPS). No desenvolvimento local via HTTP IP (ex: testando no celular pela rede Wi-Fi local), o código pode falhar com erro de método indefinido.
* **Solução:** Implementar um fallback clássico:
  ```javascript
  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxx-xx-4xxx-yxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
  ```

### 4. Otimização de Assets e Imagens
* **Contexto:** Os arquivos de imagem padrão (`og-cover.jpg` com ~215 KB e `og-default.png` com ~144 KB) estão no diretório público sem compressão. Adicionalmente, imagens dinâmicas e avatares carregados no site principal podem se beneficiar do atributo nativo `loading="lazy"` para evitar bloqueio da renderização inicial.
* **Solução:** Realizar a compressão dos assets de cobertura originais e garantir que tags `<img>` dinâmicas utilizem lazy loading.

### 5. Configuração de Linting e Formatação
* **Contexto:** O projeto não possui configuração de linters (`ESLint` ou `Prettier`). Adicionar regras mínimas de estilo e boas práticas previne a introdução de variáveis não declaradas ou imports incorretos durante a colaboração no repositório.

---

## 📈 Resumo do Diagnóstico

| Categoria | Gravidade | Descrição | Status |
|---|---|---|---|
| **Ambiente de Testes** | 🔴 Crítico | Vitest falhando na inicialização devido a dependências em falta | **Resolvido** |
| **Ambiente de Testes** | 🟡 Médio | Asserções no teste de SEO falhando devido à atualização do design | **Resolvido** |
| **Busca (UI)** | 🔴 Crítico | Crash na busca ao utilizar termos com caracteres especiais regex | Pendente |
| **Estatísticas** | 🟡 Médio | Script de tooltip do gráfico de analytics inoperante devido à limitação de innerHTML | Pendente |
| **Segurança/Configuração**| 🟡 Médio | Credenciais e endpoints do Supabase expostos de maneira crua em arquivos de analytics | Pendente |
| **Notificações** | 🟡 Médio | Crash ao interagir com o Push Notification devido à falta de variáveis do VAPID | Pendente |
| **Performance/UX** | 🟢 Baixo | Flash rápido do tema claro para escuro (FOUC) na renderização inicial | Pendente |
