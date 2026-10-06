# [CHORE] Mover scripts de manutenção pontual para scripts/dev

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-05 · **Atualizada em:** 2026-10-05

## Detalhes da Atividade

- **O que precisa ser feito:** Mover para `scripts/dev/` os scripts de migração, importação e análise que não fazem parte do build nem do envio diário, junto com os dados que só eles usam, e atualizar os caminhos fixos dentro deles.
- **Problema e evidência:** `scripts/` mistura 7 arquivos usados pelo build (`prerender`, `generate-rss`, `generate-sitemap`, `generate-llms`, `generate-og-images`, `ping-indexnow`, `send-daily-poem`, `legacy-redirects.json`) com 16 scripts sem nenhuma referência no projeto (migrações, importação do WordPress, análises) e dois dados auxiliares. Uma checagem de referências feita só fora de `scripts/` quase classificou `generate-og-images.js` (importado pelo `prerender.js`) como descartável, o que mostra o risco da mistura.
- **Impacto de não fazer:** Dificuldade de distinguir o que o build realmente usa; risco de apagar ou alterar por engano um arquivo crítico.
- **Para quem é destinado:** Mantenedores.
- **História de usuário:** Como mantenedor, quero separar scripts de build dos de manutenção pontual, para saber o que é seguro alterar.
- **Como saberemos que deu certo:** `scripts/` contém só arquivos usados pelo build/envio; `npm test -- --run` e `npm run build` seguem funcionando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Mover com `git mv` para `scripts/dev/`: `analyze_tags.js`, `check_html.js`, `check_logs.mjs`, `deactivate_simone.js`, `fetch_poems_temp.js`, `fix_collections.js`, `fix_poems.js`, `generate_artifact.js`, `get_updated.js`, `import_wp.js`, `list_152.js`, `migrate-prev-next.js`, `organize-collections.js`, `reclassify_tags.js`, `strip_html.js`, `test-queries.js`, `152_poems.json`, `poemasdenatanael.WordPress.2026-04-25.xml` | P0 | CA01 |
| RF02 | Atualizar caminhos `scripts/<arquivo>` dentro dos movidos para `scripts/dev/<arquivo>` | P0 | CA02 |
| RF03 | Atualizar a descrição de `scripts/` no README e citar `scripts/dev/` | P1 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhum arquivo usado pelo build ou pelo workflow é movido | P0 | CA03 |

### Dependências técnicas

- `scripts/prerender.js` importa `./generate-og-images.js` (permanece).
- `package.json` referencia `generate-*`, `migrate-updated-at` (permanecem).

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o repositório, quando listo `scripts/`, então restam apenas arquivos usados pelo build/envio, e os 18 itens do RF01 estão em `scripts/dev/`.
- [x] **CA02:** Dado um script movido, quando procuro `scripts/` nos caminhos de leitura/escrita, então apontam para `scripts/dev/`.
- [x] **CA03 (negativo):** Dado o build e os testes, quando `npm test -- --run` roda, então passam, e nenhum import de `scripts/prerender.js` ou `generate-*.js` ficou quebrado.
- [x] **CA04:** Dado o README, quando leio a estrutura do projeto, então `scripts/dev/` é descrito.

## O que a atividade não inclui

- Apagar qualquer script: podem ter valor histórico; ficam recuperáveis e fora do caminho.
- Mover `migrate-updated-at.js`: tem atalho no `package.json`.
- Revisar o conteúdo ou a segurança dos scripts movidos.

### Considerado para o futuro (P2)

- Apagar de `scripts/dev/` o que se confirmar obsoleto (migração do Supabase, WordPress).

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | N/A | | Não | |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Estrutura | manual | CA01 | `ls scripts scripts/dev` | Conforme RF01 |
| CT02 | Caminhos internos | manual | CA02 | `grep -rn "scripts/" scripts/dev` | Só `scripts/dev/...` |
| CT03 | Suíte | integração | CA03 | `npm test -- --run` | Verde |
| CT04 | Imports do build | manual | CA03 | `node --check scripts/prerender.js` | Sem erro |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: revisão de melhorias do site (2026-10-04)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
