import { supabase } from '../utils/supabase.js';

// Minimal SVG line chart — no external deps
function buildChart(data, width = 700, height = 160) {
  if (!data || data.length === 0) return '<p style="color:var(--text-muted);font-family:var(--font-ui);font-size:0.85rem;">Sem dados para o período.</p>';

  const values = data.map(d => d.count);
  const max = Math.max(...values, 1);
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  const avg = Math.round(sum / (values.length || 1));
  
  const padL = 36, padR = 16, padT = 16, padB = 32;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const n = data.length;

  const x = i => padL + (i / (n - 1 || 1)) * W;
  const y = v => padT + H - (v / max) * H;

  const avgY = y(avg);

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

  // Average line
  const avgLine = avg > 0 ? `
    <line x1="${padL}" y1="${avgY}" x2="${padL + W}" y2="${avgY}" stroke="var(--text-secondary)" stroke-dasharray="4 4" stroke-opacity="0.5" stroke-width="1.2"/>
    <text x="${padL + W - 4}" y="${avgY - 4}" text-anchor="end" font-size="9" fill="var(--text-secondary)" fill-opacity="0.8" font-family="var(--font-ui)">Média: ${avg}</text>
  ` : '';

  // Hover dots (invisible except hitbox)
  const dots = data.map((d, i) => `
    <g class="chart-point-group" data-label="${d.label}" data-count="${d.count}">
      <circle cx="${x(i)}" cy="${y(d.count)}" r="4" fill="var(--text-primary)" opacity="0" class="chart-dot" style="transition: opacity 0.15s ease, r 0.15s ease;"/>
      <circle cx="${x(i)}" cy="${y(d.count)}" r="16" fill="transparent" class="chart-hitbox" style="cursor: pointer;"/>
    </g>
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
        ${avgLine}
        ${dots}
        ${xLabels}
      </svg>
      <div id="chart-tooltip" style="position:absolute;pointer-events:none;display:none;
        background:var(--bg-primary);border:1px solid var(--border-strong);
        padding:4px 10px;font-family:var(--font-ui);font-size:0.78rem;
        color:var(--text-primary);border-radius:2px;box-shadow: 0 2px 8px rgba(0,0,0,0.1);z-index: 10;"></div>
    </div>
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

function countryFlag(code) {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(
    ...code.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0))
  );
}

export default {
  meta: { title: 'Analytics — Admin' },

  async render(container) {
    container.innerHTML = `
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .skeleton-pulse {
          animation: pulse 1.5s infinite ease-in-out;
        }
        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-xl);
        }
        @media (max-width: 600px) {
          .analytics-grid {
            grid-template-columns: 1fr;
            gap: var(--space-lg);
          }
        }
      </style>
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

        <!-- KPI cards (Skeletons initial state) -->
        <div id="kpi-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:var(--space-md);margin-bottom:var(--space-xl);">
          ${Array(6).fill(0).map(() => `
            <div class="skeleton-pulse" style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;">
              <div style="height:2rem;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;width:60%;"></div>
              <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:40%;"></div>
            </div>
          `).join('')}
        </div>

        <!-- Chart (Skeleton initial state) -->
        <div style="margin-bottom:var(--space-xl);">
          <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                     color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Visitas por dia</h3>
          <div id="chart-area" class="skeleton-pulse" style="height:160px;background:var(--border-subtle);border-radius:2px;"></div>
        </div>

        <!-- Secondary grid -->
        <div class="analytics-grid">
          <div>
            <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                       color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Poemas mais lidos</h3>
            <div id="top-poems" class="skeleton-pulse">
              ${Array(5).fill(0).map(() => `
                <div style="margin-bottom:var(--space-sm);">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <div style="height:0.82rem;width:50%;background:var(--border-subtle);border-radius:2px;"></div>
                    <div style="height:0.82rem;width:15%;background:var(--border-subtle);border-radius:2px;"></div>
                  </div>
                  <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
                </div>
              `).join('')}
            </div>
          </div>
          <div>
            <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                       color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Horários de maior acesso (Local)</h3>
            <div id="hourly-heatmap" class="skeleton-pulse">
              <div style="height:80px;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;"></div>
              <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:100%;"></div>
            </div>
          </div>
        </div>

        <!-- Countries -->
        <div style="margin-top:var(--space-xl);">
          <h3 style="font-family:var(--font-ui);font-size:0.8rem;text-transform:uppercase;letter-spacing:1px;
                     color:var(--text-secondary);margin-bottom:var(--space-md);font-weight:500;">Países de origem</h3>
          <div id="countries" class="skeleton-pulse">
            ${Array(4).fill(0).map(() => `
              <div style="margin-bottom:var(--space-sm);">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <div style="height:0.82rem;width:40%;background:var(--border-subtle);border-radius:2px;"></div>
                  <div style="height:0.82rem;width:20%;background:var(--border-subtle);border-radius:2px;"></div>
                </div>
                <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
              </div>
            `).join('')}
          </div>
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
        
        // Show loading skeletons again upon period switch
        this.showSkeletons(container);
        
        this.loadData(container, activeDays);
      });
    });

    await this.loadData(container, activeDays);
  },

  showSkeletons(container) {
    const kpiRow = container.querySelector('#kpi-row');
    const chartArea = container.querySelector('#chart-area');
    const topPoems = container.querySelector('#top-poems');
    const hourlyHeatmap = container.querySelector('#hourly-heatmap');
    const countries = container.querySelector('#countries');

    kpiRow.innerHTML = Array(6).fill(0).map(() => `
      <div class="skeleton-pulse" style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;">
        <div style="height:2rem;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;width:60%;"></div>
        <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:40%;"></div>
      </div>
    `).join('');

    chartArea.className = 'skeleton-pulse';
    chartArea.style.height = '160px';
    chartArea.style.background = 'var(--border-subtle)';
    chartArea.style.borderRadius = '2px';
    chartArea.innerHTML = '';

    topPoems.className = 'skeleton-pulse';
    topPoems.innerHTML = Array(5).fill(0).map(() => `
      <div style="margin-bottom:var(--space-sm);">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <div style="height:0.82rem;width:50%;background:var(--border-subtle);border-radius:2px;"></div>
          <div style="height:0.82rem;width:15%;background:var(--border-subtle);border-radius:2px;"></div>
        </div>
        <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
      </div>
    `).join('');

    hourlyHeatmap.className = 'skeleton-pulse';
    hourlyHeatmap.innerHTML = `
      <div style="height:80px;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;"></div>
      <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:100%;"></div>
    `;

    countries.className = 'skeleton-pulse';
    countries.innerHTML = Array(4).fill(0).map(() => `
      <div style="margin-bottom:var(--space-sm);">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <div style="height:0.82rem;width:40%;background:var(--border-subtle);border-radius:2px;"></div>
          <div style="height:0.82rem;width:20%;background:var(--border-subtle);border-radius:2px;"></div>
        </div>
        <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
      </div>
    `).join('');
  },

  async loadData(container, days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceISO = since.toISOString();

    // Query data with upper limit to optimize performance
    const { data: views, error } = await supabase
      .from('page_views')
      .select('created_at, page, poem_id, ip_hash, country')
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false })
      .limit(5000);

    if (error) {
      container.querySelector('#chart-area').innerHTML = `<p style="color:var(--error)">${error.message}</p>`;
      return;
    }

    const total      = views.length;
    
    // Calculate new engagement metrics
    const ipCounts = {};
    views.forEach(v => {
      if (v.ip_hash) {
        ipCounts[v.ip_hash] = (ipCounts[v.ip_hash] || 0) + 1;
      }
    });
    const uniqueIPs  = Object.keys(ipCounts).length;
    const returningIPs = Object.values(ipCounts).filter(count => count > 1).length;
    const returnRate = uniqueIPs > 0 ? Math.round((returningIPs / uniqueIPs) * 100) : 0;

    const today      = new Date().toISOString().slice(0, 10);
    const todayViews = views.filter(v => v.created_at.slice(0, 10) === today).length;
    const poemViews  = views.filter(v => v.poem_id).length;
    const poemsPerVisit = uniqueIPs > 0 ? (poemViews / uniqueIPs).toFixed(1) : '0.0';

    // Remove skeleton-pulse and render KPIs
    const kpiRow = container.querySelector('#kpi-row');
    const kpi = (label, value, subtext = '') => `
      <div style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;background:var(--bg-card);">
        <div style="font-size:1.8rem;font-family:var(--font-display);color:var(--text-primary);line-height:1.2;">${value}</div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${label}</div>
        ${subtext ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">${subtext}</div>` : ''}
      </div>
    `;
    kpiRow.innerHTML =
      kpi('Visitas totais', total) +
      kpi('Visitas hoje', todayViews) +
      kpi('IPs únicos', uniqueIPs) +
      kpi('Lidos', poemViews, 'Poemas visualizados') +
      kpi('Retorno', `${returnRate}%`, 'Visitantes recorrentes') +
      kpi('Poemas/visita', poemsPerVisit, 'Média de leitura');

    // Daily chart data
    const dayMap = {};
    views.forEach(v => {
      const day = v.created_at.slice(0, 10);
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    const chartData = fillDays(
      Object.entries(dayMap).map(([label, count]) => ({ label, count })),
      days
    );
    
    const chartArea = container.querySelector('#chart-area');
    chartArea.className = '';
    chartArea.style = '';
    chartArea.innerHTML = buildChart(chartData);

    // Setup chart tooltips programmatically using SVG element bounds
    const tt = container.querySelector('#chart-tooltip');
    const svgEl = chartArea.querySelector('svg');
    if (tt && svgEl) {
      chartArea.querySelectorAll('.chart-point-group').forEach(group => {
        const dot = group.querySelector('.chart-dot');
        group.addEventListener('mouseenter', () => {
          if (dot) {
            dot.style.opacity = '1';
            dot.style.r = '6';
          }
          tt.style.display = 'block';
          tt.textContent = `${group.dataset.label}: ${group.dataset.count} visita(s)`;
        });
        group.addEventListener('mousemove', e => {
          const rect = svgEl.getBoundingClientRect();
          const xPos = e.clientX - rect.left;
          const yPos = e.clientY - rect.top;
          tt.style.left = (xPos + 12) + 'px';
          tt.style.top  = (yPos - 32) + 'px';
        });
        group.addEventListener('mouseleave', () => {
          if (dot) {
            dot.style.opacity = '0';
            dot.style.r = '4';
          }
          tt.style.display = 'none';
        });
      });
    }

    // Top poems
    const poemMap = {};
    views.filter(v => v.poem_id).forEach(v => {
      const key = v.page;
      poemMap[key] = (poemMap[key] || 0) + 1;
    });
    const topPoems = Object.entries(poemMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topPoemsEl = container.querySelector('#top-poems');
    topPoemsEl.className = '';
    
    if (topPoems.length === 0) {
      topPoemsEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:var(--space-md) 0;">Sem leituras registradas.</p>';
    } else {
      const maxPV = topPoems[0][1];
      topPoemsEl.innerHTML = topPoems.map(([page, count]) => `
        <div style="margin-bottom:var(--space-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:0.82rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;" title="${page}">${page.replace('/poema/','')}</span>
            <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500;">${count}</span>
          </div>
          <div style="height:3px;background:var(--border-subtle);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${Math.round((count/maxPV)*100)}%;background:var(--text-primary);border-radius:2px;"></div>
          </div>
        </div>
      `).join('');
    }

    // Hourly Heatmap (visitas por hora do dia, 0h-23h local)
    const hourMap = Array(24).fill(0);
    views.forEach(v => {
      const date = new Date(v.created_at);
      const hour = date.getHours();
      if (hour >= 0 && hour < 24) {
        hourMap[hour]++;
      }
    });
    const maxHourHits = Math.max(...hourMap, 1);
    
    const hourlyHeatmapEl = container.querySelector('#hourly-heatmap');
    hourlyHeatmapEl.className = '';
    hourlyHeatmapEl.innerHTML = `
      <div style="display:flex;align-items:flex-end;justify-content:space-between;height:84px;padding:var(--space-sm) 0 4px;border-bottom:1px solid var(--border-subtle);margin-bottom:8px;">
        ${hourMap.map((count, hour) => {
          const pct = Math.round((count / maxHourHits) * 100);
          const isPeak = count === maxHourHits && count > 0;
          return `
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;margin:0 1px;" title="${hour}h: ${count} visitas">
              <div style="width:100%;height:${pct}%;background:${isPeak ? 'var(--text-primary)' : 'var(--text-muted)'};opacity:${isPeak ? '1' : '0.45'};border-radius:1px 1px 0 0;min-height:${count > 0 ? '2px' : '0'};transition:all 0.2s ease;"></div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-muted);font-family:var(--font-ui);">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    `;

    // Countries with horizontal progress percentage bars
    const countryMap = {};
    views.filter(v => v.country).forEach(v => {
      countryMap[v.country] = (countryMap[v.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const countriesEl = container.querySelector('#countries');
    countriesEl.className = '';
    
    if (topCountries.length === 0) {
      countriesEl.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;padding:var(--space-md) 0;">Sem dados de país.</p>';
    } else {
      const maxC = topCountries[0][1];
      countriesEl.innerHTML = topCountries.map(([code, count]) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
          <div style="margin-bottom:var(--space-md);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:0.82rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
                <span style="font-size:1.1rem;line-height:1;">${countryFlag(code)}</span>
                <span style="text-transform:uppercase;font-weight:500;">${code}</span>
              </span>
              <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500;">
                ${count} <span style="color:var(--text-muted);font-weight:normal;font-size:0.75rem;margin-left:4px;">(${pct}%)</span>
              </span>
            </div>
            <div style="height:3px;background:var(--border-subtle);border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${Math.round((count/maxC)*100)}%;background:var(--text-primary);border-radius:2px;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
};
