# [FEAT] {SEO} Otimizações Avançadas de SEO e GEO (Citação por IA, Meta Tags Acadêmicas e Schema Multimodal)

> **Status:** Concluída
> **Autor:** Antigravity · **Revisor:** Natanael Fernando Gatti Brentano · **Criada em:** 2026-10-22 · **Atualizada em:** 2026-10-22

## Detalhes da Atividade

- **O que precisa ser feito:** 
  1. Implementar meta tags de citação acadêmica Highwire/Google Scholar (`citation_title`, `citation_author`, `citation_publication_date`, `citation_online_date`, `citation_fulltext_html_url`, `citation_language`) nas páginas de poemas pré-renderizadas e na função de SEO em tempo de execução (`seo.js` e `prerender.js`).
  2. Adicionar componente semântico de citação ("Como citar este poema" em padrão ABNT com botão de cópia de citação) na ficha técnica de cada poema (`poem-template.js`).
  3. Expandir o schema JSON-LD de poemas (`poemSchema` em `structured-data.js`) com:
     - `audio`: entidade `AudioObject` quando houver `audio_url`, incluindo formato MIME e URL do arquivo.
     - `speakable`: `SpeakableSpecification` apontando para o título e o corpo do poema, habilitando otimização para assistentes de voz e leitura de IA.
     - `isAccessibleForFree`: `true`.
     - `copyrightNotice`: `'© Natanael Fernando Gatti Brentano'`.
  4. Adicionar meta tags `article:modified_time` no Open Graph quando o poema tiver sido editado (`updated_at`), e tag `<link rel="alternate" type="text/markdown" href="/llms-full.txt" title="llms-full.txt" />` no `<head>` do `index.html`.
  5. Enriquecer o schema `personSchema` com perfis adicionais em `sameAs` (ex.: GitHub `https://github.com/nfbrentano`).

- **Problema e evidência:** 
  - Modelos generativos (ChatGPT Search, Perplexity, Claude, Google AI Overviews) e agregadores acadêmicos/literários extraem citações preferencialmente de tags `citation_*` e blocos estruturados de citação. Hoje, o site fornece apenas Open Graph básico e schema `Poem`, sem tags de citação direta.
  - Obras que possuem narração em áudio não declaram o áudio no grafo semântico Schema.org (`AudioObject`), impedindo indexação de áudio no Google e descoberta multimodal por IAs.
  - O leitor ou pesquisador que deseja citar um poema precisa formatar manualmente a referência bibliográfica.

- **Impacto de não fazer:** 
  - Menor taxa de citação e perda de atribuição correta de autoria em respostas geradas por IA.
  - Subaproveitamento das narrações de áudio para descoberta em buscas de voz e busca multimodal.
  - Lacunas nas meta tags de modificação (`article:modified_time`) que afetam a sinalização de frescor de conteúdo para o Googlebot.

- **Para quem é destinado:** 
  - Usuários, estudantes, pesquisadores e leitores que desejam citar as obras.
  - Motores de busca tradicionais (Googlebot, Bingbot).
  - Motores de busca por IA e agentes conversacionais (Perplexity, ChatGPT, Claude, Copilot, Google AI Overviews).

- **História de usuário:** 
  - Como pesquisador ou leitor, quero visualizar e copiar a citação formatada do poema em padrão ABNT com um clique, para referenciar a obra corretamente em trabalhos e publicações.
  - Como autor, quero que motores de busca e IAs generativas indexem metadados precisos de citação, autoria e narração em áudio, para que as respostas de IA atribuam a autoria fidedignamente com links diretos para a obra original.

- **Como saberemos que deu certo:** 
  - 100% das páginas de poemas pré-renderizadas contêm as tags `citation_*` e o bloco HTML "Como citar".
  - O validador de Schema (Google Rich Results / Schema Validator) reconhece `AudioObject` e `SpeakableSpecification` nos poemas com áudio.
  - Suíte de testes automatizados do Vitest cobre todos os novos critérios com 0 falhas.

## Requisitos da Atividade

