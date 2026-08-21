import{o as e,s as t}from"./index-BWGE2Wiv.js";import{n,r,t as i}from"./filter-chips-CFIaS6EL.js";import{t as a}from"./seo-BlITGSmq.js";import{t as o}from"./newsletter-B0DNuzGh.js";var s={meta:{title:`Natanael Brentano - Poemas`},cleanup(){},async render(s,c={}){let l=c.tags?c.tags.split(`,`):[],u=c.cols?c.cols.split(`,`):[],d=c.tag?[decodeURIComponent(c.tag)]:[],f=[...new Set([...l,...d])],p=`Natanael Brentano — Poemas`;if(f.length>0||u.length>0){let e=[];f.length>0&&e.push(`Sentimentos: ${f.join(`, `)}`),u.length>0&&e.push(`Coleções: ${u.join(`, `)}`),p=`${e.join(` | `)} — Natanael Brentano`}a({title:p,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`});let m=document.querySelector(`script[id="website-schema"]`);m||(m=document.createElement(`script`),m.id=`website-schema`,m.type=`application/ld+json`,m.textContent=JSON.stringify({"@context":`https://schema.org`,"@type":`WebSite`,url:`https://nfbrentano.github.io/poemas/`,name:`Poemas — Natanael Brentano`,potentialAction:{"@type":`SearchAction`,target:`https://nfbrentano.github.io/poemas/?q={search_term_string}`,"query-input":`required name=search_term_string`}}),document.head.appendChild(m));let h=f.length>0||u.length>0;s.innerHTML=`
      <div class="home-layout">
        ${h?``:`
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
    `;let{data:g,error:_}=await t.from(`poems`).select(`id, title, slug, excerpt, tags, published_at, collection_poems(collection_id, collections(slug))`).eq(`status`,`published`).order(`published_at`,{ascending:!1});if(_){console.error(_),s.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!g||g.length===0){s.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let v=`/poemas/`,y={};g.forEach(e=>{(e.tags||[]).forEach(e=>{let t=n(e);t&&(y[t]=(y[t]||0)+1)})});let b=Object.entries(y).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);f.forEach(e=>{b.includes(e)||b.push(e)}),b.sort();let x=g;f.length>0&&(x=x.filter(e=>e.tags&&e.tags.some(e=>{let t=r(e).toLowerCase();return f.some(e=>e.toLowerCase()===t)}))),u.length>0&&(x=x.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&u.includes(e.collections.slug))));let S=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%g.length,C=g[S];h||(x=x.filter((e,t)=>t!==S));let w=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado${n?` para "<strong>${n}</strong>"`:``}.
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});return!t&&!h&&n===0?`
          <article class="poem-featured fade-in">
            <a href="${v}poema/${e.slug}" data-link>
              <h2 class="featured-title">${e.title}</h2>
              <div class="featured-excerpt">${e.excerpt||``}</div>
              <div class="featured-meta">
                <span>${i}</span>
              </div>
            </a>
            <div class="featured-actions" style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="featured-share-btn" data-platform="whatsapp" data-slug="${e.slug}" data-title="${e.title}" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Partilhar no Zap</button>
              <button class="featured-share-btn" data-platform="twitter" data-slug="${e.slug}" data-title="${e.title}" style="background: transparent; border: none; color: var(--text-muted); font-size: 0.75rem; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Tweetar</button>
            </div>
            <div class="featured-separator"></div>
          </article>
          `:`
        <article class="poem-row fade-in">
          <a href="${v}poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${e.title}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``);s.innerHTML=`
      <div class="home-layout">
        
        ${!h&&C?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${v}poema/${C.slug}" data-link class="pod-link">
            <h2 class="pod-title">${C.title}</h2>
            <p class="pod-excerpt">${C.excerpt||``}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${i.render(f)}
          </div>
          
          ${h?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${w(x)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${o.render()}
      </div>
    `,o.init(),await i.init(s,f,g),s.querySelectorAll(`.featured-share-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let{platform:n,slug:r,title:i}=e.dataset,a=`${window.location.origin}/poemas/poema/${r}`,o=`Leia "${i}", de Natanael Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})});let T=e=>{let{query:t,results:n}=e.detail,r=t,i=s.querySelector(`.list-container`);i&&(i.innerHTML=w(n||x,r.length>0,r));let a=s.querySelector(`.poem-of-day`),o=s.querySelector(`.hero-section`);r.length>0?(a&&(a.style.display=`none`),o&&(o.style.display=`none`)):(a&&(a.style.display=`block`),o&&(o.style.display=`block`))};window.addEventListener(`global-search`,T);let E=null,D=s.querySelector(`.pod-title`),O=s.querySelector(`.featured-title`);(D||O)&&(E=()=>{let e=window.scrollY;if(D){let t=Math.min(20,e*.12);D.style.transform=`translateY(${t}px)`}if(O){let t=Math.min(20,e*.08);O.style.transform=`translateY(${t}px)`}},window.addEventListener(`scroll`,E,{passive:!0})),this.cleanup=()=>{window.removeEventListener(`global-search`,T),E&&window.removeEventListener(`scroll`,E)},s.querySelector(`#random-home-btn`)?.addEventListener(`click`,()=>{e()})}};export{s as default};