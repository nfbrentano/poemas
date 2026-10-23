const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BZJzOh7M.css"])))=>i.map(i=>d[i]);
import{C as e,T as t,_ as n,b as r,g as i,i as a,v as o,w as s}from"./index-3IBTfuIH.js";import{_ as c,f as l,g as u,p as d,u as f}from"./vendor-firebase-vW9DHoZS.js";import{t as p}from"./firebase-DJUlHAWI.js";import{t as m}from"./filter-chips-snym_t2Y.js";import{t as h}from"./newsletter-DysXpQEz.js";function g(e){return function(){var t=e+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function _(e){let t=2166136261;for(let n=0;n<e.length;n++)t^=e.charCodeAt(n),t=Math.imul(t,16777619);return t>>>0}function v(e,t=new Date){if(!e||e.length===0)return null;let n=new Intl.DateTimeFormat(`en-CA`,{timeZone:`America/Sao_Paulo`,year:`numeric`,month:`2-digit`,day:`2-digit`}).format(t),r=[...e].sort((e,t)=>{let n=e.slug||e.id||``,r=t.slug||t.id||``;return n.localeCompare(r)}),i=g(_(n+`5`))();return r[Math.floor(i*r.length)]}var y={meta:{title:`Poemas Brasileiros — Natanael Fernando Gatti Brentano`},cleanup(){this.meta={title:`Poemas Brasileiros — Natanael Fernando Gatti Brentano`}},async render(g,_={}){let y=_.tags?_.tags.split(`,`):[],b=_.cols?_.cols.split(`,`):[],x=_.tag?[decodeURIComponent(_.tag)]:[],S=[...new Set([...y,...x])],C=new URLSearchParams(window.location.search),w=S.length>0||b.length>0||!!_.q||!!_.busca||C.has(`tags`)||C.has(`cols`)||C.has(`tag`)||C.has(`q`)||C.has(`busca`)||C.has(`page`);this.meta={title:`Poemas Brasileiros — Natanael Fernando Gatti Brentano`,robots:w?`noindex, follow`:null};let T=`Poemas Brasileiros — Natanael Fernando Gatti Brentano`;if(S.length>0||b.length>0){let e=[];S.length>0&&e.push(`Sentimentos: ${S.join(`, `)}`),b.length>0&&e.push(`Coleções: ${b.join(`, `)}`),T=`${e.join(` | `)} — Natanael Fernando Gatti Brentano`}a({title:T,description:`Poemas e poesia contemporânea de Natanael Fernando Gatti Brentano. Uma coleção de versos originais em português sobre amor, tempo, efêmero e o cotidiano.`,url:`https://nfgbrentano.art.br/`,type:`website`,robots:w?`noindex, follow`:null,structuredData:w?[]:[i()]});let E=S.length>0||b.length>0,D=g.getAttribute(`data-prerendered`)===`/`&&!E,O=`
      <section class="home-hero fade-in">
        <h1 class="home-title">Poemas de Natanael Fernando Gatti Brentano</h1>
        <p class="home-description">
          Poesia brasileira contemporânea em língua portuguesa. Reflexões sobre o tempo, o amor, a efemeridade e a beleza das coisas simples do cotidiano. O acervo reúne mais de 200 poemas publicados em coleções temáticas. Conheça as <a href="/colecoes/" data-link>coleções temáticas</a> e saiba mais <a href="/sobre/" data-link>sobre o autor</a>.
        </p>
      </section>
    `,k=`
      <div class="home-layout">
        ${O}
        ${E?``:`
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
    `;D||(g.innerHTML=k);let A=[],j=null;try{let e=d(c(p,`poems`),u(`status`,`==`,`published`),l(`published_at`,`desc`));A=(await f(e)).docs.map(e=>({id:e.id,...e.data()}))}catch(e){j=e}if(j){console.error(j),g.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!A||A.length===0){g.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let M={};A.forEach(e=>{(e.tags||[]).forEach(e=>{let t=n(e);t&&(M[t]=(M[t]||0)+1)})});let N=Object.entries(M).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);S.forEach(e=>{N.includes(e)||N.push(e)}),N.sort();let P=A;S.length>0&&(P=P.filter(e=>e.tags&&e.tags.some(e=>{let t=o(e).toLowerCase();return S.some(e=>e.toLowerCase()===t)}))),b.length>0&&(P=P.filter(e=>e.collection_slugs&&e.collection_slugs.some(e=>b.includes(e))));let F=v(A);!E&&F&&(P=P.filter(e=>e.id!==F.id));let I=parseInt(sessionStorage.getItem(`home_poem_limit`),10)||20,L=(e,t,n)=>{if(n||e===0)return``;let r=Math.min(t,e);return r>=e?`<p class="pagination-status" style="text-align: center; color: var(--text-muted); font-size: 0.85rem; margin-top: var(--space-lg);">Mostrando ${e} de ${e}</p>`:`
        <div class="pagination-controls" style="display: flex; flex-direction: column; align-items: center; gap: var(--space-md); margin-top: var(--space-xl);">
          <button id="load-more-btn" class="btn-secondary">Carregar mais poemas</button>
          <p class="pagination-status" style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">Mostrando ${r} de ${e}</p>
        </div>
      `},R=(t,n=!1,i=``,a=null)=>{if(t.length===0)return`
          <p class="search-empty-msg">
            Nenhum poema encontrado${i?` para "<strong>${r(i)}</strong>"`:``}.
          </p>
        `;let o=a&&!n?t.slice(0,a):t,s=null,c=``;return o.forEach((t,i)=>{let a=new Date(t.published_at).getFullYear(),o=new Date(t.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});if(!n&&!E&&i===0){let n=t.excerpt||e(t.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;c+=`
          <article class="poem-featured fade-in">
            <a href="/poema/${t.slug}/" data-link>
              <h2 class="featured-title">${r(t.title)}</h2>
              <div class="featured-excerpt">${r(n)}</div>
              <div class="featured-meta">
                <span>${o}</span>
              </div>
            </a>
            <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="whatsapp" data-slug="${t.slug}" data-title="${t.title}">WhatsApp</button>
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="twitter" data-slug="${t.slug}" data-title="${t.title}">X (Twitter)</button>
            </div>
            <div class="featured-separator"></div>
          </article>
          `,s=a}else s!==a&&(c+=`<h3 class="year-separator" style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-muted); margin: var(--space-xl) 0 var(--space-md) 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-xs);">${a}</h3>`,s=a),c+=`
          <article class="poem-row fade-in">
            <a href="/poema/${t.slug}/" data-link class="poem-row-link">
              <h3 class="poem-row-title">${r(t.title)}</h3>
              <span class="poem-row-year">${a}</span>
            </a>
          </article>
          `}),c},z=F?F.excerpt||e(F.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`:``;g.innerHTML=`
      <div class="home-layout">
        ${O}
        ${!E&&F?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="/poema/${F.slug}/" data-link class="pod-link">
            <h2 class="pod-title">${r(F.title)}</h2>
            <p class="pod-excerpt">${r(z)}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${m.render(S)}
          </div>
          
          ${E?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${R(P,!1,``,I)}
          </div>
          <div class="pagination-container">
            ${L(P.length,I,!1)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${h.render()}
      </div>
    `,g.removeAttribute(`data-prerendered`),h.init(),await m.init(g,S,A);let B=()=>{g.querySelectorAll(`.featured-share-btn`).forEach(e=>{let t=e.cloneNode(!0);e.parentNode.replaceChild(t,e),t.addEventListener(`click`,e=>{e.preventDefault();let{platform:n,slug:r,title:i}=t.dataset,a=`${window.location.origin}/poema/${r}`,o=`Leia "${i}", de Natanael Fernando Gatti Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})})};B();let V=()=>{let e=g.querySelector(`#load-more-btn`);e&&e.addEventListener(`click`,()=>{I+=20,sessionStorage.setItem(`home_poem_limit`,I);let e=g.querySelector(`.list-container`),t=g.querySelector(`.pagination-container`);e&&(e.innerHTML=R(P,!1,``,I),B()),t&&(t.innerHTML=L(P.length,I,!1),V());let n=e.querySelectorAll(`.poem-row-link, .poem-featured a`),r=I-20;n[r]&&n[r].focus()})};V();let H=e=>{let{query:t,results:n}=e.detail,r=t,i=g.querySelector(`.list-container`),a=g.querySelector(`.pagination-container`),o=r.length>0;i&&(i.innerHTML=R(n||P,o,r,I),B()),a&&(a.innerHTML=L((n||P).length,I,o),V());let s=g.querySelector(`.poem-of-day`),c=g.querySelector(`.home-hero`)||g.querySelector(`.hero-section`);r.length>0?(s&&(s.style.display=`none`),c&&(c.style.display=`none`)):(s&&(s.style.display=`block`),c&&(c.style.display=`block`))};window.addEventListener(`global-search`,H);let U=null,W=g.querySelector(`.pod-title`),G=g.querySelector(`.featured-title`);(W||G)&&(U=()=>{let e=window.scrollY;if(W){let t=Math.min(20,e*.12);W.style.transform=`translateY(${t}px)`}if(G){let t=Math.min(20,e*.08);G.style.transform=`translateY(${t}px)`}},window.addEventListener(`scroll`,U,{passive:!0})),this.cleanup=()=>{window.removeEventListener(`global-search`,H),U&&window.removeEventListener(`scroll`,U)},g.querySelector(`#random-home-btn`)?.addEventListener(`click`,e=>{s(e)}),_.q&&t(async()=>{let{searchOverlay:e}=await import(`./search-overlay-I9eCt9SZ.js`);return{searchOverlay:e}},__vite__mapDeps([0])).then(({searchOverlay:e})=>{e.open(_.q)})}};export{y as default};