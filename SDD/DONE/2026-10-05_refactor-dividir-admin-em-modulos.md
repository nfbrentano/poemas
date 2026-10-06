# [REFACTOR] Dividir src/pages/admin.js em módulos por tela

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-05 · **Atualizada em:** 2026-10-05

## Detalhes da Atividade

- **O que precisa ser feito:** Dividir `src/pages/admin.js` (2.480 linhas) em módulos por tela dentro de `src/pages/admin/`, mantendo `src/pages/admin.js` como ponto de entrada fino (shell de autenticação, cabeçalho e roteamento por `?view=`), sem alterar nenhum comportamento.
- **Problema e evidência:** O arquivo concentra o cliente de compatibilidade `supabase` (linhas 7-160), o shell e 7 telas (dashboard, coleções, obras, editor, histórico de e-mails, assinantes, comentários), de 140 a 530 linhas cada. Isso dificulta revisão, localização de código e diffs.
- **Impacto de não fazer:** Manutenção cada vez mais lenta e maior risco de conflito e regressão a cada alteração no admin.
- **Para quem é destinado:** Mantenedores.
- **História de usuário:** Como mantenedor, quero cada tela do admin em seu próprio arquivo, para alterá-la e revisá-la isoladamente.
- **Como saberemos que deu certo:** Nenhum arquivo do admin com mais de ~700 linhas; mesmo comportamento; `npm test -- --run` e `npm run build` verdes; o chunk do admin continua carregado sob demanda.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Criar `src/pages/admin/compat-client.js` com o objeto `supabase` (auth, from, storage, functions, rpc) movido sem alteração de lógica | P0 | CA01 |
| RF02 | Criar um módulo por tela em `src/pages/admin/` (`dashboard`, `collections`, `list`, `editor`, `emails`, `subscribers`, `comments`), cada um exportando sua função `render*` com a mesma lógica | P0 | CA01, CA02 |
| RF03 | `src/pages/admin.js` mantém `export default { meta, render }`, o shell e o roteamento, importando as telas dinamicamente (`import()`) apenas quando acessadas | P0 | CA02, CA03 |
| RF04 | `admin.js` continua exportando `attachPoemsToComments` e `formatCommentPoemHtml` (reexport), preservando o contrato usado pelos testes | P0 | CA04 |
| RF05 | Ajustar testes que leem o código-fonte do admin por caminho (`geo-conteudo-citavel`, `security`) para a nova estrutura, sem enfraquecer suas verificações | P0 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Refatoração pura: mesmo HTML, eventos e consultas ao Firestore | P0 | CA01 |
| RNF02 | O admin continua fora do bundle inicial do site (`router.js` já usa `import()`) | P0 | CA03 |

### Dependências técnicas

- `src/router.js` (import dinâmico de `./pages/admin.js`), `src/pages/analytics.js` (já separado)
- Testes: `admin-comments.test.js`, `geo-conteudo-citavel.test.js`, `security.test.js`

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o código novo, quando comparo os corpos das funções com o `admin.js` original, então a lógica é idêntica (só mudam `this.renderX` para `renderX` e os imports).
- [x] **CA02:** Dado o admin autenticado, quando navego por cada `?view=`, então a tela correta é renderizada.
- [x] **CA03:** Dado o build, quando gero o bundle, então cada tela do admin vira chunk separado e o bundle inicial não cresce.
- [x] **CA04:** Dado `import { attachPoemsToComments, formatCommentPoemHtml } from './pages/admin.js'`, quando o teste roda, então as funções existem e se comportam como antes.
- [x] **CA05:** Dado `npm test -- --run`, quando roda, então todos os testes passam.
- [x] **CA06 (negativo):** Dado o resultado, então nenhum comportamento, texto ou estilo visível do admin foi alterado.

## O que a atividade não inclui

- Remover o objeto de compatibilidade `supabase` e falar direto com o Firebase: mudança de comportamento, atividade própria.
- Reescrever o HTML das telas (estilos inline) ou extrair CSS.
- Adicionar testes de interface do admin.

### Considerado para o futuro (P2)

- Eliminar `compat-client.js` migrando as telas para chamadas diretas ao Firestore.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | N/A | | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Todas as views carregam | manual/e2e | CA02, CA06 | Abrir `/admin?bypass_auth=true&view=<cada view>` em dev | Telas renderizam sem erro no console |
| CT02 | Helpers de comentário | unit | CA04 | `admin-comments.test.js` | Verde |
| CT03 | Chunks no build | manual | CA03 | `vite build` e listar `dist/assets` | Um chunk por tela, `index` sem crescer |
| CT04 | Suíte | integração | CA05 | `npm test -- --run` | Verde |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: revisão de melhorias do site (2026-10-04)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
