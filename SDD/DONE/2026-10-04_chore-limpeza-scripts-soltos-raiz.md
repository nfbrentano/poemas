# [CHORE] Remover scripts de teste e depuração soltos na raiz

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-04 · **Atualizada em:** 2026-10-04

## Detalhes da Atividade

- **O que precisa ser feito:** Remover do repositório 18 arquivos soltos na raiz (`test-*.js/.cjs/.mjs`, `test_*.js`, `mock_setup.js`, `run_test.js`, `fix_collections.js`) e a pasta `scratch/`.
- **Problema e evidência:** São experimentos de depuração pontuais (hash de poema do dia, salt, puppeteer, Supabase/Firebase). Nenhum é referenciado por `package.json`, workflows, `src/` ou documentação. Dois (`test-invoke.mjs`, `test_supabase.js`) trazem chaves públicas do Supabase embutidas, e o projeto já migrou para Firebase.
- **Impacto de não fazer:** Ruído na raiz, confusão sobre o que é suíte de testes real (Vitest em `src/`) e chaves hardcoded no repositório.
- **Para quem é destinado:** Mantenedores e colaboradores.
- **História de usuário:** Como mantenedor, quero a raiz limpa, para achar o que importa e não expor chaves em arquivos descartáveis.
- **Como saberemos que deu certo:** 0 arquivos `test*`/`mock*`/`run_test*` na raiz; `npm test -- --run` e `npm run build` seguem funcionando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Remover os arquivos listados com `git rm` (histórico preservado no git) | P0 | CA01 |
| RF02 | Confirmar que nada no projeto referencia os arquivos removidos | P0 | CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Suíte de testes continua 100% verde | P0 | CA03 |

### Dependências técnicas

- Nenhuma.

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o repositório, quando listo a raiz, então não há `test-*`, `test_*`, `mock_setup.js`, `run_test.js`, `fix_collections.js` nem `scratch/`.
- [x] **CA02:** Dado o projeto, quando busco pelos nomes removidos em `package.json`, workflows, `src/` e docs, então não há referências.
- [x] **CA03:** Dado o projeto, quando `npm test -- --run` roda, então todos os testes passam.
- [x] **CA04 (negativo):** Dado o diretório `scripts/`, quando a atividade termina, então nenhum arquivo dele foi alterado.

## O que a atividade não inclui

- Limpar `scripts/`: alguns são usados pelo build, e os de manutenção pontual exigem revisão caso a caso.
- Reescrever o histórico para apagar as chaves públicas: são anon/publishable por design, o custo não compensa.
- Rotacionar chaves do Supabase: não são segredos.

### Considerado para o futuro (P2)

- Revisar `scripts/` e mover os utilitários de manutenção para `scripts/dev/`.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | Algum desses arquivos ainda é usado manualmente? | dev | Não | Recuperável pelo git |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Raiz limpa | manual | CA01 | `ls` na raiz | Sem os arquivos |
| CT02 | Sem referências | manual | CA02 | `grep` pelos nomes | Sem resultados |
| CT03 | Suíte | integração | CA03 | `npm test -- --run` | Verde |
| CT04 | `scripts/` intacto | manual | CA04 | `git status` | Sem mudanças em `scripts/` |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: revisão de melhorias do site (2026-10-04)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
