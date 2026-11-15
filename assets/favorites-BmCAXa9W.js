import{a as e,i as t,t as n}from"./html-MqnEuzWn.js";import{t as r}from"./toast-B1RJEOiX.js";import{c as i,g as a,o,u as s}from"./index-DM_Ebsql.js";import{t as c}from"./poems-store-vfUtCRue.js";import{i as l,n as u}from"./favorites-DfHnCJDr.js";import{n as d,t as f}from"./reading-history-CYE0Y_ep.js";function p(e){if(!e)return``;let t=new Date(e),n=Math.max(0,Math.floor((new Date-t)/1e3));if(n<60)return`Agora mesmo`;let r=Math.floor(n/60);if(r<60)return`Há ${r} ${r===1?`minuto`:`minutos`}`;let i=Math.floor(r/60);return i<24?`Há ${i} ${i===1?`hora`:`horas`}`:t.toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`short`})}var m={meta:{title:`Poemas Favoritos — Natanael Fernando Gatti Brentano`,robots:`noindex, nofollow`},async render(m){o({title:`Poemas Favoritos — Natanael Fernando Gatti Brentano`,description:`Seus poemas favoritos salvos para reler e revisitar.`,url:`${i}/favoritos/`,type:`website`,robots:`noindex, nofollow`,structuredData:[s([{name:`Início`,url:`${i}/`},{name:`Favoritos`,url:`${i}/favoritos/`}])]}),document.title=`Poemas Favoritos — Natanael Fernando Gatti Brentano`,m.innerHTML=e(`
      <div class="favorites-page fade-in">
        <div class="skeleton" style="width: 140px; height: 16px; margin-bottom: var(--space-md);"></div>
        <div class="skeleton" style="width: 220px; height: 32px; margin-bottom: var(--space-sm);"></div>
        <div class="skeleton" style="width: 320px; height: 18px; margin-bottom: var(--space-xl);"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
        <div class="skeleton-row" style="height: 80px; margin-bottom: var(--space-md); border-radius: 8px;"></div>
      </div>
    `);let h=[];try{h=await c()}catch{h=[]}let g=()=>{let i=u(),o=d(),s=[];for(let e of i){let t=h.find(t=>t.slug===e.slug||e.id&&t.id===e.id);t&&s.push({poem:t,fav:e})}let c=[];for(let e of o){let t=h.find(t=>t.slug===e.slug);t&&c.push({poem:t,history:e})}let _=a([{name:`Início`,url:`/`},{name:`Favoritos`,url:`/favoritos/`}]),v=``;if(c.length>0&&(v=`
          <section class="reading-history-section" style="margin-top: var(--space-2xl); border-top: 1px solid var(--border-subtle); padding-top: var(--space-xl);" aria-label="Lidos recentemente">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-md); flex-wrap: wrap; gap: var(--space-xs);">
              <div>
                <h2 style="font-family: var(--font-display); font-size: 1.35rem; color: var(--text-primary); margin: 0;">Lidos recentemente</h2>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 2px;">Poemas que você visitou neste dispositivo.</p>
              </div>
              <button type="button" id="clear-reading-history-btn" class="btn-secondary" style="font-size: 0.8rem; padding: 4px 10px; border-radius: 4px; cursor: pointer;">
                Limpar histórico
              </button>
            </div>
            <div class="reading-history-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-sm);">
              ${c.map(({poem:e,history:r})=>{let i=e.published_at?new Date(e.published_at).getFullYear():``;return`
                  <article class="reading-history-item" data-slug="${n(e.slug)}" style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 6px; padding: var(--space-sm) var(--space-md); display: flex; flex-direction: column; justify-content: space-between;">
                    <a href="/poema/${n(e.slug)}/" class="reading-history-link" data-link style="text-decoration: none; color: inherit;">
                      <h3 style="font-family: var(--font-poem); font-size: 1.05rem; margin: 0 0 4px 0; color: var(--text-primary);">${n(e.title)}</h3>
                      <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${n(e.excerpt||t(e.content).slice(0,100)+`...`)}</p>
                    </a>
                    <div style="margin-top: var(--space-xs); display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
                      <span>${n(p(r.readAt))}${i?` • ${i}`:``}</span>
                      <a href="/poema/${n(e.slug)}/" data-link style="color: var(--accent-subtle); text-decoration: none; font-weight: 500;">Continuar lendo →</a>
                    </div>
                  </article>
                `}).join(``)}
            </div>
          </section>
        `),s.length===0)m.innerHTML=e(`
          <div class="favorites-page fade-in">
            ${_}
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
            ${v}
          </div>
        `);else{let r=s.length===1?`1 poema salvo`:`${s.length} poemas salvos`;m.innerHTML=e(`
          <div class="favorites-page fade-in">
            ${_}
            <header class="favorites-header">
              <h1 class="favorites-title">Poemas Favoritos</h1>
              <p class="favorites-subtitle">${r} no seu navegador.</p>
            </header>
            <div class="favorites-list">
              ${s.map(({poem:e})=>{let r=e.published_at?new Date(e.published_at).getFullYear():``,i=e.excerpt||t(e.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;return`
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
            ${v}
          </div>
        `)}m.querySelectorAll(`.favorite-item-remove`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault(),t.stopPropagation();let n=e.dataset.slug;n&&(l(n),r.show(`Poema removido dos favoritos.`,`info`),g())})});let y=m.querySelector(`#clear-reading-history-btn`);y&&y.addEventListener(`click`,()=>{f(),r.show(`Histórico de leitura limpo.`,`info`),g()})};g()}};export{m as default,m as favorites};