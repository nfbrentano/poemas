# 🎨 Design System

O sistema de design segue a filosofia de **Minimalismo Noturno** — elegante, focado na tipografia e na leitura.

## Paleta de Cores

### Tema Escuro (Padrão)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-primary` | `#050505` | Fundo principal |
| `--bg-secondary` | `#0a0a0a` | Fundo de seções |
| `--bg-elevated` | `#121212` | Cards, elementos elevados |
| `--text-primary` | `#e2e2e2` | Texto principal |
| `--text-secondary` | `#a3a3a3` | Texto auxiliar |
| `--text-muted` | `#8a8a8a` | Texto desabilitado/sutil |
| `--accent-subtle` | `#c5a880` | Cor de destaque (Champagne/Ouro Velho) |
| `--border-subtle` | `#1a1a1a` | Bordas sutis |
| `--border-strong` | `#333333` | Bordas enfáticas |

### Tema Claro

| Token | Valor |
|-------|-------|
| `--bg-primary` | `#fdfdfd` (Off-white livresco) |
| `--text-primary` | `#1a1a1a` |
| `--accent-subtle` | `#7a6441` (Ouro mais contrastado) |

### Tema Sépia

| Token | Valor |
|-------|-------|
| `--bg-primary` | `#f4ecd8` |
| `--text-primary` | `#433422` |
| `--accent-subtle` | `#735610` |

### Alto Contraste

| Token | Valor |
|-------|-------|
| `--bg-primary` | `#000000` |
| `--text-primary` | `#ffffff` |
| `--accent-subtle` | `#ffff00` (Amarelo) |

## Tipografia

| Token | Família | Uso |
|-------|---------|-----|
| `--font-display` | Cormorant Garamond, Georgia, serif | Títulos editoriais |
| `--font-poem` | Merriweather, serif | Corpo dos poemas |
| `--font-ui` | Inter, system-ui, sans-serif | Interface e UI |
| `--font-body` | (herda de `--font-ui`) | Texto geral |

### Tamanhos de Leitura

O usuário pode alternar entre 3 tamanhos de fonte para leitura:

| Classe CSS | Tamanho |
|-----------|---------|
| `.font-reading-sm` | `1rem` (16px) |
| `.font-reading-md` | `clamp(1.05rem, 0.9rem + 0.6vw, 1.3rem)` |
| `.font-reading-lg` | `1.5rem` (24px) |

## Escala de Espaçamento

Escala editorial consistente baseada em múltiplos:

| Token | Valor | Pixels |
|-------|-------|--------|
| `--space-3xs` | `0.25rem` | 4px |
| `--space-2xs` | `0.5rem` | 8px |
| `--space-xs` | `0.75rem` | 12px |
| `--space-sm` | `1rem` | 16px |
| `--space-md` | `1.5rem` | 24px |
| `--space-lg` | `2rem` | 32px |
| `--space-xl` | `3rem` | 48px |
| `--space-2xl` | `4rem` | 64px |
| `--space-3xl` | `6rem` | 96px |
| `--space-4xl` | `8rem` | 128px |

## Layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--container-poetry` | `680px` | Largura ótima para leitura de poesia |
| `--container-main` | `1200px` | Layout principal (home, coleções) |
| `--container-admin` | `1000px` | Painel administrativo |
| `--header-height` | `100px` | Altura do header |

## Transições

| Token | Valor | Uso |
|-------|-------|-----|
| `--transition-fade` | `0.7s cubic-bezier(0.16, 1, 0.3, 1)` | Fade-in de conteúdo |
| `--transition-fast` | `0.2s ease` | Hover, toggles |
| `--transition-theme` | `background-color 0.5s ease, color 0.5s ease, ...` | Troca de tema |

## Alternância de Temas

O tema é salvo em `localStorage` com a chave `site-mode`. No carregamento da página, um script inline no `<head>` aplica o tema **antes** do primeiro render, evitando flash de conteúdo:

```javascript
var saved = localStorage.getItem('site-mode');
var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
var mode = saved || (prefersDark ? 'dark' : 'light');
```

### Temas disponíveis

| Valor em `localStorage` | Atributo no `<html>` |
|------------------------|---------------------|
| `dark` (padrão) | (nenhum) |
| `light` | `data-theme="light"` |
| `sepia` | `data-theme="sepia"` |
| `contrast` | `data-high-contrast="true"` |

## Organização dos Estilos

```
src/styles/
├── variables.css      → Tokens de design (cores, fontes, espaçamento)
├── global.css         → Reset, tipografia base, layouts globais
├── components.css     → Estilos de todos os componentes
└── social-card.css    → Estilos para exportação de imagens (Instagram)
```
