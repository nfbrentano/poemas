# [CHORE] Atualização Geral de Dependências do Projeto

> **Status:** Concluída
> **Autor:** Natanael Fernando Gatti Brentano (com Antigravity) · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-09-29 · **Atualizada em:** 2026-09-29

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar as dependências desatualizadas no `package.json` raiz para suas versões mais recentes estáveis (`@zumer/snapdom`, `dotenv`, `fast-xml-parser`, `firebase`, `jsdom`, `nodemailer`, `vite`, `vitest`), ajustando eventuais quebras de API, configurações de teste e scripts de build/execução.
- **Problema e evidência:** O comando `npm outdated` indicou 8 pacotes desatualizados no projeto raiz:
  - `@zumer/snapdom` de `2.24.7` para `3.2.0` (Major)
  - `dotenv` de `17.4.2` para `18.0.4` (Major)
  - `fast-xml-parser` de `5.11.0` para `5.11.2` (Patch)
  - `firebase` de `12.18.0` para `12.19.0` (Minor)
  - `jsdom` de `30.0.1` para `30.1.1` (Minor)
  - `nodemailer` de `9.1.1` para `10.0.12` (Major)
  - `vite` de `8.2.2` para `8.3.1` (Minor)
  - `vitest` de `4.1.11` para `5.0.2` (Major)
- **Impacto de não fazer:** O projeto acumula débito técnico, corre risco de vulnerabilidades conhecidas, perde otimizações de performance do bundler e do executor de testes, além de incompatibilidades futuras com o ecossistema Node.js / Vite.
- **Para quem é destinado:** Desenvolvedores e mantenedores da aplicação, garantindo estabilidade, segurança e suporte contínuo às ferramentas de build, teste e runtime.
- **História de usuário:** Como mantenedor do site, quero manter todas as dependências atualizadas nas últimas versões estáveis, para garantir segurança, performance de compilação e compatibilidade de longo prazo sem regressão nas funcionalidades existentes.
- **Como saberemos que deu certo:**
  - `npm outdated` no projeto raiz não reporta pacotes desatualizados (ou apenas dependências bloqueadas justificadas).
  - A suíte completa de testes (`npm test -- --run`) executa com 100% de aprovação (todos os 222+ testes passando).
  - O build de produção (`npm run build`) conclui com sucesso (Vite build + sitemap + rss + llms + prerender).

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Atualizar pacotes menores/patch (`fast-xml-parser`, `firebase`, `jsdom`, `vite`) para suas versões mais recentes no `package.json`. | P0 | CA01 |
| RF02 | Atualizar `vitest` para a versão `^5.0.2`, ajustando eventuais configurações de ambiente de teste em `vite.config.js` ou arquivos de teste se necessário. | P0 | CA02 |
| RF03 | Atualizar `@zumer/snapdom` para `^3.2.0`, garantindo compatibilidade com a exportação de cartões sociais (`src/utils/social-export.js`) e seus testes unitários. | P0 | CA03 |
| RF04 | Atualizar `dotenv` para `^18.0.4` e `nodemailer` para `^10.0.12`, assegurando que scripts que utilizam essas bibliotecas continuem executando normalmente. | P0 | CA04 |
| RF05 | Garantir que o comando `npm run build` continue compilando o bundle Vite e executando os geradores de sitemap, rss, llms e prerender sem erros. | P0 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Nenhuma regressão comportamental nas funcionalidades de leitura, navegação, tema, compartilhamento e SEO do site. | P0 | CA01, CA02, CA03, CA05 |
| RNF02 | O tempo de execução da suíte de testes e o tempo de build devem se manter estáveis ou apresentar melhora. | P1 | CA02, CA05 |
| RNF03 | Zero dependências vulneráveis conhecidas apontadas por `npm audit`. | P0 | CA06 |

### Dependências técnicas

- Arquivo `package.json` e `package-lock.json` na raiz do repositório.
- Gerenciador de pacotes `npm` versão 10+.
- Node.js 20+.

### Recursos necessários

- Conexão com o registro público npm para instalação dos novos pacotes.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que as dependências menores (`fast-xml-parser`, `firebase`, `jsdom`, `vite`) são atualizadas no `package.json`, quando executado `npm install`, então a instalação é finalizada com sucesso e o arquivo `package-lock.json` é sincronizado sem quebras.
- [x] **CA02:** Dado que `vitest` foi atualizado para a versão 5.x, quando o comando `npm test -- --run` for executado, então todos os testes unitários e de integração existentes passam com sucesso (código de saída 0).
- [x] **CA03:** Dado que `@zumer/snapdom` foi atualizado para a versão 3.x, quando o módulo `src/utils/social-export.js` e seus testes forem invocados, então a renderização de elementos para imagem/blob funciona sem erros de API.
- [x] **CA04:** Dado que `dotenv` e `nodemailer` foram atualizados para suas respectivas versões principais mais recentes, quando os scripts auxiliares forem validados, então não ocorrem erros de importação ou execução causados por alterações de sintaxe/módulo.
- [x] **CA05:** Dado que todos os pacotes foram atualizados, quando `npm run build` for acionado, então o bundle é gerado em `dist/` e todos os scripts subsequentes (`sitemap`, `rss`, `llms`, `prerender`) rodam com sucesso.
- [x] **CA06:** Dado que o `package-lock.json` foi atualizado, quando executado `npm audit`, então nenhuma vulnerabilidade de severidade crítica ou alta é introduzida.

## O que a atividade não inclui

- Atualização de pacotes dentro de `functions/package.json`: motivo: foco inicial no projeto raiz onde o `npm outdated` foi acionado pelo usuário; `functions/` possui ciclo de deploy isolado no Firebase Cloud Functions.
- Refatoração de funcionalidades ou redesenho de componentes: motivo: o objetivo é manutenção pura de dependências.

### Considerado para o futuro (P2)

- Avaliar atualização das dependências do subdiretório `functions/` (`firebase-admin`, `firebase-functions`, `nodemailer`) em atividade própria de manutenção de Cloud Functions.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Vitest 5 introduziu quebras nas flags CLI ou mocks do projeto? | dev | Não | Testaremos executando `npm test -- --run` e adaptando configurações caso necessário. |
| D02 | A API de `@zumer/snapdom` 3.x manteve `snapdom.toBlob`? | dev | Não | A documentação e uso em `src/utils/social-export.js` serão verificados após a instalação. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Instalação das novas versões | integração | CA01, CA06 | Rodar `npm install` com as versões atualizadas | Saída sem erros e lockfile atualizado |
| CT02 | Execução de toda a suíte de testes com Vitest 5 | unit/integração | CA02, CA03, CA04 | Executar `npm test -- --run` | 222+ testes passando sem falhas |
| CT03 | Build e pré-renderização de produção | integração | CA05 | Executar `npm run build` | Saída gerada em `dist/` com sitemap, rss e páginas estáticas |
| CT04 | Verificação de pacotes desatualizados | manual | CA01, CA04 | Executar `npm outdated` | Nenhum pacote desatualizado remanescente |

## URL Complementar

- Documentação técnica: https://vitest.dev/guide/, https://vite.dev/guide/
- Protótipo / mockup: N/A (manutenção técnica de dependências)
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário via terminal `npm outdated`
- Issue / PR relacionado: N/A
