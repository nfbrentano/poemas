# [CHORE] Integração Microsoft Clarity com ID z29eha5a1g

> **Status:** Concluída  
> **Autor:** Natanael / Antigravity · **Revisor:** Natanael · **Criada em:** 2026-10-23 · **Atualizada em:** 2026-10-23

## Detalhes da Atividade

- **O que precisa ser feito:** Inserir a tag oficial de rastreamento do Microsoft Clarity (`z29eha5a1g`) no `<head>` de `index.html` e remover a inicialização do ID legado (`y5mmw0thvu`) em `src/main.js`, evitando duplicação e garantindo a verificação imediata pelo Clarity.
- **Problema e evidência:** O usuário forneceu o snippet oficial do Microsoft Clarity para o domínio `https://nfgbrentano.art.br/` com o novo ID `z29eha5a1g`. O projeto possuía uma inicialização legada via import de pacote em `src/main.js` apontando para outro ID (`y5mmw0thvu`).
- **Impacto de não fazer:** O painel do Microsoft Clarity não conseguirá verificar a instalação nem coletar gravações de sessão e mapas de calor na conta/projeto correto.
- **Para quem é destinado:** Administrador do site (Natanael) para análise de métricas de uso e experiência dos leitores.
- **História de usuário:** Como administrador do site, quero que o script oficial do Microsoft Clarity esteja presente no site com o ID correto, para que eu possa acompanhar sessões, heatmaps e usabilidade do site.
- **Como saberemos que deu certo:** Script do Clarity presente no `<head>` de `index.html` com ID `z29eha5a1g`, ausência do ID antigo `y5mmw0thvu`, CSP permitindo a execução sem erros de console e testes automatizados passando.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Inserir o snippet de rastreamento do Microsoft Clarity com o identificador `z29eha5a1g` no `<head>` de `index.html`. | P0 | CA01 |
| RF02 | Remover a inicialização do ID legado `y5mmw0thvu` em `src/main.js` para evitar duplicação ou conflito de rastreadores. | P0 | CA02 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | O script do Clarity deve ser assíncrono (`async`) e compatível com a Content-Security-Policy (CSP) já configurada no site. | P0 | CA03 |

### Dependências técnicas

- Arquivo `index.html`
- Arquivo `src/main.js`

### Recursos necessários

- N/A com justificativa: O snippet oficial e o ID `z29eha5a1g` foram fornecidos diretamente pelo usuário.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado o arquivo `index.html`, quando inspecionado o elemento `<head>`, então deve conter o snippet JavaScript oficial do Microsoft Clarity com o identificador `z29eha5a1g`.
- [x] **CA02:** Dado o arquivo `src/main.js`, quando verificado seu conteúdo, então não deve haver chamadas ou inicializações para o ID legado `y5mmw0thvu`.
- [x] **CA03:** Dado o arquivo `index.html`, quando inspecionada a meta tag `Content-Security-Policy`, então ela deve conter permissões para scripts, imagens e conexões aos domínios do Microsoft Clarity (`https://www.clarity.ms`, `https://scripts.clarity.ms`, `https://*.clarity.ms`, `https://c.clarity.ms`, `https://*.bing.com`, `https://c.bing.com`).

## O que a atividade não inclui

- Rastreamento de eventos customizados ou máscaras de privacidade avançadas: motivo: baixo impacto / prematuro neste momento.

### Considerado para o futuro (P2)

- N/A com justificativa: A tag padrão do Clarity já cobre gravações de sessão, heatmaps e métricas principais de usabilidade.

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | N/A | dev | Não | Nenhuma dúvida pendente. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Validar snippet Clarity no index.html | unit | CA01 | Inspecionar index.html e buscar o script com ID z29eha5a1g | Script presente e formatado corretamente |
| CT02 | Validar ausência do ID legado no código | unit | CA02 | Inspecionar src/main.js | Nenhuma referência ao ID antigo y5mmw0thvu |
| CT03 | Validar regras de CSP para Clarity | unit | CA03 | Inspecionar diretivas de CSP no index.html | Domínios do Clarity devidamente permitidos |

## URL Complementar

- Documentação técnica: https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-script
- Protótipo / mockup: N/A com justificativa: Alteração apenas de código de analytics no HTML/JS.
- Discussões relacionadas: N/A
- Referências de design: N/A
- Requisitos originais: Solicitação do usuário no chat para inclusão do snippet com ID z29eha5a1g.
- Issue / PR relacionado: N/A
