import{i as e}from"./index-HEwGkHwt.js";function t(e,t=700,n=160){if(!e||e.length===0)return`<p style="color:var(--text-muted);font-family:var(--font-ui);font-size:0.85rem;">Sem dados para o período.</p>`;let r=Math.max(...e.map(e=>e.count),1),i=t-36-16,a=n-16-32,o=e.length,s=e=>36+e/(o-1||1)*i,c=e=>16+a-e/r*a,l=e.map((e,t)=>`${s(t)},${c(e.count)}`).join(` `),u=`36,${16+a} `+l+` ${s(o-1)},${16+a}`,d=Array.from({length:5},(e,t)=>{let n=Math.round(r/4*t),a=c(n);return`<line x1="36" y1="${a}" x2="${36+i}" y2="${a}" stroke="var(--border-subtle)" stroke-width="1"/>
            <text x="30" y="${a+4}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-ui)">${n}</text>`}).join(``),f=Math.ceil(o/10),p=e.map((e,t)=>{if(t%f!==0&&t!==o-1)return``;let r=o<=31?String(e.label).slice(5):String(e.label).slice(5,10);return`<text x="${s(t)}" y="${n-4}" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-family="var(--font-ui)">${r}</text>`}).join(``);return`
    <div style="position:relative;overflow:hidden;">
      <svg viewBox="0 0 ${t} ${n}" preserveAspectRatio="none"
           style="width:100%;height:${n}px;display:block;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stop-color="var(--text-primary)" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="var(--text-primary)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${d}
        <polygon points="${u}" fill="url(#chartGrad)"/>
        <polyline points="${l}" fill="none" stroke="var(--text-primary)" stroke-width="1.5"/>
        ${e.map((e,t)=>`
    <circle cx="${s(t)}" cy="${c(e.count)}" r="4" fill="var(--text-primary)" opacity="0"
      class="chart-dot" data-label="${e.label}" data-count="${e.count}"/>
  `).join(``)}
        ${p}
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
  `}function n(e,t){let n={};e.forEach(e=>{n[e.label]=e.count});let r=[],i=new Date;for(let e=t-1;e>=0;e--){let t=new Date(i);t.setDate(t.getDate()-e);let a=t.toISOString().slice(0,10);r.push({label:a,count:n[a]||0})}return r}var r={meta:{title:`Analytics — Admin`},async render(e){e.innerHTML=`
      <div style="font-family:var(--font-ui);max-width:900px;margin:0 auto;padding: 0 0 var(--space-xl);">

        <!-- Period selector -->
        <div style="display:flex;gap:var(--space-sm);align-items:center;margin-bottom:var(--space-lg);flex-wrap:wrap;">
          <span style="color:var(--text-secondary);font-size:0.85rem;">Período:</span>
          ${[7,30,90].map(e=>`<button class="period-btn" data-days="${e}"
              style="padding:0.35rem 0.9rem;border:1px solid var(--border-strong);border-radius:2px;
                     font-size:0.8rem;font-family:var(--font-ui);cursor:pointer;
                     background:${e===30?`var(--border-strong)`:`transparent`};
                     color:var(--text-primary);transition:background var(--transition-fast);"
            >${e===7?`7 dias`:e===30?`30 dias`:`90 dias`}</button>`).join(``)}
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
    `;let t=30;e.querySelectorAll(`.period-btn`).forEach(n=>{n.addEventListener(`click`,()=>{e.querySelectorAll(`.period-btn`).forEach(e=>{e.style.background=`transparent`}),n.style.background=`var(--border-strong)`,t=parseInt(n.dataset.days),this.loadData(e,t)})}),await this.loadData(e,t)},async loadData(r,a){let o=new Date;o.setDate(o.getDate()-a);let s=o.toISOString(),{data:c,error:l}=await e.from(`page_views`).select(`created_at, page, poem_id, ip_hash, country`).gte(`created_at`,s).order(`created_at`,{ascending:!1});if(l){r.querySelector(`#chart-area`).innerHTML=`<p style="color:var(--error)">${l.message}</p>`;return}let u=c.length,d=new Set(c.map(e=>e.ip_hash).filter(Boolean)).size,f=new Date().toISOString().slice(0,10),p=c.filter(e=>e.created_at.slice(0,10)===f).length,m=c.filter(e=>e.poem_id).length,h=r.querySelector(`#kpi-row`),g=(e,t)=>`
      <div style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;">
        <div style="font-size:2rem;font-family:var(--font-display);color:var(--text-primary);">${t}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;text-transform:uppercase;letter-spacing:1px;">${e}</div>
      </div>
    `;h.innerHTML=g(`Total de visitas`,u)+g(`Visitas hoje`,p)+g(`IPs únicos`,d)+g(`Leituras de poemas`,m);let _={};c.forEach(e=>{let t=e.created_at.slice(0,10);_[t]=(_[t]||0)+1});let v=n(Object.entries(_).map(([e,t])=>({label:e,count:t})),a);r.querySelector(`#chart-area`).innerHTML=t(v);let y={};c.filter(e=>e.poem_id).forEach(e=>{let t=e.page;y[t]=(y[t]||0)+1});let b=Object.entries(y).sort((e,t)=>t[1]-e[1]).slice(0,8),x=r.querySelector(`#top-poems`);if(b.length===0)x.innerHTML=`<p style="color:var(--text-muted);font-size:0.85rem;">Sem leituras registradas.</p>`;else{let e=b[0][1];x.innerHTML=b.map(([t,n])=>`
        <div style="margin-bottom:var(--space-sm);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
            <span style="font-size:0.82rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;" title="${t}">${t.replace(`/poema/`,``)}</span>
            <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500;">${n}</span>
          </div>
          <div style="height:3px;background:var(--border-subtle);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${Math.round(n/e*100)}%;background:var(--text-primary);border-radius:2px;"></div>
          </div>
        </div>
      `).join(``)}let S=new Set,C=[];for(let e of c)if(e.ip_hash&&!S.has(e.ip_hash)&&(S.add(e.ip_hash),C.push({hash:e.ip_hash,when:e.created_at.slice(0,10),country:e.country||`—`})),C.length>=10)break;let w=r.querySelector(`#ip-table`);w.innerHTML=C.length===0?`<p style="color:var(--text-muted);font-size:0.85rem;">Nenhum IP registrado.</p>`:`<table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
           <thead><tr style="color:var(--text-muted);border-bottom:1px solid var(--border-subtle);">
             <th style="text-align:left;padding-bottom:6px;">Hash (IP)</th>
             <th style="text-align:center;">País</th>
             <th style="text-align:right;">Última visita</th>
           </tr></thead>
           <tbody>
             ${C.map(e=>`
               <tr style="border-bottom:1px solid var(--border-subtle);">
                 <td style="padding:6px 0;color:var(--text-secondary);font-family:monospace;font-size:0.75rem;">${e.hash.slice(0,16)}…</td>
                 <td style="text-align:center;">${e.country}</td>
                 <td style="text-align:right;color:var(--text-muted);">${e.when}</td>
               </tr>`).join(``)}
           </tbody>
         </table>`;let T={};c.filter(e=>e.country).forEach(e=>{T[e.country]=(T[e.country]||0)+1});let E=Object.entries(T).sort((e,t)=>t[1]-e[1]).slice(0,6),D=r.querySelector(`#countries`);E.length===0?D.innerHTML=`<p style="color:var(--text-muted);font-size:0.85rem;">Sem dados de país.</p>`:(E[0][1],D.innerHTML=`<div style="display:flex;flex-wrap:wrap;gap:var(--space-sm);">`+E.map(([e,t])=>`
          <div style="display:flex;flex-direction:column;align-items:center;padding:var(--space-sm) var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;min-width:80px;">
            <span style="font-size:1.4rem;">${i(e)}</span>
            <span style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${e}</span>
            <span style="font-size:0.9rem;font-weight:500;">${t}</span>
          </div>`).join(``)+`</div>`)}};function i(e){return!e||e.length!==2?`🌍`:String.fromCodePoint(...e.toUpperCase().split(``).map(e=>127391+e.charCodeAt(0)))}export{r as default};