### Requisitos funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RF01 | Injetar tags meta `citation_*` nas páginas de poemas no pré-render (`scripts/prerender.js`) e dinamicamente em `src/utils/seo.js` | P0 | CA01, CA02 |
| RF02 | Adicionar seção semântica "Como citar esta obra" (ABNT) com botão de cópia na visualização de cada poema em `src/utils/poem-template.js` | P0 | CA03, CA04 |
| RF03 | Expandir `poemSchema` em `src/utils/structured-data.js` com `AudioObject` (se houver áudio), `SpeakableSpecification`, `isAccessibleForFree` e `copyrightNotice` | P0 | CA05, CA06 |
| RF04 | Emitir `article:modified_time` no Open Graph para poemas quando `updated_at` existir | P1 | CA07 |
| RF05 | Adicionar tag `<link rel="alternate" type="text/markdown" href="/llms-full.txt" title="llms-full.txt" />` no `index.html` e `scripts/prerender.js` | P1 | CA08 |
| RF06 | Adicionar link do GitHub do autor ao array `sameAs` em `personSchema` | P1 | CA09 |

### Requisitos não-funcionais

| ID | Descrição | Prioridade | CAs |
|----|-----------|------------|-----|
| RNF01 | Não degradar a performance de carregamento (LCP/CLS) das páginas de poemas | P0 | CA03 |
| RNF02 | O botão de cópia de citação deve funcionar via `navigator.clipboard` com feedback visual imediato e acessível | P0 | CA04 |
| RNF03 | Todos os testes unitários e de integração existentes e novos devem passar com sucesso (`vitest run`) | P0 | CA10 |

### Dependências técnicas

- Arquivos `src/utils/seo.js`, `src/utils/structured-data.js`, `src/utils/poem-template.js`, `scripts/prerender.js`, `index.html`.
- Suíte de testes `vitest`.

### Recursos necessários

- Acesso ao repositório local e permissão de build.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que uma página de poema é pré-renderizada ou renderizada dinamicamente, quando o HTML é gerado, então o `<head>` contém `<meta name="citation_title">`, `<meta name="citation_author" content="Brentano, Natanael Fernando Gatti">`, `<meta name="citation_publication_date">`, `<meta name="citation_fulltext_html_url">` e `<meta name="citation_language" content="pt">`.
- [x] **CA02:** Dado que um poema possui data de modificação (`updated_at`), quando a página é gerada, então o `<head>` contém `<meta name="citation_online_date">` com a data formatada em `AAAA/MM/DD`.
- [x] **CA03:** Dado que um visitante acessa a página de um poema, quando rola até a ficha técnica da obra, então visualiza uma seção "Como citar" contendo a referência no formato: `BRENTANO, Natanael Fernando Gatti. [Título]. In: Poemas Brasileiros, [Ano]. Disponível em: <[URL]>. Acesso em: [Data de Acesso].`.
- [x] **CA04:** Dado que o usuário clica no botão "Copiar citação", quando a ação é disparada, então o texto da citação é copiado para a área de transferência e o botão exibe o estado "Copiado!" por 2 a 3 segundos.
- [x] **CA05:** Dado que um poema possui `audio_url` cadastrado, quando o schema JSON-LD é gerado via `poemSchema`, então o objeto inclui a propriedade `audio` do tipo `AudioObject` com `contentUrl`, `encodingFormat` apropriado e `name`.
- [x] **CA06:** Dado que qualquer poema publicado tem seu schema JSON-LD gerado, quando `poemSchema` é chamado, então o schema inclui `speakable` com `SpeakableSpecification` apontando para os seletores CSS `#poem-text` e `.single-poem header h1`.
- [x] **CA07:** Dado que um poema possui campo `updated_at`, quando o Open Graph é renderizado, então o `<head>` inclui `<meta property="article:modified_time" content="...">`.
- [x] **CA08:** Dado que o documento HTML raiz ou pré-renderizado é inspecionado, quando o `<head>` é avaliado, então inclui `<link rel="alternate" type="text/markdown" href="/llms-full.txt" title="llms-full.txt" />` além do link existente para `llms.txt`.
- [x] **CA09:** Dado que o schema `personSchema` é gerado, quando inspecionado o campo `sameAs`, então contém tanto o link do Instagram quanto o link do perfil do GitHub (`https://github.com/nfbrentano`).
- [x] **CA10:** Dado que as modificações são implementadas, quando o comando `vitest run` é executado, então todos os testes (existentes e novos) passam com 100% de sucesso.

