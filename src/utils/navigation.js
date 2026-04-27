import { supabase } from './supabase.js';
import { navigateTo } from '../router.js';

export function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  const basePath = import.meta.env.BASE_URL;
  const navLinks = document.querySelectorAll('.main-nav a');
  
  navLinks.forEach(link => {
    // If we are at home or on a poem page, "Poemas" should be active
    const isPoemPage = currentPath.includes('/poema/');
    const isHome = currentPath === basePath || currentPath === basePath.slice(0, -1) || currentPath === '/';
    const isFavorites = currentPath.includes('/favoritos');
    
    if (link.textContent.trim() === 'Poemas' && (isHome || isPoemPage)) {
      link.classList.add('active');
    } else if (link.textContent.trim() === 'Salvos' && isFavorites) {
      link.classList.add('active');
    } else if (link.getAttribute('href') === basePath + 'sobre' && currentPath.includes('/sobre')) {
       link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

export async function getRandomPoem() {
  try {
    const { data, error } = await supabase
      .rpc('get_random_poem');
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      navigateTo('/poema/' + data[0].slug);
    }
  } catch (err) {
    console.error('Error fetching random poem:', err);
  }
}
