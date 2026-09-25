import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

import { stripHtml, escapeHtml } from '../src/utils/html.js';
import { renderPoemMarkup } from '../src/utils/poem-template.js';
import { renderAboutMarkup, getAboutFaq, DEFAULT_AVATAR_URL, DEFAULT_AUTHOR_BIO } from '../src/utils/about-template.js';
import { renderCollectionMarkup } from '../src/utils/collection-template.js';
import { getPoemOfDay } from '../src/utils/poemOfDay.js';
import {
  poemSchema,
  breadcrumbSchema,
  profilePageSchema,
  faqPageSchema,
  collectionSchema,
  collectionsListSchema,
  websiteSchema,
  sentimentSchema,
  sentimentsListSchema,
  serializeJsonLd,
  renderBreadcrumbsHtml
} from '../src/utils/structured-data.js';
import { slugifyTag, formatTag, tagToSlug } from '../src/utils/tags.js';
import { getSentimentIntro, getSentimentName } from '../src/data/sentiments.js';

import { loadFonts, generatePoemOgImage, generateCollectionOgImage, generateDefaultOgImage } from './generate-og-images.js';


// Note: Run this with node --env-file=.env.local scripts/prerender.js
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const baseUrl = 'https://nfgbrentano.art.br/'; 

if (!firebaseConfig.apiKey) {
  console.error('Environment variables for Firebase are required.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getExcerpt(poem, limit = 160) {
  if (poem.excerpt && poem.excerpt.trim()) {
    return poem.excerpt.trim();
  }
  const cleanContent = stripHtml(poem.content || '');
  if (cleanContent.length <= limit) return cleanContent;
  return cleanContent.slice(0, limit - 3) + '...';
}

function getCriticalCss() {
  const variablesCssPath = path.resolve(process.cwd(), 'src/styles/variables.css');
  let varsCss = '';
  if (fs.existsSync(variablesCssPath)) {
    varsCss = fs.readFileSync(variablesCssPath, 'utf-8');
  }

  const criticalLayoutCss = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:focus-visible { outline: 2px solid var(--accent-subtle); outline-offset: 4px; border-radius: 2px; }
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
  font-size: 18px;
  transition: var(--transition-theme);
}
a { color: inherit; text-decoration: none; transition: color var(--transition-fast), border-color var(--transition-fast); }
a:hover { color: var(--accent-subtle); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); font-weight: 400; line-height: 1.2; color: var(--text-primary); }
button { cursor: pointer; font-family: var(--font-ui); font-size: var(--btn-font-size); border: none; background: none; transition: all var(--transition-fast); }
.container { max-width: var(--container-main); margin: 0 auto; padding: 0 var(--space-lg); width: 100%; }
.header-container { max-width: 1200px; margin: 0 auto; padding: 0 var(--space-lg); display: flex; justify-content: space-between; align-items: center; width: 100%; }
.site-content { min-height: 80vh; padding-top: var(--header-height); }
.site-header {
  position: fixed; top: 0; left: 0; right: 0; height: var(--header-height);
  background: var(--header-bg); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle); z-index: var(--z-header); display: flex; align-items: center;
  transition: background var(--transition-theme), border-color var(--transition-theme);
}
.site-header .logo { font-family: var(--font-display); font-size: 1.4rem; font-weight: 400; letter-spacing: -0.01em; color: var(--text-primary); }
.main-nav { display: flex; align-items: center; }
.main-nav ul { display: flex; list-style: none; gap: var(--space-lg); }
.poem-container { max-width: var(--container-poetry); margin: 0 auto; padding: var(--space-2xl) 0 var(--space-3xl); min-height: calc(100vh - var(--header-height)); }
.single-poem header { text-align: center; margin-bottom: var(--space-2xl); }
.single-poem header h1 { font-size: clamp(2rem, 5vw, 3.2rem); margin-bottom: var(--space-sm); font-weight: 400; letter-spacing: -0.02em; line-height: 1.15; }
.poem-meta { display: flex; justify-content: center; align-items: center; gap: var(--space-sm); color: var(--text-secondary); font-size: 0.9rem; font-family: var(--font-ui); margin-bottom: var(--space-md); }
.reading-settings-trigger-container { display: flex; justify-content: center; margin-top: var(--space-xs); }
.btn-reading-settings { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; border: 1px solid var(--border-subtle); color: var(--text-secondary); background: var(--bg-surface); }
.poem-content { font-family: var(--font-poem); font-size: var(--poem-font-size, 1.25rem); line-height: var(--poem-line-height, 1.9); color: var(--text-primary); margin: var(--space-2xl) auto; max-width: 100%; }
.stanza { margin-bottom: var(--space-xl); display: block; }
.line-reveal { display: block; }
.poem-narration-player { margin: var(--space-xl) auto; padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 8px; background: var(--bg-elevated); }
.fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.site-footer { border-top: 1px solid var(--border-subtle); padding: var(--space-2xl) 0; margin-top: var(--space-4xl); font-size: 0.85rem; color: var(--text-muted); }
.footer-grid { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); }
.footer-social { display: flex; align-items: center; gap: var(--space-sm); }
.bottom-nav, .mobile-brand, .bottom-sheet-overlay, .bottom-sheet { display: none; }
.home-hero { text-align: center; padding: var(--space-xl) 0 var(--space-lg); max-width: var(--container-main); margin: 0 auto; }
.home-title { font-family: var(--font-display); font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 300; color: var(--text-primary); margin-bottom: var(--space-xs); letter-spacing: -0.01em; line-height: 1.25; }
.home-description { font-family: var(--font-poem); font-size: 1rem; color: var(--text-secondary); line-height: 1.7; max-width: 580px; margin: 0 auto; }
.home-description a { color: var(--accent-subtle); text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 768px) {
  .site-header { display: none; }
  .mobile-brand { display: block; text-align: center; padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; }
  .site-content { padding-top: var(--space-md); padding-bottom: 70px; }
  .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: var(--bg-primary); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-around; align-items: center; z-index: var(--z-header, 500); }
  .bottom-nav-item { display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--text-muted); gap: 2px; }
  .home-hero { padding: var(--space-lg) 0 var(--space-md); }
  .home-title { font-size: 1.6rem; }
  .home-description { font-size: 0.95rem; padding: 0 var(--space-sm); }
}
  `;

  const combined = (varsCss + '\n' + criticalLayoutCss)
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ')
    .replace(/\s*([:;{}])\s*/g, '$1')
    .trim();

  return combined;
}

function renderBaseLayout({ mainContent = '', dataPrerendered = '' }) {
  const currentYear = new Date().getFullYear();
  const mainAttrs = dataPrerendered ? `data-prerendered="${escapeHtml(dataPrerendered)}"` : '';

  return `
  <header class="site-header">
    <div class="header-container">
      <a href="/" class="logo" data-link>Natanael Brentano</a>
      
      <div id="header-controls" style="display: flex; align-items: center; gap: var(--space-md);">
        <button id="search-toggle-btn" class="header-search-toggle" aria-label="Buscar poemas" title="Buscar poemas (Pressione /)">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>

        <div id="nav-overlay" class="nav-overlay"></div>
        <nav class="main-nav">
          <div class="nav-drawer-header">
            <span class="logo">Natanael Brentano</span>
            <button id="nav-close-btn" class="nav-close-btn" aria-label="Fechar menu">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <ul>
            <li><a href="/" data-link>Poemas</a></li>
            <li><a href="/colecoes/" data-link>Coleções</a></li>
            <li><a href="/sobre/" data-link>Sobre</a></li>
          </ul>
        </nav>
        
        <button id="random-poem-btn" class="random-poem-btn" aria-label="Poema aleatório" title="Ver um poema aleatório">
          ⚄ <span class="btn-text">Aleatório</span>
        </button>

        <button id="mode-toggle" class="theme-toggle" aria-label="Alternar modo de visualização">
          <span class="icon-moon"><svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg></span>
          <span class="icon-sun"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></span>
          <span class="icon-sepia" style="display:none;"><svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg></span>
          <span class="icon-contrast" style="display:none;"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20ZM12,6a6,6,0,0,0,0,12V6Z"></path></svg></span>
        </button>

        <button id="menu-toggle" class="menu-toggle" aria-label="Menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12" class="line-1"></line><line x1="3" y1="6" x2="21" y2="6" class="line-2"></line><line x1="3" y1="18" x2="21" y2="18" class="line-3"></line></svg>
        </button>
      </div>
    </div>
  </header>
  <div id="mobile-brand" class="mobile-brand"><a href="/" data-link>Natanael Brentano</a></div>
  <main id="main-content" class="site-content container" ${mainAttrs}>
    ${mainContent}
  </main>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-info">
        &copy; ${currentYear} Natanael Brentano. Todos os direitos reservados.
      </div>
      <div class="footer-social">
        <a href="/sentimentos/" data-link class="footer-social-link">
          <span>Sentimentos</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" aria-label="Instagram @nfgbrentano" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          <span>@nfgbrentano</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="/feed.xml" target="_blank" aria-label="RSS Feed" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>
          <span>RSS Feed</span>
        </a>
        <span class="footer-separator">•</span>
        <a href="mailto:nfgbrentano@gmail.com" aria-label="Contato via e-mail" class="footer-social-link">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="footer-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          <span>Contato</span>
        </a>
      </div>
    </div>
  </footer>
  <nav class="bottom-nav" aria-label="Navegação móvel principal">
    <a href="/" class="bottom-nav-item" data-link>
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      <span>Poemas</span>
    </a>
    <a href="/colecoes/" class="bottom-nav-item" data-link>
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
      <span>Coleções</span>
    </a>
    <button class="bottom-nav-item bottom-nav-search" id="bottom-search-btn" type="button" aria-label="Buscar poemas">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <span>Buscar</span>
    </button>
    <a href="/sobre/" class="bottom-nav-item" data-link>
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
      <span>Sobre</span>
    </a>
    <button class="bottom-nav-item" id="bottom-settings-btn" type="button" aria-label="Ajustes">
      <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
      <span>Ajustes</span>
    </button>
  </nav>

  <div class="bottom-sheet-overlay" id="global-settings-overlay"></div>
  <div class="poem-settings-panel bottom-sheet" id="global-settings-sheet">
    <div class="bottom-sheet-handle"></div>
    <div class="settings-sheet-content" style="width: 100%;">
      <h3 style="margin-top: 0; margin-bottom: var(--space-md); font-family: var(--font-display); font-size: 1.2rem; text-align: center;">Ajustes</h3>
      
      <div style="margin-bottom: var(--space-lg);">
        <span id="current-theme-label" style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">Tema: Automático</span>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
          <button class="btn-theme-select btn-secondary" data-theme="light">Claro</button>
          <button class="btn-theme-select btn-secondary" data-theme="sepia">Sépia</button>
          <button class="btn-theme-select btn-secondary" data-theme="dark">Escuro</button>
          <button class="btn-theme-select btn-secondary" data-theme="contrast">Alto Contraste</button>
        </div>
      </div>

      <div>
        <button id="mobile-random-poem-btn" class="btn-secondary" style="width: 100%; justify-content: center; display: flex; gap: 8px;">
          ⚄ Poema Aleatório
        </button>
      </div>
    </div>
  </div>
  `;
}

function renderHomeMarkup({ poems, podPoem, allCollections = [] }) {
  const podExcerpt = podPoem ? getExcerpt(podPoem, 160) : '';
  const displayPoems = podPoem ? poems.filter(p => p.id !== podPoem.id) : poems;
  const recentPoems = displayPoems.slice(0, 20);
  
  const featuredPoem = recentPoems[0];
  const featuredExcerpt = featuredPoem ? getExcerpt(featuredPoem, 160) : '';
  const featuredDateStr = featuredPoem ? new Date(featuredPoem.published_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '';
  
  let poemRowsHtml = '';
  if (featuredPoem) {
    let lastYear = new Date(featuredPoem.published_at).getFullYear();
    for (let i = 1; i < recentPoems.length; i++) {
      const p = recentPoems[i];
      const year = new Date(p.published_at).getFullYear();
      if (lastYear !== year) {
        poemRowsHtml += `<h3 class="year-separator" style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-muted); margin: var(--space-xl) 0 var(--space-md) 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-xs);">${year}</h3>`;
        lastYear = year;
      }
      poemRowsHtml += `
      <article class="poem-row fade-in">
        <a href="/poema/${p.slug}/" data-link class="poem-row-link">
          <h3 class="poem-row-title">${escapeHtml(p.title)}</h3>
          <span class="poem-row-year">${year}</span>
        </a>
      </article>`;
    }
  }

  // Tags counts for sentiments preview
  const tagCounts = {};
  poems.forEach(p => {
    (p.tags || []).forEach(t => {
      if (t) tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  return `
  <div class="home-layout">
    <section class="home-hero">
      <h1 class="home-title">Poemas de Natanael Brentano</h1>
      <p class="home-description">
        Poesia brasileira contemporânea em língua portuguesa. Reflexões sobre o tempo, o amor, a efemeridade e a beleza das coisas simples do cotidiano. O acervo reúne atualmente ${poems.length} poemas publicados em ${allCollections.length} coleções temáticas. Conheça as <a href="/colecoes/" data-link>coleções temáticas</a> e saiba mais <a href="/sobre/" data-link>sobre o autor</a>.
      </p>
    </section>

    ${podPoem ? `
    <section class="poem-of-day fade-in">
      <p class="pod-label">— poema do dia —</p>
      <a href="/poema/${podPoem.slug}/" data-link class="pod-link">
        <h2 class="pod-title">${escapeHtml(podPoem.title)}</h2>
        <p class="pod-excerpt">${escapeHtml(podExcerpt)}</p>
      </a>
    </section>
    ` : ''}

    <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
      <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
        <div class="filter-section">
          <div class="filter-group">
            <span class="filter-label">Sentimentos:</span>
            <div class="filter-chips">
              <a href="/" data-link class="filter-chip active">Todos</a>
              ${topTags.map(tag => `<a href="/sentimento/${tagToSlug(tag)}/" data-link class="filter-chip">${escapeHtml(tag)}</a>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="list-container">
        ${featuredPoem ? `
        <article class="poem-featured fade-in">
          <a href="/poema/${featuredPoem.slug}/" data-link>
            <h2 class="featured-title">${escapeHtml(featuredPoem.title)}</h2>
            <div class="featured-excerpt">${escapeHtml(featuredExcerpt)}</div>
            <div class="featured-meta">
              <span>${featuredDateStr}</span>
            </div>
          </a>
          <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="featured-share-btn btn-secondary btn-sm" data-platform="whatsapp" data-slug="${featuredPoem.slug}" data-title="${escapeHtml(featuredPoem.title)}">WhatsApp</button>
            <button class="featured-share-btn btn-secondary btn-sm" data-platform="twitter" data-slug="${featuredPoem.slug}" data-title="${escapeHtml(featuredPoem.title)}">X (Twitter)</button>
          </div>
          <div class="featured-separator"></div>
        </article>
        ` : ''}
        ${poemRowsHtml}
      </div>

      <div class="pagination-container">
        <p class="pagination-status" style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: var(--space-lg);">Mostrando ${recentPoems.length} de ${poems.length}</p>
      </div>
      
      <div class="random-home-container">
        <a href="/aleatorio" data-link class="random-home-link">→ Poema aleatório</a>
      </div>
    </section>

    <section class="newsletter-section">
      <div class="newsletter-card">
        <h3>Receba novos poemas</h3>
        <p>Inscreva seu e-mail para receber versos inéditos diretamente na sua caixa de entrada.</p>
        <form class="newsletter-form" action="#">
          <input type="email" placeholder="Seu melhor e-mail" aria-label="Seu e-mail" required />
          <button type="submit" class="btn-primary">Inscrever-se</button>
        </form>
      </div>
    </section>
  </div>
  `;
}

async function prerender() {
  try {
    const distDir = path.resolve(process.cwd(), 'dist');
    const templatePath = path.join(distDir, 'index.html');

    if (!fs.existsSync(templatePath)) {
      console.error(`Vite build output template not found at: ${templatePath}`);
      console.error('Please run "npm run build" or "vite build" first.');
      process.exit(1);
    }

    console.log('Fetching published poems, collections and relations for pre-rendering...');
    const poemsQuery = query(
      collection(db, 'poems'),
      where('status', '==', 'published')
    );
    const [poemsSnapshot, collectionsSnapshot, collectionPoemsSnapshot] = await Promise.all([
      getDocs(poemsQuery),
      getDocs(collection(db, 'collections')).catch(() => ({ docs: [] })),
      getDocs(collection(db, 'collection_poems')).catch(() => ({ docs: [] }))
    ]);

    const poems = poemsSnapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data };
    });

    const allCollections = collectionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const collectionPoems = collectionPoemsSnapshot.docs ? collectionPoemsSnapshot.docs.map(doc => doc.data()) : [];
    const poemToColsMap = new Map();
    const colToPoemsMap = new Map();
    collectionPoems.forEach(cp => {
      if (!poemToColsMap.has(cp.poem_id)) poemToColsMap.set(cp.poem_id, []);
      poemToColsMap.get(cp.poem_id).push({ collection_id: cp.collection_id, order: cp.order });

      if (!colToPoemsMap.has(cp.collection_id)) colToPoemsMap.set(cp.collection_id, []);
      colToPoemsMap.get(cp.collection_id).push({ poem_id: cp.poem_id, order: cp.order });
    });

    // Sort published poems by date published ascending for previous/next calculation
    poems.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());

    console.log(`Found ${poems.length} poems to pre-render.`);
    let originalHtml = fs.readFileSync(templatePath, 'utf-8');
    // Reset <div id="app"> to empty in case dist/index.html was already prerendered in a previous run
    originalHtml = originalHtml.replace(/<div id="app">[\s\S]*?<\/body>/i, '<div id="app"></div>\n  </body>');

    await loadFonts();
    const defaultOgImage = await generateDefaultOgImage();

    // RF04: Inline critical CSS (~6-8 KB < 14 KB), keep external stylesheet <link> for browser caching
    const criticalCss = getCriticalCss();
    const criticalCssTag = `<style id="critical-css">${criticalCss}</style>`;
    
    // Inject critical CSS right before </head> if not already present
    if (!originalHtml.includes('id="critical-css"')) {
      originalHtml = originalHtml.replace(/<\/head>/i, `  ${criticalCssTag}\n</head>`);
    }

    // RF03: Ensure WebSite structured data is present in dist/index.html
    if (!originalHtml.includes('"@type":"WebSite"') && !originalHtml.includes('"@type": "WebSite"')) {
      const homeLd = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(websiteSchema())}</script>`;
      originalHtml = originalHtml.replace(/<\/head>/i, `  ${homeLd}\n</head>`);
    }

    // Write back critical CSS to dist/index.html
    fs.writeFileSync(templatePath, originalHtml, 'utf-8');

    let count = 0;
    for (let i = 0; i < poems.length; i++) {
      const poem = poems[i];
      const prevPoem = i > 0 ? poems[i - 1] : null;
      const nextPoem = i < poems.length - 1 ? poems[i + 1] : null;

      const prevSlug = prevPoem ? prevPoem.slug : '';
      const prevTitle = prevPoem ? prevPoem.title : '';
      const nextSlug = nextPoem ? nextPoem.slug : '';
      const nextTitle = nextPoem ? nextPoem.title : '';

      // Find collections associated with this poem
      const associatedColIds = new Set((poemToColsMap.get(poem.id) || []).map(r => r.collection_id));
      const collectionsData = allCollections.filter(c => 
        associatedColIds.has(c.id) || (poem.collection_slugs && poem.collection_slugs.includes(c.slug))
      );

      // Find related poems (share tags or collections, up to 3)
      const poemTags = new Set(poem.tags || []);
      const poemCols = new Set([...(poem.collection_slugs || []), ...collectionsData.map(c => c.slug)]);
      const otherPoems = poems.filter(p => p.id !== poem.id);
      
      const scoredPoems = otherPoems.map(p => {
        let score = 0;
        if (p.tags) p.tags.forEach(t => { if (poemTags.has(t)) score += 2; });
        if (p.collection_slugs) p.collection_slugs.forEach(c => { if (poemCols.has(c)) score += 3; });
        return { poem: p, score };
      });
      scoredPoems.sort((a, b) => b.score - a.score);
      const relatedPoems = scoredPoems.slice(0, 3).map(s => ({
        id: s.poem.id,
        slug: s.poem.slug,
        title: s.poem.title,
        excerpt: getExcerpt(s.poem, 120)
      }));

      const excerpt = getExcerpt(poem);
      const title = `${poem.title} — Natanael Brentano`;
      const url = `${baseUrl}poema/${poem.slug}/`;
      const generatedOgPath = await generatePoemOgImage(poem);
      const ogImage = `${baseUrl.replace(/\/$/, '')}${generatedOgPath}`;
      poem.image = ogImage; // Inject into poem object so structured-data uses it
      const publishedIso = new Date(poem.published_at).toISOString();

      // JSON-LD Structured Data (RF04 & RF07)
      const primaryCol = collectionsData && collectionsData.length > 0 ? collectionsData[0] : null;
      const breadcrumbItems = primaryCol ? [
        { name: 'Início', url: baseUrl },
        { name: primaryCol.name, url: `${baseUrl}colecao/${primaryCol.slug}/` },
        { name: poem.title, url }
      ] : [
        { name: 'Início', url: baseUrl },
        { name: poem.title, url }
      ];

      const poemLd = poemSchema(poem, collectionsData);
      const breadcrumbLd = breadcrumbSchema(breadcrumbItems);
      const jsonLdScript = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(poemLd)}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(breadcrumbLd)}</script>`;

      // Tags meta dinâmicas adicionais
      let articleMeta = `
    <meta property="article:published_time" content="${publishedIso}" />
    <meta property="article:author" content="Natanael Brentano" />
      `;
      if (poem.tags && Array.isArray(poem.tags)) {
        poem.tags.forEach(tag => {
          articleMeta += `\n    <meta property="article:tag" content="${escapeHtml(tag)}" />`;
        });
      }

      // CA01 & CA02: Pre-render full poem DOM and embed __DATA__ payload
      const renderedMarkup = renderPoemMarkup({
        poem,
        prevSlug,
        nextSlug,
        prevTitle,
        nextTitle,
        collectionsData,
        relatedPoems,
        baseUrl: '/'
      });

      const poemShell = renderBaseLayout({
        mainContent: renderedMarkup,
        dataPrerendered: `/poema/${poem.slug}`
      });

      const poemDataPayload = {
        poem,
        prev: { slug: prevSlug, title: prevTitle },
        next: { slug: nextSlug, title: nextTitle },
        collections: collectionsData,
        related: relatedPoems
      };
      const dataScriptTag = `\n    <script type="application/json" id="__DATA__">${JSON.stringify(poemDataPayload)}</script>`;

      // Modificando as tags meta no HTML original
      let modifiedHtml = originalHtml.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '');

      // 1. Substituir o título
      modifiedHtml = modifiedHtml.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${escapeHtml(title)}</title>`
      );

      // 2. Substituir Canonical URL
      modifiedHtml = modifiedHtml.replace(
        /<link rel="canonical" href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${url}" />`
      );

      // 3. Substituir Descrição Geral
      modifiedHtml = modifiedHtml.replace(
        /<meta name="description" content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${escapeHtml(excerpt)}" />`
      );

      // 4. Substituir Open Graph Tags
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:title" content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:description" content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${escapeHtml(excerpt)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:url" content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${url}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:image" content="[^"]*"\s*\/?>/i,
        `<meta property="og:image" content="${ogImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/png" />\n    <meta property="og:image:alt" content="${escapeHtml(title)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:type" content="[^"]*"\s*\/?>/i,
        `<meta property="og:type" content="article" />`
      );

      // 5. Substituir Twitter Tags
      modifiedHtml = modifiedHtml.replace(
        /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${escapeHtml(excerpt)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:image" content="${ogImage}" />`
      );

      // 6. Inserir metadados extras, JSON-LD e __DATA__ antes de </head>
      modifiedHtml = modifiedHtml.replace(
        /<\/head>/i,
        `${articleMeta}${jsonLdScript}${dataScriptTag}\n  </head>`
      );

      // 7. Injetar o shell completo do poema no <div id="app"></div>
      modifiedHtml = modifiedHtml.replace(
        /<div id="app"><\/div>/i,
        `<div id="app">${poemShell}</div>`
      );

      // Definir caminho de escrita do index.html para o poema correspondente
      const poemDir = path.join(distDir, 'poema', poem.slug);
      if (!fs.existsSync(poemDir)) {
        fs.mkdirSync(poemDir, { recursive: true });
      }

      fs.writeFileSync(path.join(poemDir, 'index.html'), modifiedHtml, 'utf-8');
      count++;
    }

    console.log(`Pre-rendering completed! Successfully generated ${count} poem static HTML files.`);

    // Pre-render top-level static pages for direct URL access without 404
    console.log('Generating static HTML for top-level routes...');

    let authorAvatarUrl = DEFAULT_AVATAR_URL;
    let authorBioText = DEFAULT_AUTHOR_BIO;
    try {
      const settingsSnap = await getDocs(collection(db, 'site_settings'));
      settingsSnap.forEach(d => {
        const data = d.data();
        const key = data.key || d.id;
        if (key === 'avatar_url' && data.value) {
          authorAvatarUrl = data.value;
        }
        if (key === 'author_bio' && data.value) {
          authorBioText = data.value;
        }
      });
    } catch (err) {
      console.warn('Could not fetch site_settings in prerender:', err);
    }

    const staticRoutes = [
      { route: 'sobre', title: 'Sobre Natanael Brentano — Poeta', description: 'Biografia, influências e trajetória poética de Natanael Fernando Gatti Brentano.', type: 'profile' },
      { route: 'colecoes', title: 'Coleções e Sentimentos — Natanael Brentano', description: 'Explore poemas organizados por séries temáticas e sentimentos.' },
      { route: 'admin', title: 'Painel Admin — Natanael Brentano', description: 'Área administrativa para gestão de poemas e métricas.', robots: 'noindex, nofollow' },
      { route: 'login', title: 'Login Admin — Natanael Brentano', description: 'Acesso ao painel administrativo.', robots: 'noindex, nofollow' },
      { route: 'unsubscribe', title: 'Cancelar Inscrição — Natanael Brentano', description: 'Cancelamento de inscrição na newsletter de poemas.', robots: 'noindex, nofollow' },
      { route: 'cancelar-inscricao', title: 'Cancelar Inscrição — Natanael Brentano', description: 'Cancelamento de inscrição na newsletter de poemas.', robots: 'noindex, nofollow' }
    ];

    for (const sr of staticRoutes) {
      const targetDir = path.join(distDir, sr.route);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      const canonicalRouteUrl = `${baseUrl}${sr.route}/`;

      // Remove existing JSON-LD
      let html = originalHtml.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(sr.title)}</title>`)
        .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonicalRouteUrl}" />`)
        .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(sr.description)}" />`)
        .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(sr.title)}" />`)
        .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(sr.description)}" />`)
        .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalRouteUrl}" />`)
        .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(sr.title)}" />`)
        .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(sr.description)}" />`)
        .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/jpeg" />\n    <meta property="og:image:alt" content="${escapeHtml(sr.title)}" />`)
        .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />`);
      
      if (sr.type) {
        html = html.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${escapeHtml(sr.type)}" />`);
      }

      let structuredDataHtml = '';
      if (sr.route === 'sobre') {
        const sobreBreadcrumbs = [
          { name: 'Início', url: baseUrl },
          { name: 'Sobre', url: `${baseUrl}sobre/` }
        ];
        const faqList = getAboutFaq({
          poemsCount: count || poems.length,
          collectionsCount: allCollections.filter(c => c.slug).length
        });
        structuredDataHtml = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(profilePageSchema())}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(breadcrumbSchema(sobreBreadcrumbs))}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(faqPageSchema(faqList))}</script>`;
      } else if (sr.route === 'colecoes') {
        const colecoesBreadcrumbs = [
          { name: 'Início', url: baseUrl },
          { name: 'Coleções', url: `${baseUrl}colecoes/` }
        ];
        structuredDataHtml = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(collectionsListSchema(allCollections))}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(breadcrumbSchema(colecoesBreadcrumbs))}</script>`;
      }

      if (structuredDataHtml) {
        html = html.replace(/<\/head>/i, `${structuredDataHtml}\n</head>`);
      }

      if (sr.robots) {
        html = html.replace(/<\/head>/i, `  <meta name="robots" content="${escapeHtml(sr.robots)}" />\n</head>`);
      }

      // RF04 & CA04: Pre-renderizar DOM estático completo da página /sobre/
      if (sr.route === 'sobre') {
        const renderedAboutMarkup = renderAboutMarkup({
          avatarUrl: authorAvatarUrl,
          bioText: authorBioText,
          poemsCount: count || poems.length,
          collectionsCount: allCollections.filter(c => c.slug).length,
          baseUrl: '/'
        });
        const aboutShell = renderBaseLayout({
          mainContent: renderedAboutMarkup,
          dataPrerendered: '/sobre'
        });
        html = html.replace(
          /<div id="app"><\/div>/i,
          `<div id="app">${aboutShell}</div>`
        );
      }

      fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8');
    }

    // RF05 & CA05: Redirecionar /info/ para /sobre/
    const infoDir = path.join(distDir, 'info');
    if (!fs.existsSync(infoDir)) {
      fs.mkdirSync(infoDir, { recursive: true });
    }
    const infoRedirectHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${baseUrl}sobre/">
  <link rel="canonical" href="${baseUrl}sobre/">
  <title>Redirecionando...</title>
  <script>window.location.replace('/sobre/');</script>
