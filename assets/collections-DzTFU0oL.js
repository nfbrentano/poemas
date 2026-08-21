import{s as e}from"./index-BWGE2Wiv.js";import{n as t,t as n}from"./html-Ca31mHym.js";import{r,t as i}from"./filter-chips-CFIaS6EL.js";import{t as a}from"./seo-BlITGSmq.js";var o={meta:{title:`Coleções e Sentimentos — Natanael Brentano`},async render(o,s={}){let c=s.tags?s.tags.split(`,`):[],l=s.cols?s.cols.split(`,`):[],u=c.length>0||l.length>0;a({title:`Coleções e Sentimentos — Natanael Brentano`,description:`Explore poemas organizados por séries temáticas e sentimentos.`,type:`website`}),o.innerHTML=`
      <section class="collections-page fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
          <h1 class="page-title">Explorar</h1>
          <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
        </header>

        <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
          ${i.render(c)}
        </div>

        <div id="collections-section" class="discovery-section" style="${u?`display: none;`:``}">
          <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
          <div id="collections-grid" class="collections-grid">
            <div class="loading">Carregando coleções...</div>
          </div>
        </div>

        <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
          <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">
            ${u?`Poemas Encontrados`:`Obras Recentes`}
          </h2>
          <div id="filtered-poems-list" class="list-container">
            <div class="loading">Carregando poemas...</div>
          </div>
        </div>
      </section>
    `;let d=o.querySelector(`#collections-grid`),f=o.querySelector(`#filtered-poems-list`),p=`/poemas/`,m=async()=>{let{data:r}=await e.from(`collections`).select(`*, collection_poems(count)`).order(`created_at`,{ascending:!1});d&&(!r||r.length===0?d.innerHTML=`<p class="empty-msg">Nenhuma coleção encontrada.</p>`:d.innerHTML=r.map(e=>{let r=t(e.image_url);return`
            <a href="${p}colecao/${n(e.slug)}" class="collection-card" data-link>
              ${r?`<img src="${n(r)}" alt="${n(e.name)}" class="collection-img" loading="lazy" decoding="async">`:`<div class="collection-img-placeholder"></div>`}
              <div class="collection-info">
                <h2 class="collection-name">${n(e.name)}</h2>
                <span class="collection-count">${e.collection_poems?.[0]?.count||0} poemas</span>
              </div>
            </a>
          `}).join(``))},h=[];await Promise.all([m(),(async()=>{let{data:t}=await e.from(`poems`).select(`id, title, slug, published_at, tags, collection_poems(collection_id, collections(slug))`).eq(`status`,`published`).order(`published_at`,{ascending:!1});h=t||[];let i=h;if(c.length>0){let e=c.map(e=>decodeURIComponent(e).trim().toLowerCase());i=i.filter(t=>t.tags&&t.tags.some(t=>{let n=r(t).toLowerCase();return e.includes(n)}))}l.length>0&&(i=i.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&l.includes(e.collections.slug)))),f&&(i.length===0?f.innerHTML=`<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>`:f.innerHTML=i.map(e=>{let t=new Date(e.published_at).getFullYear();return`
              <article class="poem-row fade-in">
                <a href="${p}poema/${n(e.slug)}" data-link class="poem-row-link">
                  <h3 class="poem-row-title">${n(e.title)}</h3>
                  <span class="poem-row-year">${t}</span>
                </a>
              </article>
            `}).join(``))})()]),i.init(o,c,h)}};export{o as collections,o as default};