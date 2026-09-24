# [FIX] {SEO} Imagem de compartilhamento (Open Graph) válida para poemas, coleções e páginas

## Detalhes da Atividade

- **O que precisa ser feito:** Garantir que toda página publicada tenha uma `og:image`/`twitter:image` que existe, no tamanho recomendado (1200×630) e com dimensões declaradas corretamente.
- **Por que é necessário:**
  - O prerender dos poemas aponta `og:image` e o `image` do JSON-LD para `https://<projectId>.web.app/og-image?slug=<slug>` (`scripts/prerender.js:89`), que responde **404**: essa função não existe (`functions/index.js` só exporta `sendNewsletter`). Todo poema compartilhado no WhatsApp, Facebook ou X aparece sem imagem.
  - `og-cover.jpg` e `og-default.png` são quadradas (1024×1024), mas as tags declaram 1200×630. As redes cortam ou rejeitam a imagem.
  - `index.html` usa `og-cover.jpg` e `src/utils/seo.js` usa `og-default.png` como padrão: inconsistente.
  - Coleções têm `image_url` no banco, mas o prerender não usa esse campo; as páginas estáticas não substituem `og:image`.
- **Qual valor será agregado:** Mais cliques vindos de compartilhamentos (cartões com imagem têm CTR bem maior), rich results elegíveis (o Google exige imagem válida em dados estruturados) e aparência profissional.
- **Para quem é destinado:** Leitores que compartilham poemas e o autor, que divulga nas redes.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Gerar, no build, uma imagem 1200×630 por poema (título do poema + primeiros versos + assinatura "Natanael Brentano", na identidade visual do site) e salvar em `dist/og/poema/<slug>.png` (ou `.jpg`). Sugestão: `satori` + `@resvg/resvg-js`, ou reaproveitar o layout já usado em `social-export` com Puppeteer.
- RF02: Usar a imagem gerada em `og:image`, `twitter:image` e JSON-LD `image` do poema, com URL absoluta.
- RF03: Criar uma imagem padrão única `public/og-default.jpg` 1200×630 e usá-la em `index.html`, em `seo.js` e nas páginas estáticas. Remover a referência inconsistente.
- RF04: Nas coleções, usar `image_url` quando existir; senão, gerar uma imagem 1200×630 com o nome da coleção.
- RF05: Declarar `og:image:width`, `og:image:height`, `og:image:type` e `og:image:alt` com os valores reais.
- RF06: Usar `twitter:card = summary_large_image` em todas as páginas.
- RF07: Em navegação SPA, `updateSEO` deve usar a mesma URL de imagem que o prerender, para que o estado do `<head>` seja idêntico.

### Requisitos não-funcionais

- RNF01: Cada imagem com no máximo 300 KB.
- RNF02: O tempo total de build não pode aumentar mais que 2 minutos para ~250 poemas; usar cache (pular geração se o poema não mudou, por hash de título+conteúdo).
- RNF03: Textos longos devem ser quebrados/truncados sem estourar a arte.
- RNF04: A CSP (`img-src`) não deve bloquear as imagens, já que são do mesmo domínio.

### Dependências técnicas

- `scripts/prerender.js` (ou novo `scripts/generate-og-images.js` chamado no `build`)
- `src/utils/seo.js`, `index.html`, `public/`
- Fontes locais do site (Cormorant Garamond / Merriweather) em arquivo para a renderização

### Recursos necessários

- Arte-base (fundo, tipografia, cores) aprovada pelo autor.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado um poema publicado, quando faço `curl -I` na URL do `og:image` do seu HTML, então recebo `200` com `content-type` de imagem.
- [ ] **CA02:** Dado qualquer imagem OG gerada, quando verifico suas dimensões, então ela tem exatamente 1200×630 e as tags `og:image:width/height` batem.
- [ ] **CA03:** Dado o link de um poema, quando testo no Facebook Sharing Debugger e no validador de cartões do X, então aparece o cartão grande com a imagem do poema, sem avisos.
- [ ] **CA04:** Dado uma coleção com `image_url`, quando inspeciono o prerender, então `og:image` é essa imagem.
- [ ] **CA05:** Dado o Teste de pesquisa aprimorada do Google em um poema, quando analiso, então não há erro de imagem inválida.

## O que a atividade não inclui

- Geração dinâmica em tempo real via Cloud Function.
- Redesenho do exportador de imagens para Instagram (`social-export`).
- Imagens dentro do corpo dos poemas.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Imagem existe | Build + verificar arquivo `dist/og/poema/<slug>.png` para todos os poemas | Um arquivo por poema publicado |
| CT02 | Dimensões | Script com `sharp`/`image-size` em todas as imagens geradas | Todas 1200×630, ≤ 300 KB |
| CT03 | Título longo | Poema com título de 120 caracteres | Texto quebrado/truncado, sem vazar da arte |
| CT04 | Cache | Rodar build duas vezes sem mudar poemas | Segunda execução não regenera imagens |
| CT05 | WhatsApp | Colar link de poema em conversa | Prévia com imagem e título |
| CT06 | SPA | Navegar home → poema e inspecionar `og:image` | Mesma URL do HTML prerenderizado |

## URL Complementar

- Documentação técnica: https://ogp.me/ ; https://developers.facebook.com/docs/sharing/webmasters/images
- Documentação técnica: https://github.com/vercel/satori
- Protótipo / mockup: A definir com o autor.
- Discussões relacionadas: `SDD/DONE/2026-09-23_layout-compartilhar-e-acoes.md`
- Referências de design: Identidade visual atual do site (`src/styles/variables.css`).
- Requisitos originais: Auditoria de SEO de 2026-09-24.
