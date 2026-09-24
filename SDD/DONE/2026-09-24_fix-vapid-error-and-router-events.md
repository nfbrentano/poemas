# [FIX] Correção de Erro VAPID e Múltiplos Fetches

## Detalhes da Atividade
O sistema está lançando um erro não tratado (`Error: Chave pública VAPID não está configurada no ambiente.`) ao tentar interagir com a funcionalidade de notificações (Push Notifications). Esse erro ocorre porque a chave `VITE_VAPID_PUBLIC_KEY` está ausente no ambiente (`.env.local`). Além disso, notou-se no console que as requisições de página (`[Poem] Fetching slug:...`) estão sendo disparadas múltiplas vezes ao clicar em links, o que provavelmente é causado pelo registro duplicado de *event listeners* no roteador.

## Requisitos da Atividade
- **Tratamento do VAPID**: Impedir que o erro de chave VAPID quebre a aplicação ou gere logs severos na tela para o usuário final, e adicionar tratamento para quando a chave não estiver presente (exibindo um aviso amigável e desativando a inscrição).
- **Correção de Eventos do Router**: Garantir que `initRouter()` no `router.js` registre o evento global de clique (para interceptar links `[data-link]`) apenas uma vez, mesmo após recarregamentos via HMR (Hot Module Replacement) ou re-execuções da inicialização.

## Critérios de Aceitação / Entregas
- Dado que o ambiente não possui a `VITE_VAPID_PUBLIC_KEY`, quando o usuário tenta ativar notificações, então um aviso amigável é retornado e o erro não exibe o "overlay" vermelho do Vite.
- Dado que o usuário navega pelo site clicando em múltiplos links, quando ele clica num poema, então o console exibirá `[Poem] Fetching slug` apenas 1 vez por carregamento de página, evitando requisições duplicadas ao banco de dados.

## O que a atividade não inclui
- Gerar ou providenciar a chave VAPID real no Firebase do usuário (isso deve ser feito manualmente no Console do Firebase, em Configurações do Projeto > Cloud Messaging).
- Modificar o Service Worker diretamente.

## Sugestões de casos de teste
1. Clicar em links do sumário para poemas e observar a aba "Network" e "Console" (deve constar apenas 1 fetch por navegação).
2. Sem configurar a chave VAPID no `.env`, clicar em "Ativar Notificações" na seção de Newsletter/Push; o botão deve voltar ao estado normal informando erro de configuração, sem crachar a tela inteira com overlay vermelho.

## URL Complementar
N/A
