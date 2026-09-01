const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/analytics-D065oUvg.js","assets/index.esm-C77q4Vsq.js","assets/firebase-DbnQPwBn.js","assets/index-5Z0EvPl5.js","assets/index-D3qnpX2x.css"])))=>i.map(i=>d[i]);
import{a as e,c as t,d as n,f as r,l as i,n as a,o,p as s,r as c,s as l,u}from"./index.esm-C77q4Vsq.js";import{r as d,t as f}from"./index-5Z0EvPl5.js";import{httpsCallable as p}from"./index.esm-tXuATA5w.js";import{ref as m,uploadBytes as h}from"./index.esm-eEzmRnvE.js";import{db as g,getFirebaseAuth as _,getFirebaseFunctions as v,getFirebaseStorage as y}from"./firebase-DbnQPwBn.js";import{n as b,r as x,t as S}from"./html-Ca31mHym.js";var C={auth:{getSession:async()=>({data:{session:(await _()).currentUser}}),signOut:async()=>{await(await _()).signOut()}},from:d=>({select:i=>{let a=r(g,d),s=[],c=!1,u={eq:(e,t)=>(s.push(n(e,`==`,t)),u),gte:(e,t)=>(s.push(n(e,`>=`,t)),u),order:(e,t)=>(s.push(l(e,t?.ascending?`asc`:`desc`)),u),limit:e=>(s.push(o(e)),u),single:()=>(c=!0,u),then:async(n,r)=>{try{let r=t(a,...s),i=(await e(r)).docs.map(e=>({id:e.id,...e.data()}));if(c)return i.length===0?n({data:null,error:null}):n({data:i[0],error:null});n({data:i,error:null})}catch(e){n({data:null,error:e})}}};return u},insert:async e=>{try{let t=Array.isArray(e)?e:[e],n=[];for(let e of t){let t;e.id?(t=s(g,d,e.id),await i(t,e)):t=await a(r(g,d),e),n.push({id:t.id,...e})}let o=Array.isArray(e)?n:n[0];return{data:o,error:null,select:()=>({single:async()=>({data:o,error:null})})}}catch(e){return{error:e}}},update:e=>({eq:async(t,n)=>{if(t===`id`)try{return await u(s(g,d,n),e),{error:null}}catch(e){return{error:e}}return{error:Error(`Adapter only supports update by id`)}}}),delete:()=>({eq:async(i,a)=>{if(i===`id`)try{return await c(s(g,d,a)),{error:null}}catch(e){return{error:e}}if(d===`collection_poems`&&i===`collection_id`)try{let i=t(r(g,`collection_poems`),n(`collection_id`,`==`,a)),o=await e(i);return await Promise.all(o.docs.map(e=>c(s(g,d,e.id)))),{error:null}}catch(e){return{error:e}}return{error:Error(`Adapter only supports delete by id or collection_id`)}}})}),storage:{from:e=>({upload:async(t,n,r)=>{try{let r=await y(),i=m(r,`${e}/${t}`);return await h(i,n),{data:{path:t},error:null}}catch(e){return{error:e}}},getPublicUrl:t=>({data:{publicUrl:`https://firebasestorage.googleapis.com/v0/b/poemas-natanael.firebasestorage.app/o/${encodeURIComponent(e+`%2F`+t)}?alt=media`}})})},functions:{invoke:async(e,t)=>{try{let n=await v();return{data:(await p(n,e)(t?.body)).data,error:null}}catch(e){return{error:e}}}},rpc:async()=>({data:null,error:null})};function w(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}}var T={meta:{title:`Dashboard Admin`},async render(e,t){let n=new URLSearchParams(window.location.search),r=n.get(`bypass_auth`)===`true`,{data:{session:i}}=await C.auth.getSession();if(!i&&!r){f(`/login`);return}let a=n.get(`view`)||`dashboard`,o=e=>{let t=a===e;return`font-size: 0.85rem; padding: 0.5rem 1rem; color: ${t?`var(--accent-subtle)`:`var(--text-secondary)`}; font-weight: ${t?`500`:`400`}; transition: color var(--transition-fast); border-bottom: 2px solid ${t?`var(--accent-subtle)`:`transparent`}; padding-bottom: 0.25rem; text-decoration: none;`};e.innerHTML=`
      <div class="admin-layout" style="max-width: 1400px; margin: 0 auto; padding: 0 var(--space-md); width: 100%; box-sizing: border-box;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: var(--space-md);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary); cursor: pointer; margin: 0;" id="logo-header">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-xs); align-items: center; font-family: var(--font-ui); flex-wrap: wrap;">
            <a href="/poemas/admin?view=dashboard" data-link style="${o(`dashboard`)}">Início</a>
            <a href="/poemas/admin?view=list" data-link style="${o(`list`)}">Obras</a>
            <a href="/poemas/admin?view=collections" data-link style="${o(`collections`)}">Coleções</a>
            <a href="/poemas/admin?view=analytics" data-link style="${o(`analytics`)}">Estatísticas</a>
            <a href="/poemas/admin?view=emails" data-link style="${o(`emails`)}">Histórico de Emails</a>
            <a href="/poemas/admin?view=subscribers" data-link style="${o(`subscribers`)}">Assinantes</a>
            <a href="/poemas/admin?view=comments" data-link style="${o(`comments`)}">Comentários</a>
            <a href="/poemas/admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast); text-decoration: none; color: var(--text-primary);">Nova Obra</a>

            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent; background: transparent; cursor: pointer;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `,e.querySelector(`#logo-header`).addEventListener(`click`,()=>{f(`/admin`)}),document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await C.auth.signOut(),f(`/login`)});let s=document.getElementById(`admin-content`);if(a===`dashboard`)await this.renderDashboard(s);else if(a===`list`)await this.renderList(s);else if(a===`collections`)await this.renderCollections(s);else if(a===`editor`)await this.renderEditor(s,n.get(`id`));else if(a===`analytics`){let{default:e}=await d(async()=>{let{default:e}=await import(`./analytics-D065oUvg.js`);return{default:e}},__vite__mapDeps([0,1,2,3,4]));await e.render(s)}else a===`emails`?await this.renderEmailHistory(s):a===`subscribers`?await this.renderSubscribers(s):a===`comments`&&await this.renderComments(s)},async renderDashboard(e){e.innerHTML=`<div class="loading">Carregando painel geral...</div>`;try{let t=[],n=0,r=[],i=[],a=new URLSearchParams(window.location.search).get(`bypass_auth`)===`true`;try{let[e,o,s,c]=await Promise.all([C.from(`poems`).select(`id, title, slug, status, scheduled_at, created_at`),C.from(`poem_comments`).select(`id`).eq(`approved`,!1),C.from(`subscribers`).select(`email, created_at, active`).order(`created_at`,{ascending:!1}).limit(5),C.from(`page_views`).select(`created_at`).gte(`created_at`,new Date(Date.now()-6048e5).toISOString())]);if(e.error||o.error||s.error||c.error){if(a)throw Error(`Supabase query error, fallback to mock data`);if(e.error)throw e.error;if(o.error)throw o.error;if(s.error)throw s.error;if(c.error)throw c.error}t=e.data||[],n=o.data?.length||0,r=s.data||[],i=c.data||[]}catch(e){if(a){t=[{id:`1`,title:`Poema das Flores`,slug:`poema-das-flores`,status:`published`,created_at:new Date().toISOString()},{id:`2`,title:`Canto Noturno`,slug:`canto-noturno`,status:`draft`,created_at:new Date().toISOString()},{id:`3`,title:`Silêncio da Alma`,slug:`silencio-da-alma`,status:`scheduled`,scheduled_at:new Date(Date.now()+864e5).toISOString(),created_at:new Date().toISOString()}],n=3,r=[{email:`leitor1@exemplo.com`,created_at:new Date(Date.now()-1e5).toISOString(),active:!0},{email:`leitor2@exemplo.com`,created_at:new Date(Date.now()-5e5).toISOString(),active:!1},{email:`leitor3@exemplo.com`,created_at:new Date(Date.now()-9e5).toISOString(),active:!0}],i=[];for(let e=0;e<7;e++){let t=[12,18,5,23,14,30,45][e],n=new Date;n.setDate(n.getDate()-(6-e));for(let e=0;e<t;e++)i.push({created_at:n.toISOString()})}}else throw e}let o=t.length,s=t.filter(e=>e.status===`published`).length,c=t.filter(e=>e.status===`draft`).length,l=t.filter(e=>e.status===`scheduled`).length,u={};i.forEach(e=>{let t=new Date(e.created_at).toISOString().slice(0,10);u[t]=(u[t]||0)+1});let d=[],f=0;for(let e=6;e>=0;e--){let t=new Date;t.setDate(t.getDate()-e);let n=t.toISOString().slice(0,10),r=u[n]||0;f+=r,d.push({label:n,count:r})}let p=t.filter(e=>e.status===`scheduled`&&e.scheduled_at).sort((e,t)=>new Date(e.scheduled_at)-new Date(t.scheduled_at)).slice(0,3);e.innerHTML=`
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
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${o}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);">poemas</span>
              </div>
            </div>
            
            <div style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box;">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Status das Obras</div>
              <div style="display: flex; gap: var(--space-md); font-size: 0.85rem; align-items: baseline; margin-top: auto; flex-wrap: wrap;">
                <div>
                  <span style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${s}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Pub.</span>
                </div>
                <div>
                  <span style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">${c}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Rasc.</span>
                </div>
                <div>
                  <span style="color: var(--accent-subtle); font-weight: 600; font-size: 1.1rem;">${l}</span> <span style="color: var(--text-secondary); font-size: 0.8rem;">Agend.</span>
                </div>
              </div>
            </div>
            
            <a href="/poemas/admin?view=comments" data-link style="background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 8px;">Comentários Pendentes</div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-top: auto; width: 100%;">
                <span style="font-size: 2.2rem; font-family: var(--font-display); color: ${n>0?`var(--error)`:`var(--text-muted)`}; font-weight: 400; line-height: 1;">${n}</span>
                ${n>0?`<span style="background: rgba(204, 74, 74, 0.15); color: var(--error); padding: 0.2rem 0.5rem; border-radius: 2px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Revisar</span>`:`<span style="color: var(--success); font-size: 0.75rem; font-weight: 500;">✔ Tudo limpo</span>`}
              </div>
            </a>
            
            <a href="/poemas/admin?view=analytics" id="visits-kpi-card" data-link style="position: relative; background: var(--bg-elevated); padding: var(--space-md); border-radius: 4px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; height: auto; box-sizing: border-box; text-decoration: none; transition: border-color var(--transition-fast);" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%; margin-bottom: 8px;">
                <div>
                  <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-weight: 500; margin-bottom: 4px;">Visitas (7 dias)</div>
                  <div style="font-size: 1.8rem; font-family: var(--font-display); color: var(--text-primary); font-weight: 400; line-height: 1;">${f}</div>
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
        `})(d)}
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
                
                ${r.length===0?`
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
                      ${r.map(e=>`
                        <tr style="border-bottom: 1px solid var(--border-subtle);">
                          <td style="padding: var(--space-xs) var(--space-xs) var(--space-xs) 0; color: var(--text-primary); font-family: var(--font-ui); font-size: 0.8rem; word-break: break-all;">${S(e.email)}</td>
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
                
                ${p.length===0?`
                  <p style="color: var(--text-muted); font-size: 0.85rem; padding: var(--space-sm) 0;">Nenhuma publicação agendada.</p>
                `:`
                  <div style="display: grid; gap: var(--space-xs);">
                    ${p.map(e=>`
                      <div style="padding: var(--space-xs); border: 1px solid var(--border-subtle); border-radius: 2px; background: rgba(255, 255, 255, 0.01); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); font-weight: 400;">${S(e.title)}</div>
                          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 2px;">Slug: ${S(e.slug)}</div>
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
      `;let m=e.querySelector(`#visits-kpi-card`);if(m){let e=m.querySelector(`#sparkline-svg`),t=m.querySelector(`#sparkline-tracker`),n=m.querySelector(`#sparkline-hover-dot`),r=m.querySelector(`#sparkline-tooltip`),i=i=>{let o=e.getBoundingClientRect(),s=i.clientX-o.left;if(s<-10||s>o.width+10){a();return}let c=Math.min(6,Math.max(0,Math.round(s/o.width*6))),l=d[c];if(!l)return;let u=Math.max(...d.map(e=>e.count),1),f=c/6*160,p=38-l.count/u*36;t.setAttribute(`x1`,f),t.setAttribute(`x2`,f),t.style.display=`block`,n.setAttribute(`cx`,f),n.setAttribute(`cy`,p),n.style.display=`block`;let h=new Date(l.label+`T00:00:00`),g=h.toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`2-digit`}),_=h.toLocaleDateString(`pt-BR`,{weekday:`short`}).replace(`.`,``);r.style.display=`block`,r.innerHTML=`
            <div style="font-weight: 500; font-size: 0.65rem; color: var(--text-secondary); text-transform: capitalize;">${_}, ${g}</div>
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-primary); margin-top: 2px;">${l.count} ${l.count===1?`visita`:`visitas`}</div>
          `;let v=m.getBoundingClientRect(),y=i.clientX-v.left,b=i.clientY-v.top-55;r.style.left=`${Math.min(v.width-95,Math.max(10,y-45))}px`,r.style.top=`${b}px`,r.getBoundingClientRect(),r.style.opacity=`1`,r.style.transform=`translateY(0)`},a=()=>{t&&(t.style.display=`none`),n&&(n.style.display=`none`),r&&(r.style.opacity=`0`,r.style.transform=`translateY(4px)`,setTimeout(()=>{r.style.opacity===`0`&&(r.style.display=`none`)},150))};m.addEventListener(`mousemove`,i),m.addEventListener(`mouseleave`,a)}}catch(t){console.error(t),e.innerHTML=`<div class="error">Erro ao carregar o dashboard: ${t.message}</div>`}},async renderCollections(e){let t=async()=>{e.innerHTML=`<div class="loading">Carregando coleções...</div>`;let{data:r,error:i}=await C.from(`collections`).select(`*, collection_poems(count)`);if(i){e.innerHTML=`<div class="error">Erro ao carregar coleções: ${i.message}</div>`;return}let a=r.map(e=>{let t=b(e.image_url);return`
        <div style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
          ${t?`
            <div style="height: 120px; background-image: url('${S(t)}'); background-size: cover; background-position: center; border-bottom: 1px solid var(--border-subtle);"></div>
          `:`
            <div style="height: 120px; background: var(--bg-secondary); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--border-subtle); color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">Sem Imagem</div>
          `}
          <div style="padding: var(--space-md); flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; gap: var(--space-xs);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                <h4 style="font-family: var(--font-display); font-size: 1.25rem; font-weight: 400; margin: 0; color: var(--text-primary);">${S(e.name)}</h4>
                <span style="font-size: 0.75rem; color: var(--accent-subtle); border: 1px solid var(--accent-subtle); padding: 0.1rem 0.4rem; border-radius: 2px; font-family: var(--font-ui); font-weight: 500; white-space: nowrap;">
                  ${e.collection_poems?.[0]?.count||0} obras
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-ui); margin-top: 4px;">Slug: ${S(e.slug)}</div>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-2xs); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">${S(e.description||`Sem descrição.`)}</p>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm); font-family: var(--font-ui);">
              <button class="edit-col-btn" data-id="${e.id}" style="font-size: 0.85rem; color: var(--text-primary); transition: color var(--transition-fast); background: transparent; border: none; cursor: pointer;">Editar</button>
              <button class="delete-col-btn" data-id="${e.id}" style="font-size: 0.85rem; color: var(--error); opacity: 0.7; transition: opacity var(--transition-fast); background: transparent; border: none; cursor: pointer;">Excluir</button>
            </div>
          </div>
        `}).join(``);e.innerHTML=`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xs); flex-wrap: wrap; gap: var(--space-sm);">
            <div>
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">Coleções</h3>
              <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: var(--space-3xs);">Crie e gerencie agrupamentos temáticos de suas obras.</p>
            </div>
            <button id="new-col-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; font-weight: 500; font-size: 0.85rem; border: none; cursor: pointer;">+ Nova Coleção</button>
          </div>
          
          ${r.length===0?`
            <p style="color: var(--text-muted); text-align: center; padding: var(--space-xl) 0; border: 1px dashed var(--border-strong); border-radius: 4px;">Nenhuma coleção criada ainda. Comece criando uma clicando no botão acima!</p>
          `:`
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md);">
              ${a}
            </div>
          `}
        </div>
      `,e.querySelector(`#new-col-btn`).addEventListener(`click`,()=>n()),e.querySelectorAll(`.edit-col-btn`).forEach(e=>{e.addEventListener(`click`,()=>n(e.dataset.id))}),e.querySelectorAll(`.delete-col-btn`).forEach(e=>{let n=!1;e.addEventListener(`click`,async r=>{if(!n){e.innerText=`Confirmar?`,e.style.color=`#fff`,e.style.backgroundColor=`var(--error)`,e.style.padding=`0.2rem 0.5rem`,e.style.borderRadius=`2px`,n=!0,setTimeout(()=>{e&&(e.innerText=`Excluir`,e.style.color=`var(--error)`,e.style.backgroundColor=`transparent`,e.style.padding=`0`,n=!1)},3e3);return}e.innerText=`Excluindo...`,e.disabled=!0;let{error:i}=await C.from(`collections`).delete().eq(`id`,e.dataset.id);i&&alert(`Erro ao excluir coleção: `+i.message),t()})})},n=async(n=null)=>{e.innerHTML=`<div class="loading">Carregando formulário...</div>`;let r={name:``,slug:``,description:``,image_url:``},i=new Set;try{let[a,o,s]=await Promise.all([C.from(`poems`).select(`id, title, status`).order(`title`,{ascending:!0}),n?C.from(`collections`).select(`*`).eq(`id`,n).single():Promise.resolve({data:null}),n?C.from(`collection_poems`).select(`poem_id`).eq(`collection_id`,n):Promise.resolve({data:[]})]);if(a.error)throw a.error;if(n&&o.error)throw o.error;if(n&&s.error)throw s.error;let c=a.data||[];o.data&&(r=o.data),s.data&&s.data.forEach(e=>i.add(e.poem_id)),e.innerHTML=`
          <div style="font-family: var(--font-ui); max-width: 700px; margin: 0 auto; display: grid; gap: var(--space-md);">
            <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs); margin-bottom: var(--space-3xs);">
              <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); font-weight: 400; margin: 0;">
                ${n?`Editar Coleção`:`Nova Coleção`}
              </h3>
            </div>
            
            <form id="col-form" style="display: grid; gap: var(--space-md);">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-md);">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Nome da Coleção</label>
                  <input type="text" id="col-name" value="${S(r.name)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Link (Slug)</label>
                  <input type="text" id="col-slug" value="${S(r.slug)}" required style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
                </div>
              </div>
              
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</label>
                <textarea id="col-description" style="width: 100%; min-height: 80px; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; resize: vertical;">${S(r.description||``)}</textarea>
              </div>
              
              <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: var(--space-md); align-items: start; flex-wrap: wrap;">
                <div>
                  <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">URL da Imagem de Capa</label>
                  <input type="text" id="col-img-url" value="${S(r.image_url||``)}" placeholder="https://exemplo.com/imagem.jpg" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px; margin-bottom: 8px;">
                  
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
                    ${b(r.image_url)?`
                      <img src="${S(b(r.image_url))}" id="col-img-preview" style="width: 100%; height: 100%; object-fit: cover;">
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
                  ${c.map(e=>{let t=i.has(e.id);return`
                      <label class="checklist-item" data-title="${e.title.toLowerCase()}" style="display: flex; align-items: center; gap: var(--space-2xs); padding: var(--space-3xs) var(--space-2xs); cursor: pointer; border-radius: 2px; transition: background-color var(--transition-fast);">
                        <input type="checkbox" name="associated-poems" value="${e.id}" ${t?`checked`:``} style="cursor: pointer;">
                        <span style="font-size: 0.9rem; color: var(--text-primary);">${S(e.title)}</span>
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
                  ${n?`Salvar Alterações`:`Criar Coleção`}
                </button>
              </div>
            </form>
          </div>
        `;let l=e.querySelector(`#col-name`),u=e.querySelector(`#col-slug`);l.addEventListener(`input`,()=>{(!n||u.value===``)&&(u.value=l.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``))});let d=e.querySelector(`#checklist-search`),f=e.querySelectorAll(`.checklist-item`);d.addEventListener(`input`,()=>{let e=d.value.toLowerCase().trim();f.forEach(t=>{t.dataset.title.includes(e)?t.style.display=`flex`:t.style.display=`none`})});let p=e.querySelector(`#col-img-url`),m=e.querySelector(`#col-img-preview-container`),h=e=>{m.replaceChildren();let t=b(e);if(t){let e=document.createElement(`img`);e.id=`col-img-preview`,e.setAttribute(`src`,encodeURI(t)),e.style.width=`100%`,e.style.height=`100%`,e.style.objectFit=`cover`,m.appendChild(e)}else{let e=document.createElement(`span`);e.id=`col-preview-placeholder`,e.textContent=`Nenhuma imagem`,m.appendChild(e)}};p.addEventListener(`input`,()=>{h(p.value.trim())});let g=e.querySelector(`#col-img-upload`),_=e.querySelector(`#upload-status`);g.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){_.textContent=`Enviando...`,_.style.color=`var(--accent-subtle)`,g.disabled=!0;try{let e=t.name.split(`.`).pop().toLowerCase(),n=`col_cover_${Date.now()}.${e}`,{data:r,error:i}=await C.storage.from(`avatars`).upload(n,t);if(i)throw i;let{data:a}=C.storage.from(`avatars`).getPublicUrl(n),o=a.publicUrl;p.value=o,h(o),_.textContent=`Sucesso!`,_.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de capa:`,e),_.textContent=`Erro!`,_.style.color=`var(--error)`}finally{g.disabled=!1,setTimeout(()=>{_.textContent=``},3e3)}}}),e.querySelector(`#cancel-form-btn`).addEventListener(`click`,()=>t()),e.querySelector(`#col-form`).addEventListener(`submit`,async r=>{r.preventDefault();let i=e.querySelector(`#save-col-btn`);i.innerText=`Salvando...`,i.disabled=!0;let a={name:l.value.trim(),slug:u.value.trim(),description:e.querySelector(`#col-description`).value.trim(),image_url:p.value.trim()||null},o=n,s=null;if(n)s=(await C.from(`collections`).update(a).eq(`id`,n)).error;else{a.created_at=new Date().toISOString();let e=await C.from(`collections`).insert(a);s=e.error,e.data&&(o=e.data.id)}if(s){alert(`Erro ao salvar coleção: `+s.message),i.innerText=n?`Salvar Alterações`:`Criar Coleção`,i.disabled=!1;return}let c=e.querySelectorAll(`input[name="associated-poems"]:checked`),d=Array.from(c).map(e=>e.value);if(await C.from(`collection_poems`).delete().eq(`collection_id`,o),d.length>0){let e=d.map(e=>({collection_id:o,poem_id:e})),{error:t}=await C.from(`collection_poems`).insert(e);t&&alert(`Coleção salva, mas houve um erro ao associar poemas: `+t.message)}t()})}catch(t){console.error(t),e.innerHTML=`<div class="error">Erro ao carregar o formulário: ${t.message}</div>`}};await t()},async renderList(e){e.innerHTML=`<div class="loading">Carregando obras...</div>`;try{let[t,n]=await Promise.all([C.from(`poems`).select(`id, title, slug, status, published_at, scheduled_at, tags, created_at`),C.from(`page_views`).select(`poem_id`)]);if(t.error)throw t.error;let r=t.data||[],i=n.data||[],a={};i.forEach(e=>{e.poem_id&&(a[e.poem_id]=(a[e.poem_id]||0)+1)});let o=new Set;r.forEach(e=>e.tags?.forEach(e=>o.add(e.trim()))),e.innerHTML=`
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
              ${Array.from(o).sort().map(e=>`<option value="${S(e)}">${S(e)}</option>`).join(``)}
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
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${r.length}</strong> obras
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
      `;let s=e.querySelector(`#list-tbody`),c=e.querySelector(`#results-count`),l=e=>{if(c.innerText=e.length,e.length===0){s.innerHTML=`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum poema encontrado com os filtros selecionados.
              </td>
            </tr>
          `;return}s.innerHTML=e.map(e=>{let t=a[e.id]||0,n=``;n=e.status===`scheduled`?`Agendado • ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}`:e.status===`published`?`Publicado • ${new Date(e.published_at).toLocaleDateString(`pt-BR`)}`:`Criado • ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}`;let r=e.status===`published`?`var(--success)`:e.status===`scheduled`?`var(--accent-subtle)`:`var(--border-strong)`,i=e.status===`published`?`var(--success)`:e.status===`scheduled`?`var(--accent-subtle)`:`var(--text-muted)`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary);">${S(e.title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${S(e.slug)}</td>
              <td style="padding: var(--space-md) 0;">
                <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${r}; color: ${i}; text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
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
          `}).join(``),s.querySelectorAll(`.delete-btn`).forEach(e=>{let t=!1;e.addEventListener(`click`,async n=>{n.preventDefault();let r=e.dataset.id;if(!t){let n=e.innerText;e.innerText=`Tem certeza?`,e.style.color=`#fff`,e.style.backgroundColor=`var(--error)`,e.style.padding=`0.2rem 0.5rem`,e.style.borderRadius=`2px`,e.style.opacity=`1`,t=!0,setTimeout(()=>{e&&!e.disabled&&(e.innerText=n,e.style.color=`var(--error)`,e.style.backgroundColor=`transparent`,e.style.padding=`0`,e.style.opacity=`0.7`,t=!1)},3e3);return}e.innerText=`Excluindo...`,e.disabled=!0;let{error:i}=await C.from(`poems`).delete().eq(`id`,r);if(i){console.error(i),alert(`Erro ao excluir: `+i.message),e.innerText=`Excluir`,e.disabled=!1;return}f(`/admin?view=list`)})})},u=e.querySelector(`#list-search`),d=e.querySelector(`#list-filter-status`),p=e.querySelector(`#list-filter-tag`),m=e.querySelector(`#list-sort`),h=()=>{let e=u.value.toLowerCase().trim(),t=d.value,n=p.value,i=m.value,o=[...r];e&&(o=o.filter(t=>t.title.toLowerCase().includes(e)||t.slug.toLowerCase().includes(e))),t!==`all`&&(o=o.filter(e=>e.status===t)),n!==`all`&&(o=o.filter(e=>e.tags&&e.tags.includes(n))),i===`newest`?o.sort((e,t)=>new Date(t.published_at||t.created_at)-new Date(e.published_at||e.created_at)):i===`oldest`?o.sort((e,t)=>new Date(e.published_at||e.created_at)-new Date(t.published_at||t.created_at)):i===`title-az`?o.sort((e,t)=>e.title.localeCompare(t.title)):i===`title-za`?o.sort((e,t)=>t.title.localeCompare(e.title)):i===`views`&&o.sort((e,t)=>(a[t.id]||0)-(a[e.id]||0)),l(o)};u.addEventListener(`input`,w(h,150)),d.addEventListener(`change`,h),p.addEventListener(`change`,h),m.addEventListener(`change`,h),h()}catch(t){console.error(t),e.innerHTML=`<div class="error">Erro ao carregar obras: ${t.message}</div>`}},async renderEditor(e,t){let n={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`,audio_url:``};if(t){e.innerHTML=`<div class="loading">Carregando poema...</div>`;let{data:r}=await C.from(`poems`).select(`*`).eq(`id`,t).single();r&&(n=r,n.content=x(n.content))}e.innerHTML=`
      <form id="editor-form" style="font-family: var(--font-ui);">
        <div class="editor-layout">
          <div class="editor-pane">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
                <input type="text" id="poem-title" value="${S(n.title)}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
                <input type="text" id="poem-slug" value="${S(n.slug)}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${S(n.content)}</textarea>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
              <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${S(n.excerpt||``)}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
                <input type="text" id="poem-tags" value="${S(n.tags?n.tags.join(`, `):``)}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
                <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <option value="draft" ${n.status===`draft`?`selected`:``}>Rascunho</option>
                  <option value="scheduled" ${n.status===`scheduled`?`selected`:``}>Agendado</option>
                  <option value="published" ${n.status===`published`?`selected`:``}>Publicado</option>
                </select>
              </div>
            </div>

            <!-- Audio Upload Section -->
            <div class="admin-audio-card">
              <div class="admin-audio-header">
                <label style="display: flex; align-items: center; gap: 6px; margin: 0; color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
                  <span>📎</span> Áudio da Narração (Opcional)
                </label>
                <span id="audio-upload-status" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
              </div>
              
              <input type="hidden" id="poem-audio-url" value="${S(n.audio_url||``)}">
              
              <div style="display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; margin-top: var(--space-2xs);">
                <label class="btn-secondary" style="cursor: pointer; padding: 0.5rem 1rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-strong); border-radius: 2px;">
                  <span>📁 Escolher Arquivo</span>
                  <input type="file" id="poem-audio-file" accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,audio/aac" style="display: none;">
                </label>
                <button type="button" id="remove-audio-btn" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem; color: var(--error); border-color: var(--error); display: ${n.audio_url?`inline-block`:`none`};">
                  Remover Áudio
                </button>
              </div>
              
              <p class="field-help" style="font-size: 0.78rem; color: var(--text-muted); margin-top: var(--space-2xs);">
                Formatos aceitos: MP3, WAV, M4A — Máx 10MB.
              </p>

              <div id="audio-preview-container" class="admin-audio-preview" style="display: ${n.audio_url?`flex`:`none`};">
                <div style="display: flex; align-items: center; gap: var(--space-xs); flex: 1; min-width: 200px;">
                  <span style="font-size: 0.85rem; color: var(--accent-subtle);">▶</span>
                  <audio id="audio-preview-player" controls src="${b(n.audio_url||``)}" style="height: 32px; width: 100%; max-width: 400px;"></audio>
                </div>
                <span id="audio-file-name" style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all;">
                  ${n.audio_url?`Áudio vinculado`:``}
                </span>
              </div>
            </div>

            <div id="scheduling-fields" style="margin-top: var(--space-md); ${n.status===`scheduled`?``:`display: none;`}">
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
              <input type="datetime-local" id="scheduled-at" value="${n.scheduled_at?new Date(n.scheduled_at).toISOString().slice(0,16):``}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
              <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
              ${n.status===`scheduled`?`<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(n.scheduled_at).toLocaleString(`pt-BR`)}.</p>`:``}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
              <a href="/poemas/admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
              <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
              ${n.status===`draft`?`<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>`:``}
            </div>
          </div>

          <div class="preview-pane">
            <div class="preview-header">
              <span class="preview-label">Preview em tempo real</span>
            </div>
            <article class="preview-poem">
              <h1 id="preview-title">${S(n.title||`Título da Obra`)}</h1>
              <div class="poem-meta preview-meta">
                <span id="preview-date">${n.published_at?new Date(n.published_at).toLocaleDateString(`pt-BR`):new Date().toLocaleDateString(`pt-BR`)}</span>
                <span id="preview-tags-container">${n.tags&&n.tags.length>0?`<span>•</span> <span>Sentimentos: ${S(n.tags.join(`, `))}</span>`:``}</span>
              </div>
              <div id="preview-content" class="poem-content">${S(n.content||``)}</div>
            </article>
          </div>
        </div>
      </form>
    `;let r=document.getElementById(`poem-title`),i=document.getElementById(`poem-slug`);r.addEventListener(`input`,()=>{if(document.getElementById(`preview-title`).textContent=r.value||`Título da Obra`,!t||i.value===``){let e=r.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``);i.value=e}});let a=document.getElementById(`poem-content-input`),o=document.getElementById(`preview-content`),s=document.getElementById(`poem-tags`),c=document.getElementById(`poem-status`),l=document.getElementById(`scheduling-fields`);a.addEventListener(`input`,w(()=>{o.textContent=a.value},250)),s.addEventListener(`input`,w(()=>{let e=s.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`preview-tags-container`);if(t&&(t.replaceChildren(),e.length>0)){let n=document.createElement(`span`);n.textContent=`•`;let r=document.createElement(`span`);r.textContent=`Sentimentos: ${e.join(`, `)}`,t.append(n,` `,r)}},250)),c.addEventListener(`change`,()=>{l.style.display=c.value===`scheduled`?`block`:`none`});let u=document.getElementById(`poem-audio-file`),d=document.getElementById(`poem-audio-url`),p=document.getElementById(`audio-upload-status`),m=document.getElementById(`audio-preview-container`),h=document.getElementById(`audio-preview-player`),g=document.getElementById(`audio-file-name`),_=document.getElementById(`remove-audio-btn`);u&&u.addEventListener(`change`,async e=>{let t=e.target.files?.[0];if(!t)return;let n=[`.mp3`,`.wav`,`.m4a`,`.aac`,`.ogg`],r=`.`+t.name.split(`.`).pop().toLowerCase();if(!n.includes(r)&&!t.type.startsWith(`audio/`)){alert(`Formato de áudio inválido. Por favor selecione um arquivo .mp3, .wav, .m4a ou .aac.`),u.value=``;return}let i={".m4a":`audio/mp4`,".mp3":`audio/mpeg`,".wav":`audio/wav`,".aac":`audio/aac`,".ogg":`audio/ogg`}[r]||t.type||`audio/mpeg`;if(t.size>10485760){alert(`O arquivo de áudio excede o tamanho máximo de 10MB.`),u.value=``;return}p.textContent=`Enviando áudio...`,p.style.color=`var(--accent-subtle)`,u.disabled=!0;try{let e=`narration_${Date.now()}${r}`,n=await C.storage.from(`audios`).upload(e,t,{contentType:i,upsert:!0}),a=`audios`;if(n.error&&(console.warn(`Bucket audios retornou erro, tentando fallback para avatars:`,n.error),n=await C.storage.from(`avatars`).upload(e,t,{contentType:i,upsert:!0}),a=`avatars`),n.error)throw n.error;let{data:o}=C.storage.from(a).getPublicUrl(e),s=o.publicUrl;d.value=s,h.src=b(s),h.load(),g.textContent=t.name,m.style.display=`flex`,_.style.display=`inline-block`,p.textContent=`Áudio carregado!`,p.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de áudio:`,e),p.textContent=`Erro no envio`,p.style.color=`var(--error)`,alert(`Erro ao enviar áudio: `+(e.message||`Falha de conexão`))}finally{u.disabled=!1,u.value=``,setTimeout(()=>{p&&(p.textContent=``)},3500)}}),_&&_.addEventListener(`click`,()=>{confirm(`Deseja realmente remover o áudio desta poesia?`)&&(d.value=``,h.pause(),h.removeAttribute(`src`),h.load(),m.style.display=`none`,_.style.display=`none`,g.textContent=``,p.textContent=`Áudio removido.`,p.style.color=`var(--text-muted)`,setTimeout(()=>{p&&(p.textContent=``)},2500))});let v=()=>{let e=s.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`scheduled-at`);return{title:document.getElementById(`poem-title`).value,slug:document.getElementById(`poem-slug`).value,content:document.getElementById(`poem-content-input`).value,excerpt:document.getElementById(`poem-excerpt`).value,tags:e,audio_url:d&&d.value.trim()||null,status:document.getElementById(`poem-status`).value,scheduled_at:t.value?new Date(t.value).toISOString():null}};document.getElementById(`editor-form`).addEventListener(`submit`,async e=>{e.preventDefault();let r=document.getElementById(`save-btn`);r.innerText=`Salvando...`,r.disabled=!0;let i=v();if(i.status===`scheduled`&&!i.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),r.innerText=`Gravar Alterações`,r.disabled=!1;return}i.status===`published`&&n.status!==`published`&&(i.published_at=new Date().toISOString());let a=null;if(t?a=(await C.from(`poems`).update(i).eq(`id`,t)).error:(i.created_at=new Date().toISOString(),a=(await C.from(`poems`).insert([i])).error),a){console.error(a),alert(`Erro ao salvar: `+a.message),r.innerText=`Gravar Alterações`,r.disabled=!1;return}f(`/admin`)});let y=document.getElementById(`publish-btn`);if(y){let e=!1;y.addEventListener(`click`,async n=>{if(n.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!e){y.innerText=`Tem certeza? Clique para confirmar.`,y.style.background=`var(--error)`,e=!0,setTimeout(()=>{y&&!y.disabled&&(y.innerText=`Publicar e Notificar Assinantes`,y.style.background=`var(--success)`,e=!1)},4e3);return}y.innerText=`Publicando...`,y.disabled=!0;let r=v();r.status=`published`,r.published_at=new Date().toISOString();let i=t,a=null;if(t)a=(await C.from(`poems`).update(r).eq(`id`,t)).error;else{r.created_at=new Date().toISOString();let e=await C.from(`poems`).insert(r);a=e.error,e.data&&(i=e.data.id)}if(a){console.error(a),alert(`Erro ao publicar: `+a.message),y.innerText=`Publicar e Notificar Assinantes`,y.disabled=!1;return}if(i)try{y.innerText=`Enviando newsletter...`;let{data:e,error:t}=await C.functions.invoke(`send-newsletter`,{body:{poemId:i}});if(t)throw t;alert(`Obra publicada e newsletter enviada com sucesso para ${e.count} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}f(`/admin`)})}},async renderEmailHistory(e){e.innerHTML=`<div class="loading">Carregando histórico e dados...</div>`;try{let[t,n]=await Promise.all([C.from(`email_campaign_logs`).select(`id, sent_at, status, details, poem_id, poems(title)`).order(`sent_at`,{ascending:!1}),C.from(`poems`).select(`id, title`).eq(`status`,`published`)]);if(t.error)throw t.error;if(n.error)throw n.error;let r=t.data||[],i=n.data||[];i.sort((e,t)=>e.title.localeCompare(t.title));let a=r.length,o=r.filter(e=>e.status===`success`).length,s=a>0?(o/a*100).toFixed(1):`100.0`,c=r[0]||null;e.innerHTML=`
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
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${a}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Registros de disparos de newsletter</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Taxa de Sucesso</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${s}%</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${o} envios bem-sucedidos</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Último Envio</div>
              <div style="font-size: 1.1rem; font-family: var(--font-ui); color: var(--accent-subtle); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;" title="${c?.poems?.title||`-`}">
                ${c?.poems?.title||`Nenhum envio registrado`}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: var(--space-3xs);">
                ${c?(e=>{let t=new Date(e),n=new Date-t,r=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return r<1?`Agora mesmo`:r<60?`Há ${r} min`:i<24?`Há ${i} h`:a===1?`Ontem`:a<30?`Há ${a} dias`:t.toLocaleDateString(`pt-BR`)})(c.sent_at):`Nenhum dado`}
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
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${r.length}</strong> envios
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
                  ${i.map(e=>`<option value="${e.id}">${S(e.title)}</option>`).join(``)}
                </select>
                ${i.length===0?`<p style="color: var(--error); font-size: 0.8rem; margin: 4px 0 0 0;">Nenhuma obra publicada disponível.</p>`:``}
              </div>
              
              <div style="display: flex; flex-direction: column; gap: var(--space-3xs); margin-top: var(--space-sm);">
                <label for="dispatch-target-email" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Destinatário Único (Opcional)</label>
                <input type="email" id="dispatch-target-email" placeholder="Deixe em branco para enviar a todos os assinantes" style="padding: var(--space-xs); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.95rem; width: 100%;">
                <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Se preenchido, envia apenas para este e-mail (ideal para testes).</p>
              </div>

              <div style="display: flex; align-items: flex-start; gap: var(--space-2xs); margin-top: var(--space-sm);">
                <input type="checkbox" id="dispatch-confirm-chk" style="margin-top: 3px; cursor: pointer;">
                <label for="dispatch-confirm-chk" style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; cursor: pointer; user-select: none;">
                  Confirmo que desejo enviar esta obra imediatamente (obrigatório se o destinatário não for preenchido).
                </label>
              </div>

              <div class="modal-actions" style="margin-top: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
                <button type="button" id="close-dispatch-modal-btn" class="btn-secondary" style="padding: 0.5rem 1rem; color: var(--text-secondary); font-size: 0.85rem; border: none; background: transparent; cursor: pointer;">Cancelar</button>
                <button type="submit" id="submit-dispatch-btn" class="btn-primary" ${i.length===0?`disabled`:``} style="padding: 0.5rem 1.2rem; background: var(--success); color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
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
      `;let l=e.querySelector(`#email-tbody`),u=e.querySelector(`#results-count`),d=e.querySelector(`#manual-dispatch-modal`),f=e.querySelector(`#log-details-modal`);e.querySelector(`#open-dispatch-modal-btn`).addEventListener(`click`,()=>{d.style.display=`flex`,e.querySelector(`#manual-dispatch-form`).reset()}),e.querySelector(`#close-dispatch-modal-btn`).addEventListener(`click`,()=>{d.style.display=`none`}),e.querySelector(`#close-details-modal-btn`).addEventListener(`click`,()=>{f.style.display=`none`}),[d,f].forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&(e.style.display=`none`)})});let p=null,m=async(t,n,r)=>{if(!t){alert(`Não é possível reenviar: id da obra indisponível.`);return}if(!confirm(`Deseja reenviar a newsletter da obra "${n}" para todos os assinantes ativos?`))return;let i=r.innerText;r.disabled=!0,r.innerText=`Enviando...`,r.style.opacity=`0.5`;try{let{data:r,error:i}=await C.functions.invoke(`send-newsletter`,{body:{poemId:t}});if(i)throw i;alert(`Newsletter para "${n}" reenviada com sucesso para ${r?.count||0} assinantes!`),f.style.display=`none`,this.renderEmailHistory(e)}catch(e){console.error(`Erro ao reenviar:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Erro ao enviar newsletter:\n${t||e.message||`Erro na Edge Function`}`),r.disabled=!1,r.innerText=i,r.style.opacity=`1`}};e.querySelector(`#resend-from-modal-btn`).addEventListener(`click`,async e=>{e.preventDefault(),p&&p.poem_id&&await m(p.poem_id,p.poems?.title||`Desconhecido`,e.currentTarget)});let h=t=>{if(u.innerText=t.length,t.length===0){l.innerHTML=`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum registro de envio encontrado com os filtros aplicados.
              </td>
            </tr>
          `;return}l.innerHTML=t.map(e=>{let t=e.poems?.title||`Desconhecido`,n=new Date(e.sent_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`}),r=e.status===`success`?`
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--success); box-shadow: 0 0 6px var(--success);"></span>
                Sucesso
              </span>
            `:`
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--error); box-shadow: 0 0 6px var(--error);"></span>
                Falha
              </span>
            `,i=e.details?e.details.length>50?`${S(e.details.slice(0,48))}...`:S(e.details):`-`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.15rem; color: var(--text-primary); font-weight: 400;">${S(t)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.85rem;">${n}</td>
              <td style="padding: var(--space-md) 0;">${r}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${i}</td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <button class="view-details-btn" data-id="${e.id}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; margin-right: var(--space-sm); transition: color var(--transition-fast); text-decoration: underline; padding: 0;">Detalhes</button>
                <button class="resend-log-btn" data-poem-id="${e.poem_id||``}" data-title="${S(t)}" style="color: var(--accent-subtle); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; transition: opacity var(--transition-fast); text-decoration: none; padding: 0; font-weight: 500;">Reenviar</button>
              </td>
            </tr>
          `}).join(``),l.querySelectorAll(`tr`).forEach(e=>{e.style.transition=`background-color var(--transition-fast)`,e.addEventListener(`mouseenter`,()=>{e.style.backgroundColor=`var(--bg-secondary)`}),e.addEventListener(`mouseleave`,()=>{e.style.backgroundColor=`transparent`})}),l.querySelectorAll(`.view-details-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let r=n.dataset.id,i=t.find(e=>e.id===r);if(!i)return;p=i,e.querySelector(`#detail-poem-title`).innerText=i.poems?.title||`Desconhecido`,e.querySelector(`#detail-date`).innerText=new Date(i.sent_at).toLocaleString(`pt-BR`,{dateStyle:`long`,timeStyle:`medium`});let a=i.status===`success`;e.querySelector(`#detail-status-badge`).innerHTML=a?`<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase;">Sucesso</span>`:`<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase;">Falha</span>`,e.querySelector(`#detail-description`).innerText=i.details||`Nenhum detalhe adicional disponível.`;let o=e.querySelector(`#resend-from-modal-btn`);i.poem_id?(o.style.display=`inline-block`,o.innerText=a?`Disparar Novamente`:`Tentar Reenviar`):o.style.display=`none`,f.style.display=`flex`})}),l.querySelectorAll(`.resend-log-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.dataset.poemId,r=e.dataset.title;m(n,r,e)})})},g=e.querySelector(`#email-search`),_=e.querySelector(`#email-filter-status`),v=e.querySelector(`#email-sort`),y=()=>{let e=g.value.toLowerCase().trim(),t=_.value,n=v.value,i=[...r];e&&(i=i.filter(t=>{let n=(t.poems?.title||``).toLowerCase(),r=(t.details||``).toLowerCase();return n.includes(e)||r.includes(e)})),t!==`all`&&(i=t===`success`?i.filter(e=>e.status===`success`):i.filter(e=>e.status!==`success`)),n===`newest`?i.sort((e,t)=>new Date(t.sent_at)-new Date(e.sent_at)):n===`oldest`?i.sort((e,t)=>new Date(e.sent_at)-new Date(t.sent_at)):n===`title-az`?i.sort((e,t)=>{let n=e.poems?.title||``,r=t.poems?.title||``;return n.localeCompare(r)}):n===`title-za`&&i.sort((e,t)=>{let n=e.poems?.title||``;return(t.poems?.title||``).localeCompare(n)}),h(i)};g.addEventListener(`input`,w(y,150)),_.addEventListener(`change`,y),v.addEventListener(`change`,y),y(),e.querySelector(`#manual-dispatch-form`).addEventListener(`submit`,async t=>{t.preventDefault();let n=e.querySelector(`#dispatch-poem-select`),r=n.value,i=n.options[n.selectedIndex].text,a=e.querySelector(`#dispatch-target-email`),o=a?a.value.trim():``,s=e.querySelector(`#dispatch-confirm-chk`);if(!o&&!s.checked){alert(`Você precisa confirmar o envio para todos os assinantes caso não preencha um e-mail de destino.`);return}let c=e.querySelector(`#submit-dispatch-btn`),l=e.querySelector(`#close-dispatch-modal-btn`);c.disabled=!0,c.innerText=`Enviando...`,n.disabled=!0,a&&(a.disabled=!0),s.disabled=!0,l.style.display=`none`;try{let t={poemId:r};o&&(t.targetEmail=o);let{data:n,error:a}=await C.functions.invoke(`send-newsletter`,{body:t});if(a)throw a;alert(o?`Newsletter para "${i}" enviada com sucesso para o e-mail: ${o}!`:`Newsletter para "${i}" enviada com sucesso para ${n?.count||0} assinantes!`),n?.logError&&(console.error(`Log error:`,n.logError),alert(`ATENÇÃO: Os emails foram enviados, mas houve um erro ao salvar o histórico no banco de dados.\nErro: ${n.logError.message||JSON.stringify(n.logError)}`)),d.style.display=`none`,this.renderEmailHistory(e)}catch(e){console.error(`Erro na Edge Function:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Erro ao disparar newsletter:\n${t||e.message||`Erro inesperado`}`),c.disabled=!1,c.innerText=`Disparar Newsletter`,n.disabled=!1,a&&(a.disabled=!1),s.disabled=!1,l.style.display=`inline-block`}})}catch(t){console.error(t),e.innerHTML=`<div class="error">Erro ao carregar dados do histórico: ${t.message}</div>`}},async renderSubscribers(e){e.innerHTML=`<div class="loading">Carregando assinantes...</div>`;let{data:t,error:n}=await C.from(`subscribers`).select(`email, active, created_at, unsubscribed_at`).order(`created_at`,{ascending:!1});if(n){e.innerHTML=`<div class="error">Erro ao carregar: ${n.message}</div>`;return}if(!t||t.length===0){e.innerHTML=`<p>Nenhum assinante encontrado.</p>`;return}let r=t.filter(e=>e.active).length,i=t.length,a=new Date;a.setDate(a.getDate()-30);let o=t.filter(e=>new Date(e.created_at)>a).length,s=t.filter(e=>!e.active&&e.unsubscribed_at&&new Date(e.unsubscribed_at)>a).length;e.innerHTML=`
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Total de Assinantes</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${i}</div>
          <div style="font-size: 0.8rem; color: var(--success);">${r} ativos</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Novos (30 dias)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">+${o}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Crescimento constante</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Taxa de Evasão (Churn)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${(s/(r||1)*100).toFixed(1)}%</div>
          <div style="font-size: 0.8rem; color: var(--error);">${s} saídas no mês</div>
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
          ${t.map(e=>`
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
    `,e.querySelector(`#export-csv-btn`)?.addEventListener(`click`,()=>{let e=`data:text/csv;charset=utf-8,Email,Ativo,Data Inscrição,Data Saída
`+t.map(e=>`${e.email},${e.active},${e.created_at},${e.unsubscribed_at||``}`).join(`
`),n=encodeURI(e),r=document.createElement(`a`);r.setAttribute(`href`,n),r.setAttribute(`download`,`assinantes_${new Date().toISOString().split(`T`)[0]}.csv`),document.body.appendChild(r),r.click(),document.body.removeChild(r)})},async renderComments(e){e.innerHTML=`<div class="loading">Carregando comentários...</div>`;let{data:t,error:n}=await C.from(`poem_comments`).select(`id, author_name, content, approved, created_at, poems(title)`).order(`created_at`,{ascending:!1});if(n){e.innerHTML=`<div class="error">Erro ao carregar: ${n.message}</div>`;return}if(!t||t.length===0){e.innerHTML=`<p>Nenhum comentário encontrado.</p>`;return}e.innerHTML=`
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
          ${t.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
          ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}
        </td>
        <td style="padding: var(--space-md) 0;">
          <div style="font-family: var(--font-display); font-size: 1.1rem;">${S(e.author_name)}</div>
          <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Em: ${e.poems?.title||`Obra removida`}</div>
          <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${S(e.content)}</div>
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
    `,e.querySelectorAll(`.approve-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.id,{error:r}=await C.from(`poem_comments`).update({approved:!0}).eq(`id`,n);r?alert(`Erro ao aprovar: `+r.message):this.renderComments(e)})}),e.querySelectorAll(`.delete-comment-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{if(!confirm(`Excluir este comentário?`))return;let n=t.dataset.id,{error:r}=await C.from(`poem_comments`).delete().eq(`id`,n);r?alert(`Erro ao excluir: `+r.message):this.renderComments(e)})})}};export{T as default};