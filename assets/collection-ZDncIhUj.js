import{t as e}from"./supabase-C7rZ412s.js";var t={async render(t,n){t.innerHTML=`<div class="loading">Carregando coleção...</div>`;let{data:r,error:i}=await e.from(`collections`).select(`*, collection_poems(poems(*))`).eq(`slug`,n).single();if(i||!r){t.innerHTML=`<div class="error">Coleção não encontrada.</div>`;return}let a=r.collection_poems.map(e=>e.poems).filter(e=>e.status===`published`);t.innerHTML=`
      <section class="collection-detail fade-in">
        <header class="collection-header">
          <a href="/poemas/colecoes" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${r.name}</h1>
          <p class="collection-desc-large">${r.description||``}</p>
        </header>

        <div class="poems-list">
          ${a.length>0?a.map(e=>`
            <article class="poem-row">
              <a href="/poemas/poema/${e.slug}" class="poem-row-link" data-link>
                <h3 class="poem-row-title">${e.title}</h3>
                <span class="poem-row-year">${new Date(e.published_at).getFullYear()}</span>
              </a>
            </article>
          `).join(``):`<p>Nenhum poema nesta coleção ainda.</p>`}
        </div>
      </section>
    `}};export{t as collection,t as default};