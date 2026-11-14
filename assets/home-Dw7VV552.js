const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DeJaqZLU.css"])))=>i.map(i=>d[i]);
import{a as e,i as t,t as n}from"./html-DUzinkfe.js";import{C as r,S as i,b as a,n as o,o as s,t as c,v as l,x as u,y as d}from"./index-BNfYksz6.js";import{t as f}from"./poems-store-DqDF5aZD.js";import{t as p}from"./favorites-DfHnCJDr.js";import{t as m}from"./newsletter-DB90I0rG.js";import{n as h}from"./sentiments-BrMyzAOo.js";var g=null,_={async fetchMetadata(e=null){if(g)return{tags:g};let t=e;if(!t)try{t=await f()}catch{t=[]}let n={};t?.forEach(e=>{(e.tags||[]).forEach(e=>{let t=d(e);t&&(n[t]=(n[t]||0)+1)})});let r=Object.keys(n).map(e=>({name:e,count:n[e]})).sort((e,t)=>t.count-e.count).slice(0,20);return r.length>0&&(g=r),{tags:r}},render(e=[]){return`
      <div class="filter-section fade-in">
        <div class="filter-group">
          <span class="filter-label">Sentimentos:</span>
          <div class="filter-chips" id="tag-filters">
            <div id="dynamic-tags" class="filter-chips-scroll">
              <button class="filter-chip ${e.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>
            </div>
          </div>
        </div>
      </div>
    `},async init(t,r=[],i=null){let{tags:a}=await this.fetchMetadata(i),s=t.querySelector(`#dynamic-tags`);if(s){let t=`<button class="filter-chip ${r.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>`;s.innerHTML=e(t+a.map(e=>`
        <button class="filter-chip ${r.includes(e.name)?`active`:``}" data-type="tag" data-value="${n(e.name)}">
          ${n(e.name)} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em; margin-left: 2px;">(${Number(e.count)})</span>
        </button>
      `).join(``))}t.querySelectorAll(`.filter-chip`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.value,n=[...r];if(t===`all`)n=[];else{let e=n.indexOf(t);e>-1?n.splice(e,1):n.push(t)}let i=new URLSearchParams(window.location.search);n.length>0?i.set(`tags`,n.join(`,`)):i.delete(`tags`);let a=i.toString(),s=`/`.replace(/\/$/,``),c=window.location.pathname.replace(s,``)||`/`;o(c+(a?`?${a}`:``))})});let l=t.querySelector(`.filter-chip.active`);l&&s&&setTimeout(()=>{let e=s.getBoundingClientRect(),t=l.getBoundingClientRect().left-e.left-20;t!==0&&typeof s.scrollBy==`function`&&s.scrollBy({left:t,behavior:c()})},50)}};function v(e){return function(){var t=e+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function y(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function b(e,t=new Date){if(!e||e.length===0)return null;let n=new Intl.DateTimeFormat(`en-CA`,{timeZone:`America/Sao_Paulo`,year:`numeric`,month:`2-digit`,day:`2-digit`}).format(t),r=[...e].sort((e,t)=>{let n=e.slug||e.id||``,r=t.slug||t.id||``;return n.localeCompare(r)}),i=v(y(n+`5`))();return r[Math.floor(i*r.length)]}var x={meta:{title:`Poemas Brasileiros — Natanael Fernando Gatti Brentano`},cleanup(){this.meta={title:`Poemas Brasileiros — Natanael Fernando Gatti Brentano`}},async render(o,c={}){let g=c.tags?c.tags.split(`,`):[],v=c.cols?c.cols.split(`,`):[],y=c.tag?[decodeURIComponent(c.tag)]:[],x=[...new Set([...g,...y])],S=new URLSearchParams(window.location.search),C=x.length>0||v.length>0||!!c.q||!!c.busca||S.has(`tags`)||S.has(`cols`)||S.has(`tag`)||S.has(`q`)||S.has(`busca`)||S.has(`page`);this.meta={title:`Poemas Brasileiros — Natanael Fernando Gatti Brentano`,robots:C?`noindex, follow`:null};let w=`Poemas Brasileiros — Natanael Fernando Gatti Brentano`;if(x.length>0||v.length>0){let e=[];x.length>0&&e.push(`Sentimentos: ${x.join(`, `)}`),v.length>0&&e.push(`Coleções: ${v.join(`, `)}`),w=`${e.join(` | `)} — Natanael Fernando Gatti Brentano`}s({title:w,description:`Poemas e poesia contemporânea de Natanael Fernando Gatti Brentano. Uma coleção de versos originais em português sobre amor, tempo, efêmero e o cotidiano.`,url:`https://nfgbrentano.art.br/`,type:`website`,robots:C?`noindex, follow`:null,structuredData:C?[]:[l()]});let T=x.length>0||v.length>0,E=o.getAttribute(`data-prerendered`)===`/`&&!T,D=`
      <section class="home-hero fade-in">
        <h1 class="home-title">Poemas de Natanael Fernando Gatti Brentano</h1>
        <p class="home-description">
          Poesia brasileira contemporânea em língua portuguesa. Reflexões sobre o tempo, o amor, a efemeridade e a beleza das coisas simples do cotidiano. O acervo reúne mais de 200 poemas publicados em coleções temáticas. Conheça as <a href="/colecoes/" data-link>coleções temáticas</a>, explore por <a href="/sentimentos/" data-link>sentimentos</a> e saiba mais <a href="/sobre/" data-link>sobre o autor</a>.
        </p>
      </section>
    `,O=`
      <div class="home-layout">
        ${D}
        ${T?``:`
        <section class="poem-of-day" aria-hidden="true" style="min-height: 180px;">
          <div class="skeleton" style="width: 140px; height: 14px; margin: 0 auto var(--space-sm) auto; border-radius: 4px;"></div>
          <div class="skeleton" style="width: 50%; max-width: 320px; height: 28px; margin: 0 auto var(--space-sm) auto; border-radius: 4px;"></div>
          <div class="skeleton" style="width: 75%; max-width: 480px; height: 20px; margin: 0 auto; border-radius: 4px;"></div>
        </section>
        `}

        <section class="poems-list" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            <div class="filter-section">
              <div class="filter-group">
                <span class="filter-label">Sentimentos:</span>
                <div class="filter-chips">
                  <div class="skeleton" style="width: 65px; height: 32px; border-radius: 20px; display: inline-block;"></div>
                  <div class="skeleton" style="width: 80px; height: 32px; border-radius: 20px; display: inline-block;"></div>
                  <div class="skeleton" style="width: 70px; height: 32px; border-radius: 20px; display: inline-block;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="list-container">
            <div class="skeleton skeleton-featured"></div>
            ${Array(8).fill(0).map(()=>`
              <div class="skeleton-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                <div class="skeleton" style="width: 45%; height: 22px; border-radius: 3px;"></div>
                <div class="skeleton" style="width: 45px; height: 22px; border-radius: 3px;"></div>
              </div>
            `).join(``)}
          </div>
        </section>
      </div>
    `;E||(o.innerHTML=e(O));let k=[],A=null;try{k=await f()}catch(e){A=e}if(A){if(console.error(A),r(async()=>{let{reportError:e}=await import(`./index-BNfYksz6.js`).then(e=>e.r);return{reportError:e}},__vite__mapDeps([0])).then(({reportError:e})=>e(A,{category:`firestore`,severity:`error`,route_or_task:`/`,context:{action:`home_getPublishedPoems`}})).catch(()=>{}),E){o.removeAttribute(`data-prerendered`);return}o.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!k||k.length===0){if(E){o.removeAttribute(`data-prerendered`);return}o.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let j={},M=new Map;k.forEach(e=>{(e.tags||[]).forEach(e=>{let t=d(e);t&&(j[t]=(j[t]||0)+1);let n=u(e);n&&(M.has(n)||M.set(n,{slug:n,name:h(n,t||d(e)),count:0}),M.get(n).count+=1)})});let N=Array.from(M.values()).filter(e=>e.count>=3).sort((e,t)=>t.count-e.count||e.name.localeCompare(t.name)),P=Object.entries(j).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);x.forEach(e=>{P.includes(e)||P.push(e)}),P.sort();let F=k;x.length>0&&(F=F.filter(e=>e.tags&&e.tags.some(e=>{let t=a(e).toLowerCase();return x.some(e=>e.toLowerCase()===t)}))),v.length>0&&(F=F.filter(e=>e.collection_slugs&&e.collection_slugs.some(e=>v.includes(e))));let I=b(k);!T&&I&&(F=F.filter(e=>e.id!==I.id));let L=parseInt(sessionStorage.getItem(`home_poem_limit`),10)||20,R=(e,t,n)=>{if(n||e===0)return``;let r=Math.min(t,e);return r>=e?`<p class="pagination-status" style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: var(--space-lg);">Mostrando ${e} de ${e}</p>`:`
        <div class="pagination-controls" style="display: flex; flex-direction: column; align-items: center; gap: var(--space-md); margin-top: var(--space-xl);">
          <button id="load-more-btn" class="btn-secondary">Carregar mais poemas</button>
          <p class="pagination-status" style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">Mostrando ${r} de ${e}</p>
        </div>
      `},z=(e,r=!1,i=``,a=null)=>{if(e.length===0)return`
          <p class="search-empty-msg">
            Nenhum poema encontrado${i?` para "<strong>${n(i)}</strong>"`:``}.
          </p>
        `;let o=a&&!r?e.slice(0,a):e,s=p(),c=null,l=``;return o.forEach((e,i)=>{let a=s.has(e.slug)||e.id&&s.has(e.id)?` <span class="favorite-badge" aria-label="Poema favoritado" title="Poema favoritado">🔖</span>`:``,o=new Date(e.published_at).getFullYear(),u=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});if(!r&&!T&&i===0){let r=e.excerpt||t(e.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;l+=`
          <article class="poem-featured fade-in">
            <a href="/poema/${e.slug}/" data-link>
              <h2 class="featured-title">${n(e.title)}${a}</h2>
              <div class="featured-excerpt">${n(r)}</div>
              <div class="featured-meta">
                <span>${u}</span>
              </div>
            </a>
            <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="whatsapp" data-slug="${e.slug}" data-title="${e.title}">WhatsApp</button>
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="twitter" data-slug="${e.slug}" data-title="${e.title}">X (Twitter)</button>
            </div>
            <div class="featured-separator"></div>
          </article>
          `,c=o}else c!==o&&(l+=`<h3 class="year-separator" style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-muted); margin: var(--space-xl) 0 var(--space-md) 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-xs);">${o}</h3>`,c=o),l+=`
          <article class="poem-row fade-in">
            <a href="/poema/${e.slug}/" data-link class="poem-row-link">
              <h3 class="poem-row-title">${n(e.title)}${a}</h3>
              <span class="poem-row-year">${o}</span>
            </a>
          </article>
          `}),l},B=()=>T||k.length===0?``:`
        <details class="home-archive-index" style="margin-top: var(--space-2xl); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
          <summary style="cursor: pointer; font-family: var(--font-ui); font-size: 0.9rem; color: var(--text-muted); text-align: center; list-style: none;">
            Explorar índice completo do acervo (${k.length} poemas${N.length>0?` e ${N.length} sentimentos`:``})
          </summary>
          <div class="archive-index-body" style="margin-top: var(--space-lg);">
            ${N.length>0?`
            <div class="archive-sentiments-block" style="margin-bottom: var(--space-xl);">
              <h2 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: var(--space-sm);">Sentimentos e Temas</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                <a href="/sentimentos/" data-link class="filter-chip">Todos os sentimentos</a>
                ${N.map(e=>`<a href="/sentimento/${n(e.slug)}/" data-link class="filter-chip">${n(e.name)} (${e.count})</a>`).join(``)}
              </div>
            </div>
            `:``}
            <div class="archive-poems-block">
              <h2 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: var(--space-sm);">Todos os Poemas Publicados</h2>
              <ul style="list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.5rem 1rem; padding: 0;">
                ${k.map(e=>`<li><a href="/poema/${n(e.slug)}/" data-link style="font-size: 0.9rem; color: var(--text-secondary);">${n(e.title)}</a></li>`).join(``)}
              </ul>
            </div>
          </div>
        </details>
      `,V=I?I.excerpt||t(I.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`:``,H=p(),U=I&&(H.has(I.slug)||I.id&&H.has(I.id))?` <span class="favorite-badge" aria-label="Poema favoritado" title="Poema favoritado">🔖</span>`:``;o.innerHTML=e(`
      <div class="home-layout">
        ${D}
        ${!T&&I?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="/poema/${I.slug}/" data-link class="pod-link">
            <h2 class="pod-title">${n(I.title)}${U}</h2>
            <p class="pod-excerpt">${n(V)}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${_.render(x)}
            <div style="margin-top: var(--space-xs); text-align: right;">
              <a href="/sentimentos/" data-link style="font-size: 0.85rem; color: var(--text-muted); text-decoration: underline;">Ver todos os sentimentos →</a>
            </div>
          </div>
          
          ${T?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${z(F,!1,``,L)}
          </div>
          <div class="pagination-container">
            ${R(F.length,L,!1)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
          ${B()}
        </section>
        
        ${m.render()}
      </div>
    `),o.removeAttribute(`data-prerendered`),m.init(),await _.init(o,x,k);let W=()=>{o.querySelectorAll(`.featured-share-btn`).forEach(e=>{let t=e.cloneNode(!0);e.parentNode.replaceChild(t,e),t.addEventListener(`click`,e=>{e.preventDefault();let{platform:n,slug:r,title:i}=t.dataset,a=`${window.location.origin}/poema/${r}`,o=`Leia "${i}", de Natanael Fernando Gatti Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})})};W();let G=()=>{let t=o.querySelector(`#load-more-btn`);t&&t.addEventListener(`click`,()=>{L+=20,sessionStorage.setItem(`home_poem_limit`,L);let t=o.querySelector(`.list-container`),n=o.querySelector(`.pagination-container`);t&&(t.innerHTML=e(z(F,!1,``,L)),W()),n&&(n.innerHTML=e(R(F.length,L,!1)),G());let r=t.querySelectorAll(`.poem-row-link, .poem-featured a`),i=L-20;r[i]&&r[i].focus()})};G();let K=t=>{let{query:n,results:r}=t.detail,i=n,a=o.querySelector(`.list-container`),s=o.querySelector(`.pagination-container`),c=i.length>0;a&&(a.innerHTML=e(z(r||F,c,i,L)),W()),s&&(s.innerHTML=e(R((r||F).length,L,c)),G());let l=o.querySelector(`.poem-of-day`),u=o.querySelector(`.home-hero`)||o.querySelector(`.hero-section`);i.length>0?(l&&(l.style.display=`none`),u&&(u.style.display=`none`)):(l&&(l.style.display=`block`),u&&(u.style.display=`block`))};window.addEventListener(`global-search`,K);let q=null,J=o.querySelector(`.pod-title`),Y=o.querySelector(`.featured-title`);(J||Y)&&(q=()=>{let e=window.scrollY;if(J){let t=Math.min(20,e*.12);J.style.transform=`translateY(${t}px)`}if(Y){let t=Math.min(20,e*.08);Y.style.transform=`translateY(${t}px)`}},window.addEventListener(`scroll`,q,{passive:!0})),this.cleanup=()=>{window.removeEventListener(`global-search`,K),q&&window.removeEventListener(`scroll`,q)},o.querySelector(`#random-home-btn`)?.addEventListener(`click`,e=>{i(e)}),c.q&&r(async()=>{let{searchOverlay:e}=await import(`./search-overlay-7Ka6vf5a.js`);return{searchOverlay:e}},__vite__mapDeps([0])).then(({searchOverlay:e})=>{e.open(c.q)})}};export{x as default};