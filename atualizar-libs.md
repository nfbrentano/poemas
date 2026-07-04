# Atualização de Bibliotecas (npm)

Nenhuma biblioteca do projeto foi explicitamente marcada como **depreciada** (deprecated) no registro do NPM. No entanto, algumas dependências estão **desatualizadas** em relação às suas versões mais recentes.

## Bibliotecas Desatualizadas

Aqui está o resumo das dependências que podem ser atualizadas:

| Pacote | Versão Atual | Versão Desejada (Wanted) | Última Versão (Latest) | Tipo |
| :--- | :--- | :--- | :--- | :--- |
| `@zumer/snapdom` | `2.12.9` | `2.15.0` | `2.15.0` | Dependency |
| `fast-xml-parser` | `5.7.1` | `5.9.3` | `5.9.3` | DevDependency |
| `resend` | `6.16.0` | `6.17.1` | `6.17.1` | Dependency |
| `vite` | `8.1.2` | `8.1.3` | `8.1.3` | DevDependency |

## Como Atualizar

Para atualizar as bibliotecas para a versão recomendada (que respeita o controle de versão semântico do seu `package.json`), você pode simplesmente rodar o comando abaixo no terminal na raiz do projeto:

```bash
npm update
```

Isso modificará seu arquivo `package-lock.json` para refletir as versões atualizadas.

### Atualizar para as Versões Mais Recentes ("Latest")

Como não há atualizações do tipo "Major" (que alteram o primeiro número da versão), é seguro forçar a atualização de todas para a versão mais recente (`latest`). Para isso, você pode utilizar o comando:

```bash
npm install @zumer/snapdom@latest resend@latest
npm install -D fast-xml-parser@latest vite@latest
```

### Validação Pós-Atualização

Sempre que atualizar as bibliotecas, é recomendado rodar um build ou testes locais para garantir que a aplicação não quebrou:

```bash
npm run build
npm run test
```
