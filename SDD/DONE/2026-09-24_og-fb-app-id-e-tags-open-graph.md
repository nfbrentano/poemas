# {SEO} Adicionar `fb:app_id` e corrigir tags Open Graph estáticas

## Detalhes da Atividade

- **O que precisa ser feito:** Adicionar a propriedade `fb:app_id` em todas as páginas do site. Ela é apontada como ausente pelo Sharing Debugger do Facebook. Aproveitando a mesma área, corrigir inconsistências nas tags Open Graph do HTML estático encontradas na análise do site publicado em 2026-09-24.
- **Por que é necessário:**
  - O Sharing Debugger (`developers.facebook.com/tools/debug/?q=https://nfgbrentano.art.br/`) reporta: "As duas propriedades obrigatórias a seguir estão ausentes: fb:app_id". Sem ela, o aviso persiste e não é possível usar o Facebook Insights para acompanhar os compartilhamentos do domínio.
  - O aviso cita **duas** propriedades, mas só lista `fb:app_id`. O depurador exige login e não foi possível ver o relatório completo. A análise do HTML publicado encontrou os candidatos abaixo.
  - **`og:locale` e `og:site_name`** só são definidos via JavaScript em `src/utils/seo.js:85-86`. O robô do Facebook (`facebookexternalhit`) não executa JS, então essas tags não existem para ele: não estão em `index.html` nem no HTML prerenderizado.
  - **Tags de imagem duplicadas e conflitantes:** no HTML publicado, `og:image:width`, `og:image:height` e `og:image:type` aparecem duas vezes. Nas páginas de poema, o `og:image:type` aparece como `image/png` e depois como `image/jpeg`, mas a imagem é PNG. A causa é o `scripts/prerender.js` (ex.: linhas ~584-586) inserir novas tags `og:image:*` sem remover as que já vêm do `index.html`.
  - **`og:description` com quebras de linha:** nas páginas de poema, a descrição carrega as quebras de linha dos versos dentro do atributo `content`, o que pode ser exibido de forma estranha na prévia.
- **Qual valor será agregado:** Prévias de compartilhamento corretas e sem avisos no Facebook, Instagram, WhatsApp, LinkedIn e em outras plataformas que leem Open Graph. O autor passa a ter acesso a métricas de compartilhamento no Meta for Developers.
- **Para quem é destinado:** O autor (métricas e prévias) e os leitores que compartilham ou recebem links dos poemas.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar um app no Meta for Developers (tipo "Nenhum"/"Outro", sem permissões) vinculado ao domínio `nfgbrentano.art.br` e obter o App ID.
- RF02: Adicionar `<meta property="fb:app_id" content="<APP_ID>" />` ao `<head>` do `index.html`, para que ele seja herdado por todas as páginas prerenderizadas (home, poemas, coleções, sentimentos, sobre e 404).
- RF03: Ler o App ID de uma variável de ambiente pública (`VITE_FB_APP_ID`) documentada em `.env.example`. Se ela não estiver definida, a tag não deve ser emitida (nada de valor vazio).
- RF04: Adicionar ao HTML estático (`index.html`, herdado pelo prerender) `<meta property="og:locale" content="pt_BR" />` e `<meta property="og:site_name" content="Poemas — Natanael Brentano" />`.
- RF05: No `scripts/prerender.js`, substituir as tags `og:image:width`, `og:image:height`, `og:image:type` e `og:image:alt` já existentes, em vez de adicionar novas. Cada página deve ter exatamente uma ocorrência de cada, com `og:image:type` correspondendo ao formato real da imagem (PNG para `/og/poema/*.png`, JPEG para `og-default.jpg`).
- RF06: Normalizar `og:description`, `twitter:description` e `meta description` em uma única linha, trocando quebras de linha por espaço ou por " / " entre versos, e limitar a ~200 caracteres.
- RF07: Manter a paridade na navegação SPA: `src/utils/seo.js` não pode criar tags OG duplicadas e deve atualizar as existentes.

### Requisitos não-funcionais

