# Instruções do projeto

## Spec Driven Development (SDD)

Toda nova feature, correção ou atividade deve ter uma especificação escrita **antes** da implementação.

### Regras

1. **Sempre** crie a especificação como um arquivo `.md` **dentro da pasta [`SDD/`](SDD/)**. Nunca crie especificações na raiz ou em outras pastas.
2. **Sempre** use como base o modelo [`SDD/modelo_feature.md`](SDD/modelo_feature.md): copie a estrutura e preencha todas as seções, na mesma ordem:
   - Título da Atividade (com tag, ex.: `[FEAT]`, `[FIX]`, `{SEO}`, `(UI)`)
   - Detalhes da Atividade
   - Requisitos da Atividade
   - Critérios de Aceitação / Entregas
   - O que a atividade não inclui
   - Sugestões de casos de teste
   - URL Complementar
3. **Não altere** o arquivo `SDD/modelo_feature.md`. Ele é o modelo de referência.
4. Os critérios de aceitação devem seguir o formato: *"Dado que [contexto], quando [ação], então [resultado esperado]"*.
5. Se alguma seção não se aplicar, mantenha o título e escreva `N/A` com uma breve justificativa. Não remova seções.
6. A implementação só deve começar depois que a especificação estiver criada e, se possível, revisada.
7. **Sempre** que concluir uma feature (implementada e validada com os casos de teste), **mova** o arquivo `.md` da especificação de `SDD/` para a pasta [`SDD/DONE/`](SDD/DONE/), mantendo o mesmo nome de arquivo. Crie a pasta `SDD/DONE/` caso ela ainda não exista. Na raiz de `SDD/` devem ficar apenas o modelo e as especificações pendentes ou em andamento.

### Nomenclatura dos arquivos de especificação

Use o padrão `AAAA-MM-DD_nome-da-feature.md`, em minúsculas e com hífens, por exemplo:

```
SDD/2026-09-23_busca-de-poemas.md
SDD/2026-09-23_modo-escuro.md
```

## Controle de Versão (Git: Branches e Pull Requests)

Toda tarefa deve ser desenvolvida em uma branch isolada e integrada via Pull Request.

### Regras de Branch e PR

1. **Nunca** faça commits ou implementações diretamente na branch `main`.
2. **Sempre** crie uma branch a partir da `main` atualizada antes de iniciar a especificação e o código:
   - `git checkout main && git pull`
   - `git checkout -b <tipo>/<nome-da-tarefa>`
3. **Padrão de nomenclatura das branches**:
   - `feat/<nome-da-feature>` para novas funcionalidades (ex.: `feat/modo-escuro`).
   - `fix/<nome-do-bug>` para correções de defeitos (ex.: `fix/soft-404-e-noindex`).
   - `refactor/<nome-do-refactor>` para refatorações de código.
   - `chore/<nome-da-tarefa>` para manutenção, limpeza ou infraestrutura.
4. **Commits semânticos**: use mensagens descritivas seguindo Conventional Commits (ex.: `feat: adicionar modo escuro`, `fix: corrigir noindex em coleções`).
5. **Abertura de Pull Request (PR)**:
   - Ao concluir a implementação e passar em todos os testes (`npm test`), envie a branch para o remoto (`git push -u origin <branch>`).
   - Abra um Pull Request para merge na branch `main`, detalhando o que foi feito, os testes executados e referenciando a especificação em `SDD/DONE/`.

### Fluxo Completo de Trabalho

1. Atualizar a branch principal e criar a branch de trabalho:
   ```bash
   git checkout main && git pull
   git checkout -b <tipo>/<nome-da-tarefa>
   ```
2. Criar a especificação SDD copiando o modelo:
   `cp SDD/modelo_feature.md SDD/AAAA-MM-DD_nome-da-feature.md` e preencher todas as seções.
3. Implementar seguindo os requisitos e critérios de aceitação.
4. Validar com os testes automatizados (`npm test`) antes de concluir.
5. Após concluir, mover a especificação para `SDD/DONE/AAAA-MM-DD_nome-da-feature.md`.
6. Criar o commit, fazer push e abrir o Pull Request (PR) para a branch `main`.
