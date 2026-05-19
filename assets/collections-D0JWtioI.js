import{t as e}from"./supabase-C7rZ412s.js";import{t}from"./filter-chips-CAxGVfR5.js";import{t as n}from"./seo-CbZTOP9l.js";var r={meta:{title:`Coleções e Sentimentos — Natanael Brentano`},async render(r,i={}){let a=i.tags?i.tags.split(`,`):[],o=i.cols?i.cols.split(`,`):[],s=a.length>0||o.length>0;n({title:`Coleções e Sentimentos — Natanael Brentano`,description:`Explore poemas organizados por séries temáticas e sentimentos.`,type:`website`}),r.innerHTML=`
      <section class="collections-page fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
          <h1 class="page-title">Explorar</h1>
          <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
        </header>

        <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
          ${t.render(a)}
        </div>

        <div id="collections-section" class="discovery-section" style="${s?`display: none;`:``}">
          <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
          <div id="collections-grid" class="collections-grid">
            <div class="loading">Carregando coleções...</div>
          </div>
        </div>

        <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
          <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">
            ${s?`Poemas Encontrados`:`Obras Recentes`}
          </h2>
          <div id="filtered-poems-list" class="list-container">
            <div class="loading">Carregando poemas...</div>
          </div>
        </div>
      </section>
    `;let c=r.querySelector(`#collections-grid`),l=r.querySelector(`#filtered-poems-list`),u=`/poemas/`;await Promise.all([(async()=>{let{data:t}=await e.from(`collections`).select(`*, collection_poems(count)`).order(`created_at`,{ascending:!1});c&&(!t||t.length===0?c.innerHTML=`<p class="empty-msg">Nenhuma coleção encontrada.</p>`:c.innerHTML=t.map(e=>`
            <a href="${u}colecao/${e.slug}" class="collection-card" data-link>
              ${e.image_url?`<img src="${e.image_url}" alt="${e.name}" class="collection-img" loading="lazy" decoding="async">`:`<div class="collection-img-placeholder"></div>`}
              <div class="collection-info">
                <h2 class="collection-name">${e.name}</h2>
                <span class="collection-count">${e.collection_poems?.[0]?.count||0} poemas</span>
              </div>
            </a>
          `).join(``))})(),(async()=>{let{data:t}=await e.from(`poems`).select(`id, title, slug, published_at, tags, collection_poems(collection_id, collections(slug))`).eq(`status`,`published`).order(`published_at`,{ascending:!1}),n=t||[];if(a.length>0){let e=a.map(e=>decodeURIComponent(e).trim().toLowerCase());n=n.filter(t=>t.tags&&t.tags.some(t=>{let n=t.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim().toLowerCase();return e.includes(n)}))}o.length>0&&(n=n.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&o.includes(e.collections.slug)))),l&&(n.length===0?l.innerHTML=`<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>`:l.innerHTML=n.map(e=>{let t=new Date(e.published_at).getFullYear();return`
              <article class="poem-row fade-in">
                <a href="${u}poema/${e.slug}" data-link class="poem-row-link">
                  <h3 class="poem-row-title">${e.title}</h3>
                  <span class="poem-row-year">${t}</span>
                </a>
              </article>
            `}).join(``))})()]),t.init(r,a)}};export{r as collections,r as default};