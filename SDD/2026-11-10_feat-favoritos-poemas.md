# [FEAT] Favoritos: salvar poemas para reler depois

> **Status:** Rascunho
> **Autor:** Claude · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-10 · **Atualizada em:** 2026-11-10

## Detalhes da Atividade

- **O que precisa ser feito:** Permitir que o leitor marque poemas como favoritos, sem login, e os encontre depois numa página própria (`/favoritos/`).
- **Problema e evidência:** O acervo tem 239 poemas publicados e nenhuma forma de o leitor guardar os que gostou. O único estado pessoal persistido hoje são preferências de leitura (`reading-font-size`, `site-mode` etc. em `localStorage`) e reações por emoji ([`src/utils/reactions.js`](../src/utils/reactions.js)), que não geram uma lista consultável. Para reencontrar um poema, o leitor depende da busca ou do histórico do navegador.
- **Impacto de não fazer:** Leitores recorrentes não têm motivo estrutural para voltar; o reencontro de um poema querido depende de lembrar o título.
- **Para quem é destinado:** Leitor anônimo recorrente (mobile e desktop).
- **História de usuário:** Como leitor, quero salvar os poemas de que gosto, para relê-los depois sem precisar procurá-los de novo.
- **Como saberemos que deu certo:** Favoritar e reabrir um poema favoritado em até 2 toques a partir de qualquer página; evento de favorito visível no Microsoft Clarity; 0 erros no console.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Botão "Favoritar" na página do poema, junto às ações existentes (compartilhar, reações), com estado visual ligado/desligado. | P0 | CA01, CA02 |
| RF02 | Persistir a lista de favoritos no dispositivo (sem login, sem gravação no Firestore). | P0 | CA03 |
| RF03 | Página `/favoritos/` listando os poemas salvos (título, trecho, link), do mais recente para o mais antigo. | P0 | CA04 |
| RF04 | Estado vazio em `/favoritos/` com texto explicativo e link para o acervo. | P0 | CA05 |
| RF05 | Acesso à página de favoritos pela navegação do site (barra inferior ou menu). | P0 | CA04 |
| RF06 | Favoritos cujo poema deixou de estar publicado não aparecem na lista nem geram erro. | P0 | CA06 |
| RF07 | Indicador de favorito nos cards das listas (home, coleção, sentimento). | P1 | CA07 |
| RF08 | Evento personalizado no Clarity ao favoritar/desfavoritar. | P1 | CA08 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Funciona sem login e sem nenhuma requisição de escrita à rede. | P0 | CA03 |
| RNF02 | `/favoritos/` com `noindex` e fora do sitemap (conteúdo pessoal, sem valor de busca). | P0 | CA09 |
| RNF03 | Botão acessível: `aria-pressed`, rótulo textual, operável por teclado, alvo de toque ≥ 44×44 px. | P0 | CA02 |
| RNF04 | Falha de `localStorage` (modo privado, cota) não quebra a página do poema. | P0 | CA10 |

### Dependências técnicas

- [`src/pages/poem.js`](../src/pages/poem.js) (barra de ações) e [`src/router.js`](../src/router.js) (nova rota).
- [`src/utils/poems-store.js`](../src/utils/poems-store.js) para resolver os poemas salvos a partir do cache de publicados.
- [`scripts/prerender.js`](../scripts/prerender.js) e [`scripts/generate-sitemap.js`](../scripts/generate-sitemap.js) (garantir `noindex` e exclusão do sitemap).

### Recursos necessários

