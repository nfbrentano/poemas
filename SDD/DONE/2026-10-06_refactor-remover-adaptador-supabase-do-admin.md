# [REFACTOR] Substituir o adaptador "supabase" do admin por módulo de dados explícito

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-06 · **Atualizada em:** 2026-10-06

## Detalhes da Atividade

- **O que precisa ser feito:** Remover `src/pages/admin/compat-client.js` (objeto `supabase` que imita a API do Supabase por cima do Firebase) e criar `src/pages/admin/data.js` com funções explícitas e nomeadas. Migrar os ~40 pontos de uso em `admin.js` e nos módulos de tela.
- **Problema e evidência:** O projeto migrou para Firebase, mas o admin ainda usa uma camada que finge ser o Supabase. Ela induz a erro: ignora o texto do `select` (por isso `'*, collection_poems(count)'` e `'poems(title)'` nunca fizeram junção), ignora opções de `upload` (`contentType`, `upsert`), e usa `eq('id')` como **campo** em `select` mas como **ID de documento** em `update`/`delete`.
- **Impacto de não fazer:** Quem lê o admin acredita que há junções e opções que não existem; manutenção e depuração ficam enganosas.
- **Para quem é destinado:** Mantenedores.
- **História de usuário:** Como mantenedor, quero que o acesso a dados do admin diga o que faz, para não depender de uma API que não existe aqui.
- **Como saberemos que deu certo:** 0 ocorrências de `supabase` em `src/pages/admin*`; cada função de dados coberta por teste; `npm run build` e `npm test -- --run` verdes; as 7 telas carregam sem erro de execução.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | `data.js` exporta `getAdminSession`, `signOutAdmin`, `listDocs`, `insertDocs`, `updateDocById`, `deleteDocById`, `deleteDocsWhere`, `uploadFile`, `getPublicFileUrl`, `callFunction`, preservando a lógica atual do adaptador | P0 | CA01, CA02 |
| RF02 | Funções assíncronas de dados retornam `{ data, error }` como hoje, para manter o tratamento de erro das telas | P0 | CA02 |
| RF03 | Todos os usos de `supabase` em `admin.js` e `admin/*.js` migrados; `compat-client.js` removido | P0 | CA03 |
| RF04 | Argumentos que o adaptador ignorava (campos do `select`, opções de `upload`) deixam de ser passados nos pontos de chamada, sem alterar o resultado | P0 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Refatoração pura: mesmas consultas, escritas, ordem e valores no Firestore, mesma URL pública de arquivos | P0 | CA02, CA05 |
| RNF02 | Nenhum arquivo de tela volta a importar `firebase/firestore` diretamente (acesso só via `data.js`) | P1 | CA03 |

### Dependências técnicas

- `src/utils/firebase.js`; `firebase/firestore`, `firebase/storage`, `firebase/functions`
- Telas: `admin.js`, `admin/{dashboard,collections,list,editor,emails,subscribers,comments}.js`

### Recursos necessários

- Verificação manual das telas logado como admin, após o deploy.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado `data.js`, quando consulto suas exportações, então todas as funções do RF01 existem.
- [x] **CA02:** Dado Firestore simulado nos testes, quando cada função roda, então faz as mesmas chamadas que o adaptador fazia e retorna `{ data, error }` no mesmo formato, inclusive no caminho de erro.
- [x] **CA03:** Dado o código, quando busco `supabase` e `compat-client` em `src/pages/admin*`, então não há ocorrências.
- [x] **CA04:** Dado um `select` antes com campos/junções, quando migrado, então o resultado entregue à tela é o mesmo de antes (os campos eram ignorados).
- [x] **CA05:** Dado `npm run build && npm test -- --run`, quando roda, então tudo passa e as 7 telas carregam sem erro de execução.
- [x] **CA06 (negativo):** Dado `getPublicFileUrl`, quando chamado, então produz exatamente a mesma URL que o adaptador produzia (o comportamento da codificação não é alterado nesta atividade).

## O que a atividade não inclui

- Corrigir a codificação dupla da URL pública (`%252F`) e usar `getDownloadURL`: muda comportamento; atividade própria.
- Implementar de fato as junções (`collection_poems(count)`, `poems(title)`): funcionalidade nova.
- Aplicar `contentType`/`upsert` no upload: muda comportamento.
- Trocar o formato `{ data, error }` por exceções: alteraria o tratamento de erro de todas as telas.

### Considerado para o futuro (P2)

- Contagem de poemas por coleção e título do poema nos logs de e-mail, via consulta real.
- Corrigir a URL pública de arquivos.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | As URLs públicas de capa/áudio (`%252F`) funcionam hoje em produção? | PO | Não | Fora do escopo; apenas sinalizado |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | `listDocs` com where/orderBy/limit/single | unit | CA02 | Mock do Firestore | Constraints e formato corretos; `single` retorna 1º ou null |
| CT02 | `insertDocs` com objeto, array e `id` | unit | CA02 | Mock | `addDoc`/`setDoc` conforme caso |
| CT03 | `updateDocById`/`deleteDocById`/`deleteDocsWhere` | unit | CA02 | Mock | Chamadas por ID; erro devolvido em `error` |
| CT04 | `getPublicFileUrl` | unit | CA06 | Comparar com fórmula original | Idêntica |
| CT05 | `callFunction` | unit | CA02 | Mock | `{ data }` ou `{ error }` |
| CT06 | Sem resquícios | manual | CA03 | `grep -rn "supabase\|compat-client" src/pages/admin*` | Vazio |
| CT07 | Telas | manual | CA05 | Dev server, 7 views | Sem erro de execução |

## URL Complementar

- Documentação técnica: https://firebase.google.com/docs/firestore/query-data/queries
- Protótipo / mockup: N/A
- Discussões relacionadas: `SDD/DONE/2026-10-05_refactor-dividir-admin-em-modulos.md`
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
