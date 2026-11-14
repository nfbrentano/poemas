import { escapeHtml } from './html.js';
import { formatTag, slugifyTag } from './tags.js';
import { renderBreadcrumbsHtml } from './structured-data.js';

/**
 * Analisa e extrai ano, timestamp e objeto Date de forma segura e resiliente a fusos horários.
 * Strings no formato 'YYYY-MM-DD' são protegidas contra deslocamento de fuso (UTC midnight shift).
 *
 * @param {string|number|Date|object} dateVal
 * @returns {{ date: Date, year: number, timestamp: number }}
 */
export function parsePoemDate(dateVal) {
  if (!dateVal) {
    const fallback = new Date();
    return { date: fallback, year: fallback.getFullYear(), timestamp: fallback.getTime() };
  }

  // Se já for Firestore Timestamp ou objeto com toDate/seconds
  if (typeof dateVal === 'object' && typeof dateVal.toDate === 'function') {
    const d = dateVal.toDate();
    return { date: d, year: d.getFullYear(), timestamp: d.getTime() };
  }
  if (typeof dateVal === 'object' && typeof dateVal.seconds === 'number') {
    const d = new Date(dateVal.seconds * 1000);
    return { date: d, year: d.getFullYear(), timestamp: d.getTime() };
  }

  // Se for string no formato YYYY-MM-DD simples (sem hora)
  if (typeof dateVal === 'string') {
    const trimmed = dateVal.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const year = parseInt(trimmed.slice(0, 4), 10);
      const d = new Date(`${trimmed}T12:00:00Z`);
      return { date: d, year, timestamp: d.getTime() };
    }
  }

  const d = new Date(dateVal);
  const timestamp = d.getTime();
  if (Number.isNaN(timestamp)) {
    const fallback = new Date();
    return { date: fallback, year: fallback.getFullYear(), timestamp: fallback.getTime() };
  }

  // Se a data de entrada começa com ano YYYY (ex: ISO string)
  let year = d.getFullYear();
  if (typeof dateVal === 'string' && /^\d{4}/.test(dateVal)) {
    const rawYear = parseInt(dateVal.slice(0, 4), 10);
    if (!Number.isNaN(rawYear) && Math.abs(rawYear - year) === 1) {
      year = rawYear;
    }
  }

  return { date: d, year, timestamp };
}

/**
 * Filtra apenas poemas válidos e publicados (RF01, RNF01, CA06).
 * Ignora poemas sem data, sem slug ou que estejam em rascunho/agendados.
 *
 * @param {Array} poems
 * @returns {Array}
 */
export function filterPublishedPoems(poems = []) {
  if (!Array.isArray(poems)) return [];
  return poems.filter(p => {
    if (!p || typeof p !== 'object') return false;
    if (p.status !== 'published') return false;
    if (!p.slug || typeof p.slug !== 'string') return false;
    const dateVal = p.published_at || p.created_at;
    if (!dateVal) return false;
    const { timestamp } = parsePoemDate(dateVal);
    return !Number.isNaN(timestamp);
  });
}

/**
 * Calcula os marcos literários da obra em ordem cronológica ascendente (RF01, CA02).
 * Identifica o 1º poema publicado e cada múltiplo de 50 (50º, 100º, 150º, 200º...).
 *
 * @param {Array} poems
 * @returns {Array}
 */
export function calculateMilestones(poems = []) {
  const published = filterPublishedPoems(poems);
  if (published.length === 0) return [];

  // Ordena estritamente do mais antigo para o mais novo
  const chronological = [...published].sort((a, b) => {
    const da = parsePoemDate(a.published_at || a.created_at).timestamp;
    const db = parsePoemDate(b.published_at || b.created_at).timestamp;
    return da - db;
  });

  const milestones = [];

  chronological.forEach((poem, index) => {
    const count = index + 1;
    const isFirst = index === 0;
    const isMultipleOf50 = count % 50 === 0;

    if (isFirst || isMultipleOf50) {
      const { date: pubDate, year: pubYear } = parsePoemDate(poem.published_at || poem.created_at);
      milestones.push({
        number: count,
        label: isFirst ? '1º Poema Publicado' : `${count}º Poema Catalogado`,
        poemId: poem.id,
        title: poem.title || 'Sem título',
        slug: poem.slug,
        date: pubDate.toISOString(),
        year: pubYear,
        dateFormatted: pubDate.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC'
        })
      });
    }
  });

  return milestones;
}

