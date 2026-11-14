import{a as e,t}from"./html-DUzinkfe.js";import{_ as n,d as r,f as i,m as a,p as o,y as s}from"./vendor-firebase-Dd5ijz69.js";import{t as c}from"./firebase-BNXSdU2z.js";function l(e,t=700,n=160){if(!e||e.length===0)return`<p style="color:var(--text-muted);font-family:var(--font-ui);font-size:0.85rem;">Sem dados para o período.</p>`;let r=e.map(e=>e.count),i=Math.max(...r,1),a=r.reduce((e,t)=>e+t,0),o=Math.round(a/(r.length||1)),s=t-36-16,c=n-16-32,l=e.length,u=e=>36+e/(l-1||1)*s,d=e=>16+c-e/i*c,f=d(o),p=e.map((e,t)=>`${u(t)},${d(e.count)}`).join(` `),m=`36,${16+c} `+p+` ${u(l-1)},${16+c}`,h=Array.from({length:5},(e,t)=>{let n=Math.round(i/4*t),r=d(n);return`<line x1="36" y1="${r}" x2="${36+s}" y2="${r}" stroke="var(--border-subtle)" stroke-width="1"/>
            <text x="30" y="${r+4}" text-anchor="end" font-size="10" fill="var(--text-muted)" font-family="var(--font-ui)">${n}</text>`}).join(``),g=Math.ceil(l/10),_=e.map((e,t)=>{if(t%g!==0&&t!==l-1)return``;let r=l<=31?String(e.label).slice(5):String(e.label).slice(5,10);return`<text x="${u(t)}" y="${n-4}" text-anchor="middle" font-size="10" fill="var(--text-muted)" font-family="var(--font-ui)">${r}</text>`}).join(``);return`
    <div style="position:relative;overflow:hidden;">
      <svg viewBox="0 0 ${t} ${n}" preserveAspectRatio="none"
           style="width:100%;height:${n}px;display:block;">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stop-color="var(--text-primary)" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="var(--text-primary)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${h}
        <polygon points="${m}" fill="url(#chartGrad)"/>
        <polyline points="${p}" fill="none" stroke="var(--text-primary)" stroke-width="1.5"/>
        ${o>0?`
    <line x1="36" y1="${f}" x2="${36+s}" y2="${f}" stroke="var(--text-secondary)" stroke-dasharray="4 4" stroke-opacity="0.5" stroke-width="1.2"/>
    <text x="${36+s-4}" y="${f-4}" text-anchor="end" font-size="9" fill="var(--text-secondary)" fill-opacity="0.8" font-family="var(--font-ui)">Média: ${o}</text>
  `:``}
        ${e.map((e,t)=>`
    <g class="chart-point-group" data-label="${e.label}" data-count="${e.count}">
      <circle cx="${u(t)}" cy="${d(e.count)}" r="4" fill="var(--text-primary)" opacity="0" class="chart-dot" style="transition: opacity 0.15s ease, r 0.15s ease;"/>
      <circle cx="${u(t)}" cy="${d(e.count)}" r="16" fill="transparent" class="chart-hitbox" style="cursor: pointer;"/>
    </g>
  `).join(``)}
        ${_}
      </svg>
      <div id="chart-tooltip" style="position:absolute;pointer-events:none;display:none;
        background:var(--bg-primary);border:1px solid var(--border-strong);
        padding:4px 10px;font-family:var(--font-ui);font-size:0.78rem;
        color:var(--text-primary);border-radius:2px;box-shadow: 0 2px 8px rgba(0,0,0,0.1);z-index: 10;"></div>
    </div>
  `}function u(e,t){let n={};e.forEach(e=>{n[e.label]=e.count});let r=[],i=new Date;for(let e=t-1;e>=0;e--){let t=new Date(i);t.setDate(t.getDate()-e);let a=t.toISOString().slice(0,10);r.push({label:a,count:n[a]||0})}return r}function d(e){return!e||e.length!==2?`🌍`:String.fromCodePoint(...e.toUpperCase().split(``).map(e=>127397+e.charCodeAt(0)))}var f={meta:{title:`Analytics — Admin`},async render(t){t.innerHTML=e(`
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
          ${[7,30,90].map(e=>`<button class="period-btn" data-days="${e}"
              style="padding:0.35rem 0.9rem;border:1px solid var(--border-strong);border-radius:2px;
                     font-size:0.8rem;font-family:var(--font-ui);cursor:pointer;
                     background:${e===30?`var(--border-strong)`:`transparent`};
                     color:var(--text-primary);transition:background var(--transition-fast);"
            >${e===7?`7 dias`:e===30?`30 dias`:`90 dias`}</button>`).join(``)}
        </div>

        <!-- KPI cards (Skeletons initial state) -->
        <div id="kpi-row" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:var(--space-md);margin-bottom:var(--space-xl);">
          ${[,,,,,,].fill(0).map(()=>`
            <div class="skeleton-pulse" style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;">
              <div style="height:2rem;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;width:60%;"></div>
              <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:40%;"></div>
            </div>
          `).join(``)}
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
              ${[,,,,,].fill(0).map(()=>`
                <div style="margin-bottom:var(--space-sm);">
                  <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                    <div style="height:0.82rem;width:50%;background:var(--border-subtle);border-radius:2px;"></div>
                    <div style="height:0.82rem;width:15%;background:var(--border-subtle);border-radius:2px;"></div>
                  </div>
                  <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
                </div>
              `).join(``)}
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
            ${[,,,,].fill(0).map(()=>`
              <div style="margin-bottom:var(--space-sm);">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <div style="height:0.82rem;width:40%;background:var(--border-subtle);border-radius:2px;"></div>
                  <div style="height:0.82rem;width:20%;background:var(--border-subtle);border-radius:2px;"></div>
                </div>
                <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
              </div>
            `).join(``)}
          </div>
        </div>
      </div>
    `);let n=30;t.querySelectorAll(`.period-btn`).forEach(e=>{e.addEventListener(`click`,()=>{t.querySelectorAll(`.period-btn`).forEach(e=>{e.style.background=`transparent`}),e.style.background=`var(--border-strong)`,n=parseInt(e.dataset.days),this.showSkeletons(t),this.loadData(t,n)})}),await this.loadData(t,n)},showSkeletons(t){let n=t.querySelector(`#kpi-row`),r=t.querySelector(`#chart-area`),i=t.querySelector(`#top-poems`),a=t.querySelector(`#hourly-heatmap`),o=t.querySelector(`#countries`);n.innerHTML=e([,,,,,,].fill(0).map(()=>`
      <div class="skeleton-pulse" style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;">
        <div style="height:2rem;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;width:60%;"></div>
        <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:40%;"></div>
      </div>
    `).join(``)),r.className=`skeleton-pulse`,r.style.height=`160px`,r.style.background=`var(--border-subtle)`,r.style.borderRadius=`2px`,r.innerHTML=``,i.className=`skeleton-pulse`,i.innerHTML=e([,,,,,].fill(0).map(()=>`
      <div style="margin-bottom:var(--space-sm);">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <div style="height:0.82rem;width:50%;background:var(--border-subtle);border-radius:2px;"></div>
          <div style="height:0.82rem;width:15%;background:var(--border-subtle);border-radius:2px;"></div>
        </div>
        <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
      </div>
    `).join(``)),a.className=`skeleton-pulse`,a.innerHTML=e(`
      <div style="height:80px;background:var(--border-subtle);border-radius:2px;margin-bottom:8px;"></div>
      <div style="height:0.75rem;background:var(--border-subtle);border-radius:2px;width:100%;"></div>
    `),o.className=`skeleton-pulse`,o.innerHTML=e([,,,,].fill(0).map(()=>`
      <div style="margin-bottom:var(--space-sm);">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <div style="height:0.82rem;width:40%;background:var(--border-subtle);border-radius:2px;"></div>
          <div style="height:0.82rem;width:20%;background:var(--border-subtle);border-radius:2px;"></div>
        </div>
        <div style="height:3px;background:var(--border-subtle);border-radius:2px;"></div>
      </div>
    `).join(``))},async loadData(f,p){let m=new Date;m.setDate(m.getDate()-p);let h=m.toISOString(),g=[],_=null;try{let e=a(s(c,`page_views`),n(`created_at`,`>=`,h),o(`created_at`,`desc`),i(5e3));(await r(e)).forEach(e=>g.push(e.data()))}catch(e){_=e}if(_){f.querySelector(`#chart-area`).innerHTML=e(`<p style="color:var(--error)">${t(_.message)}</p>`);return}let v=g.length,y={};g.forEach(e=>{e.ip_hash&&(y[e.ip_hash]=(y[e.ip_hash]||0)+1)});let b=Object.keys(y).length,x=Object.values(y).filter(e=>e>1).length,S=b>0?Math.round(x/b*100):0,C=new Date().toISOString().slice(0,10),w=g.filter(e=>e.created_at.slice(0,10)===C).length,T=g.filter(e=>e.poem_id).length,E=b>0?(T/b).toFixed(1):`0.0`,D=f.querySelector(`#kpi-row`),O=(e,t,n=``)=>`
      <div style="padding:var(--space-md);border:1px solid var(--border-subtle);border-radius:2px;background:var(--bg-card);">
        <div style="font-size:1.8rem;font-family:var(--font-display);color:var(--text-primary);line-height:1.2;">${t}</div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;text-transform:uppercase;letter-spacing:1px;font-weight:500;">${e}</div>
        ${n?`<div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">${n}</div>`:``}
      </div>
    `;D.innerHTML=e(O(`Visitas totais`,v)+O(`Visitas hoje`,w)+O(`IPs únicos`,b)+O(`Lidos`,T,`Poemas visualizados`)+O(`Retorno`,`${S}%`,`Visitantes recorrentes`)+O(`Poemas/visita`,E,`Média de leitura`));let k={};g.forEach(e=>{let t=e.created_at.slice(0,10);k[t]=(k[t]||0)+1});let A=u(Object.entries(k).map(([e,t])=>({label:e,count:t})),p),j=f.querySelector(`#chart-area`);j.className=``,j.style=``,j.innerHTML=e(l(A));let M=f.querySelector(`#chart-tooltip`),N=j.querySelector(`svg`);M&&N&&j.querySelectorAll(`.chart-point-group`).forEach(e=>{let t=e.querySelector(`.chart-dot`);e.addEventListener(`mouseenter`,()=>{t&&(t.style.opacity=`1`,t.style.r=`6`),M.style.display=`block`,M.textContent=`${e.dataset.label}: ${e.dataset.count} visita(s)`}),e.addEventListener(`mousemove`,e=>{let t=N.getBoundingClientRect(),n=e.clientX-t.left,r=e.clientY-t.top;M.style.left=n+12+`px`,M.style.top=r-32+`px`}),e.addEventListener(`mouseleave`,()=>{t&&(t.style.opacity=`0`,t.style.r=`4`),M.style.display=`none`})});let P={};g.filter(e=>e.poem_id).forEach(e=>{let t=e.page;P[t]=(P[t]||0)+1});let F=Object.entries(P).sort((e,t)=>t[1]-e[1]).slice(0,5),I=f.querySelector(`#top-poems`);if(I.className=``,F.length===0)I.innerHTML=e(`<p style="color:var(--text-muted);font-size:0.85rem;padding:var(--space-md) 0;">Sem leituras registradas.</p>`);else{let n=F[0][1];I.innerHTML=e(F.map(([e,r])=>`
        <div style="margin-bottom:var(--space-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-size:0.82rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;" title="${t(e)}">${t(e.replace(`/poema/`,``))}</span>
            <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500;">${r}</span>
          </div>
          <div style="height:3px;background:var(--border-subtle);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${Math.round(r/n*100)}%;background:var(--text-primary);border-radius:2px;"></div>
          </div>
        </div>
      `).join(``))}let L=Array(24).fill(0);g.forEach(e=>{let t=new Date(e.created_at).getHours();t>=0&&t<24&&L[t]++});let R=Math.max(...L,1),z=f.querySelector(`#hourly-heatmap`);z.className=``,z.innerHTML=e(`
      <div style="display:flex;align-items:flex-end;justify-content:space-between;height:84px;padding:var(--space-sm) 0 4px;border-bottom:1px solid var(--border-subtle);margin-bottom:8px;">
        ${L.map((e,t)=>{let n=Math.round(e/R*100),r=e===R&&e>0;return`
            <div style="flex:1;display:flex;flex-direction:column;align-items:center;height:100%;justify-content:flex-end;margin:0 1px;" title="${t}h: ${e} visitas">
              <div style="width:100%;height:${n}%;background:${r?`var(--text-primary)`:`var(--text-muted)`};opacity:${r?`1`:`0.45`};border-radius:1px 1px 0 0;min-height:${e>0?`2px`:`0`};transition:all 0.2s ease;"></div>
            </div>
          `}).join(``)}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-muted);font-family:var(--font-ui);">
        <span>00h</span>
        <span>06h</span>
        <span>12h</span>
        <span>18h</span>
        <span>23h</span>
      </div>
    `);let B={};g.filter(e=>e.country).forEach(e=>{B[e.country]=(B[e.country]||0)+1});let V=Object.entries(B).sort((e,t)=>t[1]-e[1]).slice(0,5),H=f.querySelector(`#countries`);if(H.className=``,V.length===0)H.innerHTML=e(`<p style="color:var(--text-muted);font-size:0.85rem;padding:var(--space-md) 0;">Sem dados de país locais. Métricas geográficas detalhadas disponíveis no Microsoft Clarity.</p>`);else{let n=V[0][1];H.innerHTML=e(V.map(([e,r])=>{let i=v>0?Math.round(r/v*100):0,a=t(e);return`
          <div style="margin-bottom:var(--space-md);">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <span style="font-size:0.82rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
                <span style="font-size:1.1rem;line-height:1;">${d(e)}</span>
                <span style="text-transform:uppercase;font-weight:500;">${a}</span>
              </span>
              <span style="font-size:0.82rem;color:var(--text-primary);font-weight:500;">
                ${r} <span style="color:var(--text-muted);font-weight:normal;font-size:0.75rem;margin-left:4px;">(${i}%)</span>
              </span>
            </div>
            <div style="height:3px;background:var(--border-subtle);border-radius:2px;overflow:hidden;">
              <div style="height:100%;width:${Math.round(r/n*100)}%;background:var(--text-primary);border-radius:2px;"></div>
            </div>
          </div>
        `}).join(``))}}};export{f as default};