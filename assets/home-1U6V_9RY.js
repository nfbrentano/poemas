import{i as e}from"./index-HEwGkHwt.js";import{n as t,t as n}from"./newsletter-CTtF0Vn9.js";var r={meta:{title:`Natanael Brentano - Poemas`},cleanup(){let e=document.getElementById(`header-search-input`);e&&e._handleSearch&&(e.removeEventListener(`input`,e._handleSearch),e._handleSearch=null)},async render(r){t({title:`Natanael Brentano — Poemas`,description:`Poesia contemporânea e textos curtos sobre o efêmero.`}),r.innerHTML=`
      <div class="home-layout fade-in">
        <section class="hero-section">
          <div class="skeleton skeleton-title" style="margin: 0 auto 2rem auto; width: 40%; height: 4rem;"></div>
          <div class="skeleton skeleton-text" style="margin: 0 auto 0.5rem auto; width: 60%;"></div>
          <div class="skeleton skeleton-text" style="margin: 0 auto; width: 50%;"></div>
        </section>
        <section class="poems-list">
          <div class="skeleton-featured">
            <div class="skeleton skeleton-title" style="width: 70%; height: 3.5rem;"></div>
            <div class="skeleton skeleton-text" style="width: 90%;"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 30%; height: 1rem; margin-top: 1.5rem;"></div>
          </div>
          ${[,,,,].fill(0).map(()=>`
            <div class="skeleton-row">
              <div class="skeleton skeleton-text" style="width: 50%; height: 1.5rem;"></div>
              <div class="skeleton skeleton-text" style="width: 10%; height: 1rem;"></div>
            </div>
          `).join(``)}
        </section>
      </div>
    `;let{data:i,error:a}=await e.from(`poems`).select(`id, title, slug, excerpt, tags, published_at`).eq(`status`,`published`).order(`published_at`,{ascending:!1});if(a){console.error(a),r.innerHTML=`<div class="error-container">Erro ao carregar os poemas. Tente novamente mais tarde.</div>`;return}if(!i||i.length===0){r.innerHTML=`
        <div class="empty-state fade-in">
          <h2>O silêncio ainda impera.</h2>
          <p>Nenhum poema publicado no momento.</p>
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
          ${u(c)}
        </section>
        
        ${n.render()}
      </div>
    `;let d=document.getElementById(`header-search-input`),f=r.querySelector(`.poems-list`);d&&f&&(d._handleSearch&&d.removeEventListener(`input`,d._handleSearch),d._handleSearch=e=>{let t=e.target.value.toLowerCase().trim(),n=t.length>0;f.innerHTML=u(n?c.filter(e=>e.title.toLowerCase().includes(t)||e.excerpt&&e.excerpt.toLowerCase().includes(t)):c,n,t)},d.addEventListener(`input`,d._handleSearch)),n.init()}};export{r as default};