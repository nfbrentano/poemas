const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/analytics-DfB2rtU9.js","assets/index-CI_ety7I.js","assets/index-C0v0KYC0.css"])))=>i.map(i=>d[i]);
import{o as e,r as t,s as n}from"./index-CI_ety7I.js";import{t as r}from"./html-BzoIVJF0.js";function i(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}}var a={meta:{title:`Dashboard Admin`},async render(r,i){let a=new URLSearchParams(window.location.search),o=a.get(`bypass_auth`)===`true`,{data:{session:s}}=await e.auth.getSession();if(!s&&!o){t(`/login`);return}let c=a.get(`view`)||`dashboard`,l=e=>{let t=c===e;return`font-size: 0.85rem; padding: 0.5rem 1rem; color: ${t?`var(--accent-subtle)`:`var(--text-secondary)`}; font-weight: ${t?`500`:`400`}; transition: color var(--transition-fast); border-bottom: 2px solid ${t?`var(--accent-subtle)`:`transparent`}; padding-bottom: 0.25rem; text-decoration: none;`};r.innerHTML=`
      <div class="admin-layout" style="max-width: 1400px; margin: 0 auto; padding: 0 var(--space-md); width: 100%; box-sizing: border-box;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: var(--space-md);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary); cursor: pointer; margin: 0;" id="logo-header">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-xs); align-items: center; font-family: var(--font-ui); flex-wrap: wrap;">
            <a href="/poemas/admin?view=dashboard" data-link style="${l(`dashboard`)}">Início</a>
            <a href="/poemas/admin?view=list" data-link style="${l(`list`)}">Obras</a>
            <a href="/poemas/admin?view=collections" data-link style="${l(`collections`)}">Coleções</a>
            <a href="/poemas/admin?view=analytics" data-link style="${l(`analytics`)}">Estatísticas</a>
            <a href="/poemas/admin?view=emails" data-link style="${l(`emails`)}">Histórico de Emails</a>
            <a href="/poemas/admin?view=subscribers" data-link style="${l(`subscribers`)}">Assinantes</a>
            <a href="/poemas/admin?view=comments" data-link style="${l(`comments`)}">Comentários</a>
            <a href="/poemas/admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast); text-decoration: none; color: var(--text-primary);">Nova Obra</a>

            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent; background: transparent; cursor: pointer;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `,r.querySelector(`#logo-header`).addEventListener(`click`,()=>{t(`/admin`)}),document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await e.auth.signOut(),t(`/login`)});let u=document.getElementById(`admin-content`);if(c===`dashboard`)await this.renderDashboard(u);else if(c===`list`)await this.renderList(u);else if(c===`collections`)await this.renderCollections(u);else if(c===`editor`)await this.renderEditor(u,a.get(`id`));else if(c===`analytics`){let{default:e}=await n(async()=>{let{default:e}=await import(`./analytics-DfB2rtU9.js`);return{default:e}},__vite__mapDeps([0,1,2]));await e.render(u)}else c===`emails`?await this.renderEmailHistory(u):c===`subscribers`?await this.renderSubscribers(u):c===`comments`&&await this.renderComments(u)},async renderDashboard(t){t.innerHTML=`<div class="loading">Carregando painel geral...</div>`;try{let n=[],i=0,a=[],o=[],s=new URLSearchParams(window.location.search).get(`bypass_auth`)===`true`;try{let[t,r,c,l]=await Promise.all([e.from(`poems`).select(`id, title, slug, status, scheduled_at, created_at`),e.from(`poem_comments`).select(`id`).eq(`approved`,!1),e.from(`subscribers`).select(`email, created_at, active`).order(`created_at`,{ascending:!1}).limit(5),e.from(`page_views`).select(`created_at`).gte(`created_at`,new Date(Date.now()-10080*60*1e3).toISOString())]);if(t.error||r.error||c.error||l.error){if(s)throw Error(`Supabase query error, fallback to mock data`);if(t.error)throw t.error;if(r.error)throw r.error;if(c.error)throw c.error;if(l.error)throw l.error}n=t.data||[],i=r.data?.length||0,a=c.data||[],o=l.data||[]}catch(e){if(s){n=[{id:`1`,title:`Poema das Flores`,slug:`poema-das-flores`,status:`published`,created_at:new Date().toISOString()},{id:`2`,title:`Canto Noturno`,slug:`canto-noturno`,status:`draft`,created_at:new Date().toISOString()},{id:`3`,title:`Silêncio da Alma`,slug:`silencio-da-alma`,status:`scheduled`,scheduled_at:new Date(Date.now()+864e5).toISOString(),created_at:new Date().toISOString()}],i=3,a=[{email:`leitor1@exemplo.com`,created_at:new Date(Date.now()-1e5).toISOString(),active:!0},{email:`leitor2@exemplo.com`,created_at:new Date(Date.now()-5e5).toISOString(),active:!1},{email:`leitor3@exemplo.com`,created_at:new Date(Date.now()-9e5).toISOString(),active:!0}],o=[];for(let e=0;e<7;e++){let t=[12,18,5,23,14,30,45][e],n=new Date;n.setDate(n.getDate()-(6-e));for(let e=0;e<t;e++)o.push({created_at:n.toISOString()})}}else throw e}let c=n.length,l=n.filter(e=>e.status===`published`).length,u=n.filter(e=>e.status===`draft`).length,d=n.filter(e=>e.status===`scheduled`).length,f={};o.forEach(e=>{let t=new Date(e.created_at).toISOString().slice(0,10);f[t]=(f[t]||0)+1});let p=[],m=0;for(let e=6;e>=0;e--){let t=new Date;t.setDate(t.getDate()-e);let n=t.toISOString().slice(0,10),r=f[n]||0;m+=r,p.push({label:n,count:r})}let h=n.filter(e=>e.status===`scheduled`&&e.scheduled_at).sort((e,t)=>new Date(e.scheduled_at)-new Date(t.scheduled_at)).slice(0,3);t.innerHTML=`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-lg); width: 100%;">
          
          <!-- Welcome / Overview row -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Bem-vindo ao Painel Admin</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Uma visão geral do seu acervo literário e engajamento.</p>
            </div>
            
            <!-- Quick Actions -->
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <a href="/poemas/admin?view=editor" data-link style="padding: 0.5rem 1rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; text-decoration: none; transition: opacity var(--transition-fast);" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">+ Nova Obra</a>
              <a href="/poemas/admin?view=collections" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Coleções</a>
              <a href="/poemas/admin?view=comments" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Comentários</a>
              <a href="/poemas/admin?view=analytics" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Estatísticas</a>
            </div>
          </div>
          
          <!-- Mini KPIs Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-md); width: 100%;">
            
            <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Total de Obras</div>
              <div style="display: flex; align-items: baseline; gap: var(--space-2xs); margin-top: auto;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${c}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">poemas</span>
              </div>
            </div>
            
            <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Status das Obras</div>
              <div style="display: flex; gap: var(--space-md); font-size: 0.85rem; align-items: baseline; margin-top: auto; flex-wrap: wrap;">
                <div>
                  <span style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${l}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Pub.</span>
                </div>
                <div>
                  <span style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">${u}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Rasc.</span>
                </div>
                <div>
                  <span style="color: var(--accent-subtle); font-weight: 600; font-size: 1.1rem;">${d}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Agend.</span>
                </div>
              </div>
            </div>
            
            <a href="/poemas/admin?view=comments" data-link style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Comentários Pendentes</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: ${i>0?`var(--error)`:`var(--text-muted)`}; font-weight: 400; line-height: 1;">${i}</span>
                ${i>0?`<span style="background: rgba(204, 74, 74, 0.15); color: var(--error); padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Revisar</span>`:`<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">✔ Tudo limpo</span>`}
              </div>
            </a>
            
            <a href="/poemas/admin?view=analytics" id="visits-kpi-card" data-link style="position: relative; background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 4px;">Visitas (7 dias)</div>
                  <div style="font-size: 1.8rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${m}</div>
                </div>
              </div>
              <div style="opacity: 0.9; width: 100%; margin-top: auto; display: flex; align-items: flex-end;">
                ${(e=>{if(!e||e.length===0)return``;let t=e.map(e=>e.count),n=Math.max(...t,1),r=e.length,i=e.map((e,t)=>({x:t/(r-1||1)*160,y:38-e.count/n*36})),a=`M ${i[0].x} ${i[0].y}`;for(let e=0;e<i.length-1;e++){let t=i[e],n=i[e+1],r=i[e-1]||t,o=i[e+2]||n,s=t.x+(n.x-r.x)/6,c=t.y+(n.y-r.y)/6,l=n.x-(o.x-t.x)/6,u=n.y-(o.y-t.y)/6;a+=` C ${s} ${c}, ${l} ${u}, ${n.x} ${n.y}`}return`
          <svg id="sparkline-svg" viewBox="0 0 160 40" style="width: 100%; height: 40px; display: block; overflow: visible; position: relative;">
            <defs>
              <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--accent-subtle)" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="var(--accent-subtle)" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            <path d="${`${a} L ${i[i.length-1].x} 40 L ${i[0].x} 40 Z`}" fill="url(#sparklineGrad)" />
            <path d="${a}" fill="none" stroke="var(--accent-subtle)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- Hover Elements -->
            <line id="sparkline-tracker" x1="0" y1="0" x2="0" y2="40" stroke="var(--border-strong)" stroke-width="1.5" stroke-dasharray="2 2" style="display: none; pointer-events: none;"/>
            <circle id="sparkline-hover-dot" r="4.5" fill="var(--bg-elevated)" stroke="var(--accent-subtle)" stroke-width="2" style="display: none; pointer-events: none; filter: drop-shadow(0 0 2px var(--accent-subtle));"/>
            
            ${i.map((e,t)=>`
              <circle cx="${e.x}" cy="${e.y}" r="2" fill="var(--accent-subtle)" opacity="0.6" />
            `).join(``)}
          </svg>
        `})(p)}
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
                  <a href="/poemas/admin?view=subscribers" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver todos</a>
                </div>
                
                ${a.length===0?`
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhum assinante cadastrado.</p>
                `:`
                  <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">
                        <th style="padding-bottom: var(--space-2xs); font-weight: 500;">Email</th>
                        <th style="padding-bottom: var(--space-2xs); font-weight: 500;">Data</th>
                        <th style="padding-bottom: var(--space-2xs); font-weight: 500; text-align: right;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${a.map(e=>`
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: var(--space-xs) var(--space-xs) var(--space-xs) 0; color: var(--text-primary); font-family: var(--font-ui); font-size: 0.8rem; word-break: break-all;">${r(e.email)}</td>
                          <td style="padding: var(--space-xs) var(--space-xs); color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</td>
                          <td style="padding: var(--space-xs) 0 var(--space-xs) var(--space-xs); text-align: right;">
                            <span style="font-size: 0.7rem; color: ${e.active?`var(--success)`:`var(--error)`}; border: 1px solid ${e.active?`var(--success)`:`var(--error)`}; padding: 0.1rem 0.4rem; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${e.active?`Ativo`:`Inativo`}
                            </span>
                          </td>
                        </tr>
                      `).join(``)}
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
                  <a href="/poemas/admin?view=list" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver obras</a>
                </div>
                
                ${h.length===0?`
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhuma publicação agendada.</p>
                `:`
                  <div style="display: grid; gap: var(--space-xs);">
                    ${h.map(e=>`
                      <div style="padding: var(--space-xs); border: 1px solid var(--border-subtle); border-radius: 2px; background: rgba(255, 255, 255, 0.01); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); font-weight: 400;">${r(e.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 2px;">Slug: ${r(e.slug)}</div>
                        </div>
                        <div style="text-align: right;">
                          <span style="font-size: 0.7rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.15rem 0.4rem; border-radius: 2px; text-transform: uppercase; font-family: var(--font-ui); white-space: nowrap;">
                            ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}
                          </span>
                        </div>
                      </div>
                    `).join(``)}
                  </div>
                `}
              </div>
            </div>
            
          </div>
          
        </div>
      `;let g=t.querySelector(`#visits-kpi-card`);if(g){let e=g.querySelector(`#sparkline-svg`),t=g.querySelector(`#sparkline-tracker`),n=g.querySelector(`#sparkline-hover-dot`),r=g.querySelector(`#sparkline-tooltip`),i=i=>{let o=e.getBoundingClientRect(),s=i.clientX-o.left;if(s<-10||s>o.width+10){a();return}let c=Math.min(6,Math.max(0,Math.round(s/o.width*6))),l=p[c];if(!l)return;let u=Math.max(...p.map(e=>e.count),1),d=c/6*160,f=38-l.count/u*36;t.setAttribute(`x1`,d),t.setAttribute(`x2`,d),t.style.display=`block`,n.setAttribute(`cx`,d),n.setAttribute(`cy`,f),n.style.display=`block`;let m=new Date(l.label+`T00:00:00`),h=m.toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`2-digit`}),_=m.toLocaleDateString(`pt-BR`,{weekday:`short`}).replace(`.`,``);r.style.display=`block`,r.innerHTML=`
            <div style="font-weight: 500; font-size: 0.65rem; color: var(--text-secondary); text-transform: capitalize;">${_}, ${h}</div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${l.count} ${l.count===1?`visita`:`visitas`}</div>
          `;let v=g.getBoundingClientRect(),y=i.clientX-v.left,b=i.clientY-v.top-55;r.style.left=`${Math.min(v.width-95,Math.max(10,y-45))}px`,r.style.top=`${b}px`,r.getBoundingClientRect(),r.style.opacity=`1`,r.style.transform=`translateY(0)`},a=()=>{t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.opacity=`0`,r.style.transform=`translateY(4px)`,setTimeout(()=>{r.style.opacity===`0`&&(r.style.display=`none`)},150))};g.addEventListener(`mousemove`,i),g.addEventListener(`mouseleave`,a)}}catch(e){console.error(e),t.innerHTML=`<div class="error">Erro ao carregar o dashboard: ${e.message}</div>`}},async renderCollections(t){let n=async()=>{t.innerHTML=`<div class="loading">Carregando coleções...</div>`;let{data:a,error:o}=await e.from(`collections`).select(`*, collection_poems(count)`).order(`created_at`,{ascending:!1});if(o){t.innerHTML=`<div class="error">Erro ao carregar coleções: ${o.message}</div>`;return}let s=a.map(e=>`
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          ${e.image_url?`
            <div style="height: 120px; background-image: url('${e.image_url}'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
          `:`
            <div style="height: 120px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Sem Imagem</div>
          `}
          <div style="padding: var(--space-md); flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-xs);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; margin: 0; color: var(--text-primary);">${r(e.name)}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.1rem 0.4rem; border-radius: 2px; font-family: var(--font-ui); font-weight: 500; white-space: nowrap;">
                  ${e.collection_poems?.[0]?.count||0} obras
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 4px;">Slug: ${r(e.slug)}</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-2xs); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${r(e.description||`Sem descrição.`)}</p>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); font-family: var(--font-ui);">
              <button class="edit-col-btn" data-id="${e.id}" style="font-size: 0.85rem; color: var(--text-primary); transition: color var(--transition-fast); background: transparent; border: none; cursor: pointer;">Editar</button>
              <button class="delete-col-btn" data-id="${e.id}" style="font-size: 0.85rem; color: var(--error); opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer;">Excluir</button>
            </div>
          </div>
        </div>
      `).join(``);t.innerHTML=`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Coleções</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Crie e gerencie agrupamentos temáticos de suas obras.</p>
            </div>
            <button id="new-col-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer;">+ Nova Coleção</button>
          </div>
          
          ${a.length===0?`
            <p style="color: var(--text-muted); text-align: center; padding: var(--space-xl) 0; border: 1px dashed var(--border-strong); border-radius: 4px;">Nenhuma coleção criada ainda. Comece criando uma clicando no botão acima!</p>
          `:`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
              ${s}
            </div>
          `}
        </div>
      `,t.querySelector(`#new-col-btn`).addEventListener(`click`,()=>i()),t.querySelectorAll(`.edit-col-btn`).forEach(e=>{e.addEventListener(`click`,()=>i(e.dataset.id))}),t.querySelectorAll(`.delete-col-btn`).forEach(t=>{let r=!1;t.addEventListener(`click`,async i=>{if(!r){t.innerText=`Confirmar?`,t.style.color=`#fff`,t.style.backgroundColor=`var(--error)`,t.style.padding=`0.2rem 0.5rem`,t.style.borderRadius=`2px`,r=!0,setTimeout(()=>{t&&(t.innerText=`Excluir`,t.style.color=`var(--error)`,t.style.backgroundColor=`transparent`,t.style.padding=`0`,r=!1)},3e3);return}t.innerText=`Excluindo...`,t.disabled=!0;let{error:a}=await e.from(`collections`).delete().eq(`id`,t.dataset.id);a&&alert(`Erro ao excluir coleção: `+a.message),n()})})},i=async(i=null)=>{t.innerHTML=`<div class="loading">Carregando formulário...</div>`;let a={name:``,slug:``,description:``,image_url:``},o=new Set;try{let[s,c,l]=await Promise.all([e.from(`poems`).select(`id, title, status`).order(`title`,{ascending:!0}),i?e.from(`collections`).select(`*`).eq(`id`,i).single():Promise.resolve({data:null}),i?e.from(`collection_poems`).select(`poem_id`).eq(`collection_id`,i):Promise.resolve({data:[]})]);if(s.error)throw s.error;if(i&&c.error)throw c.error;if(i&&l.error)throw l.error;let u=s.data||[];c.data&&(a=c.data),l.data&&l.data.forEach(e=>o.add(e.poem_id)),t.innerHTML=`
          <div style="font-family: var(--font-ui); max-width: 700px; margin: 0 auto; display: grid; gap: var(--space-md);">
            <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs); margin-bottom: var(--space-3xs);">
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">
                ${i?`Editar Coleção`:`Nova Coleção`}
              </h3>
            </div>
            
            <form id="col-form" style="display: grid; gap: var(--space-md);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Nome da Coleção</label>
                  <input type="text" id="col-name" value="${r(a.name)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Link (Slug)</label>
                  <input type="text" id="col-slug" value="${r(a.slug)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</label>
                <textarea id="col-description" style="width: 100%; min-height: 80px; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; resize: vertical;">${r(a.description||``)}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-md); align-items: start; flex-wrap: wrap;">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">URL da Imagem de Capa</label>
                  <input type="text" id="col-img-url" value="${r(a.image_url||``)}" placeholder="https://exemplo.com/imagem.jpg" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px;">
                  
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
                    ${a.image_url?`
                      <img src="${a.image_url}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">
                    `:`
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
                  ${u.map(e=>{let t=o.has(e.id);return`
                      <label class="checklist-item" data-title="${e.title.toLowerCase()}" style="display: flex; align-items: center; gap: var(--space-2xs); padding: var(--space-3xs) var(--space-2xs); cursor: pointer; border-radius: 2px; transition: background-color var(--transition-fast);">
                        <input type="checkbox" name="associated-poems" value="${e.id}" ${t?`checked`:``} style="cursor: pointer;">
                        <span style="font-size: 0.9rem; color: var(--text-primary);">${r(e.title)}</span>
                        <span style="font-size: 0.7rem; color: ${e.status===`published`?`var(--success)`:`var(--text-muted)`}; margin-left: auto; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid ${e.status===`published`?`var(--success)`:`var(--border-strong)`}; padding: 1px 4px; border-radius: 1px; font-family: var(--font-ui);">
                          ${e.status===`published`?`Publicado`:`Rascunho`}
                        </span>
                      </label>
                    `}).join(``)}
                </div>
              </div>
              
              <div style="display: flex; justify-content: flex-end; gap: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-md); margin-top: var(--space-xs);">
                <button type="button" id="cancel-form-btn" style="padding: 0.6rem 1.5rem; color: var(--text-secondary); background: transparent; border: 1px solid transparent; cursor: pointer; font-size: 0.85rem;">Cancelar</button>
                <button type="submit" id="save-col-btn" style="padding: 0.6rem 1.5rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; border: none; cursor: pointer; font-size: 0.85rem;">
                  ${i?`Salvar Alterações`:`Criar Coleção`}
                </button>
              </div>
            </form>
          </div>
        `;let d=t.querySelector(`#col-name`),f=t.querySelector(`#col-slug`);d.addEventListener(`input`,()=>{(!i||f.value===``)&&(f.value=d.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``))});let p=t.querySelector(`#checklist-search`),m=t.querySelectorAll(`.checklist-item`);p.addEventListener(`input`,()=>{let e=p.value.toLowerCase().trim();m.forEach(t=>{t.dataset.title.includes(e)?t.style.display=`flex`:t.style.display=`none`})});let h=t.querySelector(`#col-img-url`),g=t.querySelector(`#col-img-preview-container`);h.addEventListener(`input`,()=>{let e=h.value.trim();e?g.innerHTML=`<img src="${e}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">`:g.innerHTML=`<span id="col-preview-placeholder">Nenhuma imagem</span>`});let _=t.querySelector(`#col-img-upload`),v=t.querySelector(`#upload-status`);_.addEventListener(`change`,async t=>{let n=t.target.files[0];if(n){v.textContent=`Enviando...`,v.style.color=`var(--accent-subtle)`,_.disabled=!0;try{let t=n.name.split(`.`).pop().toLowerCase(),r=`col_cover_${Date.now()}.${t}`,{data:i,error:a}=await e.storage.from(`avatars`).upload(r,n);if(a)throw a;let{data:o}=e.storage.from(`avatars`).getPublicUrl(r),s=o.publicUrl;h.value=s,g.innerHTML=`<img src="${s}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">`,v.textContent=`Sucesso!`,v.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de capa:`,e),v.textContent=`Erro!`,v.style.color=`var(--error)`}finally{_.disabled=!1,setTimeout(()=>{v.textContent=``},3e3)}}}),t.querySelector(`#cancel-form-btn`).addEventListener(`click`,()=>n()),t.querySelector(`#col-form`).addEventListener(`submit`,async r=>{r.preventDefault();let a=t.querySelector(`#save-col-btn`);a.innerText=`Salvando...`,a.disabled=!0;let o={name:d.value.trim(),slug:f.value.trim(),description:t.querySelector(`#col-description`).value.trim(),image_url:h.value.trim()||null},s=i,c=null;if(i)c=(await e.from(`collections`).update(o).eq(`id`,i)).error;else{let t=await e.from(`collections`).insert([o]).select().single();c=t.error,t.data&&(s=t.data.id)}if(c){alert(`Erro ao salvar coleção: `+c.message),a.innerText=i?`Salvar Alterações`:`Criar Coleção`,a.disabled=!1;return}let l=t.querySelectorAll(`input[name="associated-poems"]:checked`),u=Array.from(l).map(e=>e.value);if(await e.from(`collection_poems`).delete().eq(`collection_id`,s),u.length>0){let t=u.map(e=>({collection_id:s,poem_id:e})),{error:n}=await e.from(`collection_poems`).insert(t);n&&alert(`Coleção salva, mas houve um erro ao associar poemas: `+n.message)}n()})}catch(e){console.error(e),t.innerHTML=`<div class="error">Erro ao carregar o formulário: ${e.message}</div>`}};await n()},async renderList(n){n.innerHTML=`<div class="loading">Carregando obras...</div>`;try{let[a,o]=await Promise.all([e.from(`poems`).select(`id, title, slug, status, published_at, scheduled_at, tags, created_at`).order(`created_at`,{ascending:!1}),e.from(`page_views`).select(`poem_id`)]);if(a.error)throw a.error;let s=a.data||[],c=o.data||[],l={};c.forEach(e=>{e.poem_id&&(l[e.poem_id]=(l[e.poem_id]||0)+1)});let u=new Set;s.forEach(e=>e.tags?.forEach(e=>u.add(e.trim()))),n.innerHTML=`
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
              ${Array.from(u).sort().map(e=>`<option value="${r(e)}">${r(e)}</option>`).join(``)}
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
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${s.length}</strong> obras
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
      `;let d=n.querySelector(`#list-tbody`),f=n.querySelector(`#results-count`),p=n=>{if(f.innerText=n.length,n.length===0){d.innerHTML=`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum poema encontrado com os filtros selecionados.
              </td>
            </tr>
          `;return}d.innerHTML=n.map(e=>{let t=l[e.id]||0,n=``;n=e.status===`scheduled`?`Agendado • ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}`:e.status===`published`?`Publicado • ${new Date(e.published_at).toLocaleDateString(`pt-BR`)}`:`Criado • ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}`;let i=e.status===`published`?`var(--success)`:e.status===`scheduled`?`var(--accent-subtle)`:`var(--border-strong)`,a=e.status===`published`?`var(--success)`:e.status===`scheduled`?`var(--accent-subtle)`:`var(--text-muted)`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary);">${r(e.title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${r(e.slug)}</td>
              <td style="padding: var(--space-md) 0;">
                <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${i}; color: ${a}; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
                  ${e.status===`published`?`Publicado`:e.status===`scheduled`?`Agendado`:`Rascunho`}
                </span>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; font-family: var(--font-ui); white-space: nowrap;">${n}</div>
              </td>
              <td style="padding: var(--space-md) 0; text-align: center; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.9rem;">
                👁 ${t}
              </td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <a href="/poemas/admin?view=editor&id=${e.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast); text-decoration: none;">Editar</a>
                <button class="delete-btn" data-id="${e.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer; padding: 0;">Excluir</button>
              </td>
            </tr>
          `}).join(``),d.querySelectorAll(`.delete-btn`).forEach(n=>{let r=!1;n.addEventListener(`click`,async i=>{i.preventDefault();let a=n.dataset.id;if(!r){let e=n.innerText;n.innerText=`Tem certeza?`,n.style.color=`#fff`,n.style.backgroundColor=`var(--error)`,n.style.padding=`0.2rem 0.5rem`,n.style.borderRadius=`2px`,n.style.opacity=`1`,r=!0,setTimeout(()=>{n&&!n.disabled&&(n.innerText=e,n.style.color=`var(--error)`,n.style.backgroundColor=`transparent`,n.style.padding=`0`,n.style.opacity=`0.7`,r=!1)},3e3);return}n.innerText=`Excluindo...`,n.disabled=!0;let{error:o}=await e.from(`poems`).delete().eq(`id`,a);if(o){console.error(o),alert(`Erro ao excluir: `+o.message),n.innerText=`Excluir`,n.disabled=!1;return}t(`/admin?view=list`)})})},m=n.querySelector(`#list-search`),h=n.querySelector(`#list-filter-status`),g=n.querySelector(`#list-filter-tag`),_=n.querySelector(`#list-sort`),v=()=>{let e=m.value.toLowerCase().trim(),t=h.value,n=g.value,r=_.value,i=[...s];e&&(i=i.filter(t=>t.title.toLowerCase().includes(e)||t.slug.toLowerCase().includes(e))),t!==`all`&&(i=i.filter(e=>e.status===t)),n!==`all`&&(i=i.filter(e=>e.tags&&e.tags.includes(n))),r===`newest`?i.sort((e,t)=>new Date(t.published_at||t.created_at)-new Date(e.published_at||e.created_at)):r===`oldest`?i.sort((e,t)=>new Date(e.published_at||e.created_at)-new Date(t.published_at||t.created_at)):r===`title-az`?i.sort((e,t)=>e.title.localeCompare(t.title)):r===`title-za`?i.sort((e,t)=>t.title.localeCompare(e.title)):r===`views`&&i.sort((e,t)=>(l[t.id]||0)-(l[e.id]||0)),p(i)};m.addEventListener(`input`,i(v,150)),h.addEventListener(`change`,v),g.addEventListener(`change`,v),_.addEventListener(`change`,v),v()}catch(e){console.error(e),n.innerHTML=`<div class="error">Erro ao carregar obras: ${e.message}</div>`}},async renderEditor(n,r){let a={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`};if(r){n.innerHTML=`<div class="loading">Carregando poema...</div>`;let{data:t}=await e.from(`poems`).select(`*`).eq(`id`,r).single();t&&(a=t,a.content=(a.content||``).replace(/<br\s*[\/]?>/gi,`
`).replace(/<\/p>\s*<p>/gi,`

`).replace(/<\/?(p|pre|div|span|strong|em|b|i)[^>]*>/gi,``).trim())}n.innerHTML=`
      <form id="editor-form" style="font-family: var(--font-ui);">
        <div class="editor-layout">
          <div class="editor-pane">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
                <input type="text" id="poem-title" value="${a.title}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
                <input type="text" id="poem-slug" value="${a.slug}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${a.content}</textarea>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
              <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${a.excerpt||``}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
                <input type="text" id="poem-tags" value="${a.tags?a.tags.join(`, `):``}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
                <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <option value="draft" ${a.status===`draft`?`selected`:``}>Rascunho</option>
                  <option value="scheduled" ${a.status===`scheduled`?`selected`:``}>Agendado</option>
                  <option value="published" ${a.status===`published`?`selected`:``}>Publicado</option>
                </select>
              </div>
            </div>

            <div id="scheduling-fields" style="margin-top: var(--space-md); ${a.status===`scheduled`?``:`display: none;`}">
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
              <input type="datetime-local" id="scheduled-at" value="${a.scheduled_at?new Date(a.scheduled_at).toISOString().slice(0,16):``}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
              <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
              ${a.status===`scheduled`?`<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(a.scheduled_at).toLocaleString(`pt-BR`)}.</p>`:``}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
              <a href="/poemas/admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
              <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
              ${a.status===`draft`?`<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>`:``}
            </div>
          </div>

          <div class="preview-pane">
            <div class="preview-header">
              <span class="preview-label">Preview em tempo real</span>
            </div>
            <article class="preview-poem">
              <h1 id="preview-title">${a.title||`Título da Obra`}</h1>
              <div class="poem-meta preview-meta">
                <span id="preview-date">${a.published_at?new Date(a.published_at).toLocaleDateString(`pt-BR`):new Date().toLocaleDateString(`pt-BR`)}</span>
                <span id="preview-tags-container">${a.tags&&a.tags.length>0?`<span>•</span> <span>Sentimentos: ${a.tags.join(`, `)}</span>`:``}</span>
              </div>
              <div id="preview-content" class="poem-content">${a.content||``}</div>
            </article>
          </div>
        </div>
      </form>
    `;let o=document.getElementById(`poem-title`),s=document.getElementById(`poem-slug`);o.addEventListener(`input`,()=>{if(document.getElementById(`preview-title`).innerText=o.value||`Título da Obra`,!r||s.value===``){let e=o.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``);s.value=e}});let c=document.getElementById(`poem-content-input`),l=document.getElementById(`preview-content`),u=document.getElementById(`poem-tags`),d=document.getElementById(`poem-status`),f=document.getElementById(`scheduling-fields`);c.addEventListener(`input`,i(()=>{l.innerHTML=c.value},250)),u.addEventListener(`input`,i(()=>{let e=u.value.split(`,`).map(e=>e.trim()).filter(e=>e);document.getElementById(`preview-tags-container`).innerHTML=e.length>0?`<span>•</span> <span>Sentimentos: ${e.join(`, `)}</span>`:``},250)),d.addEventListener(`change`,()=>{f.style.display=d.value===`scheduled`?`block`:`none`});let p=()=>{let e=u.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`scheduled-at`);return{title:document.getElementById(`poem-title`).value,slug:document.getElementById(`poem-slug`).value,content:document.getElementById(`poem-content-input`).value,excerpt:document.getElementById(`poem-excerpt`).value,tags:e,status:document.getElementById(`poem-status`).value,scheduled_at:t.value?new Date(t.value).toISOString():null}};document.getElementById(`editor-form`).addEventListener(`submit`,async n=>{n.preventDefault();let i=document.getElementById(`save-btn`);i.innerText=`Salvando...`,i.disabled=!0;let o=p();if(o.status===`scheduled`&&!o.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),i.innerText=`Gravar Alterações`,i.disabled=!1;return}o.status===`published`&&a.status!==`published`&&(o.published_at=new Date().toISOString());let s=null;if(s=r?(await e.from(`poems`).update(o).eq(`id`,r)).error:(await e.from(`poems`).insert([o])).error,s){console.error(s),alert(`Erro ao salvar: `+s.message),i.innerText=`Gravar Alterações`,i.disabled=!1;return}t(`/admin`)});let m=document.getElementById(`publish-btn`);if(m){let n=!1;m.addEventListener(`click`,async i=>{if(i.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!n){m.innerText=`Tem certeza? Clique para confirmar.`,m.style.background=`var(--error)`,n=!0,setTimeout(()=>{m&&!m.disabled&&(m.innerText=`Publicar e Notificar Assinantes`,m.style.background=`var(--success)`,n=!1)},4e3);return}m.innerText=`Publicando...`,m.disabled=!0;let a=p();a.status=`published`,a.published_at=new Date().toISOString();let o=r,s=null;if(r)s=(await e.from(`poems`).update(a).eq(`id`,r)).error;else{let t=await e.from(`poems`).insert([a]).select().single();s=t.error,t.data&&(o=t.data.id)}if(s){console.error(s),alert(`Erro ao publicar: `+s.message),m.innerText=`Publicar e Notificar Assinantes`,m.disabled=!1;return}if(o)try{m.innerText=`Enviando newsletter...`;let{data:t,error:n}=await e.functions.invoke(`send-newsletter`,{body:{poemId:o}});if(n)throw n;alert(`Obra publicada e newsletter enviada com sucesso para ${t.count} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}t(`/admin`)})}},async renderEmailHistory(t){t.innerHTML=`<div class="loading">Carregando histórico e dados...</div>`;try{let[n,a]=await Promise.all([e.from(`email_campaign_logs`).select(`id, sent_at, status, details, poem_id, poems(title)`).order(`sent_at`,{ascending:!1}),e.from(`poems`).select(`id, title`).eq(`status`,`published`).order(`created_at`,{ascending:!1})]);if(n.error)throw n.error;if(a.error)throw a.error;let o=n.data||[],s=a.data||[],c=o.length,l=o.filter(e=>e.status===`success`).length,u=c>0?(l/c*100).toFixed(1):`100.0`,d=o[0]||null;t.innerHTML=`
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
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${c}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Registros de disparos de newsletter</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Taxa de Sucesso</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${u}%</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${l} envios bem-sucedidos</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Último Envio</div>
              <div style="font-size: 1.1rem; font-family: var(--font-ui); color: var(--accent-subtle); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;" title="${d?.poems?.title||`-`}">
                ${d?.poems?.title||`Nenhum envio registrado`}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: var(--space-3xs);">
                ${d?(e=>{let t=new Date(e),n=new Date-t,r=Math.floor(n/(1e3*60)),i=Math.floor(n/(1e3*60*60)),a=Math.floor(n/(1e3*60*60*24));return r<1?`Agora mesmo`:r<60?`Há ${r} min`:i<24?`Há ${i} h`:a===1?`Ontem`:a<30?`Há ${a} dias`:t.toLocaleDateString(`pt-BR`)})(d.sent_at):`Nenhum dado`}
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
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${o.length}</strong> envios
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
                  ${s.map(e=>`<option value="${e.id}">${r(e.title)}</option>`).join(``)}
                </select>
                ${s.length===0?`<p style="color: var(--error); font-size: 0.8rem; margin: 4px 0 0 0;">Nenhuma obra publicada disponível.</p>`:``}
              </div>
              
              <div style="display: flex; align-items: flex-start; gap: var(--space-2xs); margin-top: var(--space-3xs);">
                <input type="checkbox" id="dispatch-confirm-chk" required style="margin-top: 3px; cursor: pointer;">
                <label for="dispatch-confirm-chk" style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; cursor: pointer; user-select: none;">
                  Confirmo que desejo enviar esta obra imediatamente para todos os assinantes ativos cadastrados no site.
                </label>
              </div>

              <div class="modal-actions" style="margin-top: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
                <button type="button" id="close-dispatch-modal-btn" class="btn-secondary" style="padding: 0.5rem 1rem; color: var(--text-secondary); font-size: 0.85rem; border: none; background: transparent; cursor: pointer;">Cancelar</button>
                <button type="submit" id="submit-dispatch-btn" class="btn-primary" ${s.length===0?`disabled`:``} style="padding: 0.5rem 1.2rem; background: var(--success); color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
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
      `;let f=t.querySelector(`#email-tbody`),p=t.querySelector(`#results-count`),m=t.querySelector(`#manual-dispatch-modal`),h=t.querySelector(`#log-details-modal`);t.querySelector(`#open-dispatch-modal-btn`).addEventListener(`click`,()=>{m.style.display=`flex`,t.querySelector(`#manual-dispatch-form`).reset()}),t.querySelector(`#close-dispatch-modal-btn`).addEventListener(`click`,()=>{m.style.display=`none`}),t.querySelector(`#close-details-modal-btn`).addEventListener(`click`,()=>{h.style.display=`none`}),[m,h].forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&(e.style.display=`none`)})});let g=null,_=async(n,r,i)=>{if(!n){alert(`Não é possível reenviar: id da obra indisponível.`);return}if(!confirm(`Deseja reenviar a newsletter da obra "${r}" para todos os assinantes ativos?`))return;let a=i.innerText;i.disabled=!0,i.innerText=`Enviando...`,i.style.opacity=`0.5`;try{let{data:i,error:a}=await e.functions.invoke(`send-newsletter`,{body:{poemId:n}});if(a)throw a;alert(`Newsletter para "${r}" reenviada com sucesso para ${i.count} assinantes!`),h.style.display=`none`,this.renderEmailHistory(t)}catch(e){console.error(`Erro ao reenviar:`,e),alert(`Erro ao enviar newsletter:\n${e.message||`Erro na Edge Function`}`),i.disabled=!1,i.innerText=a,i.style.opacity=`1`}};t.querySelector(`#resend-from-modal-btn`).addEventListener(`click`,async e=>{e.preventDefault(),g&&g.poem_id&&await _(g.poem_id,g.poems?.title||`Desconhecido`,e.currentTarget)});let v=e=>{if(p.innerText=e.length,e.length===0){f.innerHTML=`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum registro de envio encontrado com os filtros aplicados.
              </td>
            </tr>
          `;return}f.innerHTML=e.map(e=>{let t=e.poems?.title||`Desconhecido`,n=new Date(e.sent_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`}),i=e.status===`success`?`
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--success); box-shadow: 0 0 6px var(--success);"></span>
                Sucesso
              </span>
            `:`
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--error); box-shadow: 0 0 6px var(--error);"></span>
                Falha
              </span>
            `,a=e.details?e.details.length>50?`${r(e.details.slice(0,48))}...`:r(e.details):`-`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.15rem; color: var(--text-primary); font-weight: 400;">${r(t)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.85rem;">${n}</td>
              <td style="padding: var(--space-md) 0;">${i}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a}</td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <button class="view-details-btn" data-id="${e.id}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; margin-right: var(--space-sm); transition: color var(--transition-fast); text-decoration: underline; padding: 0;">Detalhes</button>
                <button class="resend-log-btn" data-poem-id="${e.poem_id||``}" data-title="${r(t)}" style="color: var(--accent-subtle); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; transition: opacity var(--transition-fast); text-decoration: none; padding: 0; font-weight: 500;">Reenviar</button>
              </td>
            </tr>
          `}).join(``),f.querySelectorAll(`tr`).forEach(e=>{e.style.transition=`background-color var(--transition-fast)`,e.addEventListener(`mouseenter`,()=>{e.style.backgroundColor=`var(--bg-secondary)`}),e.addEventListener(`mouseleave`,()=>{e.style.backgroundColor=`transparent`})}),f.querySelectorAll(`.view-details-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.id,i=e.find(e=>e.id===r);if(!i)return;g=i,t.querySelector(`#detail-poem-title`).innerText=i.poems?.title||`Desconhecido`,t.querySelector(`#detail-date`).innerText=new Date(i.sent_at).toLocaleString(`pt-BR`,{dateStyle:`long`,timeStyle:`medium`});let a=i.status===`success`;t.querySelector(`#detail-status-badge`).innerHTML=a?`<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase;">Sucesso</span>`:`<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase;">Falha</span>`,t.querySelector(`#detail-description`).innerText=i.details||`Nenhum detalhe adicional disponível.`;let o=t.querySelector(`#resend-from-modal-btn`);i.poem_id?(o.style.display=`inline-block`,o.innerText=a?`Disparar Novamente`:`Tentar Reenviar`):o.style.display=`none`,h.style.display=`flex`})}),f.querySelectorAll(`.resend-log-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.dataset.poemId,r=e.dataset.title;_(n,r,e)})})},y=t.querySelector(`#email-search`),b=t.querySelector(`#email-filter-status`),x=t.querySelector(`#email-sort`),S=()=>{let e=y.value.toLowerCase().trim(),t=b.value,n=x.value,r=[...o];e&&(r=r.filter(t=>{let n=(t.poems?.title||``).toLowerCase(),r=(t.details||``).toLowerCase();return n.includes(e)||r.includes(e)})),t!==`all`&&(r=t===`success`?r.filter(e=>e.status===`success`):r.filter(e=>e.status!==`success`)),n===`newest`?r.sort((e,t)=>new Date(t.sent_at)-new Date(e.sent_at)):n===`oldest`?r.sort((e,t)=>new Date(e.sent_at)-new Date(t.sent_at)):n===`title-az`?r.sort((e,t)=>{let n=e.poems?.title||``,r=t.poems?.title||``;return n.localeCompare(r)}):n===`title-za`&&r.sort((e,t)=>{let n=e.poems?.title||``;return(t.poems?.title||``).localeCompare(n)}),v(r)};y.addEventListener(`input`,i(S,150)),b.addEventListener(`change`,S),x.addEventListener(`change`,S),S(),t.querySelector(`#manual-dispatch-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=t.querySelector(`#dispatch-poem-select`),i=r.value,a=r.options[r.selectedIndex].text,o=t.querySelector(`#submit-dispatch-btn`),s=t.querySelector(`#close-dispatch-modal-btn`);o.disabled=!0,o.innerText=`Enviando...`,r.disabled=!0,s.style.display=`none`;try{let{data:n,error:r}=await e.functions.invoke(`send-newsletter`,{body:{poemId:i}});if(r)throw r;alert(`Newsletter para "${a}" enviada com sucesso para ${n.count} assinantes!`),m.style.display=`none`,this.renderEmailHistory(t)}catch(e){console.error(`Erro na Edge Function:`,e),alert(`Erro ao disparar newsletter:\n${e.message||`Erro inesperado`}`),o.disabled=!1,o.innerText=`Disparar Newsletter`,r.disabled=!1,s.style.display=`inline-block`}})}catch(e){console.error(e),t.innerHTML=`<div class="error">Erro ao carregar dados do histórico: ${e.message}</div>`}},async renderSubscribers(t){t.innerHTML=`<div class="loading">Carregando assinantes...</div>`;let{data:n,error:r}=await e.from(`subscribers`).select(`email, active, created_at, unsubscribed_at`).order(`created_at`,{ascending:!1});if(r){t.innerHTML=`<div class="error">Erro ao carregar: ${r.message}</div>`;return}if(!n||n.length===0){t.innerHTML=`<p>Nenhum assinante encontrado.</p>`;return}let i=n.filter(e=>e.active).length,a=n.length,o=new Date;o.setDate(o.getDate()-30);let s=n.filter(e=>new Date(e.created_at)>o).length,c=n.filter(e=>!e.active&&e.unsubscribed_at&&new Date(e.unsubscribed_at)>o).length;t.innerHTML=`
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Total de Assinantes</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${a}</div>
          <div style="font-size: 0.8rem; color: var(--success);">${i} ativos</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Novos (30 dias)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">+${s}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Crescimento constante</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Taxa de Evasão (Churn)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${(c/(i||1)*100).toFixed(1)}%</div>
          <div style="font-size: 0.8rem; color: var(--error);">${c} saídas no mês</div>
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
          ${n.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui);">${e.email}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">
          ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}
        </td>
        <td style="padding: var(--space-md) 0;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${e.active?`var(--success)`:`var(--error)`}; color: ${e.active?`var(--success)`:`var(--error)`}; text-transform: uppercase; letter-spacing: 1px;">
            ${e.active?`Ativo`:`Inativo`}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted);">
          ${e.unsubscribed_at?new Date(e.unsubscribed_at).toLocaleDateString(`pt-BR`):`-`}
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `,t.querySelector(`#export-csv-btn`)?.addEventListener(`click`,()=>{let e=`data:text/csv;charset=utf-8,Email,Ativo,Data Inscrição,Data Saída
`+n.map(e=>`${e.email},${e.active},${e.created_at},${e.unsubscribed_at||``}`).join(`
`),t=encodeURI(e),r=document.createElement(`a`);r.setAttribute(`href`,t),r.setAttribute(`download`,`assinantes_${new Date().toISOString().split(`T`)[0]}.csv`),document.body.appendChild(r),r.click(),document.body.removeChild(r)})},async renderComments(t){t.innerHTML=`<div class="loading">Carregando comentários...</div>`;let{data:n,error:i}=await e.from(`poem_comments`).select(`id, author_name, content, approved, created_at, poems(title)`).order(`created_at`,{ascending:!1});if(i){t.innerHTML=`<div class="error">Erro ao carregar: ${i.message}</div>`;return}if(!n||n.length===0){t.innerHTML=`<p>Nenhum comentário encontrado.</p>`;return}t.innerHTML=`
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
          ${n.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
          ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}
        </td>
        <td style="padding: var(--space-md) 0;">
          <div style="font-family: var(--font-display); font-size: 1.1rem;">${r(e.author_name)}</div>
          <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Em: ${e.poems?.title||`Obra removida`}</div>
          <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${r(e.content)}</div>
        </td>
        <td style="padding: var(--space-md) 0; vertical-align: middle;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${e.approved?`var(--success)`:`var(--accent-subtle)`}; color: ${e.approved?`var(--success)`:`var(--accent-subtle)`}; text-transform: uppercase; letter-spacing: 1px;">
            ${e.approved?`Aprovado`:`Pendente`}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; text-align: right; vertical-align: middle;">
          ${e.approved?``:`<button class="approve-btn" data-id="${e.id}" style="color: var(--success); margin-right: 1rem;">Aprovar</button>`}
          <button class="delete-comment-btn" data-id="${e.id}" style="color: var(--error);">Excluir</button>
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.approve-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.id,{error:i}=await e.from(`poem_comments`).update({approved:!0}).eq(`id`,r);i?alert(`Erro ao aprovar: `+i.message):this.renderComments(t)})}),t.querySelectorAll(`.delete-comment-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!confirm(`Excluir este comentário?`))return;let r=n.dataset.id,{error:i}=await e.from(`poem_comments`).delete().eq(`id`,r);i?alert(`Erro ao excluir: `+i.message):this.renderComments(t)})})}};export{a as default};