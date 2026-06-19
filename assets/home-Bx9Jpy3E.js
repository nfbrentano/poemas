import{a as e,o as t}from"./index-4B6FpOKk.js";import{n,r,t as i}from"./filter-chips-DIw81z8o.js";import{t as a}from"./seo-Cx_atl1Z.js";import{t as o}from"./newsletter-BWqWIsfW.js";var s={meta:{title:`Natanael Brentano - Poemas`},cleanup(){},async render(s,c={}){let l=c.tags?c.tags.split(`,`):[],u=c.cols?c.cols.split(`,`):[],d=c.tag?[decodeURIComponent(c.tag)]:[],f=[...new Set([...l,...d])],p=`Natanael Brentano — Poemas`;if(f.length>0||u.length>0){let e=[];f.length>0&&e.push(`Sentimentos: ${f.join(`, `)}`),u.length>0&&e.push(`Coleções: ${u.join(`, `)}`),p=`${e.join(` | `)} — Natanael Brentano`}a({title:p,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`}),s.innerHTML=`
      <div class="home-layout fade-in">
        <section class="poems-list">
          <div class="skeleton skeleton-featured"></div>
          ${[,,,,].fill(0).map(()=>`
            <div class="skeleton-row">
              <div class="skeleton skeleton-text" style="width: 50%;"></div>
              <div class="skeleton skeleton-text" style="width: 10%;"></div>
            </div>
          `).join(``)}
        </section>
      </div>
    `;let{data:m,error:h}=await t.from(`poems`).select(`id, title, slug, excerpt, tags, published_at, collection_poems(collection_id, collections(slug))`).eq(`status`,`published`).order(`published_at`,{ascending:!1});if(h){console.error(h),s.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!m||m.length===0){s.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let g=`/poemas/`,_={};m.forEach(e=>{(e.tags||[]).forEach(e=>{let t=n(e);t&&(_[t]=(_[t]||0)+1)})});let v=Object.entries(_).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);f.forEach(e=>{v.includes(e)||v.push(e)}),v.sort();let y=m;f.length>0&&(y=y.filter(e=>e.tags&&e.tags.some(e=>{let t=r(e).toLowerCase();return f.some(e=>e.toLowerCase()===t)}))),u.length>0&&(y=y.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&u.includes(e.collections.slug))));let b=f.length>0||u.length>0,x=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%m.length,S=m[x];b||(y=y.filter((e,t)=>t!==x));let C=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado${n?` para "<strong>${n}</strong>"`:``}.
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});return!t&&!b&&n===0?`
          <article class="poem-featured fade-in">
            <a href="${g}poema/${e.slug}" data-link>
              <h2 class="featured-title">${e.title}</h2>
              <div class="featured-excerpt">${e.excerpt||``}</div>
              <div class="featured-meta">
                <span>${i}</span>
                ${e.tags&&e.tags.length>0?`<span>•</span><span>${e.tags[0]}</span>`:``}
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
          <a href="${g}poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${e.title}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``);s.innerHTML=`
      <div class="home-layout">
        
        ${!b&&S?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${g}poema/${S.slug}" data-link class="pod-link">
            <h2 class="pod-title">${S.title}</h2>
            <p class="pod-excerpt">${S.excerpt||``}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          <div class="discovery-filters" style="margin-bottom: var(--space-xl);">
            ${i.render(f)}
          </div>
          
          ${b?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${C(y)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${o.render()}
      </div>
    `,o.init(),await i.init(s,f,m),s.querySelectorAll(`.featured-share-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let{platform:n,slug:r,title:i}=e.dataset,a=`${window.location.origin}/poemas/poema/${r}`,o=`Leia "${i}", de Natanael Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})});let w=e=>{let{query:t,results:n}=e.detail,r=t,i=s.querySelector(`.list-container`);i&&(i.innerHTML=C(n||y,r.length>0,r));let a=s.querySelector(`.poem-of-day`),o=s.querySelector(`.hero-section`);r.length>0?(a&&(a.style.display=`none`),o&&(o.style.display=`none`)):(a&&(a.style.display=`block`),o&&(o.style.display=`block`))};window.addEventListener(`global-search`,w),this.cleanup=()=>{window.removeEventListener(`global-search`,w)},s.querySelector(`#random-home-btn`)?.addEventListener(`click`,()=>{e()})}};export{s as default};