import{n as e,t}from"./index-CioTRcOo.js";import{t as n}from"./seo-BlITGSmq.js";var r={meta:{title:`Sua Biblioteca`},cleanup(){},async render(r){n({title:`Biblioteca Pessoal`,description:`Sua coleção pessoal de poemas favoritos e histórico de leitura.`,type:`website`}),r.innerHTML=`
      <div class="favorites-page fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: var(--space-xl);">
          <h1 class="page-title">Sua Biblioteca</h1>
          <p class="page-subtitle">Sua biblioteca pessoal disponível offline.</p>
        </header>

        <div class="library-tabs">
          <button id="tab-favorites" class="library-tab-btn active">Salvos</button>
          <button id="tab-history" class="library-tab-btn">Histórico</button>
        </div>
        
        <div id="library-content-container">
          <div id="favorites-list" class="favorites-list">
            <div class="loading-container">Carregando seus favoritos...</div>
          </div>
        </div>
      </div>
    `;let i=document.getElementById(`library-content-container`),a=document.getElementById(`tab-favorites`),o=document.getElementById(`tab-history`),s=`/poemas/`,c=`favorites`,l=async()=>{let e=await t.list();if(e.length===0){i.innerHTML=`
          <div class="empty-state">
            <p class="empty-state-label">♡</p>
            <h2 class="empty-state-title">Nenhum poema salvo ainda.</h2>
            <p class="empty-state-desc">Explore as obras e use o botão "Salvar" para guardá-las aqui.</p>
            <a href="${s}" data-link class="btn-secondary" style="margin-top: var(--space-xl); display: inline-block;">Explorar Poemas</a>
          </div>
        `;return}i.innerHTML=`
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md); max-width: var(--container-main); margin-left:auto; margin-right:auto; width: 100%;">
          <span style="font-size:0.85rem; color:var(--text-secondary); font-family:var(--font-ui);">${e.length} poema${e.length===1?``:`s`} salvo${e.length===1?``:`s`}</span>
          <button id="export-pdf-btn" class="btn-secondary" style="font-size:0.75rem; padding: 6px 12px;">📄 Exportar PDF</button>
        </div>
        <div id="favorites-list" class="favorites-list">
          ${e.map(e=>{let t=new Date(e.published_at).getFullYear();return`
              <article class="favorite-item">
                <div class="favorite-content">
                  <a href="${s}poema/${e.slug}" data-link class="favorite-link">
                    <h3 class="favorite-title">${e.title}</h3>
                    <p class="favorite-excerpt">${e.excerpt||``}</p>
                    <span class="favorite-year">${t}</span>
                  </a>
                </div>
                <button class="remove-fav-btn" data-slug="${e.slug}" aria-label="Remover dos favoritos">
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </article>
            `}).join(``)}
        </div>
      `,i.querySelectorAll(`.remove-fav-btn`).forEach(e=>{e.addEventListener(`click`,async n=>{let r=e.dataset.slug;await t.remove(r),l(),window.dispatchEvent(new CustomEvent(`favorites-updated`))})}),document.getElementById(`export-pdf-btn`)?.addEventListener(`click`,()=>{let t=document.createElement(`div`);t.id=`print-library-container`,t.innerHTML=e.map(e=>`
          <div class="print-poem">
            <h1 class="print-poem-title">${e.title}</h1>
            <div class="print-poem-content">${e.content}</div>
          </div>
        `).join(``),document.body.appendChild(t),window.print(),setTimeout(()=>{t.remove()},1e3)})},u=async()=>{let t=await e.list();if(t.length===0){i.innerHTML=`
          <div class="empty-state">
            <p class="empty-state-label">⏳</p>
            <h2 class="empty-state-title">Nenhum poema lido recentemente.</h2>
            <p class="empty-state-desc">Os poemas que você ler aparecerão aqui no histórico.</p>
            <a href="${s}" data-link class="btn-secondary" style="margin-top: var(--space-xl); display: inline-block;">Explorar Poemas</a>
          </div>
        `;return}i.innerHTML=`
        <div class="history-clear-container">
          <button id="clear-history-btn" class="btn-clear-history">Limpar Histórico</button>
        </div>
        <div id="history-list" class="favorites-list">
          ${t.map(e=>{let t=new Date(e.read_at).toLocaleString(`pt-BR`,{day:`2-digit`,month:`2-digit`,hour:`2-digit`,minute:`2-digit`});return`
              <article class="favorite-item">
                <div class="favorite-content">
                  <a href="${s}poema/${e.slug}" data-link class="favorite-link">
                    <h3 class="favorite-title">${e.title}</h3>
                    <p class="favorite-excerpt">${e.excerpt||``}</p>
                    <span class="favorite-year">Lido em: ${t}</span>
                  </a>
                </div>
              </article>
            `}).join(``)}
        </div>
      `,document.getElementById(`clear-history-btn`)?.addEventListener(`click`,async()=>{confirm(`Deseja realmente limpar todo o histórico de leitura?`)&&(await e.clear(),u())})},d=()=>{c===`favorites`?(a.classList.add(`active`),o.classList.remove(`active`),l()):(a.classList.remove(`active`),o.classList.add(`active`),u())};a.addEventListener(`click`,()=>{c=`favorites`,d()}),o.addEventListener(`click`,()=>{c=`history`,d()}),d()}};export{r as default};