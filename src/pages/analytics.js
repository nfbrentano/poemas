import { supabase } from '../utils/supabase.js';

// Minimal SVG line chart — no external deps
function buildChart(data, width = 700, height = 160) {
  if (!data || data.length === 0) return '<p style="color:var(--text-muted);font-family:var(--font-ui);font-size:0.85rem;">Sem dados para o período.</p>';

  const max = Math.max(...data.map(d => d.count), 1);
  const padL = 36, padR = 16, padT = 16, padB = 32;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const n = data.length;

  const x = i => padL + (i / (n - 1 || 1)) * W;
  const y = v => padT + H - (v / max) * H;

  // Filled area
  const pts  = data.map((d, i) => `${x(i)},${y(d.count)}`).join(' ');
  const area = `${padL},${padT + H} ` + pts + ` ${x(n - 1)},${padT + H}`;

  // Y gridlines
  const gridSteps = 4;
  const grids = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = Math.round((max / gridSteps) * i);
    const yy  = y(val);
    return `<line x1="${padL}" y1="${yy}" x2="${padL + W}" y2="${yy}" stroke="var(--border-subtle)" stroke-width="1"/>
            <text x="${padL - 6}" y="${yy + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-ui)">${val}</text>`;
  }).join('');

  // X labels — show every Nth label to avoid crowding
  const step = Math.ceil(n / 10);
  const xLabels = data.map((d, i) => {
    if (i % step !== 0 && i !== n - 1) return '';
    const label = n <= 31 ? String(d.label).slice(5) : String(d.label).slice(5, 10); // MM-DD
    return `<text x="${x(i)}" y="${height - 4}" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-family="var(--font-ui)">${label}</text>`;
  }).join('');

  // Hover dots (all, invisible by default)
  const dots = data.map((d, i) => `
    <circle cx="${x(i)}" cy="${y(d.count)}" r="4" fill="var(--text-primary)" opacity="0"
      class="chart-dot" data-label="${d.label}" data-count="${d.count}"/>
  `).join('');

  return `
    <div style="position:relative;overflow:hidden;">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"
           style="width:100%;height:${height}px;display:block;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stop-color="var(--text-primary)" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="var(--text-primary)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${grids}
        <polygon points="${area}" fill="url(#chartGrad)"/>
        <polyline points="${pts}" fill="none" stroke="var(--text-primary)" stroke-width="1.5"/>
        ${dots}
        ${xLabels}
      </svg>
      <div id="chart-tooltip" style="position:absolute;pointer-events:none;display:none;
        background:var(--bg-primary);border:1px solid var(--border-strong);
        padding:4px 10px;font-family:var(--font-ui);font-size:0.78rem;
        color:var(--text-primary);border-radius:2px;"></div>
    </div>
    <script>
      (function(){
        const tt = document.getElementById('chart-tooltip');
        document.querySelectorAll('.chart-dot').forEach(dot => {
          dot.addEventListener('mouseenter', e => {
            dot.style.opacity = '1';
            tt.style.display = 'block';
            tt.textContent = dot.dataset.label + ': ' + dot.dataset.count + ' visita(s)';
          });
          dot.addEventListener('mousemove', e => {
            tt.style.left = (e.offsetX + 12) + 'px';
            tt.style.top  = (e.offsetY - 28) + 'px';
          });
          dot.addEventListener('mouseleave', () => {
            dot.style.opacity = '0';
            tt.style.display = 'none';
          });
        });
      })();
    <\/script>
  `;
}

// Pad missing days in a range so chart line is continuous
function fillDays(rows, days) {
  const map = {};
  rows.forEach(r => { map[r.label] = r.count; });
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ label: key, count: map[key] || 0 });
  }
  return result;
}

