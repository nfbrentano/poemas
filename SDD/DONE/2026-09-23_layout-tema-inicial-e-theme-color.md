# [FIX][UI] Tema sépia pisca ao carregar e a barra do navegador não acompanha o tema

## Detalhes da Atividade

- **O que precisa ser feito:** Fazer o tema salvo ser aplicado antes da primeira pintura em todos os casos, e sincronizar a `<meta name="theme-color">` com o tema ativo.
- **Por que é necessário:**
  - O script inline do `index.html` (e o `public/theme-init.js`) só trata `light` e `contrast`. Para quem escolheu **sépia**, a página pinta primeiro no tema escuro e só troca quando `themeToggle.init()` roda, depois do bundle. Isso causa um flash escuro→bege a cada visita, o que incomoda justamente quem lê no sépia para descansar a vista.
  - `<meta name="theme-color" content="#050505">` é fixa. No celular, com o tema claro ou sépia, a barra de status e de endereço do navegador fica preta sobre uma página clara, o que quebra a imersão.
  - A lógica de tema existe em 3 lugares (inline no `index.html`, `theme-init.js` e `theme-toggle.js`), o que explica a divergência.
- **Qual valor será agregado:** Uma abertura de página sem "piscar" e uma aparência integrada ao sistema do celular (PWA incluída).
- **Para quem é destinado:** Leitores que usam os temas claro, sépia ou alto contraste, principalmente no celular ou com o site instalado como PWA.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: O script de inicialização deve aplicar os 4 modos (`dark`, `light`, `sepia`, `contrast`) antes da primeira pintura.
- RF02: Unificar em um único script de inicialização (manter `public/theme-init.js`, carregado de forma síncrona no `<head>`) e remover a duplicata inline do `index.html`, verificando a CSP (`script-src 'self'`).
- RF03: Atualizar a `theme-color` para a `--bg-primary` do tema ativo, tanto na inicialização quanto a cada troca em `themeToggle.apply()`.
- RF04: `apply()` não deve depender da existência de `#mode-toggle` para aplicar o tema. Hoje ele retorna cedo se o botão não existir, antes de definir `currentMode`.
- RF05: Atualizar `manifest.json` (`theme_color`/`background_color`) de forma coerente com o tema padrão.

### Requisitos não-funcionais

- RNF01: Zero flash de tema incorreto, medido por gravação de tela a 60fps em um celular real.
- RNF02: O script de inicialização deve ter menos de 1KB e nenhuma dependência.

### Dependências técnicas

- `index.html`, `public/theme-init.js`, `src/components/theme-toggle.js`, `public/manifest.json`, `scripts/prerender.js` (se ele copia o `<head>`)

### Recursos necessários

- Um celular real (iOS Safari e Chrome Android) para validar a `theme-color`.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o tema sépia salvo, quando recarrego qualquer página, então o primeiro quadro já é bege.
- [ ] **CA02:** Dado o tema claro no celular, quando abro o site, então a barra do navegador fica clara.
- [ ] **CA03:** Dado que troco o tema, quando olho a barra do navegador, então ela acompanha a nova cor.
- [ ] **CA04:** Dado o `index.html` do build, quando o inspeciono, então só existe uma implementação da inicialização de tema.

## O que a atividade não inclui

- Não inclui criar ou alterar as paletas dos temas.
- Não inclui a posição do botão de tema no mobile (ver `2026-09-23_layout-controles-mobile-sem-cabecalho.md`).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Sépia | `localStorage['site-mode']='sepia'` e recarregar com a rede em "Slow 3G" | Sem flash escuro |
| CT02 | Theme-color | Trocar os 4 temas | A meta muda a cada troca |
| CT03 | Sem preferência | Limpar o storage, com o SO em claro | Tema claro desde o primeiro quadro |
| CT04 | PWA | Site instalado, tema sépia | Barra de status bege |
| CT05 | CSP | Console após o build | Sem violações de CSP |

## URL Complementar

- Código: [index.html](../index.html), [public/theme-init.js](../public/theme-init.js), [src/components/theme-toggle.js](../src/components/theme-toggle.js), [public/manifest.json](../public/manifest.json)
- Referência: MDN, `<meta name="theme-color">`
