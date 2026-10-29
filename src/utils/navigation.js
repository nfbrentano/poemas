import { navigateTo } from '../router.js';

export function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  const basePath = import.meta.env.BASE_URL;
  const cleanBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  
  const isPoemOrHome = currentPath === basePath || currentPath === cleanBase || currentPath === '/' || currentPath.includes('/poema/');
  const isCollections = currentPath.includes('/colecoe') || currentPath.includes('/colecao/');
  const isAbout = currentPath.includes('/sobre');

  const allNavLinks = document.querySelectorAll('.main-nav a, .bottom-nav-item[href]');
  
  allNavLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    let isActive = false;

    if (link.textContent.includes('Poemas') || href === basePath || href === cleanBase || href === '/') {
      isActive = isPoemOrHome && !isCollections && !isAbout;
    } else if (link.textContent.includes('Coleções') || href.includes('/colecoes')) {
      isActive = isCollections;
    } else if (link.textContent.includes('Sobre') || href.includes('/sobre')) {
      isActive = isAbout;
    }

    link.classList.toggle('active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
import { toast } from '../components/toast.js';

let cachedPublishedSlugs = null;

export async function getRandomPoem(event) {
  let btn = null;
  if (event) {
    btn = event.currentTarget || event.target;
  }

  const currentPath = window.location.pathname;
  let currentSlug = null;
  if (currentPath.includes('/poema/')) {
    currentSlug = currentPath.split('/poema/')[1].replace(/\/$/, '');
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'wait';
    }

    let availableSlugs = [];

    if (cachedPublishedSlugs) {
      availableSlugs = cachedPublishedSlugs;
    } else {
      const { getPublishedPoems } = await import('./poems-store.js');
      const poemsData = await getPublishedPoems();
      const slugs = poemsData.map(p => p.slug).filter(Boolean);
      cachedPublishedSlugs = slugs;
      availableSlugs = slugs;
    }

    if (availableSlugs.length > 1 && currentSlug) {
      availableSlugs = availableSlugs.filter(slug => slug !== currentSlug);
    }
    
    if (availableSlugs.length > 0) {
      const randomSlug = availableSlugs[Math.floor(Math.random() * availableSlugs.length)];
      navigateTo('/poema/' + randomSlug);
    } else {
      toast.show('Não foi possível sortear um poema agora.', 'error');
    }
  } catch (err) {
    console.error('Error fetching random poem:', err);
    toast.show('Não foi possível sortear um poema agora.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.cursor = '';
    }
  }
}
