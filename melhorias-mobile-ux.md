# Melhorias UX/UI Mobile — Natanael Brentano Poemas

> Documento de referência para aprimorar a experiência de navegação em dispositivos móveis.  
> Baseado na análise do código-fonte atual (`src/components/`, `src/styles/`, `src/pages/`).

---

## 1. Navegação Principal (Header / Drawer)

### 1.1 — Bottom Navigation Bar (Alta prioridade)

**Problema:** Em mobile, o único acesso à navegação é via hambúrguer no canto superior direito. Isso é contra-intuitivo — o polegar humano alcança a parte inferior da tela com mais facilidade.

**Solução:** Adicionar uma barra de navegação fixa na parte inferior com os 4 destinos principais.

**Arquivo:** `src/components/header.js` + `src/styles/components.css`

```html
<!-- Adicionar ao final do #app, fora do <header> -->
<nav class="bottom-nav" aria-label="Navegação principal">
  <a href="/" class="bottom-nav-item" data-link>
    <svg><!-- ícone home --></svg>
    <span>Poemas</span>
  </a>
  <a href="/colecoes" class="bottom-nav-item" data-link>
    <svg><!-- ícone coleções --></svg>
    <span>Coleções</span>
  </a>
  <button class="bottom-nav-item bottom-nav-search" id="bottom-search-btn">
    <svg><!-- ícone busca --></svg>
    <span>Buscar</span>
  </button>
  <a href="/sobre" class="bottom-nav-item" data-link>
    <svg><!-- ícone sobre --></svg>
    <span>Sobre</span>
  </a>
</nav>
```

```css
/* Visível apenas em mobile */
.bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 500;
    background: var(--bg-elevated);
    border-top: 1px solid var(--border-subtle);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    height: calc(56px + env(safe-area-inset-bottom, 0px));
  }

  .bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-family: var(--font-ui);
    font-size: 0.65rem;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    text-decoration: none;
    padding: 8px 4px;
    transition: color var(--transition-fast);
    min-height: 44px;
  }

  .bottom-nav-item.active,
  .bottom-nav-item:focus-visible {
    color: var(--accent-subtle);
  }

  /* Ajustar site-content para não ficar atrás da bottom nav */
  .site-content {
    padding-bottom: calc(var(--space-xl) + 56px + env(safe-area-inset-bottom, 0px)) !important;
  }
}
```

**Impacto:** Reduz drasticamente o esforço de navegação. O hambúrguer pode ser mantido como acesso secundário ao menu completo.

---

### 1.2 — Swipe para fechar o Drawer

**Problema:** Atualmente o drawer fecha apenas tocando no overlay ou no botão "X". Sem suporte a gesto de swipe.

**Arquivo:** `src/components/header.js`

