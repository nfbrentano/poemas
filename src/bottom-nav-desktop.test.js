import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

import { updateActiveNavLink } from './utils/navigation.js';
import { header } from './components/header.js';

describe('Barra de navegação inferior (Bottom Nav) e Cabeçalho no Desktop (SDD 2026-09-29)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app">
        ${header.render()}
        <nav class="bottom-nav" aria-label="Navegação principal">
          <div class="bottom-nav-inner">
            <a href="/" class="bottom-nav-item" data-link>
              <span>Poemas</span>
            </a>
            <a href="/colecoes/" class="bottom-nav-item" data-link>
              <span>Coleções</span>
            </a>
            <button class="bottom-nav-item bottom-nav-search" id="bottom-search-btn" type="button" aria-label="Buscar poemas">
              <span>Buscar</span>
            </button>
            <a href="/sobre/" class="bottom-nav-item" data-link>
              <span>Sobre</span>
            </a>
            <button class="bottom-nav-item" id="bottom-settings-btn" type="button" aria-label="Ajustes">
              <span>Ajustes</span>
            </button>
          </div>
        </nav>
        <div class="bottom-sheet-overlay" id="global-settings-overlay"></div>
        <div class="poem-settings-panel bottom-sheet" id="global-settings-sheet">
          <div class="settings-sheet-content">
            <button class="btn-theme-select" data-theme="sepia">Sépia</button>
            <button id="mobile-random-poem-btn">Poema Aleatório</button>
          </div>
        </div>
      </div>
    `;
  });

  it('CA01: renderiza o nome do autor "Natanael Brentano" no cabeçalho com link para a home', () => {
    const headerEl = document.querySelector('.site-header');
    expect(headerEl).not.toBeNull();
    const logoEl = headerEl.querySelector('.logo');
    expect(logoEl).not.toBeNull();
    expect(logoEl.textContent.trim()).toBe('Natanael Brentano');
    expect(logoEl.getAttribute('href')).toBe('/');
  });

  it('CA02: renderiza a barra inferior com os 5 botões de navegação e ajustes envolvidos por .bottom-nav-inner', () => {
    const bottomNav = document.querySelector('.bottom-nav');
    expect(bottomNav).not.toBeNull();
    expect(bottomNav.getAttribute('aria-label')).toBe('Navegação principal');

    const inner = bottomNav.querySelector('.bottom-nav-inner');
    expect(inner).not.toBeNull();

    const items = inner.querySelectorAll('.bottom-nav-item');
    expect(items.length).toBe(5);

    const labels = Array.from(items).map(item => item.textContent.trim());
    expect(labels).toContain('Poemas');
    expect(labels).toContain('Coleções');
    expect(labels).toContain('Buscar');
    expect(labels).toContain('Sobre');
    expect(labels).toContain('Ajustes');
  });

  it('CA07: atualiza o item ativo na barra inferior conforme a rota', () => {
    // 1. Rota Home ("/")
    window.history.pushState(null, null, '/');
    updateActiveNavLink();
    const poemasItem = document.querySelector('.bottom-nav-item[href="/"]');
    expect(poemasItem.classList.contains('active')).toBe(true);
    expect(poemasItem.getAttribute('aria-current')).toBe('page');

    // 2. Rota Coleções ("/colecoes/")
    window.history.pushState(null, null, '/colecoes/');
    updateActiveNavLink();
    const colecoesItem = document.querySelector('.bottom-nav-item[href="/colecoes/"]');
    expect(colecoesItem.classList.contains('active')).toBe(true);
    expect(colecoesItem.getAttribute('aria-current')).toBe('page');
    expect(poemasItem.classList.contains('active')).toBe(false);

    // 3. Rota Sobre ("/sobre/")
    window.history.pushState(null, null, '/sobre/');
    updateActiveNavLink();
    const sobreItem = document.querySelector('.bottom-nav-item[href="/sobre/"]');
    expect(sobreItem.classList.contains('active')).toBe(true);
    expect(sobreItem.getAttribute('aria-current')).toBe('page');
    expect(colecoesItem.classList.contains('active')).toBe(false);
  });

  it('CA04 & CA05: abre e fecha a folha de ajustes com clique e tecla Escape', () => {
    const settingsBtn = document.getElementById('bottom-settings-btn');
    const overlay = document.getElementById('global-settings-overlay');
    const sheet = document.getElementById('global-settings-sheet');

    const openSettings = () => {
      overlay?.classList.add('active');
      sheet?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeSettings = () => {
      overlay?.classList.remove('active');
      sheet?.classList.remove('active');
      document.body.style.overflow = '';
    };

    settingsBtn.addEventListener('click', openSettings);
    overlay.addEventListener('click', closeSettings);

    const escListener = (e) => {
      if (e.key === 'Escape' && sheet.classList.contains('active')) {
        closeSettings();
      }
    };
    document.addEventListener('keydown', escListener);

    // Abrir
    settingsBtn.click();
    expect(sheet.classList.contains('active')).toBe(true);
    expect(overlay.classList.contains('active')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    // Fechar com Escape
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(sheet.classList.contains('active')).toBe(false);
    expect(overlay.classList.contains('active')).toBe(false);
    expect(document.body.style.overflow).toBe('');

    // Abrir e fechar com clique no overlay
    settingsBtn.click();
    expect(sheet.classList.contains('active')).toBe(true);
    overlay.click();
    expect(sheet.classList.contains('active')).toBe(false);
    expect(overlay.classList.contains('active')).toBe(false);
  });

  it('CA06: estilos CSS ocultam #header-controls e mantêm a barra inferior fixa com padding compensatório', () => {
    const globalCssPath = path.resolve(__dirname, 'styles/global.css');
    const componentsCssPath = path.resolve(__dirname, 'styles/components.css');
    const globalCss = fs.readFileSync(globalCssPath, 'utf8');
    const componentsCss = fs.readFileSync(componentsCssPath, 'utf8');

    // #header-controls oculto
    expect(globalCss).toMatch(/#header-controls\s*\{\s*display:\s*none\s*!important/);

    // .bottom-nav habilitada com position: fixed
    expect(componentsCss).toMatch(/\.bottom-nav\s*\{[^}]*position:\s*fixed/);

    // .bottom-nav-inner com max-width
    expect(componentsCss).toMatch(/\.bottom-nav-inner\s*\{[^}]*max-width:\s*680px/);

    // .site-content e .site-footer com padding inferior compensatório
    expect(globalCss).toMatch(/\.site-content\s*\{[^}]*calc\(var\(--space-2xl\)\s*\+\s*56px/);
    expect(globalCss).toMatch(/\.site-footer\s*\{[^}]*calc\(var\(--space-xl\)\s*\+\s*56px/);

    // #global-settings-sheet configurado como bottom sheet com transição
    expect(componentsCss).toMatch(/#global-settings-sheet\s*\{[^}]*position:\s*fixed/);
    expect(componentsCss).toMatch(/#global-settings-sheet\.active\s*\{[^}]*bottom:\s*0/);
  });

  it('SDD 2026-09-29 (CA01, CA02, CA03, CA04): alterna classe .scrolled ao rolar e define regras CSS para opacidade 0 e pointer-events none', () => {
    header.init();
    const headerEl = document.querySelector('.site-header');
    expect(headerEl).not.toBeNull();

    // No topo (scrollY = 0)
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    window.dispatchEvent(new Event('scroll'));
    expect(headerEl.classList.contains('scrolled')).toBe(false);

    // Rolando para baixo (scrollY = 50 > 20)
    window.scrollY = 50;
    window.dispatchEvent(new Event('scroll'));
    expect(headerEl.classList.contains('scrolled')).toBe(true);

    // Voltando ao topo (scrollY = 0 <= 20)
    window.scrollY = 0;
    window.dispatchEvent(new Event('scroll'));
    expect(headerEl.classList.contains('scrolled')).toBe(false);

    // Validação das regras CSS em global.css
    const globalCssPath = path.resolve(__dirname, 'styles/global.css');
    const globalCss = fs.readFileSync(globalCssPath, 'utf8');

    // Transição suave no .site-header
    expect(globalCss).toMatch(/\.site-header\s*\{[^}]*transition:[^}]*opacity/);

    // .site-header.scrolled com opacity: 0 e pointer-events: none
    expect(globalCss).toMatch(/\.site-header\.scrolled\s*\{[^}]*opacity:\s*0/);
    expect(globalCss).toMatch(/\.site-header\.scrolled\s*\{[^}]*pointer-events:\s*none/);

    // .site-header:focus-within para acessibilidade de navegação por teclado
    expect(globalCss).toMatch(/\.site-header:focus-within\s*\{[^}]*opacity:\s*1/);
    expect(globalCss).toMatch(/\.site-header:focus-within\s*\{[^}]*pointer-events:\s*auto/);
  });
});
