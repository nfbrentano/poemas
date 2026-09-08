import{_ as e,f as t,g as n,p as r,u as i}from"./vendor-firebase-BaoyJsfj.js";import{n as a}from"./index-Bzky9zOq.js";import{db as o}from"./firebase-DvthlrAF.js";import{r as s,t as c}from"./html-Ca31mHym.js";import{n as l,r as u,t as d}from"./filter-chips-BasUVfeE.js";import{t as f}from"./seo-D_q09apR.js";import{t as p}from"./newsletter-DiagHaDd.js";var m={meta:{title:`Natanael Brentano - Poemas`},cleanup(){},async render(m,h={}){let g=h.tags?h.tags.split(`,`):[],_=h.cols?h.cols.split(`,`):[],v=h.tag?[decodeURIComponent(h.tag)]:[],y=[...new Set([...g,...v])],b=`Natanael Brentano — Poemas`;if(y.length>0||_.length>0){let e=[];y.length>0&&e.push(`Sentimentos: ${y.join(`, `)}`),_.length>0&&e.push(`Coleções: ${_.join(`, `)}`),b=`${e.join(` | `)} — Natanael Brentano`}f({title:b,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`});let x=document.querySelector(`script[id="website-schema"]`);x||(x=document.createElement(`script`),x.id=`website-schema`,x.type=`application/ld+json`,x.textContent=JSON.stringify({"@context":`https://schema.org`,"@type":`WebSite`,url:`https://nfgbrentano.art.br/`,name:`Poemas — Natanael Brentano`,potentialAction:{"@type":`SearchAction`,target:`https://nfgbrentano.art.br/?q={search_term_string}`,"query-input":`required name=search_term_string`}}),document.head.appendChild(x));let S=y.length>0||_.length>0;m.innerHTML=`
      <div class="home-layout">
        ${S?``:`
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
    `;let C=[],w=null;try{let a=r(e(o,`poems`),n(`status`,`==`,`published`),t(`published_at`,`desc`));C=(await i(a)).docs.map(e=>({id:e.id,...e.data()}))}catch(e){w=e}if(w){console.error(w),m.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!C||C.length===0){m.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let T={};C.forEach(e=>{(e.tags||[]).forEach(e=>{let t=l(e);t&&(T[t]=(T[t]||0)+1)})});let E=Object.entries(T).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);y.forEach(e=>{E.includes(e)||E.push(e)}),E.sort();let D=C;y.length>0&&(D=D.filter(e=>e.tags&&e.tags.some(e=>{let t=u(e).toLowerCase();return y.some(e=>e.toLowerCase()===t)}))),_.length>0&&(D=D.filter(e=>e.collection_slugs&&e.collection_slugs.some(e=>_.includes(e))));let O=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%C.length,k=C[O];S||(D=D.filter((e,t)=>t!==O));let A=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado${n?` para "<strong>${n}</strong>"`:``}.
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});if(!t&&!S&&n===0){let t=e.excerpt||s(e.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;return`
          <article class="poem-featured fade-in">
            <a href="/poema/${e.slug}" data-link>
              <h2 class="featured-title">${c(e.title)}</h2>
              <div class="featured-excerpt">${c(t)}</div>
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
          `}return`
        <article class="poem-row fade-in">
          <a href="/poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${c(e.title)}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``),j=k?k.excerpt||s(k.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`:``;m.innerHTML=`
      <div class="home-layout">
        
        ${!S&&k?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="/poema/${k.slug}" data-link class="pod-link">
            <h2 class="pod-title">${c(k.title)}</h2>
            <p class="pod-excerpt">${c(j)}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${d.render(y)}
          </div>
          
          ${S?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${A(D)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${p.render()}
      </div>
    `,p.init(),await d.init(m,y,C),m.querySelectorAll(`.featured-share-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let{platform:n,slug:r,title:i}=e.dataset,a=`${window.location.origin}/poema/${r}`,o=`Leia "${i}", de Natanael Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})});let M=e=>{let{query:t,results:n}=e.detail,r=t,i=m.querySelector(`.list-container`);i&&(i.innerHTML=A(n||D,r.length>0,r));let a=m.querySelector(`.poem-of-day`),o=m.querySelector(`.hero-section`);r.length>0?(a&&(a.style.display=`none`),o&&(o.style.display=`none`)):(a&&(a.style.display=`block`),o&&(o.style.display=`block`))};window.addEventListener(`global-search`,M);let N=null,P=m.querySelector(`.pod-title`),F=m.querySelector(`.featured-title`);(P||F)&&(N=()=>{let e=window.scrollY;if(P){let t=Math.min(20,e*.12);P.style.transform=`translateY(${t}px)`}if(F){let t=Math.min(20,e*.08);F.style.transform=`translateY(${t}px)`}},window.addEventListener(`scroll`,N,{passive:!0})),this.cleanup=()=>{window.removeEventListener(`global-search`,M),N&&window.removeEventListener(`scroll`,N)},m.querySelector(`#random-home-btn`)?.addEventListener(`click`,()=>{a()})}};export{m as default};