</head>
<body>
  <p>Redirecionando para <a href="/sobre/">/sobre/</a>...</p>
</body>
</html>
`;
    fs.writeFileSync(path.join(infoDir, 'index.html'), infoRedirectHtml, 'utf-8');

    // Pre-render collection routes
    try {
      for (const col of allCollections) {
        if (col.slug) {
          const colDir = path.join(distDir, 'colecao', col.slug);
          if (!fs.existsSync(colDir)) {
            fs.mkdirSync(colDir, { recursive: true });
          }
          const title = `${col.name} — Coleção de Poemas`;
          const desc = col.description || `Poemas da coleção ${col.name}.`;
          const colUrl = `${baseUrl}colecao/${col.slug}/`;
          
          const generatedOgPath = await generateCollectionOgImage(col);
          const ogImage = generatedOgPath.startsWith('http') ? generatedOgPath : `${baseUrl.replace(/\/$/, '')}${generatedOgPath}`;

          const associatedRelations = colToPoemsMap.get(col.id) || [];
          const poemOrderMap = new Map(associatedRelations.map(r => [r.poem_id, r.order]));
          const colPoems = poems.filter(p => poemOrderMap.has(p.id) || (p.collection_slugs && p.collection_slugs.includes(col.slug)))
            .map(p => ({ ...p, _order: poemOrderMap.get(p.id) }));
          
          colPoems.sort((a, b) => {
            if (a._order !== undefined && b._order !== undefined && a._order !== b._order) {
              return a._order - b._order;
            }
            return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
          });
          const colBreadcrumbs = [
            { name: 'Início', url: baseUrl },
            { name: 'Coleções', url: `${baseUrl}colecoes/` },
            { name: col.name, url: colUrl }
          ];

          const colLd = collectionSchema(col, colPoems);
          const breadcrumbLd = breadcrumbSchema(colBreadcrumbs);
          const structuredDataHtml = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(colLd)}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(breadcrumbLd)}</script>`;

          let html = originalHtml.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
            .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${colUrl}" />`)
            .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(desc)}" />`)
            .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`)
            .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(desc)}" />`)
            .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${colUrl}" />`)
            .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${ogImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/png" />\n    <meta property="og:image:alt" content="${escapeHtml(title)}" />`)
            .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
            .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(desc)}" />`)
            .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${ogImage}" />`);

          html = html.replace(/<\/head>/i, `${structuredDataHtml}\n</head>`);

          const colMarkup = renderCollectionMarkup({
            col,
            poemsList: colPoems,
            baseUrl: '/'
          });
          const colShell = renderBaseLayout({
            mainContent: colMarkup,
            dataPrerendered: `/colecao/${col.slug}`
          });
          html = html.replace(/<div id="app"><\/div>/i, `<div id="app">${colShell}</div>`);

          fs.writeFileSync(path.join(colDir, 'index.html'), html, 'utf-8');
        }
      }
      console.log(`Generated static HTML for ${allCollections.length} collections.`);
    } catch (e) {
      console.warn('Could not prerender collection routes:', e.message);
    }

    // Pre-render sentiment routes and /sentimentos/ hub (RF04, RF07, RF08, RF09, CA01, CA02, CA05, CA06)
    console.log('Generating pre-rendered content for sentiments and tag redirects...');
    const sentimentMap = new Map();
    poems.forEach(poem => {
      const tags = Array.isArray(poem.tags) ? poem.tags : [];
      tags.forEach(t => {
        const slug = slugifyTag(t);
        if (!slug) return;
        if (!sentimentMap.has(slug)) {
          sentimentMap.set(slug, {
            slug,
            name: getSentimentName(slug, formatTag(t)),
            poems: []
          });
        }
        sentimentMap.get(slug).poems.push(poem);
      });
    });

    const allSentiments = Array.from(sentimentMap.values());
    const qualifyingSentiments = allSentiments
      .filter(s => s.poems.length >= 3)
      .sort((a, b) => b.poems.length - a.poems.length || a.name.localeCompare(b.name));

    // 1. Render /sentimentos/ hub
    try {
      const sentimentosDir = path.join(distDir, 'sentimentos');
      if (!fs.existsSync(sentimentosDir)) {
        fs.mkdirSync(sentimentosDir, { recursive: true });
      }
      const hubTitle = 'Poemas por Sentimento — Natanael Brentano';
      const hubDesc = 'Navegue pelos poemas organizados por sentimentos e temas, descobrindo versos sobre amor, saudade, efêmero e vida.';
      const hubUrl = `${baseUrl}sentimentos/`;
      const hubBreadcrumbs = [
        { name: 'Início', url: baseUrl },
        { name: 'Sentimentos', url: hubUrl }
      ];
      const hubStructuredData = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(sentimentsListSchema(qualifyingSentiments))}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(breadcrumbSchema(hubBreadcrumbs))}</script>`;

      const hubMainMarkup = `
      <section class="sentiments-page fade-in">
        <header class="page-header" style="margin-bottom: var(--space-2xl);">
          ${renderBreadcrumbsHtml(hubBreadcrumbs)}
          <h1 class="page-title" style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.75rem); margin-bottom: 0.75rem;">Poemas por Sentimento</h1>
          <p class="page-description" style="color: var(--text-muted); font-size: 1.05rem; max-width: 650px; line-height: 1.6;">
            Navegue pelos poemas organizados por sentimentos e temas. Cada página reúne versos que exploram uma emoção, reflexão ou estado de espírito.
          </p>
        </header>

        <div class="sentiments-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
          ${qualifyingSentiments.map(s => `
            <a href="/sentimento/${escapeHtml(s.slug)}/" class="sentiment-card" data-link style="padding: 1.25rem; border: 1px solid var(--border-subtle); border-radius: 8px; text-decoration: none; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease;">
              <span class="sentiment-name" style="font-weight: 500; font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary);">${escapeHtml(s.name)}</span>
              <span class="sentiment-badge" style="color: var(--accent); font-size: 0.85rem; background: var(--border-subtle); padding: 3px 10px; border-radius: 12px;">${s.poems.length} poemas</span>
            </a>
          `).join('')}
        </div>
      </section>
      `;

      const hubShell = renderBaseLayout({
        mainContent: hubMainMarkup,
        dataPrerendered: '/sentimentos'
      });

      let hubHtml = originalHtml.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<div id="app"><\/div>/i, `<div id="app">${hubShell}</div>`)
        .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(hubTitle)}</title>`)
        .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${hubUrl}" />`)
        .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(hubDesc)}" />`)
        .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(hubTitle)}" />`)
        .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(hubDesc)}" />`)
        .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${hubUrl}" />`)
        .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/jpeg" />\n    <meta property="og:image:alt" content="${escapeHtml(hubTitle)}" />`)
        .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(hubTitle)}" />`)
        .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(hubDesc)}" />`)
        .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />`);

      hubHtml = hubHtml.replace(/<\/head>/i, `${hubStructuredData}\n</head>`);
      fs.writeFileSync(path.join(sentimentosDir, 'index.html'), hubHtml, 'utf-8');
      console.log('Generated static HTML for /sentimentos/');
    } catch (e) {
      console.warn('Could not prerender /sentimentos/ hub:', e.message);
    }

    // 2. Render each /sentimento/<slug>/ page and /tag/<slug>/ redirect
    try {
      for (const s of allSentiments) {
        const sentDir = path.join(distDir, 'sentimento', s.slug);
        if (!fs.existsSync(sentDir)) {
          fs.mkdirSync(sentDir, { recursive: true });
        }

        const isIndexable = s.poems.length >= 3;
        const pageTitle = `Poemas sobre ${s.name} — Natanael Brentano`;
        const introText = getSentimentIntro(s.name, s.slug);
        const count = s.poems.length;
        const countSuffix = count === 1 ? '1 poema' : `${count} poemas`;
        const metaDescription = `${countSuffix} sobre ${s.name.toLowerCase()}. ${introText}`.slice(0, 160);
        const sentUrl = `${baseUrl}sentimento/${s.slug}/`;

        // Calculate related sentiments
        const relatedCounts = {};
        s.poems.forEach(p => {
          (p.tags || []).forEach(t => {
            const relSlug = slugifyTag(t);
            if (relSlug && relSlug !== s.slug) {
              if (!relatedCounts[relSlug]) {
                relatedCounts[relSlug] = {
                  slug: relSlug,
                  name: getSentimentName(relSlug, formatTag(t)),
                  count: 0
                };
              }
              relatedCounts[relSlug].count += 1;
            }
          });
        });
        const relatedList = Object.values(relatedCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const relatedHtml = relatedList.length > 0 ? `
          <div class="sentiment-related" style="margin: 1.5rem 0 2rem 0;">
            <span class="filter-label" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Sentimentos relacionados:</span>
            <div class="related-sentiment-chips" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${relatedList.map(r => `
                <a href="/sentimento/${escapeHtml(r.slug)}/" class="filter-chip" data-link>
                  ${escapeHtml(r.name)} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em;">(${r.count})</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : '';

        const sortedPoems = [...s.poems].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

        const breadcrumbItems = [
          { name: 'Início', url: baseUrl },
          { name: 'Sentimentos', url: `${baseUrl}sentimentos/` },
          { name: s.name, url: sentUrl }
        ];

        const sentMainMarkup = `
        <section class="collection-detail sentiment-detail fade-in">
          <header class="collection-header">
            ${renderBreadcrumbsHtml(breadcrumbItems)}
            <a href="/sentimentos/" class="back-link" data-link>← Ver todos os sentimentos</a>
            <h1 class="collection-title">Poemas sobre ${escapeHtml(s.name)}</h1>
            <p class="collection-meta" style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
              ${count} poema${count !== 1 ? 's' : ''}
            </p>
            <p class="collection-desc-large" style="margin-top: 1rem;">${escapeHtml(introText)}</p>
            ${relatedHtml}
          </header>

          <div class="poems-list">
            ${sortedPoems.map(poem => {
              const year = new Date(poem.published_at).getFullYear();
              return `
                <article class="poem-row">
                  <a href="/poema/${escapeHtml(poem.slug)}/" class="poem-row-link" data-link>
                    <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
                    <span class="poem-row-year">${year}</span>
                  </a>
                </article>
              `;
            }).join('')}
          </div>
        </section>
        `;

        const sentShell = renderBaseLayout({
          mainContent: sentMainMarkup,
          dataPrerendered: `/sentimento/${s.slug}`
        });

        let sentHtml = originalHtml.replace(/<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<div id="app"><\/div>/i, `<div id="app">${sentShell}</div>`)
          .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
          .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${sentUrl}" />`)
          .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(metaDescription)}" />`)
          .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(pageTitle)}" />`)
          .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(metaDescription)}" />`)
          .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${sentUrl}" />`)
          .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/jpeg" />\n    <meta property="og:image:alt" content="${escapeHtml(pageTitle)}" />`)
          .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(pageTitle)}" />`)
          .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(metaDescription)}" />`)
          .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />`);

        if (isIndexable) {
          const sentStructuredData = `\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(sentimentSchema(s.name, s.slug, sortedPoems, introText))}</script>\n    <script type="application/ld+json" data-seo="true">${serializeJsonLd(breadcrumbSchema(breadcrumbItems))}</script>`;
          sentHtml = sentHtml.replace(/<\/head>/i, `${sentStructuredData}\n</head>`);
        } else {
          // RF07 & CA02 & CT02: < 3 poemas recebe noindex, follow
          sentHtml = sentHtml.replace(/<\/head>/i, `  <meta name="robots" content="noindex, follow" />\n</head>`);
        }

        fs.writeFileSync(path.join(sentDir, 'index.html'), sentHtml, 'utf-8');

        // RF09: Redirecionar /tag/<slug> para /sentimento/<slug>/ gerando dist/tag/<slug>/index.html
        const tagDir = path.join(distDir, 'tag', s.slug);
        if (!fs.existsSync(tagDir)) {
          fs.mkdirSync(tagDir, { recursive: true });
        }
        const tagRedirectHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Redirecionando...</title>
  <link rel="canonical" href="${sentUrl}">
  <meta http-equiv="refresh" content="0; url=${sentUrl}">
</head>
<body>
  <p>Redirecionando para <a href="${sentUrl}">${sentUrl}</a>...</p>
</body>
</html>`;
        fs.writeFileSync(path.join(tagDir, 'index.html'), tagRedirectHtml, 'utf-8');
      }
      console.log(`Generated static HTML for ${allSentiments.length} sentiments (${qualifyingSentiments.length} indexable) and tag redirects.`);
    } catch (e) {
      console.warn('Could not prerender sentiment routes:', e.message);
    }


    // Pre-render home page in dist/index.html (RF05)
    console.log('Generating pre-rendered content for home page (dist/index.html)...');
    const sortedPoemsDesc = [...poems].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    const podPoem = getPoemOfDay(poems);
    const homeMainMarkup = renderHomeMarkup({ poems: sortedPoemsDesc, podPoem, allCollections });
    const homeShell = renderBaseLayout({
      mainContent: homeMainMarkup,
      dataPrerendered: '/'
    });

    const homeDesc = 'Poemas e poesia brasileira contemporânea de Natanael Brentano. Uma coleção de versos originais em português sobre amor, tempo, efêmero e o cotidiano.';
    let homeHtml = originalHtml
      .replace(/<div id="app"><\/div>/i, `<div id="app">${homeShell}</div>`)
      .replace(/<title>[^<]*<\/title>/i, `<title>Poemas Brasileiros — Natanael Brentano</title>`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${baseUrl}" />`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(homeDesc)}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="Poemas Brasileiros — Natanael Brentano" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(homeDesc)}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${baseUrl}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />\n    <meta property="og:image:type" content="image/jpeg" />\n    <meta property="og:image:alt" content="Poemas Brasileiros — Natanael Brentano" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="Poemas Brasileiros — Natanael Brentano" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(homeDesc)}" />`)
      .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${baseUrl.replace(/\/$/, '')}${defaultOgImage}" />`);

    fs.writeFileSync(templatePath, homeHtml, 'utf-8');
    console.log('Pre-rendered home page successfully generated at dist/index.html');

    // Generate legacy redirects (RF06 & RNF02)
    console.log('Generating legacy redirects...');
    const legacyRedirectsPath = path.resolve(process.cwd(), 'scripts/legacy-redirects.json');
    let legacyRedirects = {};
    if (fs.existsSync(legacyRedirectsPath)) {
      try {
        legacyRedirects = JSON.parse(fs.readFileSync(legacyRedirectsPath, 'utf-8'));
      } catch (err) {
        console.warn('Could not read legacy-redirects.json:', err.message);
      }
    }

    for (const [origin, destination] of Object.entries(legacyRedirects)) {
      if (origin.startsWith('/') && !origin.includes('?')) {
        const cleanOrigin = origin.replace(/^\/|\/$/g, '');
        const cleanDest = destination.replace(/^\/|\/$/g, '');
        if (cleanOrigin && cleanOrigin !== cleanDest) {
          const targetDir = path.join(distDir, cleanOrigin);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          const fullDest = destination.startsWith('http') ? destination : `${baseUrl}${cleanDest}`;
          const redirectHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>Redirecionando...</title>
  <link rel="canonical" href="${fullDest}">
  <meta http-equiv="refresh" content="0; url=${destination}">
</head>
<body>
  <p>Redirecionando para <a href="${destination}">${destination}</a>...</p>
</body>
</html>`;
          fs.writeFileSync(path.join(targetDir, 'index.html'), redirectHtml, 'utf-8');
        }
      }
    }

    // Generate dist/routes.json and inject into dist/404.html (RF05)
    console.log('Generating dist/routes.json and updating dist/404.html...');
    const knownRoutes = [
      '/',
      ...staticRoutes.map(sr => `/${sr.route}`),
      '/sentimentos',
      ...allSentiments.map(s => `/sentimento/${s.slug}`),
      '/aleatorio',
      ...poems.map(p => `/poema/${p.slug}`),
      ...allCollections.filter(c => c.slug).map(c => `/colecao/${c.slug}`)
    ];

    fs.writeFileSync(path.join(distDir, 'routes.json'), JSON.stringify(knownRoutes, null, 2), 'utf-8');

    const dist404Path = path.join(distDir, '404.html');
    if (fs.existsSync(dist404Path)) {
      let html404 = fs.readFileSync(dist404Path, 'utf-8');
      const injection = `<script id="__ROUTES__">window.__KNOWN_ROUTES__ = ${JSON.stringify(knownRoutes)}; window.__LEGACY_REDIRECTS__ = ${JSON.stringify(legacyRedirects)};</script>`;
      if (html404.includes('id="__ROUTES__"')) {
        html404 = html404.replace(/<script id="__ROUTES__">[\s\S]*?<\/script>/i, injection);
      } else {
        html404 = html404.replace(/<\/head>/i, `  ${injection}\n</head>`);
      }
      fs.writeFileSync(dist404Path, html404, 'utf-8');
    }

    // Automated Sitemap Noindex Audit (RNF01 & CA06)
    console.log('Running sitemap noindex audit...');
    const sitemapPath = path.join(distDir, 'sitemap.xml');
    if (fs.existsSync(sitemapPath)) {
      const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
      let locMatches = [];
      if (sitemapContent.includes('<sitemapindex')) {
        const subSitemaps = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
        for (const subUrl of subSitemaps) {
          const fileName = path.basename(subUrl);
          const subFilePath = path.join(distDir, fileName);
          if (fs.existsSync(subFilePath)) {
            const subContent = fs.readFileSync(subFilePath, 'utf-8');
            const subUrls = [...subContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
            locMatches.push(...subUrls);
          }
        }
      } else {
        locMatches = [...sitemapContent.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
      }
      const privateRoutes = ['/admin', '/login', '/unsubscribe', '/cancelar-inscricao'];

      for (const loc of locMatches) {
        // Guard 1: Ensure no private routes in sitemap
        for (const priv of privateRoutes) {
          if (loc.endsWith(priv) || loc.includes(`${priv}/`)) {
            throw new Error(`[BUILD AUDIT FAILED] Sitemap contains forbidden private route: ${loc}`);
          }
        }

        // Guard 2: Ensure no sitemap URL contains 'noindex'
        const cleanBaseUrl = baseUrl.replace(/\/$/, '');
        const relativePath = loc.replace(cleanBaseUrl, '').replace(/^\/|\/$/g, '');
        const targetHtmlPath = relativePath 
          ? path.join(distDir, relativePath, 'index.html') 
          : path.join(distDir, 'index.html');

        if (fs.existsSync(targetHtmlPath)) {
          const fileContent = fs.readFileSync(targetHtmlPath, 'utf-8');
          if (/<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(fileContent)) {
            throw new Error(`[BUILD AUDIT FAILED] Sitemap URL "${loc}" contains 'noindex' in ${targetHtmlPath}! Build aborted to prevent deindexing valid content.`);
          }
        }
      }
      console.log(`✓ Sitemap audit passed: ${locMatches.length} URLs verified, none contain 'noindex'.`);
    }

    console.log('All static pages successfully pre-rendered!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to pre-render:', err);
    process.exit(1);
  }
}

prerender();