/**
 * Agrupa os poemas publicados por ano de publicação (RF01, CA01).
 *
 * @param {Array} poems
 * @param {object} [options]
 * @param {'desc'|'asc'} [options.sortOrder='desc']
 * @returns {Array<{ year: number, count: number, poems: Array, topSentiments: Array, milestones: Array }>}
 */
export function groupPoemsByYear(poems = [], { sortOrder = 'desc' } = {}) {
  const published = filterPublishedPoems(poems);
  if (published.length === 0) return [];

  const milestones = calculateMilestones(published);
  const milestoneMap = new Map();
  milestones.forEach(m => {
    if (!milestoneMap.has(m.year)) milestoneMap.set(m.year, []);
    milestoneMap.get(m.year).push(m);
  });

  const yearMap = new Map();

  published.forEach(p => {
    const { year } = parsePoemDate(p.published_at || p.created_at);

    if (!yearMap.has(year)) {
      yearMap.set(year, {
        year,
        poems: [],
        tagCounts: {}
      });
    }

    const group = yearMap.get(year);
    group.poems.push(p);

    if (Array.isArray(p.tags)) {
      p.tags.forEach(rawTag => {
        if (!rawTag) return;
        const tag = String(rawTag).trim();
        if (tag) {
          group.tagCounts[tag] = (group.tagCounts[tag] || 0) + 1;
        }
      });
    }
  });

  const result = Array.from(yearMap.values()).map(group => {
    // Ordena poemas do ano de acordo com sortOrder
    const sortedPoems = [...group.poems].sort((a, b) => {
      const da = parsePoemDate(a.published_at || a.created_at).timestamp;
      const db = parsePoemDate(b.published_at || b.created_at).timestamp;
      return sortOrder === 'asc' ? da - db : db - da;
    });

    // Calcula os sentimentos mais frequentes do ano
    const topSentiments = Object.entries(group.tagCounts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([tag, count]) => ({ tag, count, slug: slugifyTag(tag), name: formatTag(tag) }));

    return {
      year: group.year,
      count: group.poems.length,
      poems: sortedPoems,
      topSentiments,
      milestones: milestoneMap.get(group.year) || []
    };
  });

  // Ordena os blocos de anos
  result.sort((a, b) => (sortOrder === 'asc' ? a.year - b.year : b.year - a.year));

  return result;
}

/**
 * Retorna estatísticas gerais e marcos do arquivo (RF01, CA01).
 *
 * @param {Array} poems
 * @returns {object}
 */
export function getArchiveStats(poems = []) {
  const published = filterPublishedPoems(poems);
  if (published.length === 0) {
    return {
      totalPoems: 0,
      startYear: new Date().getFullYear(),
      latestYear: new Date().getFullYear(),
      yearsCount: 0,
      peakYear: null,
      milestones: []
    };
  }

  const milestones = calculateMilestones(published);
  const years = published.map(p => parsePoemDate(p.published_at || p.created_at).year);
  const uniqueYears = Array.from(new Set(years)).sort((a, b) => a - b);

  const yearCounts = {};
  years.forEach(y => {
    yearCounts[y] = (yearCounts[y] || 0) + 1;
  });

  let peakYear = null;
  let maxCount = -1;
  Object.entries(yearCounts).forEach(([yearStr, count]) => {
    const y = Number(yearStr);
    if (count > maxCount || (count === maxCount && y > (peakYear ? peakYear.year : 0))) {
      maxCount = count;
      peakYear = { year: y, count };
    }
  });

  return {
    totalPoems: published.length,
    startYear: uniqueYears[0] || new Date().getFullYear(),
    latestYear: uniqueYears[uniqueYears.length - 1] || new Date().getFullYear(),
    yearsCount: uniqueYears.length,
    peakYear,
    milestones
  };
}

