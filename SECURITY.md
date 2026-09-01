# Política de Segurança

## Versões Suportadas

| Versão    | Suportada          |
| --------- | ------------------ |
| `main`    | ✅ Sim             |
| Outras    | ❌ Não             |

Apenas a branch `main` (produção) recebe correções de segurança.

## Reportando uma Vulnerabilidade

Se você descobrir uma vulnerabilidade de segurança, **por favor NÃO abra uma Issue pública**.

### Como reportar

1. Envie um e-mail para **nfgbrentano@gmail.com** com:
   - Descrição da vulnerabilidade
   - Passos para reproduzir o problema
   - Impacto potencial
   - Sugestão de correção (se houver)

2. Você receberá uma confirmação de recebimento em até **48 horas**.

3. Trabalharemos com você para entender e resolver o problema antes de qualquer divulgação pública.

### O que esperamos

- **Divulgação responsável**: não divulgue a vulnerabilidade publicamente antes de darmos uma resposta e tempo para correção.
- **Boa fé**: não explore a vulnerabilidade além do necessário para demonstrá-la.
- **Sem danos**: não acesse, modifique ou exclua dados de outros usuários.

### O que você pode esperar de nós

- ✅ Confirmação de recebimento em até 48 horas
- ✅ Avaliação inicial em até 7 dias úteis
- ✅ Atualizações regulares sobre o progresso da correção
- ✅ Crédito pela descoberta (se desejado) após a correção ser aplicada

## Escopo

Esta política cobre vulnerabilidades em:

- Código-fonte do site (frontend e scripts de build)
- Configurações de deploy (GitHub Actions workflows)
- Integrações com serviços externos (Firebase, APIs)

### Fora do escopo

- Vulnerabilidades em serviços de terceiros (Firebase, GitHub Pages, Vite, etc.) — reporte diretamente aos mantenedores desses serviços
- Ataques de engenharia social
- Ataques de negação de serviço (DoS/DDoS)

## Boas Práticas Adotadas

- 🔐 Credenciais armazenadas em GitHub Secrets (nunca no código-fonte)
- 🔒 Regras de segurança do Firestore restritivas (leitura pública apenas para poemas publicados)
- 🛡️ Variáveis de ambiente separadas do código via `.env.local` (incluído no `.gitignore`)
- ✅ Permissões mínimas nos workflows do GitHub Actions