```js
// Adicionar dentro do bloco `if (menuToggle && mainNav) {`
let touchStartX = 0;
let touchStartY = 0;

mainNav.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

mainNav.addEventListener('touchmove', (e) => {
  const deltaX = e.touches[0].clientX - touchStartX;
  const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
  
  if (deltaX > 0 && deltaY < 50) {
    const progress = Math.min(deltaX / 320, 1);
    mainNav.style.transition = 'none';
    mainNav.style.transform = `translateX(${deltaX}px)`;
    if (navOverlay) navOverlay.style.opacity = 1 - progress;
  }
}, { passive: true });

mainNav.addEventListener('touchend', (e) => {
  const deltaX = e.changedTouches[0].clientX - touchStartX;
  mainNav.style.transition = '';
  
  if (deltaX > 100) {
    closeMenu();
  } else {
    mainNav.style.transform = 'translateX(0)';
    if (navOverlay) navOverlay.style.opacity = '';
  }
}, { passive: true });
```

**Impacto:** Gesto nativo e esperado em apps iOS/Android.

---

### 1.3 — Indicador de página ativa na navegação

**Problema:** Nenhum item de navegação tem estado visual "ativo" vinculado à rota atual.

**Arquivo:** `src/router.js`

```js
// Adicionar função e chamar após cada render de rota:
function updateActiveNav(path) {
  document.querySelectorAll('.main-nav a, .bottom-nav-item[href]').forEach(link => {
    const href = link.getAttribute('href') || '';
    const isActive = (path === '/' && href === '/') ||
      (path !== '/' && href !== '/' && path.startsWith(href));
    
    link.classList.toggle('active', isActive);
    isActive
      ? link.setAttribute('aria-current', 'page')
      : link.removeAttribute('aria-current');
  });
}
```

```css
/* Drawer — linha dourada na lateral */
.site-header .main-nav a.active {
  color: var(--accent-subtle);
  padding-left: var(--space-md);
  background-color: var(--accent-muted);
  border-left: 2px solid var(--accent-subtle);
}
```

---

## 2. Busca Mobile

### 2.1 — Zoom do iOS no input de busca

**Problema:** Inputs com `font-size < 16px` ativam zoom automático no iOS, quebrando o layout.

**Arquivo:** `src/styles/components.css`

```css
/* Garantir que o iOS não faça zoom ao focar */
#mobile-search-input {
  font-size: max(16px, 1.8rem);
}

@media (max-width: 768px) {
  .search-overlay {
    height: 100dvh; /* desconta teclado virtual */
    justify-content: flex-start;
    padding-top: 20vh;
  }
  
  .search-overlay-content {
    padding: 0 var(--space-md);
    max-width: 100%;
  }
}
```

### 2.2 — Atalho de busca na Bottom Nav

**Ação:** O `#bottom-search-btn` reutiliza o `openSearch()` já existente em `header.js`. No `init()` do header, após criar os listeners existentes:

```js
// Dentro de header.init(), após a linha do search-toggle-btn:
const bottomSearchBtn = document.getElementById('bottom-search-btn');
if (bottomSearchBtn) {
  bottomSearchBtn.addEventListener('click', openSearch);
}
```

---

## 3. Gestos na Página de Poema

### 3.1 — Swipe horizontal para navegar entre poemas

**Problema:** Buttons de "Anterior / Próximo" ficam na barra inferior. Usuário mobile espera poder deslizar horizontalmente.

**Arquivo:** `src/pages/poem.js`

```js
// Adicionar após montar o poem-nav:
let swipeStartX = 0;
let swipeStartY = 0;
const SWIPE_THRESHOLD = 60;

document.addEventListener('touchstart', (e) => {
  swipeStartX = e.touches[0].clientX;
  swipeStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const deltaX = e.changedTouches[0].clientX - swipeStartX;
  const deltaY = Math.abs(e.changedTouches[0].clientY - swipeStartY);
  
  if (Math.abs(deltaX) < SWIPE_THRESHOLD || deltaY > 80) return;
  
  if (deltaX < 0) {
    document.getElementById('nav-next-btn')?.click();
  } else {
    document.getElementById('nav-prev-btn')?.click();
  }
}, { passive: true });
```

```css
@media (max-width: 768px) {
  .poem-content {
    touch-action: pan-y; /* permite scroll vertical, mas captura horizontal */
  }
}
```

### 3.2 — Double-tap para favoritar

**Arquivo:** `src/pages/poem.js`

```js
let lastTap = 0;
const poemContent = document.getElementById('poem-text');

poemContent?.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTap < 300 && now - lastTap > 0) {
    document.getElementById('fav-btn')?.click();
    showHeartAnimation(
      e.changedTouches[0].clientX,
      e.changedTouches[0].clientY
    );
  }
  lastTap = now;
}, { passive: true });

function showHeartAnimation(x, y) {
  const heart = document.createElement('span');
  heart.textContent = '♥';
  heart.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    font-size:2rem; color:var(--accent-subtle);
    pointer-events:none; z-index:9999;
    animation: heartFloat 0.8s ease forwards;
    transform: translate(-50%,-50%);
  `;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 800);
}
```

```css
@keyframes heartFloat {
  0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -150%) scale(1.5); }
}
```

---

## 4. Tipografia e Leitura Mobile

### 4.1 — Font-size base em telas muito pequenas

**Arquivo:** `src/styles/global.css`

```css
@media (max-width: 390px) {
  body {
    font-size: 16px;
  }
}
```

### 4.2 — Controles de fonte inline no mobile

**Problema:** Os controles de fonte ficam atrás de um botão extra em mobile, exigindo 2 taps.

**Arquivo:** `src/pages/poem.js` + `src/styles/components.css`

```html
<!-- Inserir antes do #poem-text, somente em mobile -->
<div class="mobile-font-control" role="group" aria-label="Tamanho da fonte">
  <button data-font="sm" aria-label="Fonte pequena">A</button>
  <button data-font="md" aria-label="Fonte média" class="active">A</button>
  <button data-font="lg" aria-label="Fonte grande">A</button>
