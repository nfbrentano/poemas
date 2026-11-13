# [FEAT] Cartão de estrofe selecionada e histórico local "Continuar Lendo"

> **Status:** Rascunho
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-11-13 · **Atualizada em:** 2026-11-13

## Detalhes da Atividade

- **O que precisa ser feito:** Permitir que o leitor selecione um verso/estrofe específica para gerar imagem/citação social personalizada (expandindo o uso atual de [`src/pages/poem.js`](../src/pages/poem.js) e [`src/utils/social-export.js`](../src/utils/social-export.js)) e adicionar um histórico local recente ("Lidos recentemente") no navegador, acessível na página de Favoritos ou na Home sem necessidade de login.
- **Problema e evidência:**
  1. [`src/pages/poem.js`](../src/pages/poem.js) já registra listener `selectionchange` para copiar/compartilhar trecho, porém [`src/utils/social-export.js`](../src/utils/social-export.js) só exporta imagem (`@zumer/snapdom`) do bloco pré-definido do poema (muitas vezes truncado em poemas longos). Leitores costumam querer compartilhar justamente a estrofe que mais os tocou.
  2. Quem lê vários poemas em sequência (ou fecha a aba no celular para continuar depois) não possui histórico recente no site para retomar o último poema lido sem depender de favoritar manualmente.
- **Impacto de não fazer:** Menos compartilhamentos orgânicos de versos marcantes no Instagram/Stories/WhatsApp e perda de retenção para leitores recorrentes que voltam ao site no dia seguinte.
- **Para quem é destinado:** Leitores em mobile e desktop, compartilhadores em redes sociais.
- **História de usuário:** Como leitor, quero selecionar exatamente a estrofe que mais me marcou para gerar um cartão bonito de imagem ou reencontrar rapidamente os últimos poemas que li hoje, para compartilhar versos fiéis ao que senti e retomar minha leitura facilmente.
- **Como saberemos que deu certo:** Barra flutuante de seleção oferece "Gerar imagem deste trecho" abrindo o modal de cartão já preenchido com a estrofe selecionada; últimos 6 poemas abertos aparecem em histórico local discreto com opção de limpar histórico; 0 requisições extras ao servidor.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Na barra contextual que surge ao selecionar texto dentro de `#poem-body` em [`src/pages/poem.js`](../src/pages/poem.js), adicionar ação **"Gerar imagem"** além de copiar/citar, respeitando limite mínimo (ex.: `>= 8` caracteres) e máximo amigável ao layout de cartão. | P0 | CA01, CA02 |
| RF02 | Adaptar [`src/utils/social-export.js`](../src/utils/social-export.js) e [`src/utils/poem-template.js`](../src/utils/poem-template.js) para aceitar `customVerseText` no preview/exportação de cartão (mantendo título do poema, indicação de trecho `...` opcional e assinatura/URL do autor), permitindo alternar entre "Trecho selecionado" e "Poema completo" dentro do próprio modal. | P0 | CA02, CA03 |
| RF03 | Criar módulo `src/utils/reading-history.js` persistindo em `localStorage` (`poemas_reading_history_v1`, máx. `8` itens) `{ slug, title, readAt }` ao ler um poema publicado por `>= 3` segundos (ou rolagem > 25%), excluindo rascunhos/admin. | P1 | CA04, CA05 |
| RF04 | Exibir seção discreta **"Lidos recentemente"** em [`src/pages/favorites.js`](../src/pages/favorites.js) (ou aba/bloco opcional abaixo do Poema do Dia na Home) com botão **"Limpar histórico"** e cruzamento apenas com poemas atualmente publicados. | P1 | CA04, CA06 |
| RF05 | Rastrear eventos discretos opcionais no Clarity (`verse_card_export`, `history_resume_click`) sem enviar texto selecionado nem dados pessoais. | P2 | CA01 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Tudo opera 100% no cliente (`localStorage` + DOM/`@zumer/snapdom`), sem escrita no Firestore e sem necessidade de login. | P0 | CA04 |
| RNF02 | Falha/bloqueio de `localStorage` (navegação anônima estrita) ou API `Selection` indisponível não gera exceções nem bloqueia a leitura do poema. | P0 | CA07 |
| RNF03 | O texto selecionado para o card deve ser inserido via `textContent` ou `escapeHtml` no template do cartão, impedindo injeção HTML. | P0 | CA02 |
| RNF04 | A seção de histórico nunca pode aparecer no HTML pré-renderizado estático como conteúdo compartilhado/indexável ou que cause Layout Shift (`CLS`) acima de `0.05`. | P1 | CA04 |

### Dependências técnicas

