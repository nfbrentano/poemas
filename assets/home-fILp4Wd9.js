import{i as e}from"./index-C-Khbs-6.js";import{n as t,t as n}from"./newsletter-BJ8K9ijl.js";var r={meta:{title:`Natanael Brentano - Poemas`},cleanup(){let e=document.getElementById(`header-search-input`);e&&e._handleSearch&&(e.removeEventListener(`input`,e._handleSearch),e._handleSearch=null)},async render(r){t({title:`Natanael Brentano — Poemas`,description:`Poesia contemporânea e textos curtos sobre o efêmero.`,type:`website`}),r.innerHTML=`
      <div class="home-layout fade-in">
        <section class="hero-section">
          <div class="skeleton skeleton-title-large"></div>
          <div class="skeleton skeleton-text-center"></div>
          <div class="skeleton skeleton-text-center-short"></div>
        </section>
        <section class="poems-list">
          <div class="skeleton skeleton-featured"></div>
          ${[,,,,].fill(0).map(()=>`
            <div class="skeleton-row">
              <div class="skeleton skeleton-text" style="width: 50%;"></div>
              <div class="skeleton skeleton-text" style="width: 10%;"></div>
            </div>
          `).join(``)}
        </section>
      </div>
    `;let{data:i,error:a}=await e.from(`poems`).select(`id, title, slug, excerpt, tags, published_at`).eq(`status`,`published`).order(`published_at`,{ascending:!1});if(a){console.error(a),r.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">!</p>
          <h2 class="empty-state-title">Algo deu errado.</h2>
          <p class="empty-state-desc">Não foi possível carregar os poemas. Tente recarregar a página.</p>
        </div>
      `;return}if(!i||i.length===0){r.innerHTML=`
        <div class="empty-state fade-in">
          <p class="empty-state-label">—</p>
          <h2 class="empty-state-title">O silêncio ainda impera.</h2>
          <p class="empty-state-desc">Nenhum poema publicado no momento.</p>
        </div>
      `;return}let o=new Date().toISOString().slice(0,10).split(``).reduce((e,t)=>e+t.charCodeAt(0),0)%i.length,s=i[o],c=i.filter((e,t)=>t!==o),l=`/poemas/`,u=(e,t=!1,n=``)=>e.length===0?`
          <p class="search-empty-msg">
            Nenhum poema encontrado para "<strong>${n}</strong>".
          </p>
        `:e.map((e,n)=>{let r=new Date(e.published_at).getFullYear(),i=new Date(e.published_at).toLocaleDateString(`pt-BR`,{month:`long`,year:`numeric`});return!t&&n===0?`
          <article class="poem-featured fade-in">
            <a href="${l}poema/${e.slug}" data-link>
              <h2 class="featured-title">${e.title}</h2>
              <div class="featured-excerpt">${e.excerpt||``}</div>
              <div class="featured-meta">
                <span>${i}</span>
                ${e.tags&&e.tags.length>0?`<span>•</span><span>${e.tags[0]}</span>`:``}
              </div>
            </a>
            <div class="featured-separator"></div>
          </article>
          `:`
        <article class="poem-row fade-in">
          <a href="${l}poema/${e.slug}" data-link class="poem-row-link">
            <h3 class="poem-row-title">${e.title}</h3>
            <span class="poem-row-year">${r}</span>
          </a>
        </article>
      `}).join(``);r.innerHTML=`
      <div class="home-layout">
        
        <section class="poem-of-day fade-in">
          <p class="pod-label">— poema do dia —</p>
          <a href="${l}poema/${s.slug}" data-link class="pod-link">
            <h2 class="pod-title">${s.title}</h2>
            <p class="pod-excerpt">${s.excerpt||``}</p>
          </a>
        </section>

        <section class="hero-section fade-in">
          <h1></h1>
          <p></p>
        </section>

        <section class="poems-list fade-in">
          <input type="search" id="search-input" placeholder="Buscar poema..." aria-label="Buscar poema">
          <div class="list-container">
            ${u(c)}
          </div>
        </section>
        
        ${n.render()}
      </div>
    `;let d=document.getElementById(`search-input`),f=r.querySelector(`.list-container`);d&&f&&d.addEventListener(`input`,e=>{let t=e.target.value.toLowerCase().trim(),n=t.length>0;f.innerHTML=u(n?c.filter(e=>e.title.toLowerCase().includes(t)||e.excerpt&&e.excerpt.toLowerCase().includes(t)):c,n,t)}),n.init()}};export{r as default};