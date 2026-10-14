# [CHORE] Atualização Geral de Dependências da Raiz

> **Status:** Concluída
> **Autor:** Natanael Fernando Gatti Brentano (com Antigravity) · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-10-14 · **Atualizada em:** 2026-10-14

## Detalhes da Atividade

- **O que precisa ser feito:** Atualizar todas as dependências desatualizadas no `package.json` da raiz da aplicação para as versões estáveis mais recentes (`@zumer/snapdom`, `dotenv`, `firebase`, `nodemailer`, `jsdom`, `satori`, `vite`, `vitest`), incluindo as versões principais `firebase@13.0.0` e `satori@0.57.2`, validando toda a suíte de testes unitários, testes de integração, geração de imagens Open Graph e build de pré-renderização estática.
- **Problema e evidência:** O comando `npm outdated` indicou 8 pacotes desatualizados no projeto raiz:
  - `@zumer/snapdom` de `3.2.0` para `3.3.4` (Minor/Patch)
  - `dotenv` de `18.0.4` para `18.0.8` (Patch)
  - `firebase` de `12.19.0` para `13.0.0` (Major)
  - `nodemailer` de `10.0.12` para `10.1.1` (Minor)
  - `jsdom` de `30.1.1` para `30.1.2` (Patch)
  - `satori` de `0.33.5` para `0.57.2` (Major jump)
  - `vite` de `8.3.1` para `8.3.4` (Patch)
  - `vitest` de `5.0.2` para `5.0.4` (Patch)
- **Impacto de não fazer:** Acúmulo de débito técnico, obsolescência das ferramentas de build e empacotamento, perda de melhorias de desempenho do Vite/Vitest e eventuais vulnerabilidades de segurança corrigidas nos pacotes upstream.
- **Para quem é destinado:** Desenvolvedores e mantenedores do projeto, assegurando tooling moderno, segurança e estabilidade contínua no pipeline de CI/CD e deploy no GitHub Pages.
- **História de usuário:** Como mantenedor do site, quero atualizar as dependências do projeto para as versões mais recentes, para garantir segurança, performance de compilação e compatibilidade a longo prazo sem introduzir quebras ou regressões.
- **Como saberemos que deu certo:**
  - `npm outdated` na raiz não aponta mais pacotes desatualizados.
  - 100% dos testes existentes (31 arquivos e 281 testes) executam com sucesso com `npx vitest run`.
  - O comando `npm run build` completa a compilação do Vite, a geração de sitemaps, RSS, LLMs e a pré-renderização das páginas estáticas e imagens OG via Satori sem erros.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|---|-----------|------------|-----|
| RF01 | Atualizar `@zumer/snapdom` para `^3.3.4`, `dotenv` para `^18.0.8` e `nodemailer` para `^10.1.1` em `dependencies`. | P0 | CA01 |
| RF02 | Atualizar `firebase` para a versão `^13.0.0`, assegurando compatibilidade com todos os módulos importados (`app`, `firestore`, `auth`, `storage`, `functions`). | P0 | CA02 |
| RF03 | Atualizar devDependencies (`jsdom` para `^30.1.2`, `vite` para `^8.3.4`, `vitest` para `^5.0.4`). | P0 | CA03 |
| RF04 | Atualizar `satori` para `^0.57.2`, validando a compatibilidade com `satori-html` e a geração das capas Open Graph em `scripts/generate-og-images.js`. | P0 | CA04 |
| RF05 | Garantir a sincronização do `package-lock.json` e a integridade de todas as rotinas de build e testes. | P0 | CA05 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|---|-----------|------------|-----|
| RNF01 | Nenhuma quebra ou regressão nas funcionalidades de leitura, navegação SPA, tema, reações, comentários, busca e SEO. | P0 | CA02, CA05 |
| RNF02 | O tempo de compilação do build e de execução dos testes deve permanecer estável. | P1 | CA03, CA05 |
| RNF03 | Nenhuma nova vulnerabilidade crítica introduzida pelo `package-lock.json`. | P0 | CA06 |

### Dependências técnicas

- Arquivos `package.json` e `package-lock.json` na raiz do projeto.
- Node.js 20+ e npm 10+.

### Recursos necessários

- Conexão de rede para download dos pacotes do npm registry.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que as dependências (`@zumer/snapdom`, `dotenv`, `nodemailer`) foram atualizadas no `package.json`, quando `npm install` for executado, então a instalação conclui com êxito e os módulos são importados sem erros de sintaxe ou exportação.
- [x] **CA02:** Dado que o `firebase` foi atualizado para a versão 13.x, quando os testes e a conexão com o Firestore forem executados em runtime e nos scripts de build, então as operações de leitura, escrita e autenticação continuam funcionando normalmente.
- [x] **CA03:** Dado que `jsdom`, `vite` e `vitest` foram atualizados para suas últimas versões no `package.json`, quando o comando `npx vitest run` for executado, então todos os 281 testes passam sem falhas.
- [x] **CA04:** Dado que `satori` foi atualizado para `^0.57.2`, quando `npm run build` gerar as imagens Open Graph dos 237 poemas, então o layout dos cartões é gerado sem erros de layout ou de fontes.
- [x] **CA05:** Dado que todas as dependências foram atualizadas, quando executado `npm run build`, então o bundle Vite é criado em `dist/`, os sitemaps, RSS, LLMs e as 237 páginas estáticas são geradas com sucesso.
- [x] **CA06:** Dado que a instalação foi concluída, quando executado `npm outdated` na raiz, então nenhum pacote da raiz é reportado como desatualizado.

## O que a atividade não inclui

- Atualização de pacotes do subdiretório `functions/`: motivo: Cloud Functions possuem ciclo de vida e deploy isolados no Firebase Functions; escopo focado na aplicação raiz do site conforme decisão de planejamento.
- Refatoração de componentes da interface: motivo: manutenção exclusiva de dependências sem alteração no código de produto.

### Considerado para o futuro (P2)

- Planejar a atualização das dependências de `functions/package.json` (`firebase-admin`, `firebase-functions`, `nodemailer`) em branch específica com testes em emulador Firebase.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | Alguma API de Firestore utilizada pelo projeto foi modificada no Firebase 13? | dev | Não | Verificado: as quebras do SDK Web v13 concentram-se no pacote `@firebase/ai`, mantendo as APIs de `app`, `firestore`, `auth` e `storage` compatíveis. |
| D02 | O Satori 0.57 requer ajuste na estrutura de fontes ou tags de HTML do satori-html? | dev | Não | Validado com sucesso: `scripts/generate-og-images.js` gerou todas as imagens perfeitamente. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Instalação das dependências atualizadas | integração | CA01, CA02, CA03, CA04 | Executar comandos `npm install` correspondentes | Instalação concluída e `package-lock.json` sincronizado |
| CT02 | Execução de testes automatizados com Vitest | unit/integração | CA01, CA02, CA03 | Executar `npx vitest run` | 31 arquivos de teste e 281 testes passando com código 0 |
| CT03 | Build completo de produção e geração de assets | integração | CA02, CA04, CA05 | Executar `npm run build` | Bundle Vite, feeds, sitemaps e 237 páginas estáticas com OG images gerados com sucesso |
| CT04 | Validação de ausência de dependências desatualizadas | verificação | CA06 | Executar `npm outdated` | Sem pacotes desatualizados listados para o projeto raiz |

## URL Complementar

- Documentação técnica: https://firebase.google.com/support/release-notes/js, https://github.com/vercel/satori
- Protótipo / mockup: N/A
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário via `/plan npm outdated`
- Issue / PR relacionado: N/A
