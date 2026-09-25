# [FEAT] {GEO} Gerar `llms.txt` e `llms-full.txt` no build

## Detalhes da Atividade

- **O que precisa ser feito:** Gerar automaticamente, no `npm run build`, os arquivos `/llms.txt` (índice do site em Markdown para LLMs) e `/llms-full.txt` (acervo completo de poemas em Markdown), a partir dos mesmos dados do Firestore que já alimentam o sitemap, o RSS e o prerender.
- **Por que é necessário:**
  - Não existe `llms.txt` em `public/` nem no build. Ele é a convenção emergente (llmstxt.org) para oferecer aos LLMs um resumo limpo do site: quem é o autor, o que o site contém e onde está cada conteúdo, sem precisar interpretar HTML, CSS e JS.
  - As páginas do poema carregam muito markup de interface (reações, compartilhamento, comentários, newsletter). Um arquivo textual limpo reduz ruído e aumenta a chance de citação correta (título + autor + URL).
- **Qual valor será agregado:** Os assistentes de IA passam a entender a estrutura do site (autor → coleções → poemas → sentimentos) e a citar os poemas com atribuição e link corretos.
- **Para quem é destinado:** Agentes e motores de busca de IA e, indiretamente, os leitores que chegam por eles.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Criar `scripts/generate-llms.js`, executado no `build` após `sitemap` e `rss` (ex.: `npm run llms`), que grava `dist/llms.txt` e `dist/llms-full.txt`.
- RF02: `llms.txt` no formato llmstxt.org:
  - `# Poemas — Natanael Brentano`
  - bloco `>` com um resumo de 1 a 2 frases: poesia brasileira contemporânea, em português, autor Natanael Fernando Gatti Brentano, quantidade de poemas publicados;
  - parágrafo curto sobre o autor, com link para `/sobre/`;
  - seção `## Coleções`, com `- [Nome](url): descrição` para cada coleção;
  - seção `## Sentimentos`, com links para `/sentimento/<slug>/` quando existirem (ver `2026-09-24_seo-paginas-de-sentimentos.md`); até lá, omitir a seção;
  - seção `## Poemas`, com `- [Título](url): primeira linha ou resumo` para todos os poemas **publicados**, do mais recente para o mais antigo;
  - seção `## Optional`, com links para `/feed.xml`, `/sitemap.xml` e `/llms-full.txt`.
- RF03: `llms-full.txt` com, para cada poema publicado: `## Título`, linha de metadados (URL canônica, data de publicação, coleções e sentimentos) e o texto do poema em Markdown, com estrofes separadas por linha em branco e versos preservados (quebra de linha com dois espaços ou `\` ao final).
- RF04: Incluir no topo de ambos os arquivos uma linha de atribuição/licença, por exemplo: "© Natanael Brentano. Citações permitidas com crédito e link para a URL do poema." O texto final é definido pelo autor.
- RF05: Excluir rascunhos e poemas não publicados, com o mesmo filtro usado em `scripts/generate-sitemap.js` e `scripts/prerender.js`.
- RF06: Adicionar `<link rel="alternate" type="text/markdown" href="/llms.txt" title="llms.txt">` no `<head>` do `index.html`.

### Requisitos não-funcionais

- RNF01: Reutilizar os utilitários existentes (`src/utils/text-format.js`, `stripHtml`, `ensureTrailingSlash`, `sitemap-builder.js`) em vez de duplicar a conversão de HTML para texto.
- RNF02: Todas as URLs devem ser absolutas, canônicas e com barra final (conforme `2026-09-24_seo-urls-canonicas-barra-final.md`).
- RNF03: Arquivos em UTF-8 com `\n` e tamanho do `llms.txt` abaixo de ~100 KB. Se o acervo crescer, resumir as descrições.
- RNF04: Se o Firestore falhar, o build não pode quebrar: registrar um aviso e gerar pelo menos o cabeçalho e as seções estáticas.
- RNF05: Testes vitest para o gerador (formato, exclusão de rascunhos, preservação de versos).

### Dependências técnicas

- Acesso ao Firestore no build (as mesmas credenciais de `generate-sitemap.js` / `prerender.js`).
- Opcional: páginas de sentimento (`2026-09-24_seo-paginas-de-sentimentos.md`) para a seção `## Sentimentos`.

### Recursos necessários

- `.env.local` com as credenciais do Firebase para o build local.
- Texto de licença/atribuição aprovado pelo autor.

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado o site publicado, quando acesso `https://nfgbrentano.art.br/llms.txt`, então recebo um Markdown com título, resumo, seção de autor, coleções e lista de poemas com links.
- [ ] **CA02:** Dado um poema em rascunho, quando o build roda, então ele não aparece em `llms.txt` nem em `llms-full.txt`.
- [ ] **CA03:** Dado um poema com várias estrofes, quando leio seu trecho em `llms-full.txt`, então os versos e as estrofes estão preservados, sem tags HTML.
- [ ] **CA04:** Dado um poema novo publicado, quando o próximo deploy termina, então ele aparece no topo da seção `## Poemas`.
- [ ] **CA05:** Dado o `<head>` da home, quando inspeciono, então há um `link rel="alternate"` apontando para `/llms.txt`.
- [ ] **CA06:** Dado que o Firestore está indisponível no build, quando `npm run build` roda, então o build conclui com um aviso e os arquivos contêm pelo menos as seções estáticas.

## O que a atividade não inclui

- Versões `.md` individuais por página (ex.: `/poema/<slug>/index.md`). Pode ser uma evolução futura.
- Alterações no `robots.txt` (tarefa `2026-09-24_geo-robots-crawlers-de-ia.md`).
- Tradução do conteúdo para outros idiomas.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Estrutura | Rodar o gerador com um mock de 3 poemas e 2 coleções | H1, blockquote e as seções `## Coleções`, `## Poemas` e `## Optional` presentes |
| CT02 | Rascunhos | Mock com um poema `status: draft` | Ausente dos dois arquivos |
| CT03 | Versos | Poema com `<p>verso<br>verso</p><p>…</p>` | Versos em linhas separadas e estrofes separadas por linha em branco |
| CT04 | URLs | Verificar todos os links | Absolutos, `https://nfgbrentano.art.br/…/` com barra final |
| CT05 | Falha do Firestore | Simular erro na busca | Build conclui; aviso no console |
| CT06 | Validação externa | Conferir `llms.txt` publicado contra o formato de llmstxt.org | Formato válido |

## URL Complementar

- Documentação técnica: [llmstxt.org — especificação](https://llmstxt.org/)
- Protótipo / mockup: N/A — arquivo gerado, sem interface.
- Discussões relacionadas: `SDD/DONE/2026-09-24_seo-sitemap-e-rss.md`, `SDD/2026-09-24_seo-paginas-de-sentimentos.md`, `SDD/2026-09-24_geo-robots-crawlers-de-ia.md`
- Referências de design: N/A — sem interface.
- Requisitos originais: relatório de auditoria em 2026-09-24 sobre Otimização de Motores Gerativos (GEO).
