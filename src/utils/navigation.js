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

export async function getRandomPoem() {
  try {
    const { db } = await import('./firebase.js');
    const { collection, getDocs } = await import('firebase/firestore');
    
    const querySnapshot = await getDocs(collection(db, 'poems'));
    const poems = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.slug) poems.push(data.slug);
    });
    
    if (poems.length > 0) {
      const randomSlug = poems[Math.floor(Math.random() * poems.length)];
      navigateTo('/poema/' + randomSlug);
    }
  } catch (err) {
    console.error('Error fetching random poem:', err);
  }
}