export default {
  meta: { title: 'Analytics — Admin' },

  async render(container) {
    container.innerHTML = `
      <div style="font-family:var(--font-ui);max-width:900px;margin:0 auto;padding: 0 0 var(--space-xl);">

        <!-- Period selector -->
        <div style="display:flex;gap:var(--space-sm);align-items:center;margin-bottom:var(--space-lg);flex-wrap:wrap;">
          <span style="color:var(--text-secondary);font-size:0.85rem;">Período:</span>
          ${[7, 30, 90].map(d =>
            `<button class="period-btn" data-days="${d}"
              style="padding:0.35rem 0.9rem;border:1px solid var(--border-strong);border-radius:2px;
                     font-size:0.8rem;font-family:var(--font-ui);cursor:pointer;
                     background:${d===30?'var(--border-strong)':'transparent'};
                     color:var(--text-primary);transition:background var(--transition-fast);"
            >${d === 7 ? '7 dias' : d === 30 ? '30 dias' : '90 dias'}</button>`
          ).join('')}
        </div>

        <!-- KPI cards -->
        <div id="kpi-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-md);margin-bottom:var(--space-xl);"></div>

        <!-- Chart -->
        <div style="margin-bottom:var(--space-xl);">
          <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                     color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Visitas por dia</h3>
          <div id="chart-area">Carregando...</div>
        </div>

        <!-- Top poems -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-xl);">
          <div>
            <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                       color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Poemas mais lidos</h3>
            <div id="top-poems">Carregando...</div>
          </div>
          <div>
            <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                       color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">IPs únicos (hash) recentes</h3>
            <div id="ip-table">Carregando...</div>
          </div>
        </div>

        <!-- Countries -->
        <div style="margin-top:var(--space-xl);">
          <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                     color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Países de origem</h3>
          <div id="countries">Carregando...</div>
        </div>
      </div>
    `;

    // Period button logic
    let activeDays = 30;
    container.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.period-btn').forEach(b => {
          b.style.background = 'transparent';
        });
        btn.style.background = 'var(--border-strong)';
        activeDays = parseInt(btn.dataset.days);
        this.loadData(container, activeDays);
      });
    });

    await this.loadData(container, activeDays);
  },

  async loadData(container, days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    // All views in period
    const { data: views, error } = await supabase
      .from('page_views')
      .select('viewed_at, page, poem_id, ip_hash, country')
      .gte('viewed_at', sinceISO)
      .order('viewed_at', { ascending: false });

    if (error) {
      container.querySelector('#chart-area').innerHTML = `<p style="color:var(--error)">${error.message}</p>`;
      return;
    }

    const total      = views.length;
    const uniqueIPs  = new Set(views.map(v => v.ip_hash).filter(Boolean)).size;
    const today      = new Date().toISOString().slice(0, 10);
    const todayViews = views.filter(v => v.viewed_at.slice(0, 10) === today).length;
    const poemViews  = views.filter(v => v.poem_id).length;

    // KPI cards
    const kpiRow = container.querySelector('#kpi-row');
    const kpi = (label, value) => `
      <div style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;">
        <div style="font-size:2rem;font-family:var(--font-display);color:var(--text-primary);">${value}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:1px;">${label}</div>
      </div>
    `;
    kpiRow.innerHTML =
      kpi('Total de visitas', total) +
      kpi('Visitas hoje', todayViews) +
      kpi('IPs únicos', uniqueIPs) +
      kpi('Leituras de poemas', poemViews);

    // Daily chart data
    const dayMap = {};
    views.forEach(v => {
      const day = v.viewed_at.slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const chartData = fillDays(
      Object.entries(dayMap).map(([label, count]) => ({ label, count })),
      days
    );
    container.querySelector('#chart-area').innerHTML = buildChart(chartData);

    // Top poems
    const poemMap = {};
    views.filter(v => v.poem_id).forEach(v => {
      const key = v.page;
      poemMap[key] = (poemMap[key] || 0) + 1;
    });
    const topPoems = Object.entries(poemMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const topPoemsEl = container.querySelector('#top-poems');
    if (topPoems.length === 0) {
      topPoemsEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Sem leituras registradas.</p>';
    } else {
      const maxPV = topPoems[0][1];
      topPoemsEl.innerHTML = topPoems.map(([page, count]) => `
        <div style="margin-bottom:var(--space-sm);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:0.82rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" title="${page}">${page.replace('/poema/','')}</span>
            <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500;">${count}</span>
          </div>
          <div style="height:3px;background:var(--border-subtle);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${Math.round((count/maxPV)*100)}%;background:var(--text-primary);border-radius:2px;"></div>
          </div>
        </div>
      `).join('');
    }

    // Recent unique IPs
    const ipSeen = new Set();
    const recentIPs = [];
    for (const v of views) {
      if (v.ip_hash && !ipSeen.has(v.ip_hash)) {
        ipSeen.add(v.ip_hash);
        recentIPs.push({ hash: v.ip_hash, when: v.viewed_at.slice(0, 10), country: v.country || '—' });
      }
      if (recentIPs.length >= 10) break;
    }
    const ipTableEl = container.querySelector('#ip-table');
    ipTableEl.innerHTML = recentIPs.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhum IP registrado.</p>'
      : `<table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
           <thead><tr style="color:var(--text-muted);border-bottom:1px solid var(--border-subtle);">
             <th style="text-align:left;padding-bottom:6px;">Hash (IP)</th>
             <th style="text-align:center;">País</th>
             <th style="text-align:right;">Última visita</th>
           </tr></thead>
           <tbody>
             ${recentIPs.map(ip => `
               <tr style="border-bottom:1px solid var(--border-subtle);">
                 <td style="padding:6px 0;color:var(--text-secondary);font-family:monospace;font-size:0.75rem;">${ip.hash.slice(0, 16)}…</td>
                 <td style="text-align:center;">${ip.country}</td>
                 <td style="text-align:right;color:var(--text-muted);">${ip.when}</td>
               </tr>`).join('')}
           </tbody>
         </table>`;

    // Countries
    const countryMap = {};
    views.filter(v => v.country).forEach(v => {
      countryMap[v.country] = (countryMap[v.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const countriesEl = container.querySelector('#countries');
    if (topCountries.length === 0) {
      countriesEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Sem dados de país.</p>';
    } else {
      const maxC = topCountries[0][1];
      countriesEl.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);">` +
        topCountries.map(([code, count]) => `
          <div style="display:flex;flex-direction:column;align-items:center;padding:var(--space-sm) var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;min-width:80px;">
            <span style="font-size:1.4rem;">${countryFlag(code)}</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${code}</span>
            <span style="font-size:0.9rem;font-weight:500;">${count}</span>
          </div>`).join('') +
        `</div>`;
    }
  }
};

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E0 - 65 + c.charCodeAt(0))
  );
}

function fillDays(rows, days) {
  const map = {};
  rows.forEach(r => { map[r.label] = r.count; });
  const result = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push({ label: key, count: map[key] || 0 });
  }
  return result;
}
