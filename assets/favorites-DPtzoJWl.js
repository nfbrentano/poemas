import{a as e,i as t,t as n}from"./html-DUzinkfe.js";import{t as r}from"./toast-CApwxsHH.js";import{c as i,h as a,l as o,o as s}from"./index-BNfYksz6.js";import{t as c}from"./poems-store-DqDF5aZD.js";import{i as l,n as u}from"./favorites-DfHnCJDr.js";var d={meta:{title:`Poemas Favoritos — Natanael Fernando Gatti Brentano`,robots:`noindex, nofollow`},async render(d){s({title:`Poemas Favoritos — Natanael Fernando Gatti Brentano`,description:`Seus poemas favoritos salvos para reler e revisitar.`,url:`${i}/favoritos/`,type:`website`,robots:`noindex, nofollow`,structuredData:[o([{name:`Início`,url:`${i}/`},{name:`Favoritos`,url:`${i}/favoritos/`}])]}),document.title=`Poemas Favoritos — Natanael Fernando Gatti Brentano`,d.innerHTML=e(`
      <div class="favorites-page fade-in">
        <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: var(--space-md);"></div>
        <div class="skeleton" style="width: 220px; height: 32px; margin-bottom: var(--space-sm);"></div>
        <div class="skeleton" style="width: 320px; height: 18px; margin-bottom: var(--space-xl);"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
      </div>
    `);let f=[];try{f=await c()}catch{f=[]}let p=()=>{let i=u(),o=[];for(let e of i){let t=f.find(t=>t.slug===e.slug||e.id&&t.id===e.id);t&&o.push({poem:t,fav:e})}let s=a([{name:`Início`,url:`/`},{name:`Favoritos`,url:`/favoritos/`}]);if(o.length===0){d.innerHTML=e(`
          <div class="favorites-page fade-in">
            ${s}
            <header class="favorites-header">
              <h1 class="favorites-title">Poemas Favoritos</h1>
              <p class="favorites-subtitle">Seus poemas salvos para reler e revisitar.</p>
            </header>
            <div class="favorites-empty">
              <div class="empty-icon" aria-hidden="true">🔖</div>
              <h2 class="empty-title">Nenhum poema favoritado ainda</h2>
              <p class="empty-desc">
                Quando encontrar versos que tocam sua alma, clique no botão <strong>Favoritar</strong> ao final do poema para guardá-los aqui e reler quando desejar.
              </p>
              <a href="/" class="btn-primary" data-link>Explorar o acervo de poemas</a>
            </div>
          </div>
        `);return}let c=o.length===1?`1 poema salvo`:`${o.length} poemas salvos`;d.innerHTML=e(`
        <div class="favorites-page fade-in">
          ${s}
          <header class="favorites-header">
            <h1 class="favorites-title">Poemas Favoritos</h1>
            <p class="favorites-subtitle">${c} no seu navegador.</p>
          </header>
          <div class="favorites-list">
            ${o.map(({poem:e})=>{let r=e.published_at?new Date(e.published_at).getFullYear():``,i=e.excerpt||t(e.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;return`
                <article class="favorite-item" data-slug="${n(e.slug)}">
                  <a href="/poema/${n(e.slug)}/" class="favorite-item-link" data-link>
                    <h2 class="favorite-item-title">${n(e.title)}</h2>
                    <p class="favorite-item-excerpt">${n(i)}</p>
                    <div class="favorite-item-meta">
                      ${r?`<span>${r}</span>`:``}
                    </div>
                  </a>
                  <button type="button" class="favorite-item-remove" data-slug="${n(e.slug)}" aria-label="Remover &quot;${n(e.title)}&quot; dos favoritos" title="Remover dos favoritos">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </article>
              `}).join(``)}
          </div>
        </div>
      `),d.querySelectorAll(`.favorite-item-remove`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation();let n=e.dataset.slug;n&&(l(n),r.show(`Poema removido dos favoritos.`,`info`),p())})})};p()}};export{d as default,d as favorites};