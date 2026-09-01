# 🧩 Sistema de Componentes

Catálogo de todos os componentes UI do projeto. Cada componente é um módulo ES independente em `src/components/`.

## Componentes

### `header.js`
**Navegação principal do site.**

- Logo/título com link para home
- Links de navegação: Poemas, Coleções, Sobre
- Botão de busca (abre o search overlay)
- Toggle de tema (dark/light/sepia)
- Menu mobile responsivo

Métodos: `render()`, `init()`

---

### `search-overlay.js`
**Busca fullscreen com resultados em tempo real.**

- Overlay que cobre toda a tela
- Input com busca por título, conteúdo e tags
- Resultados renderizados como cards clicáveis
- Navegação por teclado (Esc para fechar)
- Debounce para evitar queries excessivas

---

### `theme-toggle.js`
**Alternância entre temas visuais.**

- Suporta 4 modos: Dark, Light, Sépia, Alto Contraste
- Persiste a escolha em `localStorage` (chave: `site-mode`)
- Respeita a preferência do sistema (`prefers-color-scheme`)

---

### `audio-player.js`
**Player de áudio para poemas narrados.**

- Player customizado com controles de play/pause, progresso e volume
- Interface minimalista integrada ao design do site
- Suporte a arquivos armazenados no Firebase Storage

---

### `filter-chips.js`
**Chips de filtro por tag/categoria.**

- Renderiza tags como chips clicáveis
- Suporta seleção múltipla
- Filtra a lista de poemas em tempo real

---

### `newsletter.js`
**Formulário de inscrição na newsletter.**

- Input de e-mail com validação
- Feedback visual (success/error via toast)
- Salva assinante no Firestore (coleção `subscribers`)

---

### `poem-comments.js`
**Seção de comentários em poemas.**

- Exibe comentários existentes
- Formulário para adicionar novos comentários
- Moderação via painel admin

---

### `immersive-reader.js`
**Modo leitura imersiva.**

- Esconde header, footer e elementos de navegação
- Foca 100% no texto do poema
- Toggle para ativar/desativar
- Ideal para leitura concentrada

---

### `back-to-top.js`
**Botão "voltar ao topo".**

- Aparece após scroll de determinada distância
- Animação suave de scroll
- Desaparece quando próximo ao topo

Métodos: `init()`

---

### `push-toggle.js`
**Toggle de notificações push.**

- Ativa/desativa notificações push do browser
- Integração com Service Worker
- Feedback visual do estado atual

---

### `toast.js`
**Notificações toast.**

- Mensagens temporárias (success, error, info)
- Aparece no canto da tela
- Auto-dismiss após timeout

---

## Padrão de Componentes

Todos os componentes seguem um padrão consistente:

```javascript
// Componente com lifecycle
export default {
  render(container, params) {
    // Renderiza o HTML no container
    container.innerHTML = `...`;
    // Setup de event listeners
  },
  cleanup() {
    // Remove event listeners
    // Limpa timers/intervals
  },
  meta: {
    title: 'Título da Página' // Usado pelo router para <title>
  }
};
```

```javascript
// Componente global (header, back-to-top)
export const component = {
  render() {
    return `<html string>`;
  },
  init() {
    // Setup após o DOM estar pronto
  }
};
```
