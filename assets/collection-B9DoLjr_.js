import{o as e}from"./index-BHLKTwRq.js";var t={async render(t,n){let r=typeof n==`object`?n.slug:n;t.innerHTML=`<div class="loading">Carregando coleção...</div>`;let{data:i,error:a}=await e.from(`collections`).select(`*, collection_poems(poems(*))`).eq(`slug`,r).single();if(a||!i){t.innerHTML=`<div class="error">Coleção não encontrada.</div>`;return}let o=i.collection_poems.map(e=>e.poems).filter(e=>e.status===`published`);t.innerHTML=`
      <section class="collection-detail fade-in">
        <header class="collection-header">
          <a href="/poemas/colecoes" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${i.name}</h1>
          <p class="collection-desc-large">${i.description||``}</p>
        </header>

        <div class="poems-list">
          ${o.length>0?o.map(e=>`
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