- Ícone de favorito (coração/marcador) coerente com [`public/icons.svg`](../public/icons.svg).
- Textos do estado vazio.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou na página de um poema não favoritado, quando aciono "Favoritar", então o botão passa ao estado ativo e um aviso (toast) confirma a ação.
- [ ] **CA02:** Dado que o foco está no botão de favorito, quando pressiono Enter ou Espaço, então o estado alterna e `aria-pressed` reflete o novo valor.
- [ ] **CA03:** Dado que favoritei um poema, quando recarrego a página ou volto ao site em outro dia no mesmo navegador, então o poema continua favoritado e nenhuma escrita foi feita no Firestore.
- [ ] **CA04:** Dado que tenho 3 poemas favoritados, quando abro `/favoritos/` pela navegação do site, então vejo os 3, com o favoritado por último no topo, e cada item leva à página do poema.
- [ ] **CA05:** Dado que não tenho favoritos, quando abro `/favoritos/`, então vejo o estado vazio com link para o acervo, sem lista vazia nem erro.
- [ ] **CA06:** Dado que um poema favoritado foi despublicado, quando abro `/favoritos/`, então ele não aparece e os demais são listados normalmente.
- [ ] **CA07:** Dado que tenho um poema favoritado, quando o vejo num card da home, de uma coleção ou de um sentimento, então o card exibe o indicador de favorito.
- [ ] **CA08:** Dado que o Clarity está carregado, quando favorito ou desfavorito um poema, então um evento personalizado correspondente é enviado.
- [ ] **CA09:** Dado o build de produção, quando inspeciono `/favoritos/` e os sitemaps, então a página tem `noindex` e não consta em nenhum sitemap.
- [ ] **CA10:** Dado que `localStorage` está indisponível, quando abro um poema e aciono "Favoritar", então a página segue funcionando e um aviso informa que não foi possível salvar — o botão não fica em estado ativo falso.

## O que a atividade não inclui

- Sincronização de favoritos entre dispositivos: motivo: exigiria login de leitor, que o site não tem.
- Contagem pública de "quantas pessoas favoritaram": motivo: as reações já cumprem o papel de sinal público.
- Exportar/importar a lista: motivo: baixo impacto agora.

### Considerado para o futuro (P2)

- Disponibilizar os favoritos para leitura offline (ver [`2026-11-10_feat-leitura-offline-acervo.md`](2026-11-10_feat-leitura-offline-acervo.md)).
- Sincronização via Auth anônimo do Firebase.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O acesso fica na barra inferior (que já tem itens definidos) ou no menu? | PO/design | Sim | |
| D02 | Favorito e reação ❤️ convivem sem confundir o leitor? Ícone deve ser marcador em vez de coração? | design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Alternar favorito | unit | CA01, CA03 | Chamar o módulo de favoritos para adicionar e remover um id | Lista persistida reflete cada operação |
| CT02 | Teclado e ARIA | integração (jsdom) | CA02 | Renderizar o botão, disparar Enter/Espaço | `aria-pressed` alterna |
| CT03 | Listagem ordenada | integração | CA04 | Salvar 3 ids em momentos distintos e renderizar `/favoritos/` | 3 itens, mais recente primeiro |
| CT04 | Estado vazio | integração | CA05 | Renderizar `/favoritos/` sem dados | Mensagem e link para o acervo |
| CT05 | Poema despublicado | unit | CA06 | Lista com id ausente do cache de publicados | Id ignorado, sem exceção |
| CT06 | Indicador nos cards | integração | CA07 | Renderizar home com um id favoritado | Card correspondente marcado |
| CT07 | Evento Clarity | unit | CA08 | Mockar Clarity e alternar favorito | Evento chamado 1× por ação |
| CT08 | Noindex e sitemap | integração (pós-build) | CA09 | Ler `dist/favoritos/index.html` e sitemaps | `noindex` presente; URL ausente |
| CT09 | Storage indisponível | unit | CA10 | Fazer `localStorage.setItem` lançar erro | Sem exceção; estado permanece inativo |

## URL Complementar

- Documentação técnica: [`src/pages/poem.js`](../src/pages/poem.js), [`src/utils/poems-store.js`](../src/utils/poems-store.js)
- Protótipo / mockup: N/A — a definir em D01/D02.
- Discussões relacionadas: N/A
- Referências de design: [`SDD/DONE/2026-09-23_layout-compartilhar-e-acoes.md`](DONE/2026-09-23_layout-compartilhar-e-acoes.md)
- Requisitos originais: pedido de levantamento de melhorias em 2026-11-10.
- Issue / PR relacionado: N/A
