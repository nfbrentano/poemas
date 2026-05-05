import{t as e}from"./supabase-C7rZ412s.js";var t={async render(t){t.innerHTML=`
      <section class="collections-page fade-in">
        <header class="page-header">
          <h1 class="page-title">Coleções</h1>
          <p class="page-subtitle">Séries temáticas e livros catalogados</p>
        </header>
        <div id="collections-grid" class="collections-grid">
          <div class="loading">Carregando coleções...</div>
        </div>
      </section>
    `;let n=t.querySelector(`#collections-grid`),{data:r,error:i}=await e.from(`collections`).select(`*, collection_poems(count)`).order(`created_at`,{ascending:!1});if(i||!r||r.length===0){n.innerHTML=`<p class="empty-msg">Nenhuma coleção encontrada ainda.</p>`;return}n.innerHTML=r.map(e=>`
      <a href="/poemas/colecao/${e.slug}" class="collection-card" data-link>
        ${e.image_url?`<img src="${e.image_url}" alt="${e.name}" class="collection-img">`:`<div class="collection-img-placeholder"></div>`}
        <div class="collection-info">
          <h2 class="collection-name">${e.name}</h2>
          <p class="collection-desc">${e.description||``}</p>
          <span class="collection-count">${e.collection_poems?.[0]?.count||0} poemas</span>
        </div>
      </a>
    `).join(``)}};export{t as collections,t as default};