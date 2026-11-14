import{a as e,t}from"./html-DUzinkfe.js";import{s as n}from"./data-BxfxRve7.js";async function r(r){r.innerHTML=`<div class="loading">Carregando painel geral...</div>`;try{let i=[],a=0,o=0,s=[],c=[],[l,u,d,f,p]=await Promise.all([n(`poems`),n(`poem_comments`,{where:[[`approved`,`==`,!1]]}),n(`subscribers`,{orderBy:[`created_at`,`desc`],limit:5}),n(`page_views`,{where:[[`created_at`,`>=`,new Date(Date.now()-6048e5).toISOString()]]}),Promise.resolve(n(`error_logs`,{where:[[`status`,`==`,`open`]]})).catch(()=>({data:[]}))]);if(l.error)throw l.error;if(u.error)throw u.error;if(d.error)throw d.error;if(f.error)throw f.error;i=l.data||[],a=u.data?.length||0,o=p?.data?.length||0,s=d.data||[],c=f.data||[];let m=i.length,h=i.filter(e=>e.status===`published`).length,g=i.filter(e=>e.status===`draft`).length,_=i.filter(e=>e.status===`scheduled`).length,v={};c.forEach(e=>{let t=new Date(e.created_at).toISOString().slice(0,10);v[t]=(v[t]||0)+1});let y=[],b=0;for(let e=6;e>=0;e--){let t=new Date;t.setDate(t.getDate()-e);let n=t.toISOString().slice(0,10),r=v[n]||0;b+=r,y.push({label:n,count:r})}let x=i.filter(e=>e.status===`scheduled`&&e.scheduled_at).sort((e,t)=>new Date(e.scheduled_at)-new Date(t.scheduled_at)).slice(0,3);r.innerHTML=e(`
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
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${m}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">poemas</span>
              </div>
            </div>
            
            <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Status das Obras</div>
              <div style="display: flex; gap: var(--space-md); font-size: 0.85rem; align-items: baseline; margin-top: auto; flex-wrap: wrap;">
                <div>
                  <span style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${h}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Pub.</span>
                </div>
                <div>
                  <span style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">${g}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Rasc.</span>
                </div>
                <div>
                  <span style="color: var(--accent-subtle); font-weight: 600; font-size: 1.1rem;">${_}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Agend.</span>
                </div>
              </div>
            </div>
            
            <a href="/admin?view=comments" data-link style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Comentários Pendentes</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: ${a>0?`var(--error)`:`var(--text-muted)`}; font-weight: 400; line-height: 1;">${a}</span>
                ${a>0?`<span style="background: rgba(204, 74, 74, 0.15); color: var(--error); padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Revisar</span>`:`<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">✔ Tudo limpo</span>`}
              </div>
            </a>

            <a href="/admin?view=errors" id="open-errors-kpi-card" data-link style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Erros em Aberto</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <span id="dashboard-open-errors-count" style="font-size: 2.2rem; font-family: var(--font-display); color: ${o>0?`var(--error)`:`var(--text-muted)`}; font-weight: 400; line-height: 1;">${o}</span>
                ${o>0?`<span style="background: rgba(204, 74, 74, 0.15); color: var(--error); padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Analisar</span>`:`<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">✔ Estável</span>`}
              </div>
            </a>
            
            <a href="/admin?view=analytics" id="visits-kpi-card" data-link style="position: relative; background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 4px;">Visitas (7 dias)</div>
                  <div style="font-size: 1.8rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${b}</div>
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
            
            ${i.map(e=>`
              <circle cx="${e.x}" cy="${e.y}" r="2" fill="var(--accent-subtle)" opacity="0.6" />
            `).join(``)}
          </svg>
        `})(y)}
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
                
                ${s.length===0?`
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
                      ${s.map(e=>`
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: var(--space-xs) var(--space-xs) var(--space-xs) 0; color: var(--text-primary); font-family: var(--font-ui); font-size: 0.8rem; word-break: break-all;">${t(e.email)}</td>
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
                  <a href="/admin?view=list" data-link style="font-size: 0.75rem; color: var(--accent-subtle); text-decoration: none;">Ver obras</a>
                </div>
                
                ${x.length===0?`
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhuma publicação agendada.</p>
                `:`
                  <div style="display: grid; gap: var(--space-xs);">
                    ${x.map(e=>{let n=new Date(e.scheduled_at).getTime(),r=!isNaN(n)&&n<Date.now()-36e5,i=r?`var(--error)`:`var(--accent-subtle)`,a=r?`var(--error)`:`var(--accent-subtle)`;return`
                      <div style="padding: var(--space-xs); border: 1px solid var(--border-subtle); border-radius: 2px; background: rgba(255, 255, 255, 0.01); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); font-weight: 400;">${t(e.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 2px;">Slug: ${t(e.slug)}</div>
                        </div>
                        <div style="text-align: right; display: flex; align-items: center; gap: 4px;">
                          ${r?`
                            <span class="badge-delayed" style="font-size: 0.7rem; color: var(--error); border: 1px solid var(--error); padding: 0.15rem 0.4rem; border-radius: 2px; text-transform: uppercase; font-family: var(--font-ui); white-space: nowrap; font-weight: 600;">
                              Atrasado
                            </span>
                          `:``}
                          <span style="font-size: 0.7rem; color: ${a}; border: 1px solid ${i}; padding: 0.15rem 0.4rem; border-radius: 2px; text-transform: uppercase; font-family: var(--font-ui); white-space: nowrap;">
                            ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}
                          </span>
                        </div>
                      </div>
                      `}).join(``)}
                  </div>
                `}
              </div>
            </div>
            
          </div>
          
        </div>
      `);let S=r.querySelector(`#visits-kpi-card`);if(S){let n=S.querySelector(`#sparkline-svg`),r=S.querySelector(`#sparkline-tracker`),i=S.querySelector(`#sparkline-hover-dot`),a=S.querySelector(`#sparkline-tooltip`),o=o=>{let c=n.getBoundingClientRect(),l=o.clientX-c.left;if(l<-10||l>c.width+10){s();return}let u=Math.min(6,Math.max(0,Math.round(l/c.width*6))),d=y[u];if(!d)return;let f=Math.max(...y.map(e=>e.count),1),p=u/6*160,m=38-d.count/f*36;r.setAttribute(`x1`,p),r.setAttribute(`x2`,p),r.style.display=`block`,i.setAttribute(`cx`,p),i.setAttribute(`cy`,m),i.style.display=`block`;let h=new Date(d.label+`T00:00:00`),g=h.toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`2-digit`}),_=h.toLocaleDateString(`pt-BR`,{weekday:`short`}).replace(`.`,``);a.style.display=`block`,a.innerHTML=e(`
            <div style="font-weight: 500; font-size: 0.65rem; color: var(--text-secondary); text-transform: capitalize;">${t(_)}, ${t(g)}</div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${d.count} ${d.count===1?`visita`:`visitas`}</div>
          `);let v=S.getBoundingClientRect(),b=o.clientX-v.left,x=o.clientY-v.top-55;a.style.left=`${Math.min(v.width-95,Math.max(10,b-45))}px`,a.style.top=`${x}px`,a.getBoundingClientRect(),a.style.opacity=`1`,a.style.transform=`translateY(0)`},s=()=>{r&&(r.style.display=`none`),i&&(i.style.display=`none`),a&&(a.style.opacity=`0`,a.style.transform=`translateY(4px)`,setTimeout(()=>{a.style.opacity===`0`&&(a.style.display=`none`)},150))};S.addEventListener(`mousemove`,o),S.addEventListener(`mouseleave`,s)}}catch(n){console.error(n),r.innerHTML=e(`<div class="error">Erro ao carregar o dashboard: ${t(n.message)}</div>`)}}export{r as renderDashboard};