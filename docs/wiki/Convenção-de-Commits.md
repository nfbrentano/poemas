# 📝 Convenção de Commits

Este projeto segue a especificação [Conventional Commits](https://www.conventionalcommits.org/).

## Formato

```
<tipo>: <descrição breve>

[corpo opcional]

[rodapé opcional]
```

## Tipos

| Tipo | Emoji | Descrição | Exemplo |
|------|-------|-----------|---------|
| `feat` | ✨ | Nova funcionalidade | `feat: adicionar modo leitura imersiva` |
| `fix` | 🐛 | Correção de bug | `fix: corrigir scroll no Safari iOS` |
| `docs` | 📝 | Documentação | `docs: atualizar wiki com nova seção` |
| `style` | 🎨 | Formatação (sem mudança de lógica) | `style: ajustar indentação do CSS` |
| `refactor` | ♻️ | Refatoração | `refactor: extrair lógica de SEO para utils` |
| `test` | 🧪 | Testes | `test: adicionar teste para o router` |
| `chore` | 🔧 | Manutenção geral | `chore: atualizar versão do Vite` |
| `perf` | ⚡ | Performance | `perf: lazy load do Firebase Auth` |
| `ci` | 🔄 | CI/CD | `ci: corrigir versão do Node no deploy` |

## Regras

1. **Descrição em minúsculas** — Não inicie com letra maiúscula
2. **Sem ponto final** — A descrição não termina com `.`
3. **Imperativo** — Use "adicionar" em vez de "adicionado" ou "adiciona"
4. **Breve** — Máximo 72 caracteres na primeira linha
5. **Idioma** — Descrição em português

## Exemplos

```
feat: adicionar busca por tags na home

A busca agora suporta filtro por tags usando chips
interativos. O estado dos filtros é preservado na URL
via query params.
```

```
fix: corrigir carregamento de poemas no Safari

O Safari não suporta View Transitions API. Adicionado
fallback com renderização direta sem animação.

Closes #42
```

```
chore: atualizar dependências de segurança

npm audit fix aplicado. Nenhuma breaking change.
```
