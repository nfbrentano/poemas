import { db } from '../utils/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { updateSEO } from '../utils/seo.js';
import { sentimentsListSchema, breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { escapeHtml } from '../utils/html.js';
import { slugifyTag, formatTag } from '../utils/tags.js';
import { getSentimentName } from '../data/sentiments.js';

export const sentiments = {
  meta: {
    title: 'Poemas por Sentimento — Natanael Brentano',
    description: 'Explore todos os sentimentos e temas dos poemas de Natanael Brentano.'
  },
  async render(container) {
    container.innerHTML = `
      <section class="sentiments-page fade-in">
        <header class="page-header" style="margin-bottom: var(--space-2xl);">
          <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="width: 80%; height: 20px;"></div>
        </header>
        <div class="sentiments-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
          <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
          <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
          <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
        </div>
      </section>
    `;

    const sentimentMap = new Map();

    try {
      const q = query(collection(db, 'poems'), where('status', '==', 'published'));
      const snapshot = await getDocs(q);

      snapshot.forEach(doc => {
        const p = doc.data();
        const tags = Array.isArray(p.tags) ? p.tags : [];
        tags.forEach(t => {
          const slug = slugifyTag(t);
          if (!slug) return;
          if (!sentimentMap.has(slug)) {
            sentimentMap.set(slug, {
              slug,
              name: getSentimentName(slug, formatTag(t)),
              count: 0
            });
          }
          sentimentMap.get(slug).count += 1;
        });
      });
    } catch (e) {
      console.error('[Sentiments] Error fetching poems:', e);
    }

    // RF07 & RF08: Listar sentimentos indexáveis com pelo menos 3 poemas
    const list = Array.from(sentimentMap.values())
      .filter(s => s.count >= 3)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    const canonicalUrl = `${SITE_URL}/sentimentos/`;
    const breadcrumbItems = [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: 'Sentimentos', url: canonicalUrl }
    ];

    const pageTitle = 'Poemas por Sentimento — Natanael Brentano';
    const pageDesc = 'Navegue pelos poemas organizados por sentimentos e temas, descobrindo versos sobre amor, saudade, efêmero e vida.';

    sentiments.meta = {
      title: pageTitle,
      description: pageDesc
    };
    document.title = pageTitle;

    updateSEO({
      title: pageTitle,
      description: pageDesc,
      url: canonicalUrl,
      type: 'website',
      structuredData: [
        sentimentsListSchema(list),
        breadcrumbSchema(breadcrumbItems)
      ]
    });

    container.innerHTML = `
      <section class="sentiments-page fade-in">
        <header class="page-header" style="margin-bottom: var(--space-2xl);">
          ${renderBreadcrumbsHtml(breadcrumbItems)}
          <h1 class="page-title" style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.75rem); margin-bottom: 0.75rem;">Poemas por Sentimento</h1>
          <p class="page-description" style="color: var(--text-muted); font-size: 1.05rem; max-width: 650px; line-height: 1.6;">
            Navegue pelos poemas organizados por sentimentos e temas. Cada página reúne versos que exploram uma emoção, reflexão ou estado de espírito.
          </p>
        </header>

        <div class="sentiments-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
          ${list.length > 0 ? list.map(s => `
            <a href="${import.meta.env.BASE_URL}sentimento/${escapeHtml(s.slug)}/" class="sentiment-card" data-link style="padding: 1.25rem; border: 1px solid var(--border-subtle); border-radius: 8px; text-decoration: none; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease;">
              <span class="sentiment-name" style="font-weight: 500; font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary);">${escapeHtml(s.name)}</span>
              <span class="sentiment-badge" style="color: var(--accent); font-size: 0.85rem; background: var(--border-subtle); padding: 3px 10px; border-radius: 12px;">${s.count} poemas</span>
            </a>
          `).join('') : '<p class="empty-state-desc">Nenhum sentimento com poemas suficientes encontrado.</p>'}
        </div>
      </section>
    `;
  }
};

export default sentiments;
