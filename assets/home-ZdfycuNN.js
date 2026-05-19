import{t as e}from"./supabase-C7rZ412s.js";import{a as t}from"./index-CpvUCwIo.js";import"./filter-chips-CAxGVfR5.js";import{t as n}from"./seo-CbZTOP9l.js";import{t as r}from"./newsletter-D22GW_Gl.js";var i={meta:{title:`Natanael Brentano - Poemas`},cleanup(){},async render(i,a={}){let o=a.tags?a.tags.split(`,`):[],s=a.cols?a.cols.split(`,`):[],c=a.tag?[decodeURIComponent(a.tag)]:[],l=[...new Set([...o,...c])],u=`Natanael Brentano — Poemas`;if(l.length>0||s.length>0){let e=[];l.length>0&&e.push(`Sentimentos: ${l.join(`, `)}`),s.length>0&&e.push(`Coleções: ${s.join(`, `)}`),u=`${e.join(` | `)} — Natanael Brentano`}n({title:u,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`}),i.innerHTML=`
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
    `;let{data:d,error:f}=await e.from(`poems`).select(`id, title, slug, excerpt, tags, published_at, collection_poems(collection_id, collections(slug))`).eq(`status`,`published`).order(`published_at`,{ascending:!1});if(f){console.error(f),i.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!d||d.length===0){i.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let p=`/poemas/`,m={};d.forEach(e=>{(e.tags||[]).forEach(e=>{let t=e.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim();t=t.charAt(0).toUpperCase()+t.slice(1).toLowerCase(),m[t]=(m[t]||0)+1})});let h=Object.entries(m).sort((e,t)=>t[1]-e[1]).slice(0,5).map(e=>e[0]);l.forEach(e=>{h.includes(e)||h.push(e)}),h.sort();let g=d;l.length>0&&(g=g.filter(e=>e.tags&&e.tags.some(e=>{let t=e.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim().toLowerCase();return l.some(e=>e.toLowerCase()===t)}))),s.length>0&&(g=g.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&s.includes(e.collections.slug))));let _=l.length>0||s.length>0,v=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%d.length,y=d[v];_||(g=g.filter((e,t)=>t!==v));let b=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado${n?` para "<strong>${n}</strong>"`:``}.
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});return!t&&!_&&n===0?`
          <article class="poem-featured fade-in">
            <a href="${p}poema/${e.slug}" data-link>
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
          <a href="${p}poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${e.title}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``);i.innerHTML=`
      <div class="home-layout">
        
        ${!_&&y?`
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${p}poema/${y.slug}" data-link class="pod-link">
            <h2 class="pod-title">${y.title}</h2>
            <p class="pod-excerpt">${y.excerpt||``}</p>
          </a>
        </section>
        `:``}

        <section class="poems-list fade-in" style="padding-top: var(--space-xl);">
          
          ${_?`<h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg); color: var(--text-primary); text-align: center; opacity: 0.7;">Resultados filtrados</h2>`:``}
          
          <div class="list-container">
            ${b(g)}
          </div>
          <div class="random-home-container">
            <button id="random-home-btn" class="random-home-link">→ Poema aleatório</button>
          </div>
        </section>
        
        ${r.render()}
      </div>
    `,r.init(),i.querySelectorAll(`.featured-share-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let{platform:n,slug:r,title:i}=e.dataset,a=`${window.location.origin}/poemas/poema/${r}`,o=`Leia "${i}", de Natanael Brentano:`,s=``;n===`whatsapp`&&(s=`https://api.whatsapp.com/send?text=${encodeURIComponent(o+` `+a)}`),n===`twitter`&&(s=`https://twitter.com/intent/tweet?text=${encodeURIComponent(o)}&url=${encodeURIComponent(a)}`),window.open(s,`_blank`,`noopener,noreferrer`)})});let x=e=>{let{query:t,results:n}=e.detail,r=t,a=i.querySelector(`.list-container`);a&&(a.innerHTML=b(n||g,r.length>0,r));let o=i.querySelector(`.poem-of-day`),s=i.querySelector(`.hero-section`);r.length>0?(o&&(o.style.display=`none`),s&&(s.style.display=`none`)):(o&&(o.style.display=`block`),s&&(s.style.display=`block`))};window.addEventListener(`global-search`,x),this.cleanup=()=>{window.removeEventListener(`global-search`,x)},i.querySelector(`#random-home-btn`)?.addEventListener(`click`,()=>{t()})}};export{i as default};