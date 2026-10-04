# [CHORE] Executar testes automatizados antes do deploy

> **Status:** Aprovada
> **Autor:** Natanael Fernando Gatti Brentano · **Revisor:** · **Criada em:** 2026-10-04 · **Atualizada em:** 2026-10-04

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar ao `.github/workflows/deploy.yml` uma etapa `npm test -- --run` depois do build (os testes de SEO e segurança leem `dist/` e importam o `prerender.js`, que exige as variáveis do Firebase) e antes do upload do artefato.
- **Problema e evidência:** O projeto tem 228 testes (SEO, segurança, comentários), mas o workflow de deploy publica sem executá-los.
- **Impacto de não fazer:** Uma regressão coberta por teste pode ir para produção sem aviso.
- **Para quem é destinado:** Mantenedores.
- **História de usuário:** Como mantenedor, quero que o deploy falhe se algum teste falhar, para não publicar regressões.
- **Como saberemos que deu certo:** Falha de teste interrompe o workflow antes do upload do artefato.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Etapa de testes executa após o `Build` e antes do upload | P0 | CA01, CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Etapa roda em modo não interativo (`--run`) com as mesmas variáveis do build | P0 | CA03 |

### Dependências técnicas

- `.github/workflows/deploy.yml`, script `test` do `package.json` (vitest)

### Recursos necessários

- N/A

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o workflow, quando um push na `main` ocorre, então `npm test -- --run` executa após o build, com as mesmas variáveis de ambiente, e antes do upload.
- [x] **CA02:** Dado que algum teste falha, quando o workflow roda, então ele termina com erro e não publica.
- [x] **CA03:** Dado que o vitest roda localmente com `--run`, então termina sem modo watch e com todos os testes passando.

## O que a atividade não inclui

- Workflow separado para pull requests: mudança maior, avaliar depois.
- Lint ou checagem de tipos: o projeto não tem configuração para isso.

### Considerado para o futuro (P2)

- Rodar os testes também em PRs.

## Dúvidas em aberto

| # | Dúvida | Responsável | Bloqueante? | Resposta |
|---|--------|-------------|-------------|----------|
| D01 | Algum teste depende de secrets ou rede? | dev | Não | Suíte roda local sem `.env` |

## Sugestões de casos de teste

| # | Cenário | Tipo | Cobre | Passos | Resultado esperado |
|---|---------|------|-------|--------|--------------------|
| CT01 | Ordem das etapas | unit | CA01 | Teste lê o YAML e compara posição de `npm test` e `npm run build` | Teste vem após o build e antes do upload |
| CT02 | Suíte local | manual | CA03 | `npm test -- --run` | 100% verde |

## URL Complementar

- Documentação técnica: https://docs.github.com/actions
- Protótipo / mockup: N/A
- Discussões relacionadas: revisão de melhorias do site (2026-10-04)
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário
- Issue / PR relacionado: N/A
