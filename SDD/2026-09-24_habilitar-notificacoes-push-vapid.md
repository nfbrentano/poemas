# [DOC] Instruções para Habilitar Notificações Push (VAPID)

## Detalhes da Atividade

- **O que precisa ser feito:** Documentar o processo correto de obtenção e configuração da chave pública VAPID no ambiente do projeto para ativar o sistema de Push Notifications.
- **Por que é necessário:** O projeto estava emitindo um erro no console pela ausência da variável de ambiente `VITE_VAPID_PUBLIC_KEY`. Sem esta chave, os usuários não conseguem se inscrever para receber avisos de novos poemas.
- **Qual valor será agregado:** Facilita o processo para que o desenvolvedor responsável ative de fato o sistema de Push no futuro sem esquecer dos passos no painel do Firebase.
- **Para quem é destinado:** Desenvolvedores e mantenedores do projeto.

## Requisitos da Atividade

### Requisitos funcionais

N/A - Esta atividade é puramente documental, não altera código no repositório.

### Requisitos não-funcionais

N/A

### Dependências técnicas

- Acesso ao painel do Firebase Console (Projeto: poemas-natanael) com permissões de administrador para gerar Web Push Certificates.

### Recursos necessários

- Arquivo `.env.local`

## Critérios de Aceitação / Entregas

- [ ] **CA01:** Dado que o desenvolvedor tenha lido as instruções, quando ele gerar a key pair no console do Firebase e colocar em `.env.local`, então o sistema de notificações deverá poder ser ativado na interface do usuário sem apresentar erro de VAPID não configurado.

## O que a atividade não inclui

- Implementação do Service Worker de Push (já está presente no código, pendente apenas a configuração da chave).
- Geração real das chaves pela equipe técnica nesta tarefa.

## Sugestões de casos de teste

| # | Cenário | Passos | Resultado esperado |
|---|---------|--------|--------------------|
| CT01 | Habilitar Notificações na interface local | 1. Entrar em Firebase Console > Configurações do Projeto > Cloud Messaging.<br>2. Na aba "Web Push certificates", clicar em "Generate key pair".<br>3. Copiar a chave pública e adicionar no arquivo local (`.env.local`) como `VITE_VAPID_PUBLIC_KEY="SUA-CHAVE-AQUI"`.<br>4. Recarregar o ambiente (`npm run dev`).<br>5. Clicar em "Ativar Notificações" na seção correspondente na página de um poema. | O alerta vermelho não deve aparecer e as notificações deverão ser ativadas localmente, permitindo receber pushes via Firebase. |

## URL Complementar

N/A
