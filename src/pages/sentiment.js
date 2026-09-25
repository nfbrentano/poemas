import { db } from '../utils/firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { updateSEO, setNotFoundSEO } from '../utils/seo.js';
import { sentimentSchema, breadcrumbSchema, renderBreadcrumbsHtml, SITE_URL } from '../utils/structured-data.js';
import { escapeHtml } from '../utils/html.js';
import { slugifyTag, formatTag } from '../utils/tags.js';
import { getSentimentIntro, getSentimentName } from '../data/sentiments.js';

export const sentiment = {
  meta: {
    title: 'Sentimento'
  },
  async render(container, params) {
    const rawSlug = typeof params === 'object' ? params.slug : params;
    const slug = slugifyTag(rawSlug || '');

    container.innerHTML = `
      <section class="collection-detail fade-in">
        <header class="collection-header">
          <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="width: 80%; height: 20px;"></div>
        </header>
        <div class="poems-list">
          <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
          <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
          <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
        </div>
      </section>
    `;

    if (!slug) {
      this.renderNotFound(container);
      return;
    }

    let matchingPoems = [];
    let detectedName = '';
    const relatedCounts = {};

    try {
      // 1 single Firestore query to fetch published poems (RNF02: <= 2 queries)
      const q = query(collection(db, 'poems'), where('status', '==', 'published'));
      const snapshot = await getDocs(q);

      snapshot.forEach(doc => {
        const p = { id: doc.id, ...doc.data() };
        const tags = Array.isArray(p.tags) ? p.tags : [];
        let hasTag = false;

        tags.forEach(t => {
          if (slugifyTag(t) === slug) {
            hasTag = true;
            if (!detectedName) {
              detectedName = formatTag(t);
            }
          }
        });

        if (hasTag) {
          matchingPoems.push(p);

          // Co-occurring tags for related sentiments (CT06)
          tags.forEach(t => {
            const relatedSlug = slugifyTag(t);
            if (relatedSlug && relatedSlug !== slug) {
              if (!relatedCounts[relatedSlug]) {
                relatedCounts[relatedSlug] = {
                  slug: relatedSlug,
                  name: formatTag(t),
                  count: 0
                };
              }
              relatedCounts[relatedSlug].count += 1;
            }
          });
        }
      });
    } catch (e) {
      console.error('[Sentiment] Error fetching poems:', e);
    }

    // CT05: Se não houver poemas publicados com esse sentimento, retorna 404
    if (matchingPoems.length === 0) {
      this.renderNotFound(container);
      return;
    }

    // Ordenar poemas por published_at desc
    matchingPoems.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Determinar nome do sentimento e textos
    const sentimentName = getSentimentName(slug, detectedName);
    const pageTitle = `Poemas sobre ${sentimentName}`;
    const introText = getSentimentIntro(sentimentName, slug);
    const count = matchingPoems.length;
    const countSuffix = count === 1 ? '1 poema' : `${count} poemas`;
    const metaDescription = `${countSuffix} sobre ${sentimentName.toLowerCase()}. ${introText}`.slice(0, 160);

    const canonicalUrl = `${SITE_URL}/sentimento/${slug}/`;
    const breadcrumbItems = [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: 'Sentimentos', url: `${SITE_URL}/sentimentos/` },
      { name: sentimentName, url: canonicalUrl }
    ];

    // RF07 & CA02 & CT02: Limite de indexação (≥ 3 poemas)
    const isIndexable = count >= 3;
    const robots = isIndexable ? undefined : 'noindex, follow';

    sentiment.meta = {
      title: pageTitle,
      description: metaDescription,
      robots
    };
    document.title = `${pageTitle} — Natanael Brentano`;

    updateSEO({
      title: pageTitle,
      description: metaDescription,
      url: canonicalUrl,
      robots,
      type: 'website',
      structuredData: isIndexable ? [
        sentimentSchema(sentimentName, slug, matchingPoems, introText),
        breadcrumbSchema(breadcrumbItems)
      ] : []
    });

    // Top related sentiments (sorted by frequency)
    const relatedList = Object.values(relatedCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const relatedHtml = relatedList.length > 0 ? `
      <div class="sentiment-related" style="margin: 1.5rem 0 2rem 0;">
        <span class="filter-label" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Sentimentos relacionados:</span>
        <div class="related-sentiment-chips" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${relatedList.map(r => `
            <a href="${import.meta.env.BASE_URL}sentimento/${escapeHtml(r.slug)}/" class="filter-chip" data-link>
              ${escapeHtml(r.name)} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em;">(${r.count})</span>
            </a>
          `).join('')}
        </div>
      </div>
    ` : '';

    container.innerHTML = `
      <section class="collection-detail sentiment-detail fade-in">
        <header class="collection-header">
          ${renderBreadcrumbsHtml(breadcrumbItems)}
          <a href="${import.meta.env.BASE_URL}sentimentos/" class="back-link" data-link>← Ver todos os sentimentos</a>
          <h1 class="collection-title">${escapeHtml(pageTitle)}</h1>
          <p class="collection-meta" style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
            ${count} poema${count !== 1 ? 's' : ''}
          </p>
          <p class="collection-desc-large" style="margin-top: 1rem;">${escapeHtml(introText)}</p>
          ${relatedHtml}
        </header>

        <div class="poems-list">
          ${matchingPoems.map(poem => {
            const year = new Date(poem.published_at).getFullYear();
            return `
              <article class="poem-row">
                <a href="${import.meta.env.BASE_URL}poema/${escapeHtml(poem.slug)}/" class="poem-row-link" data-link>
                  <h3 class="poem-row-title">${escapeHtml(poem.title)}</h3>
                  <span class="poem-row-year">${year}</span>
                </a>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  renderNotFound(container) {
    sentiment.meta = {
      title: 'Página não encontrada',
      robots: 'noindex, follow'
    };
    setNotFoundSEO();
    container.innerHTML = `
      <div class="not-found-page fade-in">
        <p class="not-found-label">404</p>
        <h2 class="not-found-title">Sentimento não encontrado</h2>
        <p class="not-found-desc">Não encontramos poemas para o sentimento solicitado.</p>
        <a href="${import.meta.env.BASE_URL}sentimentos/" data-link class="not-found-link">← Ver todos os sentimentos</a>
      </div>
    `;
  }
};

export default sentiment;
