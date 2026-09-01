import{a as e,c as t,d as n,f as r,s as i}from"./index.esm-C77q4Vsq.js";import{n as a}from"./index-5Z0EvPl5.js";import{db as o}from"./firebase-DbnQPwBn.js";import{n as s,r as c,t as l}from"./filter-chips-B2irCICN.js";import{t as u}from"./seo-BF0uIWTH.js";import{t as d}from"./newsletter-2RAkzR_l.js";var f={meta:{title:`Natanael Brentano - Poemas`},cleanup(){},async render(f,p={}){let m=p.tags?p.tags.split(`,`):[],h=p.cols?p.cols.split(`,`):[],g=p.tag?[decodeURIComponent(p.tag)]:[],_=[...new Set([...m,...g])],v=`Natanael Brentano — Poemas`;if(_.length>0||h.length>0){let e=[];_.length>0&&e.push(`Sentimentos: ${_.join(`, `)}`),h.length>0&&e.push(`Coleções: ${h.join(`, `)}`),v=`${e.join(` | `)} — Natanael Brentano`}u({title:v,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`});let y=document.querySelector(`script[id="website-schema"]`);y||(y=document.createElement(`script`),y.id=`website-schema`,y.type=`application/ld+json`,y.textContent=JSON.stringify({"@context":`https://schema.org`,"@type":`WebSite`,url:`https://nfbrentano.github.io/poemas/`,name:`Poemas — Natanael Brentano`,potentialAction:{"@type":`SearchAction`,target:`https://nfbrentano.github.io/poemas/?q={search_term_string}`,"query-input":`required name=search_term_string`}}),document.head.appendChild(y));let b=_.length>0||h.length>0;f.innerHTML=`
      <div class="home-layout">
        ${b?``:`
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
    `;let x=[],S=null;try{let a=t(r(o,`poems`),n(`status`,`==`,`published`),i(`published_at`,`desc`));x=(await e(a)).docs.map(e=>({id:e.id,...e.data()}))}catch(e){S=e}if(S){console.error(S),f.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!x||x.length===0){f.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let C=`/poemas/`,w={};x.forEach(e=>{(e.tags||[]).forEach(e=>{let t=s(e);t&&(w[t]=(w[t]||0)+1)})});let T=Object.entries(w).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);_.forEach(e=>{T.includes(e)||T.push(e)}),T.sort();let E=x;_.length>0&&(E=E.filter(e=>e.tags&&e.tags.some(e=>{let t=c(e).toLowerCase();return _.some(e=>e.toLowerCase()===t)}))),h.length>0&&(E=E.filter(e=>e.collection_slugs&&e.collection_slugs.some(e=>h.includes(e))));let D=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%x.length,O=x[D];b||(E=E.filter((e,t)=>t!==D));let k=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado${n?` para "<strong>${n}</strong>"`:``}.
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});return!t&&!b&&n===0?`
          <article class="poem-featured fade-in">
            <a href="${C}poema/${e.slug}" data-link>
              <h2 class="featured-title">${e.title}</h2>
              <div class="featured-excerpt">${e.excerpt||``}</div>
              <div class="featured-meta">
                <span>${i}</span>
              </div>
            </a>
            <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="whatsapp" data-slug="${e.slug}" data-title="${e.title}">WhatsApp</button>
              <button class="featured-share-btn btn-secondary btn-sm" data-platform="twitter" data-slug="${e.slug}" data-title="${e.title}">X (Twitter)</button>
            </div>
            <div class="featured-separator"></div>
          </article>
          `:`
        <article class="poem-row fade-in">
          <a href="${C}poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${e.title}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``);f.innerHTML=`
      <div class="home-layout">
        
        ${!b&&O?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${C}poema/${O.slug}" data-link class="pod-link">
            <h2 class="pod-title">${O.title}</h2>
            <p class="pod-excerpt">${O.excerpt||``}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${l.render(_)}
          </div>
          
          ${b?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${k(E)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${d.render()}
      </div>
    `,d.init(),await l.init(f,_,x),f.querySelectorAll(`.featured-share-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let{platform:n,slug:r,title:i}=e.dataset,a=`${window.location.origin}/poemas/poema/${r}`,o=`Leia "${i}", de Natanael Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})});let A=e=>{let{query:t,results:n}=e.detail,r=t,i=f.querySelector(`.list-container`);i&&(i.innerHTML=k(n||E,r.length>0,r));let a=f.querySelector(`.poem-of-day`),o=f.querySelector(`.hero-section`);r.length>0?(a&&(a.style.display=`none`),o&&(o.style.display=`none`)):(a&&(a.style.display=`block`),o&&(o.style.display=`block`))};window.addEventListener(`global-search`,A);let j=null,M=f.querySelector(`.pod-title`),N=f.querySelector(`.featured-title`);(M||N)&&(j=()=>{let e=window.scrollY;if(M){let t=Math.min(20,e*.12);M.style.transform=`translateY(${t}px)`}if(N){let t=Math.min(20,e*.08);N.style.transform=`translateY(${t}px)`}},window.addEventListener(`scroll`,j,{passive:!0})),this.cleanup=()=>{window.removeEventListener(`global-search`,A),j&&window.removeEventListener(`scroll`,j)},f.querySelector(`#random-home-btn`)?.addEventListener(`click`,()=>{a()})}};export{f as default};