- [`src/pages/poem.js`](../src/pages/poem.js), [`src/utils/poem-template.js`](../src/utils/poem-template.js) e [`src/utils/social-export.js`](../src/utils/social-export.js).
- [`src/pages/favorites.js`](../src/pages/favorites.js) e [`src/utils/poems-store.js`](../src/utils/poems-store.js).

### Recursos necessários

- N/A — biblioteca `@zumer/snapdom` já instalada em [`package.json`](../package.json).

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que estou lendo um poema e seleciono uma estrofe dentro de `#poem-body`, quando a barra contextual de seleção aparece, então exibe o botão "Gerar imagem" ao lado das opções existentes.
- [ ] **CA02:** Dado que selecionei 3 versos e cliquei em "Gerar imagem", quando o modal de cartão abre, então a prévia exibe exatamente aqueles 3 versos junto ao título do poema e crédito do autor, sem tags HTML quebradas.
- [ ] **CA03:** Dado o modal de cartão aberto com um trecho selecionado, quando alterno o toggle para "Poema inteiro" (ou abro o modal pelo botão tradicional "Salvar Imagem"), então exibe o poema padrão sem resquício da seleção anterior.
- [ ] **CA04:** Dado que li os poemas A e B na sessão, quando abro a visualização de "Lidos recentemente" em `/favoritos/`, então B aparece antes de A com link direto para retomar a leitura, sem gravar nada no Firestore.
- [ ] **CA05:** Dado que o histórico atingiu 8 poemas, quando leio um 9º poema diferente, então o mais antigo sai da lista mantendo máximo de 8 entradas ordenadas por data de leitura.
- [ ] **CA06:** Dado um histórico com 3 poemas lidos, quando clico em "Limpar histórico", então a chave no `localStorage` é removida e a seção desaparece imediatamente.
- [ ] **CA07:** Dado que `localStorage.setItem` lança erro de cota/privacidade, quando abro e leio um poema, então a página funciona normalmente sem erros visíveis ao leitor.

## O que a atividade não inclui

- Salvamento de posição exata por pixel de rolagem entre dispositivos distintos: motivo: requer conta de usuário.
- Marcação de múltiplos trechos coloridos no estilo Kindle Highlights com notas pessoais: motivo: complexo demais para o escopo atual do leitor anônimo.

### Considerado para o futuro (P2)

- Link com fragmento de texto (`#:~:text=...` Text Fragment API) ao compartilhar um verso específico por WhatsApp/X.
- Botão rápido em cada estrofe no hover/toque longo ("Citar esta estrofe") para quem tem dificuldade de selecionar texto no mobile.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O bloco "Lidos recentemente" deve ficar apenas em `/favoritos/` (como complemento natural para leitores recorrentes) ou também aparecer de forma compacta na Home quando já houver histórico? | design/PO | Não | |
| D02 | Em caso de seleção de texto no iOS Safari / Android Chrome onde a barra nativa do sistema aparece perto da seleção, qual posicionamento evita sobreposição (barra fixa na base vs acima da seleção)? | design | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Extração segura de trecho | unit/integração (jsdom) | CA01, CA02 | Simular seleção dentro de `#poem-body` e fora dele (`header`/comentários) | Barra com "Gerar imagem" aparece apenas para seleção válida dentro de `#poem-body` |
| CT02 | Card com trecho vs completo | unit | CA02, CA03 | Invocar helper do card em `social-export.js` / modal com e sem `customVerseText` | Renderiza trecho no modo customizado e limpa ao fechar/alternar |
| CT03 | CRUD e limite de histórico | unit | CA04, CA05, CA06 | Gravar 9 slugs em `reading-history.js`, checar ordem/limite e chamar `clearHistory()` | Mantém 8 mais recentes sem duplicar e limpa completamente |
| CT04 | Filtragem de despublicados | integração | CA04 | Histórico contém slug ausente de `getPublishedPoems()` | Slug não publicado é omitido da listagem |
| CT05 | Resiliência a falha de storage | unit | CA07 | Mockar `localStorage.setItem` lançando exceção ao registrar leitura | Nenhuma exceção propagada |

## URL Complementar

- Documentação técnica: [`src/pages/poem.js`](../src/pages/poem.js), [`src/utils/social-export.js`](../src/utils/social-export.js), [`src/pages/favorites.js`](../src/pages/favorites.js)
- Protótipo / mockup: N/A
- Discussões relacionadas: [`SDD/DONE/2026-11-10_feat-favoritos-poemas.md`](DONE/2026-11-10_feat-favoritos-poemas.md), [`SDD/DONE/2026-09-23_layout-compartilhar-e-acoes.md`](DONE/2026-09-23_layout-compartilhar-e-acoes.md)
- Referências de design: [`src/styles/social-card.css`](../src/styles/social-card.css)
- Requisitos originais: Análise técnica do repositório em 2026-11-13.
- Issue / PR relacionado: N/A
