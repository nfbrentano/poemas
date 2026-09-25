# [FIX] Remoção de Secret Inexistente INDEXNOW_KEY no Workflow de Deploy

## Detalhes da Atividade

- **O que precisa ser feito:** Remover a declaração `env: INDEXNOW_KEY: ${{ secrets.INDEXNOW_KEY }}` da etapa `Ping IndexNow` no arquivo `.github/workflows/deploy.yml`.
- **Por que é necessário:** O validador do GitHub Actions no editor emite um aviso (`Context access might be invalid: INDEXNOW_KEY`) porque o segredo não existe e não precisa ser cadastrado no repositório. O script `scripts/ping-indexnow.js` já possui resolução nativa automática da chave pública a partir do arquivo `.txt` em `public/`.
- **Qual valor será agregado:** Elimina o aviso de linter/validação estática do workflow CI/CD e simplifica o pipeline sem perder funcionalidade de ping do IndexNow.
- **Para quem é destinado:** Desenvolvedores e mantenedores do repositório.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: A etapa `Ping IndexNow` do workflow `.github/workflows/deploy.yml` deve executar `node scripts/ping-indexnow.js --ping` sem depender de variável de ambiente com secret não cadastrado.
- RF02: O script `scripts/ping-indexnow.js` deve continuar localizando a chave do IndexNow via fallback nativo no diretório `public/` ou `dist/`.

### Requisitos não-funcionais

- RNF01: Nenhuma chave secreta ou credencial sensível deve ser exposta.
- RNF02: O arquivo de workflow deve ser válido de acordo com o schema do GitHub Actions, eliminando warnings do linter de contexto de secrets.

### Dependências técnicas

- Arquivo `.github/workflows/deploy.yml`
- Script `scripts/ping-indexnow.js`
- Arquivo público de verificação `public/c9e4b7803a6d491f86f76c5b05813d92.txt`

### Recursos necessários

- Node.js e Vitest para validação de testes.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que o arquivo `.github/workflows/deploy.yml` é analisado, quando a etapa `Ping IndexNow` é inspecionada, então não deve haver mapeamento de secret inexistente `INDEXNOW_KEY` nem avisos de linter.
- [x] **CA02:** Dado que o script `node scripts/ping-indexnow.js --ping` é executado sem a variável de ambiente `INDEXNOW_KEY`, quando a execução ocorre no repositório, então a chave pública de `public/c9e4b7803a6d491f86f76c5b05813d92.txt` deve ser detectada automaticamente e utilizada.
- [x] **CA03:** Dado que a suíte de testes do projeto é executada, quando vitest roda, então todos os testes continuam passando com sucesso.

## O que a atividade não inclui

- Alteração da lógica interna de `scripts/ping-indexnow.js`.
- Modificação de outros jobs ou etapas do GitHub Actions.
- Criação de novos arquivos estáticos de verificação.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Validação do workflow | Inspecionar `.github/workflows/deploy.yml` | Step `Ping IndexNow` contém apenas `run: node scripts/ping-indexnow.js --ping` sem `env` inválido |
| CT02 | Detecção automática da chave | Executar `node scripts/ping-indexnow.js --ping` em ambiente sem `INDEXNOW_KEY` | Chave é auto-descoberta e URLs enviadas com sucesso |
| CT03 | Testes automatizados | Executar `npm test -- --run` | Todos os testes passam |

## URL Complementar

- Documentação técnica: [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions), [IndexNow Documentation](https://www.indexnow.org/)
- Protótipo / mockup: N/A - arquivo de configuração de CI/CD.
- Discussões relacionadas: `SDD/DONE/2026-09-24_geo-robots-crawlers-de-ia.md`
- Referências de design: N/A.
- Requisitos originais: Solicitação do usuário para corrigir aviso do IDE `Context access might be invalid: INDEXNOW_KEY`.