/**
 * Renderiza o markup completo da página de arquivo em HTML semântico puro (RF02, CA01, CA03, CA04).
 * Utilizado tanto na rota cliente (/arquivo/) quanto na pré-renderização estática (scripts/prerender.js).
 *
 * @param {object} params
 * @param {Array} params.poems
 * @param {'desc'|'asc'} [params.sortOrder='desc']
 * @param {string} [params.baseUrl='/']
 * @returns {string}
 */
export function renderArchiveMarkup({ poems = [], sortOrder = 'desc', baseUrl = '/' } = {}) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const stats = getArchiveStats(poems);
  const yearGroups = groupPoemsByYear(poems, { sortOrder });

  const breadcrumbItems = [
    { name: 'Início', url: base },
    { name: 'Arquivo e Linha do Tempo', url: `${base}arquivo/` }
  ];
  const breadcrumbsHtml = renderBreadcrumbsHtml(breadcrumbItems);

  // Chips de navegação rápida de anos
  const yearChipsHtml = yearGroups.map(yg => `
    <a href="#ano-${yg.year}" class="year-chip" title="Ir para o ano ${yg.year}">
      <span class="year-chip-label">${yg.year}</span>
      <span class="year-chip-count">${yg.count}</span>
    </a>
  `).join('');

  // Painel de Marcos Literários
  let milestonesHtml = '';
  if (stats.milestones.length > 0) {
    const milestoneCards = stats.milestones.map(m => `
      <div class="archive-milestone-card">
        <div class="milestone-badge">
          <span class="milestone-badge-icon" aria-hidden="true">✦</span>
          <span class="milestone-badge-label">${escapeHtml(m.label)}</span>
        </div>
        <a href="${base}poema/${escapeHtml(m.slug)}/" class="milestone-title-link" data-link>
          ${escapeHtml(m.title)}
        </a>
        <div class="milestone-date">
          <time datetime="${escapeHtml(m.date.slice(0, 10))}">${escapeHtml(m.dateFormatted)}</time>
        </div>
      </div>
    `).join('');

    milestonesHtml = `
      <section class="archive-milestones-section" aria-label="Marcos Literários da Obra">
        <div class="archive-section-header">
          <h2 class="archive-section-title">Marcos Literários da Trajetória</h2>
          <span class="archive-section-subtitle">Obras que marcaram o crescimento do acervo poético</span>
        </div>
        <div class="archive-milestones-grid">
          ${milestoneCards}
        </div>
      </section>
    `;
  }

  // Lista dos blocos anuais
  const yearsListHtml = yearGroups.map(yg => {
    const sentimentChips = yg.topSentiments.length > 0 ? `
      <div class="archive-year-sentiments">
        <span class="archive-sentiments-label">Temas frequentes:</span>
        ${yg.topSentiments.map(s => `
          <a href="${base}sentimento/${escapeHtml(s.slug)}/" class="archive-tag-chip" data-link>#${escapeHtml(s.name)}</a>
        `).join('')}
      </div>
    ` : '';

    const yearMilestones = yg.milestones.length > 0 ? `
      <div class="archive-year-milestones-banner" role="note">
        ${yg.milestones.map(m => `
          <div class="year-milestone-item">
            <span class="milestone-star" aria-hidden="true">★</span>
            <span><strong>${escapeHtml(m.label)}:</strong> <a href="${base}poema/${escapeHtml(m.slug)}/" data-link>${escapeHtml(m.title)}</a></span>
          </div>
        `).join('')}
      </div>
    ` : '';

    const poemsList = yg.poems.map(p => {
      const { date: pubDate } = parsePoemDate(p.published_at || p.created_at);
      const dayMonth = pubDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');
      const iso = pubDate.toISOString().slice(0, 10);

      return `
        <li class="archive-poem-item">
          <time datetime="${iso}" class="archive-poem-date">${dayMonth}</time>
          <a href="${base}poema/${escapeHtml(p.slug)}/" class="archive-poem-link" data-link>
            ${escapeHtml(p.title)}
          </a>
        </li>
      `;
    }).join('');

    return `
      <section id="ano-${yg.year}" class="archive-year-section">
        <div class="archive-year-header">
          <div class="archive-year-headline">
            <h2 class="archive-year-title">${yg.year}</h2>
            <span class="archive-year-count-badge">${yg.count} ${yg.count === 1 ? 'poema' : 'poemas'}</span>
          </div>
          ${sentimentChips}
        </div>
        ${yearMilestones}
        <ul class="archive-poems-list">
          ${poemsList}
        </ul>
      </section>
    `;
  }).join('');

  return `
    <div class="archive-container container">
      ${breadcrumbsHtml}
      
      <header class="archive-hero fade-in">
        <h1 class="page-title">Arquivo & Linha do Tempo</h1>
        <p class="page-subtitle">
          Uma jornada poética viva através dos anos: <strong>${stats.totalPoems}</strong> poemas publicados desde <strong>${stats.startYear}</strong> até <strong>${stats.latestYear}</strong>.
        </p>
        
        <div class="archive-stats-strip">
          <div class="archive-stat-item">
            <span class="archive-stat-value">${stats.totalPoems}</span>
            <span class="archive-stat-label">Poemas Catalogados</span>
          </div>
          <div class="archive-stat-item">
            <span class="archive-stat-value">${stats.yearsCount}</span>
            <span class="archive-stat-label">Anos de Publicação</span>
          </div>
          ${stats.peakYear ? `
            <div class="archive-stat-item">
              <span class="archive-stat-value">${stats.peakYear.year}</span>
              <span class="archive-stat-label">Ano Mais Produtivo (${stats.peakYear.count} poemas)</span>
            </div>
          ` : ''}
        </div>
      </header>

      ${milestonesHtml}

      <div class="archive-toolbar" role="region" aria-label="Controles e navegação por ano">
        <div class="archive-nav-wrapper">
          <span class="archive-nav-title">Saltar para o ano:</span>
          <nav class="archive-year-nav" aria-label="Navegação rápida por ano">
            ${yearChipsHtml}
          </nav>
        </div>

        <div class="archive-sort-wrapper">
          <span class="archive-sort-title">Ordem dos anos:</span>
          <div class="archive-sort-buttons" role="group" aria-label="Alternar ordem cronológica">
            <button type="button" id="archive-sort-desc" class="btn-archive-sort ${sortOrder === 'desc' ? 'active' : ''}" data-sort="desc" aria-pressed="${sortOrder === 'desc'}">
              Mais recentes primeiro
            </button>
            <button type="button" id="archive-sort-asc" class="btn-archive-sort ${sortOrder === 'asc' ? 'active' : ''}" data-sort="asc" aria-pressed="${sortOrder === 'asc'}">
              Ordem cronológica (2015 → atual)
            </button>
          </div>
        </div>
      </div>

      <div id="archive-years-container" class="archive-years-container">
        ${yearsListHtml}
      </div>

      <div class="archive-footer-callout">
        <p>Procurando um sentimento ou tema específico?</p>
        <div style="display: flex; gap: var(--space-sm); justify-content: center; flex-wrap: wrap;">
          <a href="${base}sentimentos/" class="btn-secondary" data-link>Explorar Sentimentos</a>
          <a href="${base}colecoes/" class="btn-secondary" data-link>Explorar Coleções</a>
          <a href="${base}aleatorio" class="btn-primary" data-link>⚄ Poema Aleatório</a>
        </div>
      </div>
    </div>
  `;
}
