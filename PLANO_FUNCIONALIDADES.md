# Plano de Funcionalidades – Site Poemas

## Visão Geral
Este documento propõe um conjunto de funcionalidades e melhorias estruturadas para o projeto **Poemas**, com foco em:
- Experiência do usuário (UX) premium
- Desempenho e SEO avançados
- Robustez da camada backend (Supabase)
- Escalabilidade e manutenção a longo prazo

A proposta está organizada em categorias, priorização e um roadmap sugerido.

---

## Estado Atual (Resumo rápido)
| Camada | Tecnologias | Status |
|--------|-------------|--------|
| Frontend | Vanilla JS + Vite | ✅ Sólido, modularizado |
| Backend | Supabase (DB, Auth, Edge Functions) | ✅ Sólido |
| PWA | Service Worker + Manifest | ✅ Funcional |
| SEO | Meta tags, JSON‑LD, Sitemap, RSS, OG dinâmico | ✅ Premium |
| Analytics | Custom page_views + geo‑IP | ✅ Funcional |
| Testes | Vitest (alguns testes) | ⚠️ Parcial |
| CI/CD | GitHub Actions (build & deploy) | ⚠️ Falhas históricas (esbuild) |

---

## Funcionalidades Sugeridas
### 1. Experiência do Usuário (UX) & UI
- **Modo Escuro automático**: Detectar preferência do sistema e permitir toggle manual. (Alta prioridade)
- **Animações de entrada avançadas** (staggered já implementado) → expandir para transições de página completa usando `page‑transition API`.
- **Pesquisa Full‑Text**: Integrar Supabase `fts` para busca instantânea de poemas.
- **Filtro avançado por tags & coleções**: UI de filtro múltiplo com chips selecionáveis.
- **Pré‑visualização de OG Image** no editor admin, permitindo ajustes antes de publicar.
- **Modo Leitura Imersiva**: Tela cheia, fonte ajustável, controle de leitura automática.
- **Notificações Push** via Web‑Push API para novos poemas ou newsletters.

### 2. Desempenho & SEO
- **Lazy‑load de imagens** com `IntersectionObserver` + `srcset` para diferentes resoluções.
- **Pre‑rendering de rotas críticas** usando Vite SSR ou `vite-plugin-ssg` para melhorar First Contentful Paint.
- **Auditoria Lighthouse** e otimização de **CLS** (Cumulative Layout Shift).
- **Atualizar Sitemap** dinamicamente no build e submeter ao Google Search Console.
- **Implementar Brotli/Gzip** nos assets estáticos (via GitHub Pages ou Cloudflare).

### 3. PWA & Offline
- **Cache versionamento**: Incrementar `CACHE_NAME` automaticamente no CI quando houver mudanças.
- **Background Sync** para envios de comentários/assinaturas realizadas offline.
- **Estratégia Cache‑First para assets estáticos** + Network‑First para API.
- **Adicionar página de “offline”** customizada com branding premium.

### 4. Backend (Supabase)
- **Webhook de eventos**: Notificar via Discord/Slack quando novos assinantes entram ou churn ocorre.
- **Funções Edge**: 
  - `track_clicks` para analytics de cliques em poemas.
  - `generate_rss` como Edge Function para atualização automática.
- **Política RLS refinada**: Garantir que apenas usuários autenticados vejam comentários moderados.
- **Migração de tabelas**: `audio_url` já presente – pode adicionar `duration` e `transcript` para acessibilidade.
- **Integração com Stripe** para pagamentos de conteúdos premium (p.e., coleções exclusivas).

### 5. Testes & Qualidade
- **Cobertura de testes**: Alcançar > 80 % de cobertura unitária (Vitest) e testes de integração usando `playwright`.
- **Testes de regressão visual** com `@storybook/addon-image` ou `pixelmatch`.
- **Linting avançado** – adição de `eslint-plugin-jsdoc` e regras de acessibilidade (`eslint-plugin-jsx-a11y`).

### 6. CI/CD & Infraestrutura
- **Pipeline robusto**: 
  - Cache de dependências (`actions/cache`).
  - Build multi‑platform (Linux/macOS) para garantir `esbuild`.
  - Deploy automático via `gh-pages` após aprovação.
- **GitHub Actions para testes de segurança** (`npm audit`, Dependabot).
- **Versão de contêiner Docker** para desenvolvimento local isolado.

### 7. Documentação & Onboarding
- **Guia de Contribuição** atualizado (README + CONTRIBUTING.md).
- **Storybook** para componentes UI, facilitando design system.
- **Glossário de termos** (poema, coleção, assinante) para novos colaboradores.

### 8. Acessibilidade (a11y)
- **Auditoria WCAG 2.1** e correções: contrastes, foco visível, ARIA labels.
- **Modo “Leitura de Tela”** com textos alternativos para imagens de capa.
- **Suporte a navegação por teclado** (já tem atalhos, mas garantir foco lógico).

---

## Priorização (Matriz Impacto × Esforço)
| Prioridade | Funcionalidade | Impacto | Esforço |
|-----------|----------------|---------|--------|
| **Alta** | Modo escuro, Busca full‑text, Cache versionamento, Notificações push, Política RLS refinada | Alto | Médio |
| **Média** | Background Sync, Web‑Push UI, Stripe integration, Testes de cobertura >80% | Médio | Médio‑Alto |
| **Baixa** | Storybook, Docs de contribuição, Auditar Lighthouse, Docker dev env | Baixo‑Médio | Baixo |

---

## Roadmap sugerido (Trimestres)
| Trimestre | Metas Principais |
|-----------|------------------|
| **Q2 2026** | Implementar modo escuro, busca full‑text, atualização de cache SW, melhorias de acessibilidade críticas. |
| **Q3 2026** | Notificações push, background sync, RLS avançada, iniciar integração Stripe (piloto). |
| **Q4 2026** | Cobertura de testes >80 %, CI/CD robusto, documentação completa, Storybook. |
| **Q1 2027** | Otimizações de performance (SSR/SSG), auditoria Lighthouse, expansão de conteúdo premium. |

---

## Próximos Passos
1. **Criar issue** para cada funcionalidade de alta prioridade.
2. Definir *milestones* alinhados ao roadmap trimestral.
3. Atualizar README com badges de status (build, coverage, lighthouse). 
4. Revisar políticas de RLS e criar testes de integração para garantir segurança.
5. Agendar review de design system com a equipe para consolidar componentes UI.

---

*Este plano está aberto a revisões e priorizações de acordo com o fluxo de trabalho da equipe.*
