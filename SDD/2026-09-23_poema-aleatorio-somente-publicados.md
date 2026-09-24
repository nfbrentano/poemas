# [FIX] "Poema aleatório" pode sortear rascunhos e baixa todos os documentos

## Detalhes da Atividade

- **O que precisa ser feito:** Ajustar `getRandomPoem()` (`src/utils/navigation.js`) para sortear apenas poemas publicados, evitar sortear o poema que já está aberto e reaproveitar dados que já estão em memória.
- **Por que é necessário:** A função faz `getDocs(collection(db, 'poems'))` sem filtro de `status`. Com isso, rascunhos e poemas agendados entram no sorteio. Quando um deles é sorteado, a página do poema (que filtra `status == 'published'`) mostra "Obra não encontrada". A consulta também baixa o conteúdo completo de todos os poemas a cada clique, e o poema atual pode ser sorteado de novo.
- **Qual valor será agregado:** O botão "Aleatório" sempre leva a um poema legível, responde mais rápido e gasta menos leituras do Firestore.
- **Para quem é destinado:** Leitores que usam o botão "Aleatório" (cabeçalho, home e a rota `/aleatorio`).

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Sortear apenas documentos com `status == 'published'`.
- RF02: Quando o leitor estiver em `/poema/:slug` e houver mais de um poema, não sortear o mesmo slug.
- RF03: Reaproveitar a lista de slugs publicados em cache de módulo durante a sessão (e, se houver, o `allPoemsCache` do `searchOverlay`).
- RF04: Se nada for encontrado ou der erro, mostrar um toast ("Não foi possível sortear um poema agora.") em vez de só registrar no console.

### Requisitos não-funcionais

- RNF01: No máximo uma consulta ao Firestore por sessão para o sorteio.
- RNF02: O botão deve dar feedback visual (desabilitado ou com indicador) enquanto a primeira carga não termina.

### Dependências técnicas

- `src/utils/navigation.js`, `src/components/toast.js`, `src/components/search-overlay.js` (cache opcional)
- Índice existente em `status` (já usado pela home)

### Recursos necessários

- N/A.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que existem rascunhos no banco, quando clico em "Aleatório" 50 vezes, então nunca caio em "Obra não encontrada".
- [ ] **CA02:** Dado que estou lendo o poema X, quando clico em "Aleatório", então abre um poema diferente de X.
- [ ] **CA03:** Dado que já sorteei uma vez, quando sorteio de novo na mesma sessão, então nenhuma nova requisição ao Firestore é feita.
- [ ] **CA04:** Dado que o Firestore está offline, quando clico em "Aleatório", então um toast de erro é exibido.

## O que a atividade não inclui

- Não inclui sorteio ponderado por sentimento ou por histórico de leitura.
- Não inclui mudar a rota `/aleatorio`.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Filtro de status | Mock com 2 publicados e 1 rascunho; sortear 100x | Rascunho nunca escolhido |
| CT02 | Evita repetir | Mock com 2 poemas; `location.pathname = /poema/a` | Sempre navega para `b` |
| CT03 | Um único poema | Mock com apenas `a`, estando em `/poema/a` | Navega para `a` ou exibe toast, sem loop infinito |
| CT04 | Cache | Chamar 2x | `getDocs` chamado 1x |

## URL Complementar

- Código: [src/utils/navigation.js](../src/utils/navigation.js), [src/components/header.js](../src/components/header.js), [src/pages/home.js](../src/pages/home.js)
