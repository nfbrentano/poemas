# Contribuindo para Poemas de Natanael

Obrigado pelo interesse em contribuir! 🪶 Este guia vai te ajudar a entender como participar do projeto.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)
- [Configurando o Ambiente](#configurando-o-ambiente)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Estilo de Código](#estilo-de-código)
- [Commits](#commits)

## Código de Conduta

Este projeto adota o [Código de Conduta do Contribuidor](CODE_OF_CONDUCT.md). Ao participar, espera-se que você siga este código. Reporte comportamentos inaceitáveis para **nfgbrentano@gmail.com**.

## Como Posso Contribuir?

### 🐛 Reportando Bugs

Antes de criar um bug report:

1. Verifique se o problema já não foi reportado nas [Issues existentes](https://github.com/nfbrentano/poemas/issues)
2. Verifique se o problema persiste na versão mais recente

Ao reportar um bug, inclua:

- **Descrição clara** do problema
- **Passos para reproduzir** o comportamento
- **Comportamento esperado** vs. o que realmente acontece
- **Screenshots** se aplicável
- **Ambiente**: navegador, sistema operacional, versão do Node.js

### 💡 Sugerindo Melhorias

Adoramos sugestões! Abra uma [Issue](https://github.com/nfbrentano/poemas/issues/new) descrevendo:

- O problema que a melhoria resolve
- Como você imagina a solução
- Alternativas que você considerou

### 📝 Contribuindo com Conteúdo

> **Nota importante:** Os poemas publicados neste site são obras autorais de Natanael Brentano e estão protegidos sob licença CC BY-NC-ND 4.0. Contribuições de conteúdo poético não são aceitas — apenas contribuições técnicas ao código e à infraestrutura.

## Configurando o Ambiente

1. **Fork** o repositório
2. **Clone** seu fork:

   ```bash
   git clone https://github.com/SEU-USUARIO/poemas.git
   cd poemas
   ```

3. **Instale as dependências**:

   ```bash
   npm install
   ```

4. **Configure as variáveis de ambiente** — crie `.env.local` com suas credenciais Firebase (veja o [README](README.md#variáveis-de-ambiente))

5. **Rode o servidor de desenvolvimento**:

   ```bash
   npm run dev
   ```

## Fluxo de Trabalho

1. Crie uma branch a partir da `main`:

   ```bash
   git checkout -b feature/minha-contribuicao
   ```

2. Faça suas alterações seguindo o [estilo de código](#estilo-de-código)

3. Rode os testes:

   ```bash
   npm run test
   ```

4. Commit suas alterações (veja [Commits](#commits))

5. Push para seu fork:

   ```bash
   git push origin feature/minha-contribuicao
   ```

6. Abra um **Pull Request** para a branch `main` do repositório original

## Estilo de Código

- **JavaScript**: Vanilla JS (ES Modules). Sem frameworks.
- **CSS**: Vanilla CSS. Sem pré-processadores.
- **HTML**: Semântico e acessível.
- **Nomes de variáveis e funções**: em inglês, descritivos e em camelCase.
- **Comentários**: em português quando explicam lógica de negócio; em inglês para comentários técnicos genéricos.
- **Sem dependências desnecessárias**: avalie se a funcionalidade pode ser implementada nativamente antes de adicionar um pacote.

## Commits

Use mensagens de commit claras e descritivas:

```
tipo: descrição breve

Corpo opcional com mais detalhes sobre a mudança.
```

### Tipos de commit

| Tipo       | Descrição                                          |
| ---------- | -------------------------------------------------- |
| `feat`     | Nova funcionalidade                                |
| `fix`      | Correção de bug                                    |
| `docs`     | Alteração na documentação                          |
| `style`    | Formatação, sem mudança de lógica                  |
| `refactor` | Refatoração de código sem mudança de comportamento |
| `test`     | Adição ou correção de testes                       |
| `chore`    | Manutenção geral (build, CI, etc.)                 |

### Exemplos

```
feat: adicionar modo escuro na página de leitura
fix: corrigir carregamento de poemas no Safari
docs: atualizar instruções de deploy no README
```

## 🙏 Obrigado!

Toda contribuição — grande ou pequena — é valorizada. Obrigado por dedicar seu tempo para melhorar este projeto!
