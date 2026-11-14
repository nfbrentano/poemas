import{a as e,r as t,t as n}from"./html-DUzinkfe.js";import{b as r,c as i,d as a,h as o,l as s,o as c}from"./index-BNfYksz6.js";import{d as l,m as u,y as d}from"./vendor-firebase-Dd5ijz69.js";import{t as f}from"./firebase-BNXSdU2z.js";import{t as p}from"./poems-store-DqDF5aZD.js";import{enrichCollectionsWithCurated as m,mergeRelationsWithCurated as h}from"./collections-DuSS-6xZ.js";import{t as g}from"./collection-template-B60OdItA.js";var _={meta:{title:`Coleções — Natanael Fernando Gatti Brentano`},async render(_,v={}){try{let y=v.tags?v.tags.split(`,`):[],b=v.cols?v.cols.split(`,`):[],x=y.length>0||b.length>0,S=_.getAttribute(`data-prerendered`)===`/colecoes`&&!x,C=`${i}/colecoes/`,w=[{name:`Início`,url:`${i}/`},{name:`Coleções`,url:C}];S?_.removeAttribute(`data-prerendered`):(c({title:`Coleções — Natanael Fernando Gatti Brentano`,description:`Explore poemas organizados por séries temáticas e agrupamentos poéticos.`,url:C,type:`website`,structuredData:[a([]),s(w)]}),_.innerHTML=e(`
          <section class="collections-page fade-in">
            <header class="page-header" style="text-align: center; margin-bottom: var(--space-xl);">
              ${o(w)}
              <h1 class="page-title">Coleções</h1>
              <p class="page-subtitle">Séries temáticas e agrupamentos poéticos</p>
            </header>

            <div id="collections-section" class="discovery-section">
              <h2 class="section-title" style="margin-bottom: var(--space-md);">Séries em Destaque</h2>
              <div id="collections-grid" class="collections-grid">
                <div class="skeleton-row" style="height: 220px; border-radius: 6px;"></div>
                <div class="skeleton-row" style="height: 220px; border-radius: 6px;"></div>
                <div class="skeleton-row" style="height: 220px; border-radius: 6px;"></div>
              </div>
            </div>

            <div id="poems-filtered-section" class="discovery-section" style="margin-top: var(--space-3xl);">
              <h2 class="section-title" id="poems-list-title" style="margin-bottom: var(--space-md);">Obras do Acervo</h2>
              <div id="filtered-poems-list" class="list-container">
                <div class="skeleton-row" style="height: 60px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
                <div class="skeleton-row" style="height: 60px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
                <div class="skeleton-row" style="height: 60px; margin-bottom: 0.75rem; border-radius: 4px;"></div>
              </div>
            </div>
          </section>
        `));let T=_.querySelector(`#collections-grid`),E=_.querySelector(`#filtered-poems-list`),D=[],O=[];try{let e=typeof navigator<`u`&&navigator.onLine===!1,[t,n,r]=await Promise.all([e?Promise.resolve({docs:[]}):Promise.resolve().then(()=>l(u(d(f,`collections`)))).catch(e=>(console.warn(`[Collections] Firestore collections indisponível (offline):`,e),{docs:[]})),e?Promise.resolve({docs:[]}):Promise.resolve().then(()=>l(d(f,`collection_poems`))).catch(e=>(console.warn(`[Collections] Firestore collection_poems indisponível (offline):`,e),{docs:[]})),p()]);O=r||[];let i=new Set(O.map(e=>e.id)),o=t.docs?t.docs.map(e=>({id:e.id,...e.data()})):[],g=m(o),_=n.docs?n.docs.map(e=>e.data()):[],v=h(_,O,g);g.forEach(e=>{let t=new Set(v.filter(t=>t.collection_id===e.id&&i.has(t.poem_id)).map(e=>e.poem_id));O.forEach(n=>{Array.isArray(n.collection_slugs)&&n.collection_slugs.includes(e.slug)&&t.add(n.id)});let n=t.size;D.push({...e,poemCount:n,collection_poems:[{count:n}]})}),D.sort((e,t)=>t.poemCount-e.poemCount||(e.name||``).localeCompare(t.name||``)),D.length>0&&c({title:`Coleções — Natanael Fernando Gatti Brentano`,description:`Explore poemas organizados por séries temáticas e agrupamentos poéticos.`,url:C,type:`website`,structuredData:[a(D),s(w)]})}catch(e){if(console.error(`Error fetching collections data:`,e),S)return}if(T&&D.length>0&&(T.innerHTML=e(D.map((e,r)=>{let i=t(e.image_url),a=r===0?`fetchpriority="high" width="360" height="160" decoding="async"`:`loading="lazy" decoding="async" width="360" height="160"`,o=e.poemCount||0,s=(e.description||``).trim();return`
            <a href="/colecao/${n(e.slug)}/" class="collection-card" data-link>
              ${i?`
                <img src="${n(i)}" alt="${n(e.name)}" class="collection-img" ${a}>
              `:`
                <div class="collection-card-cover">
                  <span class="collection-card-icon" aria-hidden="true">❦</span>
                  <span class="collection-card-category">Coleção Temática</span>
                </div>
              `}
              <div class="collection-info">
                <h2 class="collection-name">${n(e.name)}</h2>
                <span class="collection-count">${o} poema${o===1?``:`s`}</span>
                ${s?`<p class="collection-desc-preview">${n(s)}</p>`:``}
              </div>
            </a>
          `}).join(``)),T.querySelectorAll(`.collection-img`).forEach(e=>{e.addEventListener(`error`,()=>{if(e.isConnected){let t=document.createElement(`div`);t.className=`collection-card-cover`,t.innerHTML=`
                <span class="collection-card-icon" aria-hidden="true">❦</span>
                <span class="collection-card-category">Coleção Temática</span>
              `,e.replaceWith(t)}},{once:!0})})),E){let t=O;if(y.length>0){let e=y.map(e=>decodeURIComponent(e).trim().toLowerCase());t=t.filter(t=>Array.isArray(t.tags)&&t.tags.some(t=>{let n=r(t).toLowerCase();return e.includes(n)}))}b.length>0&&(t=t.filter(e=>Array.isArray(e.collection_slugs)&&e.collection_slugs.some(e=>b.includes(e)))),E.innerHTML=t.length===0?`<p class="empty-state-desc" style="text-align: center; padding: 2rem;">Nenhum poema corresponde aos filtros selecionados.</p>`:e(t.map(e=>{let t=e.published_at?new Date(e.published_at).getFullYear():``,r=g(e,140);return`
              <article class="poem-row fade-in">
                <a href="/poema/${n(e.slug)}/" data-link class="poem-row-link">
                  <div class="poem-row-main" style="flex: 1; min-width: 0;">
                    <h3 class="poem-row-title">${n(e.title)}</h3>
                    ${r?`<p class="poem-row-excerpt" style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0; line-height: 1.5;">${n(r)}</p>`:``}
                  </div>
                  ${t?`<span class="poem-row-year">${t}</span>`:``}
                </a>
              </article>
            `}).join(``))}}catch(t){console.error(`Collections render error:`,t),_.innerHTML=e(`
        <div style="padding: 2rem; color: #ff5555; background: #222; border-radius: 8px; margin: 2rem;">
          <h3>Erro interno em collections.js</h3>
          <pre style="font-size: 12px; overflow-x: auto; margin-top: 1rem;">${n(t.stack||t.message)}</pre>
        </div>
      `)}}};export{_ as collections,_ as default};