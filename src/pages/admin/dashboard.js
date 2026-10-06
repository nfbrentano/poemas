import { supabase } from './compat-client.js';
import { escapeHtml } from '../../utils/html.js';

export async function renderDashboard(container) {
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
}
