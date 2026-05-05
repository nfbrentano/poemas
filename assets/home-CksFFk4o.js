import{t as e}from"./supabase-C7rZ412s.js";import{a as t}from"./index-Wu1speV6.js";import{t as n}from"./seo-CbZTOP9l.js";import{t as r}from"./newsletter-vE9zrvAq.js";var i={meta:{title:`Natanael Brentano - Poemas`},cleanup(){},async render(i,a={}){let o=a.tag?decodeURIComponent(a.tag):null;n(o?{title:`Sentimento: ${o} — Natanael Brentano`,description:`Poemas que expressam o sentimento "${o}".`,type:`website`}:{title:`Natanael Brentano — Poemas`,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`}),i.innerHTML=`
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
    `;let{data:s,error:c}=await e.from(`poems`).select(`id, title, slug, excerpt, tags, published_at`).eq(`status`,`published`).order(`published_at`,{ascending:!1});if(c){console.error(c),i.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!s||s.length===0){i.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let l=`/poemas/`,u={};s.forEach(e=>{(e.tags||[]).forEach(e=>{let t=e.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim();t=t.charAt(0).toUpperCase()+t.slice(1).toLowerCase(),u[t]=(u[t]||0)+1})});let d=Object.entries(u).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);o&&!d.includes(o)&&d.push(o),d.sort();let f=s;o&&(f=s.filter(e=>e.tags&&e.tags.some(e=>e.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim().toLowerCase()===o.toLowerCase())));let p=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%s.length,m=s[p];o||(f=f.filter((e,t)=>t!==p));let h=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado${n?` para "<strong>${n}</strong>"`:``}.
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});return!t&&!o&&n===0?`
          <article class="poem-featured fade-in">
            <a href="${l}poema/${e.slug}" data-link>
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
          <a href="${l}poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${e.title}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``);i.innerHTML=`
      <div class="home-layout">
        
        ${!o&&m?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${l}poema/${m.slug}" data-link class="pod-link">
            <h2 class="pod-title">${m.title}</h2>
            <p class="pod-excerpt">${m.excerpt||``}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          ${d.length===0?``:`
        <div class="tags-menu fade-in">
          <a href="${l}" data-link class="tag-chip ${o?``:`active`}">Todos</a>
          ${d.map(e=>`
            <a href="${l}tag/${encodeURIComponent(e)}" data-link class="tag-chip ${e===o?`active`:``}">${e}</a>
          `).join(``)}
        </div>
      `}
          
          ${o?`<h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center;">Poemas sobre "${o}"</h2>`:``}
          
          <div class="list-container">
            ${h(f)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${r.render()}
      </div>
    `,r.init(),i.querySelectorAll(`.featured-share-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let{platform:n,slug:r,title:i}=e.dataset,a=`${window.location.origin}/poemas/poema/${r}`,o=`Leia "${i}", de Natanael Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})});let g=e=>{let{query:t,results:n}=e.detail,r=t,a=i.querySelector(`.list-container`);a&&(a.innerHTML=h(n||f,r.length>0,r));let o=i.querySelector(`.poem-of-day`),s=i.querySelector(`.hero-section`);r.length>0?(o&&(o.style.display=`none`),s&&(s.style.display=`none`)):(o&&(o.style.display=`block`),s&&(s.style.display=`block`))};window.addEventListener(`global-search`,g),this.cleanup=()=>{window.removeEventListener(`global-search`,g)},i.querySelector(`#random-home-btn`)?.addEventListener(`click`,()=>{t()})}};export{i as default};