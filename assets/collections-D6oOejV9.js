import{a as e,c as t,d as n,f as r,s as i}from"./index.esm-C77q4Vsq.js";import{db as a}from"./firebase-DbnQPwBn.js";import{n as o,t as s}from"./html-Ca31mHym.js";import{r as c,t as l}from"./filter-chips-B2irCICN.js";import{t as u}from"./seo-BF0uIWTH.js";var d={meta:{title:`Coleções e Sentimentos — Natanael Brentano`},async render(d,f={}){try{let p=f.tags?f.tags.split(`,`):[],m=f.cols?f.cols.split(`,`):[],h=p.length>0||m.length>0;u({title:`Coleções e Sentimentos — Natanael Brentano`,description:`Explore poemas organizados por séries temáticas e sentimentos.`,type:`website`}),d.innerHTML=`
        <section class="collections-page fade-in">
          <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
            <h1 class="page-title">Explorar</h1>
            <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
          </header>

          <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
            ${l.render(p)}
          </div>

          <div id="collections-section" class="discovery-section" style="${h?`display: none;`:``}">
            <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
            <div id="collections-grid" class="collections-grid">
              <div class="loading">Carregando coleções...</div>
            </div>
          </div>

          <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
            <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">
              ${h?`Poemas Encontrados`:`Obras Recentes`}
            </h2>
            <div id="filtered-poems-list" class="list-container">
              <div class="loading">Carregando poemas...</div>
            </div>
          </div>
        </section>
      `;let g=d.querySelector(`#collections-grid`),_=d.querySelector(`#filtered-poems-list`),v=`/poemas/`,y=async()=>{let n=[],i=null;try{let i=t(r(a,`collections`)),o=await e(i),s=await e(r(a,`collection_poems`)),c=[];s.forEach(e=>c.push(e.data())),o.forEach(e=>{let t=e.data(),r=c.filter(t=>t.collection_id===e.id).length;n.push({id:e.id,...t,collection_poems:[{count:r}]})})}catch(e){i=e}g&&(i&&console.error(`Supabase error fetching collections:`,i),!n||n.length===0?g.innerHTML=`<p class="empty-msg">Nenhuma coleção encontrada.</p>`:g.innerHTML=n.map(e=>{let t=o(e.image_url);return`
              <a href="${v}colecao/${s(e.slug)}" class="collection-card" data-link>
                ${t?`<img src="${s(t)}" alt="${s(e.name)}" class="collection-img" loading="lazy" decoding="async">`:`<div class="collection-img-placeholder"></div>`}
                <div class="collection-info">
                  <h2 class="collection-name">${s(e.name)}</h2>
                  <span class="collection-count">${e.collection_poems?.[0]?.count||0} poemas</span>
                </div>
              </a>
            `}).join(``))},b=[];await Promise.all([y(),(async()=>{let o=[];try{let s=t(r(a,`poems`),n(`status`,`==`,`published`),i(`published_at`,`desc`)),c=await e(s),l=await e(r(a,`collections`)),u={};l.forEach(e=>{u[e.id]=e.data()});let d=await e(r(a,`collection_poems`)),f=[];d.forEach(e=>f.push(e.data())),c.forEach(e=>{let t=e.data(),n=f.filter(t=>t.poem_id===e.id).map(e=>({collection_id:e.collection_id,collections:u[e.collection_id]?{slug:u[e.collection_id].slug}:null}));o.push({id:e.id,...t,collection_poems:n})})}catch{}b=o||[];let l=b;if(p.length>0){let e=p.map(e=>decodeURIComponent(e).trim().toLowerCase());l=l.filter(t=>t.tags&&t.tags.some(t=>{let n=c(t).toLowerCase();return e.includes(n)}))}m.length>0&&(l=l.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&m.includes(e.collections.slug)))),_&&(l.length===0?_.innerHTML=`<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>`:_.innerHTML=l.map(e=>{let t=new Date(e.published_at).getFullYear();return`
                <article class="poem-row fade-in">
                  <a href="${v}poema/${s(e.slug)}" data-link class="poem-row-link">
                    <h3 class="poem-row-title">${s(e.title)}</h3>
                    <span class="poem-row-year">${t}</span>
                  </a>
                </article>
              `}).join(``))})()]),l.init(d,p,b).catch(e=>console.error(`FilterChips init error:`,e))}catch(e){console.error(`Collections render error:`,e),d.innerHTML=`
        <div style="padding: 2rem; color: #ff5555; background: #222; border-radius: 8px; margin: 2rem;">
          <h3>Erro interno em collections.js</h3>
          <pre style="font-size: 12px; overflow-x: auto; margin-top: 1rem;">${e.stack||e.message}</pre>
        </div>
      `}}};export{d as collections,d as default};