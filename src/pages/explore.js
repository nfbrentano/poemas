import { supabase } from '../utils/supabase.js';
import { updateSEO } from '../utils/seo.js';
import { trackPageView } from '../utils/analytics.js';

export default {
  meta: {
    title: 'Explorar'
  },
  async render(container) {
    trackPageView('/explore');
    updateSEO({
      title: 'Explorar Poemas - Natanael Brentano',
      description: 'Navegue visualmente pelos temas e obras na forma de constelações literárias.',
      url: window.location.href,
      type: 'website'
    });

    container.innerHTML = `
      <div class="explore-container fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: 2rem;">
          <h1 class="page-title">Mapa Literário</h1>
          <p class="page-subtitle">Uma constelação de temas e sentimentos. Clique para explorar.</p>
        </header>
        <div class="explore-map" id="explore-map">
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color: var(--text-muted); font-family: var(--font-ui);">Mapeando sentimentos...</div>
        </div>
      </div>
    `;

    const mapEl = document.getElementById('explore-map');

    // Fetch tags from all published poems
    const { data: poems, error } = await supabase
      .from('poems')
      .select('tags')
      .eq('status', 'published');
      
    if (error || !poems) {
      console.error('Error fetching tags:', error);
      mapEl.innerHTML = '<p style="text-align:center; padding-top: 20%;">O mapa está obscurecido por nuvens. Tente novamente mais tarde.</p>';
      return;
    }

    const tagCounts = {};
    poems.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });

    const tagsArray = Object.keys(tagCounts).map(t => ({ tag: t, count: tagCounts[t] })).sort((a, b) => b.count - a.count);

    if (tagsArray.length === 0) {
      mapEl.innerHTML = '<p style="text-align:center; padding-top: 20%;">Ainda não há sentimentos mapeados.</p>';
      return;
    }

    mapEl.innerHTML = '';
    
    // Create nodes with random positions but somewhat dispersed
    tagsArray.forEach((t, i) => {
      // Base size relative to count, min 80, max 160
      const size = Math.max(80, Math.min(160, 60 + (t.count * 15)));
      
      // Random position (avoid edges completely)
      const top = 10 + Math.random() * 70; // 10% to 80%
      const left = 5 + Math.random() * 80; // 5% to 85%
      
      const animationDelay = (Math.random() * 2) + 's';
      const animationDuration = (4 + Math.random() * 3) + 's';
      
      const a = document.createElement('a');
      a.href = `${import.meta.env.BASE_URL}?tag=${encodeURIComponent(t.tag)}`;
      a.className = 'explore-node fade-in';
      a.setAttribute('data-link', '');
      a.style.width = size + 'px';
      a.style.height = size + 'px';
      a.style.top = top + '%';
      a.style.left = left + '%';
      a.style.animationDelay = animationDelay;
      a.style.animationDuration = animationDuration;
      
      // Some visual variety
      if (i % 3 === 0) {
        a.style.borderColor = 'var(--accent-subtle)';
        a.style.color = 'var(--accent-subtle)';
      }
      
      a.innerHTML = `
        <div>
          <div class="explore-node-tag">${t.tag}</div>
          <div class="explore-node-count">${t.count} obra${t.count !== 1 ? 's' : ''}</div>
        </div>
      `;
      
      mapEl.appendChild(a);
    });
  }
};