- RNF01: O App ID é público por natureza (fica no HTML), mas não deve ser escrito à mão em vários arquivos: deve haver uma única fonte.
- RNF02: A tag `fb:app_id` usa `property`, não `name`, conforme a documentação da Meta.
- RNF03: Adicionar um teste vitest que valide no HTML prerenderizado: presença única de `fb:app_id`, `og:locale`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image` e `og:type`; ausência de duplicatas de `og:image:*`; `og:description` sem `\n`.
- RNF04: Nenhuma mudança visual no site.

### Dependências técnicas

- Conta do autor no Meta for Developers para criar o app e obter o App ID. **App ID confirmado pelo autor em 2026-09-24: `1657229069459357`** (público; configurado em `.github/workflows/deploy.yml` e `.env.example`).
- `index.html`, `scripts/prerender.js`, `src/utils/seo.js`, `.env.example` e os secrets do GitHub Actions (`.github/workflows/deploy.yml`) para injetar `VITE_FB_APP_ID` no build.

### Recursos necessários

- Acesso ao Meta for Developers (login do autor, que precisa ser feito pelo próprio autor).
- Acesso aos secrets do repositório no GitHub.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o site publicado, quando analiso `https://nfgbrentano.art.br/` no Sharing Debugger do Facebook, então não aparece mais o aviso de propriedades obrigatórias ausentes.
- [x] **CA02:** Dado qualquer página prerenderizada (home, poema, coleção, sentimento, sobre), quando leio o HTML sem executar JS, então encontro exatamente uma tag `fb:app_id` com o App ID correto.
- [x] **CA03:** Dado o HTML estático de qualquer página, quando o inspeciono, então há `og:locale=pt_BR` e `og:site_name`.
- [x] **CA04:** Dado o HTML de um poema, quando conto as tags `og:image:width`, `og:image:height` e `og:image:type`, então há exatamente uma de cada, e `og:image:type` é `image/png`.
- [x] **CA05:** Dado o HTML de um poema, quando leio `og:description`, então o conteúdo está em uma única linha, sem quebras.
- [x] **CA06:** Dado um build sem `VITE_FB_APP_ID`, quando o HTML é gerado, então a tag `fb:app_id` não é emitida e o build não falha.
- [x] **CA07:** Dado que navego pela SPA entre páginas, quando inspeciono o `<head>`, então não há tags OG duplicadas.

## O que a atividade não inclui

- Integração com o SDK JavaScript do Facebook, login social, pixel de conversão ou botão "Curtir".
- Alteração do design das imagens OG (já tratado em `SDD/2026-09-24_seo-imagem-compartilhamento-og.md`, se houver).
- Criação de página ou perfil do autor no Facebook.
- Envio automatizado de "re-scrape" ao Facebook após o deploy.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | fb:app_id na home | `curl -s https://nfgbrentano.art.br/ \| grep fb:app_id` | Uma ocorrência com o App ID |
| CT02 | fb:app_id no poema | Repetir CT01 em `/poema/com-voce/` | Uma ocorrência |
| CT03 | Sem variável de ambiente | Rodar `npm run build` sem `VITE_FB_APP_ID` | Build ok; sem a tag `fb:app_id` |
| CT04 | Duplicatas de imagem | Contar `og:image:type` em `dist/poema/*/index.html` | 1 por arquivo, `image/png` |
| CT05 | Locale e site name | `grep og:locale` e `grep og:site_name` no `dist` | Presentes em todas as páginas |
| CT06 | Descrição em linha única | Verificar se o `content` de `og:description` tem `\n` | Sem quebras |
| CT07 | Sharing Debugger | Colar a home e um poema no depurador e clicar em "Scrape Again" | Sem avisos obrigatórios; prévia correta |
| CT08 | Outras plataformas | Colar um link de poema no WhatsApp e no LinkedIn Post Inspector | Título, descrição e imagem corretos |

## URL Complementar

- Documentação técnica: [Meta — Webmasters: tags Open Graph](https://developers.facebook.com/docs/sharing/webmasters/), [Meta — criar um app](https://developers.facebook.com/docs/development/create-an-app/), [Protocolo Open Graph](https://ogp.me/)
- Protótipo / mockup: N/A — tags de metadados, sem interface.
- Discussões relacionadas: `SDD/2026-09-24_seo-imagem-compartilhamento-og.md`, `SDD/DONE/2026-09-24_seo-home-h1-canonical-e-conteudo-estatico.md`
- Referências de design: N/A.
- Requisitos originais: [Sharing Debugger — nfgbrentano.art.br](https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fnfgbrentano.art.br%2F), relato do usuário em 2026-09-24: "As duas propriedades obrigatórias a seguir estão ausentes: fb:app_id".
