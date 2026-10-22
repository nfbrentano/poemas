import{b as e}from"./index-DadoRXS-.js";import{s as t}from"./data-KIeY_Y8W.js";async function n(n){n.innerHTML=`<div class="loading">Carregando painel geral...</div>`;try{let r=[],i=0,a=[],o=[],s=new URLSearchParams(window.location.search).get(`bypass_auth`)===`true`;try{let[e,n,c,l]=await Promise.all([t(`poems`),t(`poem_comments`,{where:[[`approved`,`==`,!1]]}),t(`subscribers`,{orderBy:[`created_at`,`desc`],limit:5}),t(`page_views`,{where:[[`created_at`,`>=`,new Date(Date.now()-6048e5).toISOString()]]})]);if(e.error||n.error||c.error||l.error){if(s)throw Error(`Firestore query error, fallback to mock data`);if(e.error)throw e.error;if(n.error)throw n.error;if(c.error)throw c.error;if(l.error)throw l.error}r=e.data||[],i=n.data?.length||0,a=c.data||[],o=l.data||[]}catch(e){if(s){r=[{id:`1`,title:`Poema das Flores`,slug:`poema-das-flores`,status:`published`,created_at:new Date().toISOString()},{id:`2`,title:`Canto Noturno`,slug:`canto-noturno`,status:`draft`,created_at:new Date().toISOString()},{id:`3`,title:`Silêncio da Alma`,slug:`silencio-da-alma`,status:`scheduled`,scheduled_at:new Date(Date.now()+864e5).toISOString(),created_at:new Date().toISOString()}],i=3,a=[{email:`leitor1@exemplo.com`,created_at:new Date(Date.now()-1e5).toISOString(),active:!0},{email:`leitor2@exemplo.com`,created_at:new Date(Date.now()-5e5).toISOString(),active:!1},{email:`leitor3@exemplo.com`,created_at:new Date(Date.now()-9e5).toISOString(),active:!0}],o=[];for(let e=0;e<7;e++){let t=[12,18,5,23,14,30,45][e],n=new Date;n.setDate(n.getDate()-(6-e));for(let e=0;e<t;e++)o.push({created_at:n.toISOString()})}}else throw e}let c=r.length,l=r.filter(e=>e.status===`published`).length,u=r.filter(e=>e.status===`draft`).length,d=r.filter(e=>e.status===`scheduled`).length,f={};o.forEach(e=>{let t=new Date(e.created_at).toISOString().slice(0,10);f[t]=(f[t]||0)+1});let p=[],m=0;for(let e=6;e>=0;e--){let t=new Date;t.setDate(t.getDate()-e);let n=t.toISOString().slice(0,10),r=f[n]||0;m+=r,p.push({label:n,count:r})}let h=r.filter(e=>e.status===`scheduled`&&e.scheduled_at).sort((e,t)=>new Date(e.scheduled_at)-new Date(t.scheduled_at)).slice(0,3);n.innerHTML=`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-lg); width: 100%;">
          
          <!-- Welcome / Overview row -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Bem-vindo ao Painel Admin</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Uma visão geral do seu acervo literário e engajamento.</p>
            </div>
            
            <!-- Quick Actions -->
            <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">
              <a href="/admin?view=editor" data-link style="padding: 0.5rem 1rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; text-decoration: none; transition: opacity var(--transition-fast);" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">+ Nova Obra</a>
              <a href="/admin?view=collections" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Coleções</a>
              <a href="/admin?view=comments" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Comentários</a>
              <a href="/admin?view=analytics" data-link style="padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; font-size: 0.85rem; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">Estatísticas</a>
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
            
            <a href="/admin?view=comments" data-link style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Comentários Pendentes</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: ${i>0?`var(--error)`:`var(--text-muted)`}; font-weight: 400; line-height: 1;">${i}</span>
                ${i>0?`<span style="background: rgba(204, 74, 74, 0.15); color: var(--error); padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Revisar</span>`:`<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">✔ Tudo limpo</span>`}
              </div>
            </a>
            
            <a href="/admin?view=analytics" id="visits-kpi-card" data-link style="position: relative; background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
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
                  <a href="/admin?view=subscribers" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver todos</a>
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
                      ${a.map(t=>`
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: var(--space-xs) var(--space-xs) var(--space-xs) 0; color: var(--text-primary); font-family: var(--font-ui); font-size: 0.8rem; word-break: break-all;">${e(t.email)}</td>
                          <td style="padding: var(--space-xs) var(--space-xs); color: var(--text-muted); font-size: 0.8rem; white-space: nowrap;">${new Date(t.created_at).toLocaleDateString(`pt-BR`)}</td>
                          <td style="padding: var(--space-xs) 0 var(--space-xs) var(--space-xs); text-align: right;">
                            <span style="font-size: 0.7rem; color: ${t.active?`var(--success)`:`var(--error)`}; border: 1px solid ${t.active?`var(--success)`:`var(--error)`}; padding: 0.1rem 0.4rem; border-radius: 2px; text-transform: uppercase; letter-spacing: 0.5px;">
                              ${t.active?`Ativo`:`Inativo`}
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
                  <a href="/admin?view=list" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver obras</a>
                </div>
                
                ${h.length===0?`
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhuma publicação agendada.</p>
                `:`
                  <div style="display: grid; gap: var(--space-xs);">
                    ${h.map(t=>`
                      <div style="padding: var(--space-xs); border: 1px solid var(--border-subtle); border-radius: 2px; background: rgba(255, 255, 255, 0.01); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); font-weight: 400;">${e(t.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 2px;">Slug: ${e(t.slug)}</div>
                        </div>
                        <div style="text-align: right;">
                          <span style="font-size: 0.7rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.15rem 0.4rem; border-radius: 2px; text-transform: uppercase; font-family: var(--font-ui); white-space: nowrap;">
                            ${new Date(t.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}
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
      `;let g=n.querySelector(`#visits-kpi-card`);if(g){let e=g.querySelector(`#sparkline-svg`),t=g.querySelector(`#sparkline-tracker`),n=g.querySelector(`#sparkline-hover-dot`),r=g.querySelector(`#sparkline-tooltip`),i=i=>{let o=e.getBoundingClientRect(),s=i.clientX-o.left;if(s<-10||s>o.width+10){a();return}let c=Math.min(6,Math.max(0,Math.round(s/o.width*6))),l=p[c];if(!l)return;let u=Math.max(...p.map(e=>e.count),1),d=c/6*160,f=38-l.count/u*36;t.setAttribute(`x1`,d),t.setAttribute(`x2`,d),t.style.display=`block`,n.setAttribute(`cx`,d),n.setAttribute(`cy`,f),n.style.display=`block`;let m=new Date(l.label+`T00:00:00`),h=m.toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`2-digit`}),_=m.toLocaleDateString(`pt-BR`,{weekday:`short`}).replace(`.`,``);r.style.display=`block`,r.innerHTML=`
            <div style="font-weight: 500; font-size: 0.65rem; color: var(--text-secondary); text-transform: capitalize;">${_}, ${h}</div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${l.count} ${l.count===1?`visita`:`visitas`}</div>
          `;let v=g.getBoundingClientRect(),y=i.clientX-v.left,b=i.clientY-v.top-55;r.style.left=`${Math.min(v.width-95,Math.max(10,y-45))}px`,r.style.top=`${b}px`,r.getBoundingClientRect(),r.style.opacity=`1`,r.style.transform=`translateY(0)`},a=()=>{t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.opacity=`0`,r.style.transform=`translateY(4px)`,setTimeout(()=>{r.style.opacity===`0`&&(r.style.display=`none`)},150))};g.addEventListener(`mousemove`,i),g.addEventListener(`mouseleave`,a)}}catch(e){console.error(e),n.innerHTML=`<div class="error">Erro ao carregar o dashboard: ${e.message}</div>`}}export{n as renderDashboard};