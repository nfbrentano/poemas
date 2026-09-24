# [FIX] Limpeza de URLs Obsoletas do Supabase e Fallback Resiliente de Imagens de Coleções

## Detalhes da Atividade

- **O que precisa ser feito:** 
  1. Remover referências a URLs residuais do projeto desativado do Supabase (`ejorjxvjglkkxnusdrzl.supabase.co`) no banco de dados Firestore (especificamente nos documentos de `collections` e `poems`).
  2. Implementar tratamento de erro (`onerror`) nas imagens de capa de coleções no frontend ([src/pages/collections.js](src/pages/collections.js)), garantindo que caso qualquer imagem falhe ao carregar (seja por DNS, 404 ou rede), ela faça fallback gracioso para o componente de placeholder visual.
- **Por que é necessário:** O domínio antigo do Supabase não existe mais, causando erros de console `net::ERR_NAME_NOT_RESOLVED` e potenciais quebras de exibição visual para os usuários.
- **Qual valor será agregado:** Eliminação de erros de console, melhoria na resiliência da interface e experiência do usuário polida e sem elementos quebrados.
- **Para quem é destinado:** Leitores e visitantes do site explorando coleções e poemas, bem como a integridade da administração do site.

## Requisitos da Atividade

### Requisitos funcionais

- RF01: Limpar as URLs obsoletas do Supabase no Firestore (`collections` com `image_url` apontando para `supabase.co` definidas para `null`; poema com `audio_url` apontando para `supabase.co` definido para `null`).
- RF02: No frontend de coleções ([src/pages/collections.js](src/pages/collections.js)), quando uma imagem de capa falhar ao carregar, o elemento `img` deve ser substituído graciosamente pelo elemento placeholder `<div class="collection-img-placeholder"></div>`.

### Requisitos não-funcionais

- RNF01: Nenhuma requisição desnecessária para domínios inexistentes deve ser disparada após a limpeza.
- RNF02: O fallback no frontend deve ser imperceptível e manter o layout estável, sem layout shift abrupto.

### Dependências técnicas

- Firebase Admin / Firebase Firestore SDK (configuração existente em `.env` / `.env.local`).

### Recursos necessários

- Script Node.js de migração/limpeza no Firestore.

## Critérios de Aceitação / Entregas

- [x] **CA01:** Dado que existem coleções com `image_url` apontando para o domínio desativado do Supabase, quando o script de sanitização for executado, então os campos `image_url` dessas coleções devem ser atualizados para `null`.
- [x] **CA02:** Dado que existe um poema com `audio_url` apontando para o domínio desativado do Supabase, quando o script de sanitização for executado, então o campo `audio_url` desse poema deve ser atualizado para `null`.
- [x] **CA03:** Dado que uma imagem de coleção tenha uma URL inacessível, quando o navegador falhar no carregamento da imagem, então o evento de erro deve substituir a imagem pelo placeholder padrão da coleção sem gerar quebra de layout.

## O que a atividade não inclui

- Alteração da lógica de novos uploads de capa no painel administrativo (já utilizam Firebase Storage).
- Recriação ou reenvio dos arquivos originais de imagem/áudio perdidos (podem ser reenviados pelo admin posteriormente).

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Limpeza do Firestore | Executar script de limpeza e inspecionar documentos no Firestore | Nenhum documento em `collections` ou `poems` contém referência a `supabase.co` |
| CT02 | Fallback de imagem com erro | Fornecer uma URL inválida para capa de coleção na renderização de `collections.js` | Imagem com erro é ocultada e substituída pelo placeholder padrão |
| CT03 | Navegação na página de Coleções | Acessar `/colecoes` no navegador | Nenhuma mensagem de erro `net::ERR_NAME_NOT_RESOLVED` referente a `ejorjxvjglkkxnusdrzl.supabase.co` |

## URL Complementar

- Documentação técnica: N/A - Manutenção interna pós-migração Firebase
- Protótipo / mockup: N/A
- Discussões relacionadas: Erros de console reportados com `ERR_NAME_NOT_RESOLVED`
- Referências de design: Layout existente de cards de coleção em `src/styles/`
- Requisitos originais: Solicitação do usuário para corrigir erro de console