## O que a atividade não inclui

- Alteração no algoritmo de geração de imagens Open Graph (`scripts/generate-og-images.js`): motivo: já está funcionando e otimizado com Satori e fontes locais.
- Mudança no formato de URLs ou redirecionamento de slugs: motivo: slugs canônicos atuais já estão consolidados e indexados.
- Integração com APIs externas de citação paga: motivo: desnecessário, a formatação padrão ABNT pura em JavaScript atende 100% aos requisitos de citação acadêmica e GEO.

### Considerado para o futuro (P2)

- Suporte a exportação de citação em formato BibTeX / RIS para softwares como Zotero e Mendeley.
- Schema `BreadcrumbList` com hierarquia de categorias enriquecidas por ontologias externas (Wikidata Q5185279 para Poesia).

## Dúvidas em aberto

| # | Dúvida | Responsável (PO/dev/design) | Bloqueante? | Resposta |
|---|--------|-----------------------------|-------------|----------|
| D01 | O formato padrão de citação deve ser estritamente ABNT ou ter alternância para APA/MLA? | dev | Não | O formato padrão adotado será ABNT (referência no Brasil), com texto limpo facilmente compreensível por IAs e pesquisadores. |

## Sugestões de casos de teste

| # | Cenário | Tipo (unit/integração/e2e/manual) | Cobre | Passos | Resultado esperado |
|---|---------|-----------------------------------|-------|--------|--------------------|
| CT01 | Geração de tags de citação no `seo.js` | unit | CA01, CA02 | Chamar `updateSEO` com dados de poema e inspecionar tags `citation_*` no DOM | Tags `citation_title`, `citation_author`, `citation_publication_date`, `citation_fulltext_html_url` e `citation_language` presentes |
| CT02 | Geração de tags de citação no pré-render | integração | CA01, CA02 | Executar função de pré-render para poema de teste e inspecionar HTML retornado | Tags `citation_*` devidamente injetadas no `<head>` estático |
| CT03 | Markup da seção de citação no poema | unit | CA03 | Chamar `renderPoemMarkup` com dados de poema | Contém container com classe de citação e texto em padrão ABNT |
| CT04 | Schema JSON-LD com `AudioObject` | unit | CA05 | Chamar `poemSchema` com poema contendo `audio_url` | Schema contém propriedade `audio` com `@type: "AudioObject"` e `contentUrl` |
| CT05 | Schema JSON-LD com `SpeakableSpecification` | unit | CA06 | Chamar `poemSchema` para qualquer poema | Schema contém propriedade `speakable` com seletores corretos |
| CT06 | Meta tag `article:modified_time` | unit | CA07 | Chamar `updateSEO` com `updated_at` fornecido | Meta tag `article:modified_time` injetada com timestamp ISO correto |
| CT07 | Link para `llms-full.txt` no HTML | unit | CA08 | Verificar arquivo `index.html` e saída do pré-render | `<link rel="alternate" type="text/markdown" href="/llms-full.txt" ...>` presente |
| CT08 | `personSchema` com GitHub em `sameAs` | unit | CA09 | Chamar `personSchema()` e inspecionar `sameAs` | Array contém `https://github.com/nfbrentano` |

## URL Complementar

- Documentação técnica:
  - Google Scholar Inclusion Guidelines (Citation Meta Tags): https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
  - Schema.org AudioObject: https://schema.org/AudioObject
  - Schema.org SpeakableSpecification: https://schema.org/SpeakableSpecification
  - llmstxt.org Specification: https://llmstxt.org/
- Protótipo / mockup: N/A — melhoria semântica e estrutural.
- Discussões relacionadas: N/A.
- Referências de design: N/A.
- Requisitos originais: Solicitação do usuário para avaliar SEO e GEO e criar SDD de melhorias.
- Issue / PR relacionado: N/A.
