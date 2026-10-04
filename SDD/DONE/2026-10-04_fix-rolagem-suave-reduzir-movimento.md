# [FIX] Respeitar "reduzir movimento" nas rolagens suaves feitas em JavaScript

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-04 · **Atualizada em:** 2026-10-04

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer o botão "voltar ao topo" e a centralização do chip ativo nos filtros usarem rolagem instantânea quando o usuário ativa `prefers-reduced-motion: reduce`.
- **Problema e evidência:** O CSS já zera animações e transições nesse modo (`global.css`), mas `back-to-top.js` e `filter-chips.js` chamam `scrollTo`/`scrollBy` com `behavior: 'smooth'`, que o CSS não controla.
- **Impacto de não fazer:** Usuários sensíveis a movimento (vestibular) veem rolagem animada mesmo com a preferência ativa (WCAG 2.3.3).
- **Para quem é destinado:** Leitores com a preferência de reduzir movimento.
- **História de usuário:** Como leitor sensível a movimento, quero que a página role sem animação, para não sentir desconforto.
- **Como saberemos que deu certo:** Com a preferência ativa, 0 chamadas de rolagem com `behavior: 'smooth'`.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Helper `scrollBehavior()` retorna `'auto'` com a preferência ativa e `'smooth'` caso contrário | P0 | CA01, CA02 |
| RF02 | `back-to-top.js` e `filter-chips.js` usam o helper | P0 | CA03, CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Funciona sem `matchMedia` (ambientes antigos/jsdom): usa `'smooth'` | P0 | CA02 |

### Dependências técnicas

- `src/components/back-to-top.js`, `src/components/filter-chips.js`, novo `src/utils/motion.js`

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que `prefers-reduced-motion: reduce` está ativo, quando `scrollBehavior()` é chamado, então retorna `'auto'`.
- [x] **CA02:** Dado que a preferência não está ativa ou `matchMedia` não existe, quando chamado, então retorna `'smooth'`.
- [x] **CA03:** Dado o modo reduzido, quando clico em "voltar ao topo", então `scrollTo` recebe `behavior: 'auto'`.
- [x] **CA04:** Dado o modo reduzido, quando a página de filtros centraliza o chip ativo, então `scrollBy` recebe `behavior: 'auto'`.
- [x] **CA05 (negativo):** Dado o modo normal, quando clico em "voltar ao topo", então a rolagem continua suave.

## O que a atividade não inclui

- Áudio: já só inicia por clique do usuário, nada a mudar.
- View transitions: o CSS está comentado, sem efeito hoje.

### Considerado para o futuro (P2)

- Opção própria no site para desativar animações, independente do sistema.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | N/A | | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Helper com preferência ativa | unit | CA01 | Mock `matchMedia` matches=true | `'auto'` |
| CT02 | Helper sem preferência/sem matchMedia | unit | CA02 | matches=false; matchMedia ausente | `'smooth'` |
| CT03 | Botão voltar ao topo | unit | CA03, CA05 | Clicar com e sem preferência | `scrollTo` com `auto` / `smooth` |

## URL Complementar

- Documentação técnica: https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html
- Protótipo / mockup: N/A
- Discussões relacionadas: revisão de melhorias do site (2026-10-04)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
