import{t as e}from"./index-Wu1speV6.js";import{t}from"./seo-CbZTOP9l.js";var n={meta:{title:`Poemas Salvos`},cleanup(){},async render(n){t({title:`Poemas Salvos`,description:`Sua coleção pessoal de poemas favoritos.`,type:`website`}),n.innerHTML=`
      <div class="favorites-page fade-in">
        <header class="page-header">
          <h1 class="page-title">Poemas Salvos</h1>
          <p class="page-subtitle">Sua biblioteca pessoal disponível offline.</p>
        </header>
        
        <div id="favorites-list" class="favorites-list">
          <div class="loading-container">Carregando seus favoritos...</div>
        </div>
      </div>
    `;let r=document.getElementById(`favorites-list`),i=`/poemas/`,a=async()=>{let t=await e.list();if(t.length===0){r.innerHTML=`
          <div class="empty-state">
            <p class="empty-state-label">♡</p>
            <h2 class="empty-state-title">Nenhum poema salvo ainda.</h2>
            <p class="empty-state-desc">Explore as obras e use o botão "Salvar" para guardá-las aqui.</p>
            <a href="${i}" data-link class="btn-secondary" style="margin-top: var(--space-xl); display: inline-block;">Explorar Poemas</a>
          </div>
        `;return}r.innerHTML=t.map(e=>{let t=new Date(e.published_at).getFullYear();return`
          <article class="favorite-item">
            <div class="favorite-content">
              <a href="${i}poema/${e.slug}" data-link class="favorite-link">
                <h3 class="favorite-title">${e.title}</h3>
                <p class="favorite-excerpt">${e.excerpt||``}</p>
                <span class="favorite-year">${t}</span>
              </a>
            </div>
            <button class="remove-fav-btn" data-slug="${e.slug}" aria-label="Remover dos favoritos">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </article>
        `}).join(``),r.querySelectorAll(`.remove-fav-btn`).forEach(t=>{t.addEventListener(`click`,async n=>{let r=t.dataset.slug;await e.remove(r),a(),window.dispatchEvent(new CustomEvent(`favorites-updated`))})})};a()}};export{n as default};