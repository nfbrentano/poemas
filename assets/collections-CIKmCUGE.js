import{o as e}from"./index-BHLKTwRq.js";import{r as t,t as n}from"./filter-chips-BXxCHK4w.js";import{t as r}from"./seo-CzsjKMAB.js";var i={meta:{title:`Coleções e Sentimentos — Natanael Brentano`},async render(i,a={}){let o=a.tags?a.tags.split(`,`):[],s=a.cols?a.cols.split(`,`):[],c=o.length>0||s.length>0;r({title:`Coleções e Sentimentos — Natanael Brentano`,description:`Explore poemas organizados por séries temáticas e sentimentos.`,type:`website`}),i.innerHTML=`
      <section class="collections-page fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
          <h1 class="page-title">Explorar</h1>
          <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
        </header>

        <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
          ${n.render(o)}
        </div>

        <div id="collections-section" class="discovery-section" style="${c?`display: none;`:``}">
          <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
          <div id="collections-grid" class="collections-grid">
            <div class="loading">Carregando coleções...</div>
          </div>
        </div>

        <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
          <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">
            ${c?`Poemas Encontrados`:`Obras Recentes`}
          </h2>
          <div id="filtered-poems-list" class="list-container">
            <div class="loading">Carregando poemas...</div>
          </div>
        </div>
      </section>
    `;let l=i.querySelector(`#collections-grid`),u=i.querySelector(`#filtered-poems-list`),d=`/poemas/`,f=async()=>{let{data:t}=await e.from(`collections`).select(`*, collection_poems(count)`).order(`created_at`,{ascending:!1});l&&(!t||t.length===0?l.innerHTML=`<p class="empty-msg">Nenhuma coleção encontrada.</p>`:l.innerHTML=t.map(e=>`
            <a href="${d}colecao/${e.slug}" class="collection-card" data-link>
              ${e.image_url?`<img src="${e.image_url}" alt="${e.name}" class="collection-img" loading="lazy" decoding="async">`:`<div class="collection-img-placeholder"></div>`}
              <div class="collection-info">
                <h2 class="collection-name">${e.name}</h2>
                <span class="collection-count">${e.collection_poems?.[0]?.count||0} poemas</span>
              </div>
            </a>
          `).join(``))},p=[];await Promise.all([f(),(async()=>{let{data:n}=await e.from(`poems`).select(`id, title, slug, published_at, tags, collection_poems(collection_id, collections(slug))`).eq(`status`,`published`).order(`published_at`,{ascending:!1});p=n||[];let r=p;if(o.length>0){let e=o.map(e=>decodeURIComponent(e).trim().toLowerCase());r=r.filter(n=>n.tags&&n.tags.some(n=>{let r=t(n).toLowerCase();return e.includes(r)}))}s.length>0&&(r=r.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&s.includes(e.collections.slug)))),u&&(r.length===0?u.innerHTML=`<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>`:u.innerHTML=r.map(e=>{let t=new Date(e.published_at).getFullYear();return`
              <article class="poem-row fade-in">
                <a href="${d}poema/${e.slug}" data-link class="poem-row-link">
                  <h3 class="poem-row-title">${e.title}</h3>
                  <span class="poem-row-year">${t}</span>
                </a>
              </article>
            `}).join(``))})()]),n.init(i,o,p)}};export{i as collections,i as default};