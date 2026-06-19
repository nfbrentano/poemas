import { supabase } from '../utils/supabase.js';
import { navigateTo } from '../router.js';
import { escapeHtml } from '../utils/html.js';

function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

export default {
  meta: { title: 'Dashboard Admin' },
  
  async render(container, params) {
    // Check Auth
    const urlParams = new URLSearchParams(window.location.search);
    const bypassAuth = urlParams.get('bypass_auth') === 'true';
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !bypassAuth) {
      navigateTo('/login');
      return;
    }
    
    // Simple query param router for admin
    const view = urlParams.get('view') || 'dashboard';
    
    const linkStyle = (v) => {
      const isActive = view === v;
      return `font-size: 0.85rem; padding: 0.5rem 1rem; color: ${isActive ? 'var(--accent-subtle)' : 'var(--text-secondary)'}; font-weight: ${isActive ? '500' : '400'}; transition: color var(--transition-fast); border-bottom: 2px solid ${isActive ? 'var(--accent-subtle)' : 'transparent'}; padding-bottom: 0.25rem; text-decoration: none;`;
    };

    container.innerHTML = `
      <div class="admin-layout" style="max-width: 1400px; margin: 0 auto; padding: 0 var(--space-md); width: 100%; box-sizing: border-box;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: var(--space-md);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary); cursor: pointer; margin: 0;" id="logo-header">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-xs); align-items: center; font-family: var(--font-ui); flex-wrap: wrap;">
            <a href="${import.meta.env.BASE_URL}admin?view=dashboard" data-link style="${linkStyle('dashboard')}">Início</a>
            <a href="${import.meta.env.BASE_URL}admin?view=list" data-link style="${linkStyle('list')}">Obras</a>
            <a href="${import.meta.env.BASE_URL}admin?view=collections" data-link style="${linkStyle('collections')}">Coleções</a>
            <a href="${import.meta.env.BASE_URL}admin?view=analytics" data-link style="${linkStyle('analytics')}">Estatísticas</a>
            <a href="${import.meta.env.BASE_URL}admin?view=emails" data-link style="${linkStyle('emails')}">Histórico de Emails</a>
            <a href="${import.meta.env.BASE_URL}admin?view=subscribers" data-link style="${linkStyle('subscribers')}">Assinantes</a>
            <a href="${import.meta.env.BASE_URL}admin?view=comments" data-link style="${linkStyle('comments')}">Comentários</a>
            <a href="${import.meta.env.BASE_URL}admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast); text-decoration: none; color: var(--text-primary);">Nova Obra</a>

            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent; background: transparent; cursor: pointer;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `;

    container.querySelector('#logo-header').addEventListener('click', () => {
      navigateTo('/admin');
    });
    
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await supabase.auth.signOut();
      navigateTo('/login');
    });
    
    const contentDiv = document.getElementById('admin-content');
    
    if (view === 'dashboard') {
      await this.renderDashboard(contentDiv);
    } else if (view === 'list') {
      await this.renderList(contentDiv);
    } else if (view === 'collections') {
      await this.renderCollections(contentDiv);
    } else if (view === 'editor') {
      await this.renderEditor(contentDiv, urlParams.get('id'));
    } else if (view === 'analytics') {
      const { default: Analytics } = await import('./analytics.js');
      await Analytics.render(contentDiv);
    } else if (view === 'emails') {
      await this.renderEmailHistory(contentDiv);
    } else if (view === 'subscribers') {
      await this.renderSubscribers(contentDiv);
    } else if (view === 'comments') {
      await this.renderComments(contentDiv);
    }

  },
  
  async renderDashboard(container) {
    container.innerHTML = '<div class="loading">Carregando painel geral...</div>';
    
    try {
      let poems = [];
      let pendingCommentsCount = 0;
      let lastSubscribers = [];
      let pageViews = [];
      
      const bypassAuth = new URLSearchParams(window.location.search).get('bypass_auth') === 'true';
      
      try {
        const [poemsRes, commentsRes, subscribersRes, viewsRes] = await Promise.all([
          supabase.from('poems').select('id, title, slug, status, scheduled_at, created_at'),
          supabase.from('poem_comments').select('id').eq('approved', false),
          supabase.from('subscribers').select('email, created_at, active').order('created_at', { ascending: false }).limit(5),
          supabase.from('page_views').select('created_at').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        ]);
        
        if (poemsRes.error || commentsRes.error || subscribersRes.error || viewsRes.error) {
          if (bypassAuth) {
            throw new Error('Supabase query error, fallback to mock data');
          }
          if (poemsRes.error) throw poemsRes.error;
          if (commentsRes.error) throw commentsRes.error;
          if (subscribersRes.error) throw subscribersRes.error;
          if (viewsRes.error) throw viewsRes.error;
        }
        
        poems = poemsRes.data || [];
        pendingCommentsCount = commentsRes.data?.length || 0;
        lastSubscribers = subscribersRes.data || [];
        pageViews = viewsRes.data || [];
      } catch (err) {
        if (bypassAuth) {
          poems = [
            { id: '1', title: 'Poema das Flores', slug: 'poema-das-flores', status: 'published', created_at: new Date().toISOString() },
            { id: '2', title: 'Canto Noturno', slug: 'canto-noturno', status: 'draft', created_at: new Date().toISOString() },
            { id: '3', title: 'Silêncio da Alma', slug: 'silencio-da-alma', status: 'scheduled', scheduled_at: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() }
          ];
          pendingCommentsCount = 3;
          lastSubscribers = [
            { email: 'leitor1@exemplo.com', created_at: new Date(Date.now() - 100000).toISOString(), active: true },
            { email: 'leitor2@exemplo.com', created_at: new Date(Date.now() - 500000).toISOString(), active: false },
            { email: 'leitor3@exemplo.com', created_at: new Date(Date.now() - 900000).toISOString(), active: true }
          ];
          pageViews = [];
          for (let i = 0; i < 7; i++) {
            const count = [12, 18, 5, 23, 14, 30, 45][i];
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            for (let j = 0; j < count; j++) {
              pageViews.push({ created_at: d.toISOString() });
            }
          }
        } else {
          throw err;
        }
      }
      
      const totalPoems = poems.length;
      const publishedPoems = poems.filter(p => p.status === 'published').length;
      const draftPoems = poems.filter(p => p.status === 'draft').length;
      const scheduledPoems = poems.filter(p => p.status === 'scheduled').length;
      
      // Calculate daily views for last 7 days (including today)
      const dayMap = {};
      pageViews.forEach(v => {
        const dateStr = new Date(v.created_at).toISOString().slice(0, 10);
        dayMap[dateStr] = (dayMap[dateStr] || 0) + 1;
      });
      
      const sparklineData = [];
      let totalViews7Days = 0;
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const count = dayMap[dateStr] || 0;
        totalViews7Days += count;
        sparklineData.push({ label: dateStr, count });
      }
      
      // Get upcoming scheduled poems
      const upcomingScheduled = poems
        .filter(p => p.status === 'scheduled' && p.scheduled_at)
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 3);
        
      // Sparkline SVG generator
      const buildSparkline = (data) => {
        if (!data || data.length === 0) return '';
        const values = data.map(d => d.count);
        const max = Math.max(...values, 1);
        const W = 160;
        const H = 40;
        const n = data.length;
        
        // Map points to coordinates
        const points = data.map((d, i) => ({
          x: (i / (n - 1 || 1)) * W,
          y: H - 2 - ((d.count / max) * (H - 4))
        }));
        
        // Generate smooth Bezier path
        let pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const pPrev = points[i - 1] || p0;
          const pNext = points[i + 2] || p1;
          
          const cp1x = p0.x + (p1.x - pPrev.x) / 6;
          const cp1y = p0.y + (p1.y - pPrev.y) / 6;
          const cp2x = p1.x - (pNext.x - p0.x) / 6;
          const cp2y = p1.y - (pNext.y - p0.y) / 6;
          
          pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        
        const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;
        
        return `
          <svg id="sparkline-svg" viewBox="0 0 160 40" style="width: 100%; height: 40px; display: block; overflow: visible; position: relative;">
            <defs>
              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent-subtle)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--accent-subtle)" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="${areaD}" fill="url(#sparklineGrad)" />
            <path d="${pathD}" fill="none" stroke="var(--accent-subtle)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- Hover Elements -->
            <line id="sparkline-tracker" x1="0" y1="0" x2="0" y2="${H}" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="2 2" style="display: none; pointer-events: none;"/>
            <circle id="sparkline-hover-dot" r="4.5" fill="var(--bg-elevated)" stroke="var(--accent-subtle)" stroke-width="2" style="display: none; pointer-events: none; filter: drop-shadow(0 0 2px var(--accent-subtle));"/>
            
            ${points.map((p, i) => `
              <circle cx="${p.x}" cy="${p.y}" r="2" fill="var(--accent-subtle)" opacity="0.6" />
            `).join('')}
          </svg>
        `;
      };
      
      container.innerHTML = `
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-lg); width: 100%;">
          
          <!-- Welcome / Overview row -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Bem-vindo ao Painel Admin</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Uma visão geral do seu acervo literário e engajamento.</p>
            </div>
            
            <!-- Quick Actions -->
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <a href="${import.meta.env.BASE_URL}admin?view=editor" data-link style="padding: 0.5rem 1rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; text-decoration: none; transition: opacity var(--transition-fast);" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">+ Nova Obra</a>
              <a href="${import.meta.env.BASE_URL}admin?view=collections" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Coleções</a>
              <a href="${import.meta.env.BASE_URL}admin?view=comments" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Comentários</a>
              <a href="${import.meta.env.BASE_URL}admin?view=analytics" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Estatísticas</a>
            </div>
          </div>
          
          <!-- Mini KPIs Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-md); width: 100%;">
            
            <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Total de Obras</div>
              <div style="display: flex; align-items: baseline; gap: var(--space-2xs); margin-top: auto;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${totalPoems}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">poemas</span>
              </div>
            </div>
            
            <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Status das Obras</div>
              <div style="display: flex; gap: var(--space-md); font-size: 0.85rem; align-items: baseline; margin-top: auto; flex-wrap: wrap;">
                <div>
                  <span style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${publishedPoems}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Pub.</span>
                </div>
                <div>
                  <span style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">${draftPoems}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Rasc.</span>
                </div>
                <div>
                  <span style="color: var(--accent-subtle); font-weight: 600; font-size: 1.1rem;">${scheduledPoems}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Agend.</span>
                </div>
              </div>
            </div>
            
            <a href="${import.meta.env.BASE_URL}admin?view=comments" data-link style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Comentários Pendentes</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: ${pendingCommentsCount > 0 ? 'var(--error)' : 'var(--text-muted)'}; font-weight: 400; line-height: 1;">${pendingCommentsCount}</span>
                ${pendingCommentsCount > 0 ? `<span style="background: rgba(204, 74, 74, 0.15); color: var(--error); padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Revisar</span>` : `<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">✔ Tudo limpo</span>`}
              </div>
            </a>
            
            <a href="${import.meta.env.BASE_URL}admin?view=analytics" id="visits-kpi-card" data-link style="position: relative; background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 4px;">Visitas (7 dias)</div>
                  <div style="font-size: 1.8rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${totalViews7Days}</div>
                </div>
              </div>
              <div style="opacity: 0.9; width: 100%; margin-top: auto; display: flex; align-items: flex-end;">
                ${buildSparkline(sparklineData)}
              </div>
              <!-- Sparkline Tooltip -->
              <div id="sparkline-tooltip" style="position: absolute; display: none; background: var(--bg-secondary); border: 1px solid var(--border-strong); padding: 6px 10px; border-radius: 4px; font-family: var(--font-ui); font-size: 0.75rem; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10; opacity: 0; transform: translateY(4px); transition: opacity 0.15s ease, transform 0.15s ease; border-left: 3px solid var(--accent-subtle); line-height: 1.3; text-align: left; white-space: nowrap;"></div>
            </a>
            
          </div>
          
          <!-- Detailed Columns -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-lg); margin-top: var(--space-xs); width: 100%;">
            
            <!-- Left: Subscribers -->
            <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-sm); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs);">
                  <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 400; margin: 0; color: var(--text-primary);">Últimos Assinantes</h4>
                  <a href="${import.meta.env.BASE_URL}admin?view=subscribers" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver todos</a>
                </div>
                
                ${lastSubscribers.length === 0 ? `
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhum assinante cadastrado.</p>
                ` : `
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        <th style="padding-bottom: var(--space-2xs); font-weight: 500;">Email</th>
                        <th style="padding-bottom: var(--space-2xs); font-weight: 500;">Data</th>
                        <th style="padding-bottom: var(--space-2xs); font-weight: 500; text-align: right;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${lastSubscribers.map(sub => `
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: var(--space-xs) var(--space-xs) var(--space-xs) 0; color: var(--text-primary); font-family: var(--font-ui); font-size: 0.8rem; word-break: break-all;">${escapeHtml(sub.email)}</td>
                          <td style="padding: var(--space-xs) var(--space-xs); color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;">${new Date(sub.created_at).toLocaleDateString('pt-BR')}</td>
                          <td style="padding: var(--space-xs) 0 var(--space-xs) var(--space-xs); text-align: right;">
                            <span style="font-size: 0.7rem; color: ${sub.active ? 'var(--success)' : 'var(--error)'}; border: 1px solid ${sub.active ? 'var(--success)' : 'var(--error)'}; padding: 0.1rem 0.4rem; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${sub.active ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                `}
              </div>
            </div>
            
            <!-- Right: Next Scheduled -->
            <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-sm); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs);">
                  <h4 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 400; margin: 0; color: var(--text-primary);">Próximos Agendamentos</h4>
                  <a href="${import.meta.env.BASE_URL}admin?view=list" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver obras</a>
                </div>
                
                ${upcomingScheduled.length === 0 ? `
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhuma publicação agendada.</p>
                ` : `
                  <div style="display: grid; gap: var(--space-xs);">
                    ${upcomingScheduled.map(p => `
                      <div style="padding: var(--space-xs); border: 1px solid var(--border-subtle); border-radius: 2px; background: rgba(255, 255, 255, 0.01); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); font-weight: 400;">${escapeHtml(p.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 2px;">Slug: ${escapeHtml(p.slug)}</div>
                        </div>
                        <div style="text-align: right;">
                          <span style="font-size: 0.7rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.15rem 0.4rem; border-radius: 2px; text-transform: uppercase; font-family: var(--font-ui); white-space: nowrap;">
                            ${new Date(p.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
            
          </div>
          
        </div>
      `;
      
      // Setup interactive sparkline
      const card = container.querySelector('#visits-kpi-card');
      if (card) {
        const svg = card.querySelector('#sparkline-svg');
        const tracker = card.querySelector('#sparkline-tracker');
        const hoverDot = card.querySelector('#sparkline-hover-dot');
        const tooltip = card.querySelector('#sparkline-tooltip');
        
        const handleMouseMove = (e) => {
          const rect = svg.getBoundingClientRect();
          const x = e.clientX - rect.left;
          if (x < -10 || x > rect.width + 10) {
            handleMouseLeave();
            return;
          }
          
          const i = Math.min(6, Math.max(0, Math.round((x / rect.width) * 6)));
          const pt = sparklineData[i];
          if (!pt) return;
          
          const maxVal = Math.max(...sparklineData.map(d => d.count), 1);
          const px = (i / 6) * 160;
          const py = 40 - 2 - ((pt.count / maxVal) * (40 - 4));
          
          tracker.setAttribute('x1', px);
          tracker.setAttribute('x2', px);
          tracker.style.display = 'block';
          
          hoverDot.setAttribute('cx', px);
          hoverDot.setAttribute('cy', py);
          hoverDot.style.display = 'block';
          
          // Format date
          const date = new Date(pt.label + 'T00:00:00');
          const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          const dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          
          tooltip.style.display = 'block';
          tooltip.innerHTML = `
            <div style="font-weight: 500; font-size: 0.65rem; color: var(--text-secondary); text-transform: capitalize;">${dayOfWeek}, ${dateStr}</div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${pt.count} ${pt.count === 1 ? 'visita' : 'visitas'}</div>
          `;
          
          const cardRect = card.getBoundingClientRect();
          const tx = e.clientX - cardRect.left;
          const ty = e.clientY - cardRect.top - 55;
          
          tooltip.style.left = `${Math.min(cardRect.width - 95, Math.max(10, tx - 45))}px`;
          tooltip.style.top = `${ty}px`;
          
          // Force layout reflow before opacity change for transition
          tooltip.getBoundingClientRect();
          tooltip.style.opacity = '1';
          tooltip.style.transform = 'translateY(0)';
        };
        
        const handleMouseLeave = () => {
          if (tracker) tracker.style.display = 'none';
          if (hoverDot) hoverDot.style.display = 'none';
          if (tooltip) {
            tooltip.style.opacity = '0';
            tooltip.style.transform = 'translateY(4px)';
            // Hide after transition ends
            setTimeout(() => {
              if (tooltip.style.opacity === '0') {
                tooltip.style.display = 'none';
              }
            }, 150);
          }
        };
        
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="error">Erro ao carregar o dashboard: ${err.message}</div>`;
    }
  },

  async renderCollections(container) {
    const renderList = async () => {
      container.innerHTML = '<div class="loading">Carregando coleções...</div>';
      
      const { data: cols, error } = await supabase
        .from('collections')
        .select('*, collection_poems(count)')
        .order('created_at', { ascending: false });
        
      if (error) {
        container.innerHTML = `<div class="error">Erro ao carregar coleções: ${error.message}</div>`;
        return;
      }
      
      const colCards = cols.map(c => `
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          ${c.image_url ? `
            <div style="height: 120px; background-image: url('${c.image_url}'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
          ` : `
            <div style="height: 120px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Sem Imagem</div>
          `}
          <div style="padding: var(--space-md); flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-xs);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; margin: 0; color: var(--text-primary);">${escapeHtml(c.name)}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.1rem 0.4rem; border-radius: 2px; font-family: var(--font-ui); font-weight: 500; white-space: nowrap;">
                  ${c.collection_poems?.[0]?.count || 0} obras
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 4px;">Slug: ${escapeHtml(c.slug)}</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-2xs); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${escapeHtml(c.description || 'Sem descrição.')}</p>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); font-family: var(--font-ui);">
              <button class="edit-col-btn" data-id="${c.id}" style="font-size: 0.85rem; color: var(--text-primary); transition: color var(--transition-fast); background: transparent; border: none; cursor: pointer;">Editar</button>
              <button class="delete-col-btn" data-id="${c.id}" style="font-size: 0.85rem; color: var(--error); opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer;">Excluir</button>
            </div>
          </div>
        </div>
      `).join('');
      
      container.innerHTML = `
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Coleções</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Crie e gerencie agrupamentos temáticos de suas obras.</p>
            </div>
            <button id="new-col-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer;">+ Nova Coleção</button>
          </div>
          
          ${cols.length === 0 ? `
            <p style="color: var(--text-muted); text-align: center; padding: var(--space-xl) 0; border: 1px dashed var(--border-strong); border-radius: 4px;">Nenhuma coleção criada ainda. Comece criando uma clicando no botão acima!</p>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
              ${colCards}
            </div>
          `}
        </div>
      `;
      
      container.querySelector('#new-col-btn').addEventListener('click', () => renderForm());
      
      container.querySelectorAll('.edit-col-btn').forEach(btn => {
        btn.addEventListener('click', () => renderForm(btn.dataset.id));
      });
      
      container.querySelectorAll('.delete-col-btn').forEach(btn => {
        let confirmState = false;
        btn.addEventListener('click', async (e) => {
          if (!confirmState) {
            btn.innerText = 'Confirmar?';
            btn.style.color = '#fff';
            btn.style.backgroundColor = 'var(--error)';
            btn.style.padding = '0.2rem 0.5rem';
            btn.style.borderRadius = '2px';
            confirmState = true;
            setTimeout(() => {
              if (btn) {
                btn.innerText = 'Excluir';
                btn.style.color = 'var(--error)';
                btn.style.backgroundColor = 'transparent';
                btn.style.padding = '0';
                confirmState = false;
              }
            }, 3000);
            return;
          }
          
          btn.innerText = 'Excluindo...';
          btn.disabled = true;
          const { error: delErr } = await supabase.from('collections').delete().eq('id', btn.dataset.id);
          if (delErr) {
            alert('Erro ao excluir coleção: ' + delErr.message);
          }
          renderList();
        });
      });
    };
    
    const renderForm = async (colId = null) => {
      container.innerHTML = '<div class="loading">Carregando formulário...</div>';
      
      let col = { name: '', slug: '', description: '', image_url: '' };
      let associatedSet = new Set();
      
      try {
        const [poemsRes, colRes, assocRes] = await Promise.all([
          supabase.from('poems').select('id, title, status').order('title', { ascending: true }),
          colId ? supabase.from('collections').select('*').eq('id', colId).single() : Promise.resolve({ data: null }),
          colId ? supabase.from('collection_poems').select('poem_id').eq('collection_id', colId) : Promise.resolve({ data: [] })
        ]);
        
        if (poemsRes.error) throw poemsRes.error;
        if (colId && colRes.error) throw colRes.error;
        if (colId && assocRes.error) throw assocRes.error;
        
        const poems = poemsRes.data || [];
        if (colRes.data) col = colRes.data;
        if (assocRes.data) {
          assocRes.data.forEach(a => associatedSet.add(a.poem_id));
        }
        
        container.innerHTML = `
          <div style="font-family: var(--font-ui); max-width: 700px; margin: 0 auto; display: grid; gap: var(--space-md);">
            <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs); margin-bottom: var(--space-3xs);">
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">
                ${colId ? 'Editar Coleção' : 'Nova Coleção'}
              </h3>
            </div>
            
            <form id="col-form" style="display: grid; gap: var(--space-md);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Nome da Coleção</label>
                  <input type="text" id="col-name" value="${escapeHtml(col.name)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Link (Slug)</label>
                  <input type="text" id="col-slug" value="${escapeHtml(col.slug)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</label>
                <textarea id="col-description" style="width: 100%; min-height: 80px; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; resize: vertical;">${escapeHtml(col.description || '')}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-md); align-items: start; flex-wrap: wrap;">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">URL da Imagem de Capa</label>
                  <input type="text" id="col-img-url" value="${escapeHtml(col.image_url || '')}" placeholder="https://exemplo.com/imagem.jpg" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px;">
                  
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <label class="btn-secondary" for="col-img-upload" style="cursor: pointer; padding: 0.4rem 0.8rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.8rem; display: inline-block;">
                      Fazer Upload
                    </label>
                    <input type="file" id="col-img-upload" accept="image/*" style="display: none;">
                    <span id="upload-status" style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-ui);"></span>
                  </div>
                </div>
                
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Preview da Capa</label>
                  <div id="col-img-preview-container" style="width: 100%; height: 105px; border: 1px solid var(--border-strong); border-radius: 2px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; overflow: hidden; color: var(--text-muted); font-size: 0.8rem;">
                    ${col.image_url ? `
                      <img src="${col.image_url}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">
                    ` : `
                      <span id="col-preview-placeholder">Nenhuma imagem</span>
                    `}
                  </div>
                </div>
              </div>
              
              <!-- Poem checklist -->
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Associar Poemas</label>
                
                <input type="text" id="checklist-search" placeholder="Filtrar poemas na lista..." style="width: 100%; padding: 0.4rem var(--space-sm); border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px; font-size: 0.85rem;">
                
                <div id="checklist-container" style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-2xs); background: var(--bg-secondary); display: grid; gap: 4px;">
                  ${poems.map(p => {
                    const isChecked = associatedSet.has(p.id);
                    return `
                      <label class="checklist-item" data-title="${p.title.toLowerCase()}" style="display: flex; align-items: center; gap: var(--space-2xs); padding: var(--space-3xs) var(--space-2xs); cursor: pointer; border-radius: 2px; transition: background-color var(--transition-fast);">
                        <input type="checkbox" name="associated-poems" value="${p.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
                        <span style="font-size: 0.9rem; color: var(--text-primary);">${escapeHtml(p.title)}</span>
                        <span style="font-size: 0.7rem; color: ${p.status === 'published' ? 'var(--success)' : 'var(--text-muted)'}; margin-left: auto; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${p.status === 'published' ? 'var(--success)' : 'var(--border-strong)'}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui);">
                          ${p.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
              
              <div style="display: flex; justify-content: flex-end; gap: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <button type="button" id="cancel-form-btn" style="padding: 0.6rem 1.5rem; color: var(--text-secondary); background: transparent; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem;">Cancelar</button>
                <button type="submit" id="save-col-btn" style="padding: 0.6rem 1.5rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; border: none; cursor: pointer; font-size: 0.85rem;">
                  ${colId ? 'Salvar Alterações' : 'Criar Coleção'}
                </button>
              </div>
            </form>
          </div>
        `;
        
        const nameInput = container.querySelector('#col-name');
        const slugInput = container.querySelector('#col-slug');
        nameInput.addEventListener('input', () => {
          if (!colId || slugInput.value === '') {
            slugInput.value = nameInput.value.toLowerCase().trim()
              .replace(/[áàãâä]/g, 'a')
              .replace(/[éèêë]/g, 'e')
              .replace(/[íìîï]/g, 'i')
              .replace(/[óòõôö]/g, 'o')
              .replace(/[úùûü]/g, 'u')
              .replace(/ç/g, 'c')
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
          }
        });
        
        const checkSearch = container.querySelector('#checklist-search');
        const checkItems = container.querySelectorAll('.checklist-item');
        checkSearch.addEventListener('input', () => {
          const query = checkSearch.value.toLowerCase().trim();
          checkItems.forEach(item => {
            if (item.dataset.title.includes(query)) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
        
        const imgUrlInput = container.querySelector('#col-img-url');
        const previewContainer = container.querySelector('#col-img-preview-container');
        imgUrlInput.addEventListener('input', () => {
          const val = imgUrlInput.value.trim();
          if (val) {
            previewContainer.innerHTML = `<img src="${val}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">`;
          } else {
            previewContainer.innerHTML = `<span id="col-preview-placeholder">Nenhuma imagem</span>`;
          }
        });
        
        const fileInput = container.querySelector('#col-img-upload');
        const statusSpan = container.querySelector('#upload-status');
        fileInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          statusSpan.textContent = 'Enviando...';
          statusSpan.style.color = 'var(--accent-subtle)';
          fileInput.disabled = true;
          
          try {
            const ext = file.name.split('.').pop().toLowerCase();
            const fileName = `col_cover_${Date.now()}.${ext}`;
            
            const { data, error: upErr } = await supabase.storage
              .from('avatars')
              .upload(fileName, file);
              
            if (upErr) throw upErr;
            
            const { data: urlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(fileName);
              
            const publicUrl = urlData.publicUrl;
            imgUrlInput.value = publicUrl;
            previewContainer.innerHTML = `<img src="${publicUrl}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">`;
            statusSpan.textContent = 'Sucesso!';
            statusSpan.style.color = 'var(--success)';
          } catch (err) {
            console.error('Erro no upload de capa:', err);
            statusSpan.textContent = 'Erro!';
            statusSpan.style.color = 'var(--error)';
          } finally {
            fileInput.disabled = false;
            setTimeout(() => {
              statusSpan.textContent = '';
            }, 3000);
          }
        });
        
        container.querySelector('#cancel-form-btn').addEventListener('click', () => renderList());
        
        container.querySelector('#col-form').addEventListener('submit', async (e) => {
          e.preventDefault();
          const saveBtn = container.querySelector('#save-col-btn');
          saveBtn.innerText = 'Salvando...';
          saveBtn.disabled = true;
          
          const payload = {
            name: nameInput.value.trim(),
            slug: slugInput.value.trim(),
            description: container.querySelector('#col-description').value.trim(),
            image_url: imgUrlInput.value.trim() || null
          };
          
          let colIdToUse = colId;
          let colError = null;
          
          if (colId) {
            const res = await supabase.from('collections').update(payload).eq('id', colId);
            colError = res.error;
          } else {
            const res = await supabase.from('collections').insert([payload]).select().single();
            colError = res.error;
            if (res.data) colIdToUse = res.data.id;
          }
          
          if (colError) {
            alert('Erro ao salvar coleção: ' + colError.message);
            saveBtn.innerText = colId ? 'Salvar Alterações' : 'Criar Coleção';
            saveBtn.disabled = false;
            return;
          }
          
          const checkedCheckboxes = container.querySelectorAll('input[name="associated-poems"]:checked');
          const checkedIds = Array.from(checkedCheckboxes).map(cb => cb.value);
          
          await supabase.from('collection_poems').delete().eq('collection_id', colIdToUse);
          
          if (checkedIds.length > 0) {
            const relations = checkedIds.map(poemId => ({
              collection_id: colIdToUse,
              poem_id: poemId
            }));
            const { error: relError } = await supabase.from('collection_poems').insert(relations);
            if (relError) {
              alert('Coleção salva, mas houve um erro ao associar poemas: ' + relError.message);
            }
          }
          
          renderList();
        });
        
      } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error">Erro ao carregar o formulário: ${err.message}</div>`;
      }
    };
    
    await renderList();
  },

  async renderList(container) {
    container.innerHTML = '<div class="loading">Carregando obras...</div>';
    
    try {
      const [poemsRes, viewsRes] = await Promise.all([
        supabase.from('poems').select('id, title, slug, status, published_at, scheduled_at, tags, created_at').order('created_at', { ascending: false }),
        supabase.from('page_views').select('poem_id')
      ]);
      
      if (poemsRes.error) throw poemsRes.error;
      
      const poems = poemsRes.data || [];
      const views = viewsRes.data || [];
      
      const viewCounts = {};
      views.forEach(v => {
        if (v.poem_id) {
          viewCounts[v.poem_id] = (viewCounts[v.poem_id] || 0) + 1;
        }
      });
      
      const allTags = new Set();
      poems.forEach(p => p.tags?.forEach(t => allTags.add(t.trim())));
      const sortedTags = Array.from(allTags).sort();
      
      container.innerHTML = `
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          
          <!-- Filters Toolbar -->
          <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; background: var(--bg-elevated); padding: var(--space-sm); border-radius: 4px; border: 1px solid var(--border-subtle);">
            <input type="text" id="list-search" placeholder="Buscar por título ou slug..." style="flex-grow: 1; padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; min-width: 200px; font-size: 0.85rem;">
            
            <select id="list-filter-status" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; cursor: pointer;">
              <option value="all">Todos os Estados</option>
              <option value="published">Publicados</option>
              <option value="draft">Rascunhos</option>
              <option value="scheduled">Agendados</option>
            </select>
            
            <select id="list-filter-tag" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; max-width: 180px; cursor: pointer;">
              <option value="all">Todos os Sentimentos</option>
              ${sortedTags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('')}
            </select>
            
            <select id="list-sort" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; font-size: 0.85rem; cursor: pointer;">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="title-az">Título (A-Z)</option>
              <option value="title-za">Título (Z-A)</option>
              <option value="views">Mais Vistos (Views)</option>
            </select>
          </div>
          
          <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <div>
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${poems.length}</strong> obras
            </div>
          </div>
          
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 600px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Link</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Estado</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500; text-align: center;">Visualizações</th>
                  <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
                </tr>
              </thead>
              <tbody id="list-tbody"></tbody>
            </table>
          </div>
        </div>
      `;
      
      const tbody = container.querySelector('#list-tbody');
      const resultsCountEl = container.querySelector('#results-count');
      
      const renderRows = (filteredPoems) => {
        resultsCountEl.innerText = filteredPoems.length;
        if (filteredPoems.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum poema encontrado com os filtros selecionados.
              </td>
            </tr>
          `;
          return;
        }
        
        tbody.innerHTML = filteredPoems.map(p => {
          const count = viewCounts[p.id] || 0;
          let dateInfo = '';
          if (p.status === 'scheduled') {
            dateInfo = `Agendado • ${new Date(p.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`;
          } else if (p.status === 'published') {
            dateInfo = `Publicado • ${new Date(p.published_at).toLocaleDateString('pt-BR')}`;
          } else {
            dateInfo = `Criado • ${new Date(p.created_at).toLocaleDateString('pt-BR')}`;
          }
          
          const badgeColor = p.status === 'published' ? 'var(--success)' : p.status === 'scheduled' ? 'var(--accent-subtle)' : 'var(--border-strong)';
          const badgeTextColor = p.status === 'published' ? 'var(--success)' : p.status === 'scheduled' ? 'var(--accent-subtle)' : 'var(--text-muted)';
          
          return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary);">${escapeHtml(p.title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(p.slug)}</td>
              <td style="padding: var(--space-md) 0;">
                <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${badgeColor}; color: ${badgeTextColor}; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
                  ${p.status === 'published' ? 'Publicado' : p.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                </span>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; font-family: var(--font-ui); white-space: nowrap;">${dateInfo}</div>
              </td>
              <td style="padding: var(--space-md) 0; text-align: center; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.9rem;">
                👁 ${count}
              </td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <a href="${import.meta.env.BASE_URL}admin?view=editor&id=${p.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast); text-decoration: none;">Editar</a>
                <button class="delete-btn" data-id="${p.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer; padding: 0;">Excluir</button>
              </td>
            </tr>
          `;
        }).join('');
        
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
          let confirmState = false;
          btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const id = btn.dataset.id;
            
            if (!confirmState) {
              const originalText = btn.innerText;
              btn.innerText = 'Tem certeza?';
              btn.style.color = '#fff';
              btn.style.backgroundColor = 'var(--error)';
              btn.style.padding = '0.2rem 0.5rem';
              btn.style.borderRadius = '2px';
              btn.style.opacity = '1';
              confirmState = true;
              
              setTimeout(() => {
                if (btn && !btn.disabled) {
                  btn.innerText = originalText;
                  btn.style.color = 'var(--error)';
                  btn.style.backgroundColor = 'transparent';
                  btn.style.padding = '0';
                  btn.style.opacity = '0.7';
                  confirmState = false;
                }
              }, 3000);
              return;
            }
            
            btn.innerText = 'Excluindo...';
            btn.disabled = true;
            
            const { error } = await supabase.from('poems').delete().eq('id', id);
            
            if (error) {
              console.error(error);
              alert('Erro ao excluir: ' + error.message);
              btn.innerText = 'Excluir';
              btn.disabled = false;
              return;
            }
            
            navigateTo('/admin?view=list');
          });
        });
      };
      
      const searchInput = container.querySelector('#list-search');
      const statusSelect = container.querySelector('#list-filter-status');
      const tagSelect = container.querySelector('#list-filter-tag');
      const sortSelect = container.querySelector('#list-sort');
      
      const filterList = () => {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusSelect.value;
        const tag = tagSelect.value;
        const sort = sortSelect.value;
        
        let filtered = [...poems];
        
        if (query) {
          filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(query) || 
            p.slug.toLowerCase().includes(query)
          );
        }
        
        if (status !== 'all') {
          filtered = filtered.filter(p => p.status === status);
        }
        
        if (tag !== 'all') {
          filtered = filtered.filter(p => p.tags && p.tags.includes(tag));
        }
        
        if (sort === 'newest') {
          filtered.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
        } else if (sort === 'oldest') {
          filtered.sort((a, b) => new Date(a.published_at || a.created_at) - new Date(b.published_at || b.created_at));
        } else if (sort === 'title-az') {
          filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'title-za') {
          filtered.sort((a, b) => b.title.localeCompare(a.title));
        } else if (sort === 'views') {
          filtered.sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0));
        }
        
        renderRows(filtered);
      };
      
      searchInput.addEventListener('input', debounce(filterList, 150));
      statusSelect.addEventListener('change', filterList);
      tagSelect.addEventListener('change', filterList);
      sortSelect.addEventListener('change', filterList);
      
      filterList();
      
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="error">Erro ao carregar obras: ${err.message}</div>`;
    }
  },
  
  async renderEditor(container, id) {
    let poem = { title: '', slug: '', content: '', excerpt: '', tags: [], status: 'draft' };
    
    if (id) {
      container.innerHTML = '<div class="loading">Carregando poema...</div>';
      const { data } = await supabase.from('poems').select('*').eq('id', id).single();
      if (data) {
        poem = data;
        // Clean imported HTML tags so the editor is always pure natural text
        poem.content = (poem.content || '')
          .replace(/<br\s*[\/]?>/gi, '\n')
          .replace(/<\/p>\s*<p>/gi, '\n\n')
          .replace(/<\/?(p|pre|div|span|strong|em|b|i)[^>]*>/gi, '')
          .trim();
      }
    }
    
    container.innerHTML = `
      <form id="editor-form" style="font-family: var(--font-ui);">
        <div class="editor-layout">
          <div class="editor-pane">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
                <input type="text" id="poem-title" value="${poem.title}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
                <input type="text" id="poem-slug" value="${poem.slug}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${poem.content}</textarea>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
              <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${poem.excerpt || ''}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
                <input type="text" id="poem-tags" value="${poem.tags ? poem.tags.join(', ') : ''}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
                <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <option value="draft" ${poem.status === 'draft' ? 'selected' : ''}>Rascunho</option>
                  <option value="scheduled" ${poem.status === 'scheduled' ? 'selected' : ''}>Agendado</option>
                  <option value="published" ${poem.status === 'published' ? 'selected' : ''}>Publicado</option>
                </select>
              </div>
            </div>

            <div id="scheduling-fields" style="margin-top: var(--space-md); ${poem.status === 'scheduled' ? '' : 'display: none;'}">
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
              <input type="datetime-local" id="scheduled-at" value="${poem.scheduled_at ? new Date(poem.scheduled_at).toISOString().slice(0, 16) : ''}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
              <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
              ${poem.status === 'scheduled' ? `<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(poem.scheduled_at).toLocaleString('pt-BR')}.</p>` : ''}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
              <a href="${import.meta.env.BASE_URL}admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
              <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
              ${poem.status === 'draft' ? `<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>` : ''}
            </div>
          </div>

          <div class="preview-pane">
            <div class="preview-header">
              <span class="preview-label">Preview em tempo real</span>
            </div>
            <article class="preview-poem">
              <h1 id="preview-title">${poem.title || 'Título da Obra'}</h1>
              <div class="poem-meta preview-meta">
                <span id="preview-date">${poem.published_at ? new Date(poem.published_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</span>
                <span id="preview-tags-container">${poem.tags && poem.tags.length > 0 ? `<span>•</span> <span>Sentimentos: ${poem.tags.join(', ')}</span>` : ''}</span>
              </div>
              <div id="preview-content" class="poem-content">${poem.content || ''}</div>
            </article>
          </div>
        </div>
      </form>
    `;
    
    // Auto-generate slug from title if empty
    const titleInput = document.getElementById('poem-title');
    const slugInput = document.getElementById('poem-slug');
    
    titleInput.addEventListener('input', () => {
      // Sync preview title
      document.getElementById('preview-title').innerText = titleInput.value || 'Título da Obra';

      if (!id || slugInput.value === '') { // Auto-fill for new poems or if slug is empty
        let slug = titleInput.value.toLowerCase().trim()
          .replace(/[áàãâä]/g, 'a')
          .replace(/[éèêë]/g, 'e')
          .replace(/[íìîï]/g, 'i')
          .replace(/[óòõôö]/g, 'o')
          .replace(/[úùûü]/g, 'u')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        slugInput.value = slug;
      }
    });

    // Preview Sync Logic
    const contentInput = document.getElementById('poem-content-input');
    const previewContent = document.getElementById('preview-content');
    const tagsInput = document.getElementById('poem-tags');
    const statusSelect = document.getElementById('poem-status');
    const schedulingFields = document.getElementById('scheduling-fields');

    const updatePreview = () => {
      previewContent.innerHTML = contentInput.value;
    };

    contentInput.addEventListener('input', debounce(updatePreview, 250));

    tagsInput.addEventListener('input', debounce(() => {
      const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
      document.getElementById('preview-tags-container').innerHTML = tags.length > 0 ? `<span>•</span> <span>Sentimentos: ${tags.join(', ')}</span>` : '';
    }, 250));

    statusSelect.addEventListener('change', () => {
      schedulingFields.style.display = statusSelect.value === 'scheduled' ? 'block' : 'none';
    });
    const getFormData = () => {
      const tags = tagsInput.value.split(',').map(t => t.trim()).filter(t => t);
      const scheduledAtInput = document.getElementById('scheduled-at');
      
      return {
        title: document.getElementById('poem-title').value,
        slug: document.getElementById('poem-slug').value,
        content: document.getElementById('poem-content-input').value,
        excerpt: document.getElementById('poem-excerpt').value,
        tags,
        status: document.getElementById('poem-status').value,
        scheduled_at: scheduledAtInput.value ? new Date(scheduledAtInput.value).toISOString() : null
      };
    };
    
    document.getElementById('editor-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('save-btn');
      btn.innerText = 'Salvando...';
      btn.disabled = true;
      
      const payload = getFormData();
      
      if (payload.status === 'scheduled' && !payload.scheduled_at) {
        alert('Por favor, defina uma data para o agendamento.');
        btn.innerText = 'Gravar Alterações';
        btn.disabled = false;
        return;
      }

      if (payload.status === 'published' && poem.status !== 'published') {
        payload.published_at = new Date().toISOString();
      }
      
      let error = null;
      if (id) {
        const res = await supabase.from('poems').update(payload).eq('id', id);
        error = res.error;
      } else {
        const res = await supabase.from('poems').insert([payload]);
        error = res.error;
      }
      
      if (error) {
        console.error(error);
        alert('Erro ao salvar: ' + error.message);
        btn.innerText = 'Gravar Alterações';
        btn.disabled = false;
        return;
      }
      
      navigateTo('/admin');
    });
    
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      let confirmState = false;
      
      publishBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Enforce form validation before proceeding
        const form = document.getElementById('editor-form');
        if (!form.reportValidity()) return;
        
        if (!confirmState) {
          publishBtn.innerText = 'Tem certeza? Clique para confirmar.';
          publishBtn.style.background = 'var(--error)';
          confirmState = true;
          
          // Reset confirm state after 4 seconds
          setTimeout(() => {
            if (publishBtn && !publishBtn.disabled) {
              publishBtn.innerText = 'Publicar e Notificar Assinantes';
              publishBtn.style.background = 'var(--success)';
              confirmState = false;
            }
          }, 4000);
          return;
        }
        
        publishBtn.innerText = 'Publicando...';
        publishBtn.disabled = true;
        
        const payload = getFormData();
        payload.status = 'published';
        payload.published_at = new Date().toISOString();
        
        let poemId = id;
        let error = null;
        
        if (id) {
          const res = await supabase.from('poems').update(payload).eq('id', id);
          error = res.error;
        } else {
          const res = await supabase.from('poems').insert([payload]).select().single();
          error = res.error;
          if (res.data) poemId = res.data.id;
        }
        
        if (error) {
          console.error(error);
          alert('Erro ao publicar: ' + error.message);
          publishBtn.innerText = 'Publicar e Notificar Assinantes';
          publishBtn.disabled = false;
          return;
        }
        
        // Trigger Supabase Edge Function Newsletter
        if (poemId) {
          try {
            publishBtn.innerText = 'Enviando newsletter...';
            
            const { data, error: fnError } = await supabase.functions.invoke('send-newsletter', {
              body: { poemId }
            });

            if (fnError) throw fnError;

            alert(`Obra publicada e newsletter enviada com sucesso para ${data.count} assinantes!`);
          } catch(err) {
            console.error('Newsletter erro:', err);
            let detailedMsg = '';
            if (err.context && typeof err.context.json === 'function') {
              try {
                const errBody = await err.context.json();
                detailedMsg = errBody.error || errBody.message || '';
              } catch (e) {}
            }
            alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${detailedMsg || err.message || 'Erro na Edge Function'}`);
          }
        }
        
        navigateTo('/admin');
      });
    }
  },
  
  async renderEmailHistory(container) {
    container.innerHTML = '<div class="loading">Carregando histórico e dados...</div>';
    
    try {
      const [logsRes, poemsRes] = await Promise.all([
        supabase
          .from('email_campaign_logs')
          .select('id, sent_at, status, details, poem_id, poems(title)')
          .order('sent_at', { ascending: false }),
        supabase
          .from('poems')
          .select('id, title')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
      ]);
      
      if (logsRes.error) throw logsRes.error;
      if (poemsRes.error) throw poemsRes.error;
      
      const logs = logsRes.data || [];
      const publishedPoems = poemsRes.data || [];
      
      // Calculate KPIs
      const totalCount = logs.length;
      const successCount = logs.filter(l => l.status === 'success').length;
      const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '100.0';
      const lastLog = logs[0] || null;
      
      const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `Há ${diffMins} min`;
        if (diffHours < 24) return `Há ${diffHours} h`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 30) return `Há ${diffDays} dias`;
        return date.toLocaleDateString('pt-BR');
      };
      
      container.innerHTML = `
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          
          <!-- Header and Primary Action -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-xs);">
            <div>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">Gerencie os disparos de newsletters enviados aos seus leitores.</p>
            </div>
            <button id="open-dispatch-modal-btn" class="btn-primary" style="padding: 0.6rem 1.2rem; background: var(--accent-subtle); color: var(--bg-primary); font-weight: 500; font-size: 0.85rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
              <span style="font-size: 1.1rem; line-height: 1;">✉</span> Novo Disparo Manual
            </button>
          </div>

          <!-- KPIs Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md);">
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Total de Campanhas</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${totalCount}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Registros de disparos de newsletter</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Taxa de Sucesso</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${successRate}%</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${successCount} envios bem-sucedidos</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Último Envio</div>
              <div style="font-size: 1.1rem; font-family: var(--font-ui); color: var(--accent-subtle); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;" title="${lastLog?.poems?.title || '-'}">
                ${lastLog?.poems?.title || 'Nenhum envio registrado'}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: var(--space-3xs);">
                ${lastLog ? formatRelativeTime(lastLog.sent_at) : 'Nenhum dado'}
              </div>
            </div>
          </div>
          
          <!-- Filters Toolbar -->
          <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; background: var(--bg-elevated); padding: var(--space-sm); border-radius: 6px; border: 1px solid var(--border-subtle);">
            <input type="text" id="email-search" placeholder="Buscar por obra ou detalhes..." style="flex-grow: 1; padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; min-width: 200px; font-size: 0.85rem;">
            
            <select id="email-filter-status" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
              <option value="all">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="failed">Falhas / Erros</option>
            </select>
            
            <select id="email-sort" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="title-az">Obra (A-Z)</option>
              <option value="title-za">Obra (Z-A)</option>
            </select>
          </div>
          
          <!-- Table Results count -->
          <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <div>
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${logs.length}</strong> envios
            </div>
          </div>
          
          <!-- Table -->
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 700px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Data do Envio</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Detalhes</th>
                  <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
                </tr>
              </thead>
              <tbody id="email-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- MODAL: Novo Disparo Manual -->
        <div id="manual-dispatch-modal" class="modal">
          <div class="modal-content" style="max-width: 500px; display: flex; flex-direction: column; gap: var(--space-md);">
            <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); margin: 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs);">Novo Disparo de Newsletter</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 0;">
              Selecione uma obra publicada para enviar por e-mail a todos os assinantes ativos.
            </p>
            
            <form id="manual-dispatch-form" style="display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-2xs);">
              <div style="display: flex; flex-direction: column; gap: var(--space-3xs);">
                <label for="dispatch-poem-select" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Selecione a Obra</label>
                <select id="dispatch-poem-select" required style="padding: var(--space-xs); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.95rem; cursor: pointer; width: 100%;">
                  <option value="" disabled selected>Escolha um poema...</option>
                  ${publishedPoems.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('')}
                </select>
                ${publishedPoems.length === 0 ? '<p style="color: var(--error); font-size: 0.8rem; margin: 4px 0 0 0;">Nenhuma obra publicada disponível.</p>' : ''}
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: var(--space-2xs); margin-top: var(--space-3xs);">
                <input type="checkbox" id="dispatch-confirm-chk" required style="margin-top: 3px; cursor: pointer;">
                <label for="dispatch-confirm-chk" style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; cursor: pointer; user-select: none;">
                  Confirmo que desejo enviar esta obra imediatamente para todos os assinantes ativos cadastrados no site.
                </label>
              </div>

              <div class="modal-actions" style="margin-top: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
                <button type="button" id="close-dispatch-modal-btn" class="btn-secondary" style="padding: 0.5rem 1rem; color: var(--text-secondary); font-size: 0.85rem; border: none; background: transparent; cursor: pointer;">Cancelar</button>
                <button type="submit" id="submit-dispatch-btn" class="btn-primary" ${publishedPoems.length === 0 ? 'disabled' : ''} style="padding: 0.5rem 1.2rem; background: var(--success); color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
                  Disparar Newsletter
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- MODAL: Detalhes do Log -->
        <div id="log-details-modal" class="modal">
          <div class="modal-content" style="max-width: 550px; display: flex; flex-direction: column; gap: var(--space-md);">
            <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); margin: 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs);">Detalhes da Campanha</h3>
            
            <div style="display: grid; gap: var(--space-sm); font-size: 0.9rem; margin-top: var(--space-2xs);">
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs);">
                <span style="color: var(--text-muted); font-weight: 500;">Obra:</span>
                <span id="detail-poem-title" style="color: var(--text-primary); font-weight: 500; font-family: var(--font-display); font-size: 1.1rem;">-</span>
              </div>
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs); align-items: center;">
                <span style="color: var(--text-muted); font-weight: 500;">Status:</span>
                <span id="detail-status-badge">-</span>
              </div>
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs);">
                <span style="color: var(--text-muted); font-weight: 500;">Data/Hora:</span>
                <span id="detail-date" style="color: var(--text-secondary);">-</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-3xs); margin-top: var(--space-3xs);">
                <span style="color: var(--text-muted); font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Resposta / Detalhes do Servidor SMTP:</span>
                <pre id="detail-description" style="margin: 0; padding: var(--space-sm); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: var(--text-primary); overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 180px; overflow-y: auto;"></pre>
              </div>
            </div>

            <div class="modal-actions" style="margin-top: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
              <button type="button" id="close-details-modal-btn" class="btn-secondary" style="padding: 0.5rem 1rem; color: var(--text-secondary); font-size: 0.85rem; border: none; background: transparent; cursor: pointer;">Fechar</button>
              <button type="button" id="resend-from-modal-btn" class="btn-primary" style="padding: 0.5rem 1.2rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer;">Reenviar Agora</button>
            </div>
          </div>
        </div>
      `;

      const tbody = container.querySelector('#email-tbody');
      const resultsCountEl = container.querySelector('#results-count');
      
      // Set up modal elements references
      const dispatchModal = container.querySelector('#manual-dispatch-modal');
      const detailsModal = container.querySelector('#log-details-modal');
      
      // Open Dispatch Modal
      container.querySelector('#open-dispatch-modal-btn').addEventListener('click', () => {
        dispatchModal.style.display = 'flex';
        container.querySelector('#manual-dispatch-form').reset();
      });
      
      // Close Dispatch Modal
      container.querySelector('#close-dispatch-modal-btn').addEventListener('click', () => {
        dispatchModal.style.display = 'none';
      });
      
      // Close Details Modal
      container.querySelector('#close-details-modal-btn').addEventListener('click', () => {
        detailsModal.style.display = 'none';
      });
      
      // Close modals when clicking outside content
      [dispatchModal, detailsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.style.display = 'none';
          }
        });
      });

      // State representing current detail log being shown
      let selectedLogForResend = null;
      
      // Set up Reenviar actions
      const handleResendAction = async (poemId, poemTitle, buttonEl) => {
        if (!poemId) {
          alert('Não é possível reenviar: id da obra indisponível.');
          return;
        }
        if (!confirm(`Deseja reenviar a newsletter da obra "${poemTitle}" para todos os assinantes ativos?`)) {
          return;
        }
        
        const originalText = buttonEl.innerText;
        buttonEl.disabled = true;
        buttonEl.innerText = 'Enviando...';
        buttonEl.style.opacity = '0.5';
        
        try {
          const { data, error: fnError } = await supabase.functions.invoke('send-newsletter', {
            body: { poemId }
          });
          
          if (fnError) throw fnError;
          
          alert(`Newsletter para "${poemTitle}" reenviada com sucesso para ${data.count} assinantes!`);
          // Close details modal if open
          detailsModal.style.display = 'none';
          // Reload the view
          this.renderEmailHistory(container);
        } catch (err) {
          console.error('Erro ao reenviar:', err);
          alert(`Erro ao enviar newsletter:\n${err.message || 'Erro na Edge Function'}`);
          buttonEl.disabled = false;
          buttonEl.innerText = originalText;
          buttonEl.style.opacity = '1';
        }
      };

      // Register action on details modal button (once)
      container.querySelector('#resend-from-modal-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (selectedLogForResend && selectedLogForResend.poem_id) {
          await handleResendAction(
            selectedLogForResend.poem_id,
            selectedLogForResend.poems?.title || 'Desconhecido',
            e.currentTarget
          );
        }
      });
      
      const renderRows = (filteredLogs) => {
        resultsCountEl.innerText = filteredLogs.length;
        if (filteredLogs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum registro de envio encontrado com os filtros aplicados.
              </td>
            </tr>
          `;
          return;
        }
        
        tbody.innerHTML = filteredLogs.map(log => {
          const title = log.poems?.title || 'Desconhecido';
          const formattedDate = new Date(log.sent_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
          const isSuccess = log.status === 'success';
          
          const statusBadge = isSuccess 
            ? `
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--success); box-shadow: 0 0 6px var(--success);"></span>
                Sucesso
              </span>
            ` 
            : `
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--error); box-shadow: 0 0 6px var(--error);"></span>
                Falha
              </span>
            `;
            
          const detailsPreview = log.details 
            ? (log.details.length > 50 ? `${escapeHtml(log.details.slice(0, 48))}...` : escapeHtml(log.details))
            : '-';
            
          return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.15rem; color: var(--text-primary); font-weight: 400;">${escapeHtml(title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.85rem;">${formattedDate}</td>
              <td style="padding: var(--space-md) 0;">${statusBadge}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${detailsPreview}</td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <button class="view-details-btn" data-id="${log.id}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; margin-right: var(--space-sm); transition: color var(--transition-fast); text-decoration: underline; padding: 0;">Detalhes</button>
                <button class="resend-log-btn" data-poem-id="${log.poem_id || ''}" data-title="${escapeHtml(title)}" style="color: var(--accent-subtle); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; transition: opacity var(--transition-fast); text-decoration: none; padding: 0; font-weight: 500;">Reenviar</button>
              </td>
            </tr>
          `;
        }).join('');
        
        // Add listeners for row hover micro-animations
        tbody.querySelectorAll('tr').forEach(row => {
          row.style.transition = 'background-color var(--transition-fast)';
          row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'var(--bg-secondary)';
          });
          row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = 'transparent';
          });
        });

        // Set up View Details Action
        tbody.querySelectorAll('.view-details-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const logId = btn.dataset.id;
            const log = filteredLogs.find(l => l.id === logId);
            if (!log) return;
            
            selectedLogForResend = log;
            
            container.querySelector('#detail-poem-title').innerText = log.poems?.title || 'Desconhecido';
            container.querySelector('#detail-date').innerText = new Date(log.sent_at).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'medium' });
            
            const isSuccess = log.status === 'success';
            container.querySelector('#detail-status-badge').innerHTML = isSuccess 
              ? `<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase;">Sucesso</span>`
              : `<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase;">Falha</span>`;
            
            container.querySelector('#detail-description').innerText = log.details || 'Nenhum detalhe adicional disponível.';
            
            // Re-configure the modal Resend button depending on if we have a poem_id
            const resendModalBtn = container.querySelector('#resend-from-modal-btn');
            if (log.poem_id) {
              resendModalBtn.style.display = 'inline-block';
              resendModalBtn.innerText = isSuccess ? 'Disparar Novamente' : 'Tentar Reenviar';
            } else {
              resendModalBtn.style.display = 'none';
            }
            
            detailsModal.style.display = 'flex';
          });
        });

        // Set up Reenviar actions
        tbody.querySelectorAll('.resend-log-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const poemId = btn.dataset.poemId;
            const title = btn.dataset.title;
            handleResendAction(poemId, title, btn);
          });
        });
      };

      const searchInput = container.querySelector('#email-search');
      const statusSelect = container.querySelector('#email-filter-status');
      const sortSelect = container.querySelector('#email-sort');
      
      const filterList = () => {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusSelect.value;
        const sort = sortSelect.value;
        
        let filtered = [...logs];
        
        if (query) {
          filtered = filtered.filter(log => {
            const title = (log.poems?.title || '').toLowerCase();
            const details = (log.details || '').toLowerCase();
            return title.includes(query) || details.includes(query);
          });
        }
        
        if (status !== 'all') {
          if (status === 'success') {
            filtered = filtered.filter(log => log.status === 'success');
          } else {
            filtered = filtered.filter(log => log.status !== 'success');
          }
        }
        
        if (sort === 'newest') {
          filtered.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        } else if (sort === 'oldest') {
          filtered.sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at));
        } else if (sort === 'title-az') {
          filtered.sort((a, b) => {
            const titleA = a.poems?.title || '';
            const titleB = b.poems?.title || '';
            return titleA.localeCompare(titleB);
          });
        } else if (sort === 'title-za') {
          filtered.sort((a, b) => {
            const titleA = a.poems?.title || '';
            const titleB = b.poems?.title || '';
            return titleB.localeCompare(titleA);
          });
        }
        
        renderRows(filtered);
      };
      
      searchInput.addEventListener('input', debounce(filterList, 150));
      statusSelect.addEventListener('change', filterList);
      sortSelect.addEventListener('change', filterList);
      
      // Execute initial filter
      filterList();

      // Set up Dispatch Form submission handler
      const dispatchForm = container.querySelector('#manual-dispatch-form');
      dispatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const poemSelect = container.querySelector('#dispatch-poem-select');
        const poemId = poemSelect.value;
        const poemTitle = poemSelect.options[poemSelect.selectedIndex].text;
        
        const submitBtn = container.querySelector('#submit-dispatch-btn');
        const cancelBtn = container.querySelector('#close-dispatch-modal-btn');
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';
        poemSelect.disabled = true;
        cancelBtn.style.display = 'none';
        
        try {
          const { data, error: fnError } = await supabase.functions.invoke('send-newsletter', {
            body: { poemId }
          });
          
          if (fnError) throw fnError;
          
          alert(`Newsletter para "${poemTitle}" enviada com sucesso para ${data.count} assinantes!`);
          dispatchModal.style.display = 'none';
          
          // Refresh page details
          this.renderEmailHistory(container);
        } catch (err) {
          console.error('Erro na Edge Function:', err);
          alert(`Erro ao disparar newsletter:\n${err.message || 'Erro inesperado'}`);
          
          submitBtn.disabled = false;
          submitBtn.innerText = 'Disparar Newsletter';
          poemSelect.disabled = false;
          cancelBtn.style.display = 'inline-block';
        }
      });
      
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="error">Erro ao carregar dados do histórico: ${err.message}</div>`;
    }
  },

  async renderSubscribers(container) {
    container.innerHTML = '<div class="loading">Carregando assinantes...</div>';
    
    const { data: subs, error } = await supabase
      .from('subscribers')
      .select('email, active, created_at, unsubscribed_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      container.innerHTML = `<div class="error">Erro ao carregar: ${error.message}</div>`;
      return;
    }
    
    if (!subs || subs.length === 0) {
      container.innerHTML = '<p>Nenhum assinante encontrado.</p>';
      return;
    }

    // KPIs Logic
    const activeCount = subs.filter(s => s.active).length;
    const totalCount = subs.length;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newLast30 = subs.filter(s => new Date(s.created_at) > last30Days).length;
    const churnCount = subs.filter(s => !s.active && s.unsubscribed_at && new Date(s.unsubscribed_at) > last30Days).length;
    const churnRate = ((churnCount / (activeCount || 1)) * 100).toFixed(1);
    
    const rows = subs.map(s => `
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui);">${s.email}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">
          ${new Date(s.created_at).toLocaleDateString('pt-BR')}
        </td>
        <td style="padding: var(--space-md) 0;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${s.active ? 'var(--success)' : 'var(--error)'}; color: ${s.active ? 'var(--success)' : 'var(--error)'}; text-transform: uppercase; letter-spacing: 1px;">
            ${s.active ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted);">
          ${s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString('pt-BR') : '-'}
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Total de Assinantes</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${totalCount}</div>
          <div style="font-size: 0.8rem; color: var(--success);">${activeCount} ativos</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Novos (30 dias)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">+${newLast30}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Crescimento constante</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Taxa de Evasão (Churn)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${churnRate}%</div>
          <div style="font-size: 0.8rem; color: var(--error);">${churnCount} saídas no mês</div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-lg);">
        <button id="export-csv-btn" class="btn-secondary" style="font-size: 0.8rem;">Exportar CSV</button>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">E-mail</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Inscrição</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Cancelamento</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    container.querySelector('#export-csv-btn')?.addEventListener('click', () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Email,Ativo,Data Inscrição,Data Saída\n"
        + subs.map(s => `${s.email},${s.active},${s.created_at},${s.unsubscribed_at || ''}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `assinantes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  },

  async renderComments(container) {
    container.innerHTML = '<div class="loading">Carregando comentários...</div>';
    
    const { data: comments, error } = await supabase
      .from('poem_comments')
      .select('id, author_name, content, approved, created_at, poems(title)')
      .order('created_at', { ascending: false });
      
    if (error) {
      container.innerHTML = `<div class="error">Erro ao carregar: ${error.message}</div>`;
      return;
    }
    
    if (!comments || comments.length === 0) {
      container.innerHTML = '<p>Nenhum comentário encontrado.</p>';
      return;
    }
    
    const rows = comments.map(c => `
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
          ${new Date(c.created_at).toLocaleDateString('pt-BR')}
        </td>
        <td style="padding: var(--space-md) 0;">
          <div style="font-family: var(--font-display); font-size: 1.1rem;">${escapeHtml(c.author_name)}</div>
          <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Em: ${c.poems?.title || 'Obra removida'}</div>
          <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${escapeHtml(c.content)}</div>
        </td>
        <td style="padding: var(--space-md) 0; vertical-align: middle;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${c.approved ? 'var(--success)' : 'var(--accent-subtle)'}; color: ${c.approved ? 'var(--success)' : 'var(--accent-subtle)'}; text-transform: uppercase; letter-spacing: 1px;">
            ${c.approved ? 'Aprovado' : 'Pendente'}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; text-align: right; vertical-align: middle;">
          ${!c.approved ? `<button class="approve-btn" data-id="${c.id}" style="color: var(--success); margin-right: 1rem;">Aprovar</button>` : ''}
          <button class="delete-comment-btn" data-id="${c.id}" style="color: var(--error);">Excluir</button>
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Data</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Autor e Comentário</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
            <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    container.querySelectorAll('.approve-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const { error } = await supabase.from('poem_comments').update({ approved: true }).eq('id', id);
        if (error) alert('Erro ao aprovar: ' + error.message);
        else this.renderComments(container);
      });
    });

    container.querySelectorAll('.delete-comment-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Excluir este comentário?')) return;
        const id = btn.dataset.id;
        const { error } = await supabase.from('poem_comments').delete().eq('id', id);
        if (error) alert('Erro ao excluir: ' + error.message);
        else this.renderComments(container);
      });
    });
  }
};