</div>
```

```css
.mobile-font-control { display: none; }

@media (max-width: 768px) {
  .mobile-font-control {
    display: flex;
    gap: var(--space-sm);
    justify-content: center;
    margin-bottom: var(--space-md);
    padding: var(--space-xs) 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .mobile-font-control button {
    min-width: 44px;
    min-height: 44px;
    border: 1px solid var(--border-subtle);
    border-radius: 4px;
    color: var(--text-muted);
    font-family: var(--font-ui);
  }
  
  .mobile-font-control button.active {
    border-color: var(--accent-subtle);
    color: var(--accent-subtle);
  }

  .mobile-font-control button:nth-child(1) { font-size: 0.85rem; }
  .mobile-font-control button:nth-child(2) { font-size: 1rem; }
  .mobile-font-control button:nth-child(3) { font-size: 1.2rem; }
}
```

---

## 5. Filter Chips (Página Home)

### 5.1 — Scroll horizontal com snap

**Problema:** Os `.filter-chips` provavelmente quebram em múltiplas linhas em mobile.

**Arquivo:** `src/styles/components.css`

```css
@media (max-width: 768px) {
  .filter-chips {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    gap: var(--space-xs);
    padding-bottom: var(--space-2xs);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .filter-chips::-webkit-scrollbar {
    display: none;
  }

  .filter-chip {
    scroll-snap-align: start;
    flex-shrink: 0;
    white-space: nowrap;
  }
}
```

### 5.2 — Fade gradient nas bordas

```css
@media (max-width: 768px) {
  .filter-section {
    position: relative;
  }

  .filter-section::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 40px;
    background: linear-gradient(to right, transparent, var(--bg-primary));
    pointer-events: none;
    z-index: 1;
  }
}
```

---

## 6. Performance Mobile

### 6.1 — `content-visibility` nos poem-rows

**Problema:** Listas longas renderizam todos os itens de uma vez, mesmo fora da viewport.

**Arquivo:** `src/styles/components.css`

```css
.poem-row {
  /* manter estilos existentes, adicionar: */
  content-visibility: auto;
  contain-intrinsic-size: 0 60px;
}
```

**Impacto:** Redução de ~40-60% no tempo de renderização para listas com 30+ poemas.

### 6.2 — `will-change` somente durante animação

**Arquivo:** `src/styles/components.css`

```css
/* Remover will-change global do drawer se houver */
.main-nav {
  /* não usar will-change aqui */
}

/* Adicionar apenas no estado ativo */
.main-nav.active {
  will-change: transform;
}
```

---

## 7. Acessibilidade Mobile

### 7.1 — Tap targets WCAG 2.5.5 (mínimo 44×44px)

| Elemento | Arquivo | Estado | Ação |
|---|---|---|---|
| `.header-search-toggle` | `components.css:97` | 44×44 ✅ | OK |
| `.theme-toggle` | `global.css:356` | 48×48 ✅ | OK |
| `.filter-chip` | `components.css` | provável < 44px ❌ | `min-height: 44px` |
| `.font-btn` | `components.css:1267` | ~30px ❌ | `44×44px` |
| `.nav-close-btn` | `components.css:1154` | 44×44 ✅ | OK |
| `.share-btn` | `components.css:446` | sem min-height ❌ | `min-height: 44px` |

```css
@media (max-width: 768px) {
  .font-btn {
    min-width: 44px;
    min-height: 44px;
    padding: 8px;
  }
  
  .share-btn {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }
  
  .filter-chip {
    min-height: 44px;
    padding: 10px 16px;
  }
}
```

### 7.2 — Anunciar mudanças de rota (SPA)

**Arquivo:** `index.html` + `src/router.js`

```html
<!-- Adicionar ao <body> do index.html -->
<div id="route-announcer" role="status" aria-live="polite" aria-atomic="true"
     class="sr-only"></div>
```

```js
// Em router.js, após cada render:
function announceRouteChange(title) {
  const el = document.getElementById('route-announcer');
  if (el) {
    el.textContent = '';
    setTimeout(() => { el.textContent = `Navegando para: ${title}`; }, 50);
  }
}
```

```css
.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
```

---

## 8. Safe Areas (Notch / Dynamic Island / Barra de Gestos)

**Verificar no `index.html`:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
> ⚠️ `viewport-fit=cover` é obrigatório para que `env(safe-area-inset-*)` funcione.

**Arquivo:** `src/styles/components.css`

```css
/* Barra inferior de poema */
.poem-nav {
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
}

/* Nova bottom nav */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Botão fechar do search-overlay */
.search-overlay-close {
  top: calc(var(--space-lg) + env(safe-area-inset-top, 0px));
  right: calc(var(--space-lg) + env(safe-area-inset-right, 0px));
}
```

---

## 9. Back-to-Top

**Problema:** O botão pode sobrepor a nova bottom nav em mobile.

**Arquivo:** `src/components/back-to-top.js` (CSS inline ou `components.css`)

```css
@media (max-width: 768px) {
  .back-to-top-btn {
    bottom: calc(56px + env(safe-area-inset-bottom, 0px) + var(--space-sm));
  }
}
```

---

## 10. Checklist de Implementação

### 🔴 Alta Prioridade (impacto direto na usabilidade)
- [ ] **1.1** — Implementar Bottom Navigation Bar
- [ ] **5.1** — Scroll horizontal dos filter chips (sem quebra de linha)
- [ ] **7.1** — Corrigir tap targets abaixo de 44px (`.font-btn`, `.share-btn`, `.filter-chip`)
- [ ] **8** — Verificar `viewport-fit=cover` e safe areas

### 🟡 Média Prioridade (melhoria de experiência)
- [ ] **1.2** — Swipe para fechar o drawer
- [ ] **3.1** — Swipe horizontal entre poemas
- [ ] **1.3** — Indicador de página ativa + `aria-current`
- [ ] **9** — Posicionar back-to-top acima da bottom nav
- [ ] **2.1** — Corrigir zoom do iOS no input de busca (`font-size: max(16px, ...)`)

### 🟢 Baixa Prioridade (polish)
- [ ] **3.2** — Double-tap para favoritar
- [ ] **4.2** — Controles de fonte inline no mobile
- [ ] **5.2** — Fade gradient nos chips
- [ ] **6.1** — `content-visibility` nos poem-rows
- [ ] **7.2** — Anunciar mudanças de rota para leitores de tela
- [ ] **4.1** — Font-size 16px em telas ≤ 390px
- [ ] **6.2** — `will-change` somente no estado `.active`

---

## Referências

- [WCAG 2.5.5 — Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Safe Area Insets — MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/env)
- [content-visibility — web.dev](https://web.dev/articles/content-visibility)
- [iOS Zoom prevention on input focus](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/)
- [Touch Events — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Touch_events)
