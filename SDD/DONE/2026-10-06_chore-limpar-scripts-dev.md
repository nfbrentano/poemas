# [CHORE] Limpar scripts/dev: remover scripts obsoletos e manter o export do WordPress

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-06 · **Atualizada em:** 2026-10-06

## Detalhes da Atividade

- **O que precisa ser feito:** Remover de `scripts/dev/` os 17 scripts e dados derivados de migrações e correções pontuais já concluídas, manter o export original do WordPress e adicionar um `README.md` explicando o conteúdo e como recuperar o resto pelo histórico do git.
- **Problema e evidência:** A pasta foi criada em `SDD/DONE/2026-10-05_chore-mover-scripts-manutencao-para-dev.md` apenas para tirar os scripts do caminho. Hoje 8 deles usam o Supabase (o banco é o Firebase), 4 dependem desses, e 5 são correções/migrações pontuais já aplicadas. Um deles (`check_logs.mjs`) traz uma chave pública do Supabase hardcoded e `generate_artifact.js` grava num caminho de outra ferramenta, fora do projeto.
- **Impacto de não fazer:** Código morto que confunde, parece utilizável e não roda mais.
- **Para quem é destinado:** Mantenedores.
- **História de usuário:** Como mantenedor, quero remover scripts obsoletos, mantendo a fonte original dos poemas, para o repositório refletir só o que é utilizável.
- **Como saberemos que deu certo:** `scripts/dev/` contém só o `.xml` e o `README.md`; nenhuma referência quebrada; `npm run build` e `npm test -- --run` verdes.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Remover com `git rm` os 17 itens: `analyze_tags.js`, `check_html.js`, `check_logs.mjs`, `deactivate_simone.js`, `fetch_poems_temp.js`, `fix_collections.js`, `fix_poems.js`, `generate_artifact.js`, `get_updated.js`, `import_wp.js`, `list_152.js`, `migrate-prev-next.js`, `organize-collections.js`, `reclassify_tags.js`, `strip_html.js`, `test-queries.js`, `152_poems.json` | P0 | CA01 |
| RF02 | Manter `poemasdenatanael.WordPress.2026-04-25.xml` | P0 | CA02 |
| RF03 | Criar `scripts/dev/README.md` com a descrição do `.xml` e o comando para recuperar os scripts removidos | P0 | CA03 |
| RF04 | Atualizar a descrição de `scripts/dev/` no README principal | P1 | CA04 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhum arquivo usado pelo build, pelos workflows ou pelo `package.json` é afetado | P0 | CA05 |

### Dependências técnicas

- Nenhuma. Nada fora de `scripts/dev/` referencia os arquivos removidos (verificado).

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado `scripts/dev/`, quando listo, então os 17 itens do RF01 não existem mais.
- [x] **CA02:** Dado `scripts/dev/`, quando listo, então o `.xml` do WordPress continua lá, idêntico.
- [x] **CA03:** Dado o `README.md` da pasta, quando o leio, então explica o `.xml` e traz um comando git que recupera qualquer script removido.
- [x] **CA04:** Dado o README principal, quando leio a estrutura do projeto, então `scripts/dev/` descreve o export do WordPress.
- [x] **CA05 (negativo):** Dado o repositório, quando busco os nomes removidos em `package.json`, `.github`, `src`, `functions` e demais scripts, então não há referência, e `npm run build` e `npm test -- --run` passam.

## O que a atividade não inclui

- Remover o `.xml` do WordPress: é o único backup bruto dos poemas na forma original.
- Reescrever o histórico do git para apagar a chave pública do Supabase: é uma chave anon/publishable, e o custo não compensa.

### Considerado para o futuro (P2)

- Mover o `.xml` para fora do repositório (armazenamento privado), se o tamanho ou a privacidade passarem a importar.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | Manter o `.xml` do WordPress no repositório? | PO | Não | Mantido por segurança |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Pasta limpa | manual | CA01, CA02 | `ls scripts/dev` | Só `.xml` e `README.md` |
| CT02 | Sem referências | manual | CA05 | `grep -rn` pelos nomes | Vazio |
| CT03 | Recuperação | manual | CA03 | Rodar o comando do README para um script | Arquivo restaurado |
| CT04 | Build e testes | integração | CA05 | `npm run build && npm test -- --run` | Verdes |

## URL Complementar

- Documentação técnica: N/A
- Protótipo / mockup: N/A
- Discussões relacionadas: `SDD/DONE/2026-10-05_chore-mover-scripts-manutencao-para-dev.md`
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
