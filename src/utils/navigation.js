export function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  const basePath = import.meta.env.BASE_URL;
  const navLinks = document.querySelectorAll('.main-nav a');
  
  navLinks.forEach(link => {
    // If we are at home or on a poem page, "Poemas" should be active
    const isPoemPage = currentPath.includes('/poema/');
    const isHome = currentPath === basePath || currentPath === basePath.slice(0, -1) || currentPath === '/';
    
    if (link.textContent.trim() === 'Poemas' && (isHome || isPoemPage)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
