import{S as e,b as t,i as n,l as r,o as i,p as a,s as o,v as s}from"./index-3IBTfuIH.js";import{_ as c,f as l,g as u,p as d,u as f}from"./vendor-firebase-vW9DHoZS.js";import{t as p}from"./firebase-DJUlHAWI.js";import{t as m}from"./filter-chips-snym_t2Y.js";var h={meta:{title:`Coleções e Sentimentos — Natanael Fernando Gatti Brentano`},async render(h,g={}){try{let _=g.tags?g.tags.split(`,`):[],v=g.cols?g.cols.split(`,`):[],y=_.length>0||v.length>0,b=`${i}/colecoes/`,x=[{name:`Início`,url:`${i}/`},{name:`Coleções`,url:b}];n({title:`Coleções e Sentimentos — Natanael Fernando Gatti Brentano`,description:`Explore poemas organizados por séries temáticas e sentimentos.`,url:b,type:`website`,structuredData:[r([]),o(x)]}),h.innerHTML=`
        <section class="collections-page fade-in">
          <header class="page-header" style="text-align: center; margin-bottom: var(--space-2xl);">
            ${a(x)}
            <h1 class="page-title">Explorar</h1>
            <p class="page-subtitle">Séries temáticas, livros e sentimentos catalogados</p>
          </header>

          <div class="discovery-filters" style="margin-bottom: var(--space-2xl);">
            ${m.render(_)}
          </div>

          <div id="collections-section" class="discovery-section" style="${y?`display: none;`:``}">
            <h2 class="section-title" style="margin-bottom: var(--space-lg);">Coleções em Destaque</h2>
            <div id="collections-grid" class="collections-grid">
              <div class="loading">Carregando coleções...</div>
            </div>
          </div>

          <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-2xl);">
            <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-lg);">
              ${y?`Poemas Encontrados`:`Obras Recentes`}
            </h2>
            <div id="filtered-poems-list" class="list-container">
              <div class="loading">Carregando poemas...</div>
            </div>
          </div>
        </section>
      `;let S=h.querySelector(`#collections-grid`),C=h.querySelector(`#filtered-poems-list`),w=async()=>{let i=[],a=null;try{let e=d(c(p,`collections`)),t=await f(e),a=await f(c(p,`collection_poems`)),s=[];a.forEach(e=>s.push(e.data())),t.forEach(e=>{let t=e.data(),n=s.filter(t=>t.collection_id===e.id).length;i.push({id:e.id,...t,collection_poems:[{count:n}]})}),i.length>0&&n({title:`Coleções e Sentimentos — Natanael Fernando Gatti Brentano`,description:`Explore poemas organizados por séries temáticas e sentimentos.`,url:b,type:`website`,structuredData:[r(i),o(x)]})}catch(e){a=e}S&&(a&&console.error(`Error fetching collections:`,a),!i||i.length===0?S.innerHTML=`<p class="empty-msg">Nenhuma coleção encontrada.</p>`:(S.innerHTML=i.map((n,r)=>{let i=e(n.image_url),a=r===0?`fetchpriority="high" width="360" height="180" decoding="async"`:`loading="lazy" decoding="async" width="360" height="180"`;return`
              <a href="/colecao/${t(n.slug)}/" class="collection-card" data-link>
                ${i?`<img src="${t(i)}" alt="${t(n.name)}" class="collection-img" ${a} onerror="this.onerror=null; const p=document.createElement('div'); p.className='collection-img-placeholder'; this.replaceWith(p);">`:`<div class="collection-img-placeholder"></div>`}
                <div class="collection-info">
                  <h2 class="collection-name">${t(n.name)}</h2>
                  <span class="collection-count">${n.collection_poems?.[0]?.count||0} poemas</span>
                </div>
              </a>
            `}).join(``),S.querySelectorAll(`.collection-img`).forEach(e=>{e.addEventListener(`error`,()=>{if(e.isConnected){let t=document.createElement(`div`);t.className=`collection-img-placeholder`,e.replaceWith(t)}},{once:!0})})))},T=[];await Promise.all([w(),(async()=>{let e=[];try{let t=d(c(p,`poems`),u(`status`,`==`,`published`),l(`published_at`,`desc`)),n=await f(t),r=await f(c(p,`collections`)),i={};r.forEach(e=>{i[e.id]=e.data()});let a=await f(c(p,`collection_poems`)),o=[];a.forEach(e=>o.push(e.data())),n.forEach(t=>{let n=t.data(),r=o.filter(e=>e.poem_id===t.id).map(e=>({collection_id:e.collection_id,collections:i[e.collection_id]?{slug:i[e.collection_id].slug}:null}));e.push({id:t.id,...n,collection_poems:r})})}catch{}T=e||[];let n=T;if(_.length>0){let e=_.map(e=>decodeURIComponent(e).trim().toLowerCase());n=n.filter(t=>t.tags&&t.tags.some(t=>{let n=s(t).toLowerCase();return e.includes(n)}))}v.length>0&&(n=n.filter(e=>e.collection_poems&&e.collection_poems.some(e=>e.collections&&v.includes(e.collections.slug)))),C&&(n.length===0?C.innerHTML=`<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>`:C.innerHTML=n.map(e=>{let n=new Date(e.published_at).getFullYear();return`
                <article class="poem-row fade-in">
                  <a href="/poema/${t(e.slug)}/" data-link class="poem-row-link">
                    <h3 class="poem-row-title">${t(e.title)}</h3>
                    <span class="poem-row-year">${n}</span>
                  </a>
                </article>
              `}).join(``))})()]),m.init(h,_,T).catch(e=>console.error(`FilterChips init error:`,e))}catch(e){console.error(`Collections render error:`,e),h.innerHTML=`
        <div style="padding: 2rem; color: #ff5555; background: #222; border-radius: 8px; margin: 2rem;">
          <h3>Erro interno em collections.js</h3>
          <pre style="font-size: 12px; overflow-x: auto; margin-top: 1rem;">${e.stack||e.message}</pre>
        </div>
      `}}};export{h as collections,h as default};