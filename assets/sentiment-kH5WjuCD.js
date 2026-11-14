import{a as e,t}from"./html-DUzinkfe.js";import{a as n,c as r,g as i,h as a,l as o,o as s,x as c,y as l}from"./index-BNfYksz6.js";import{t as u}from"./poems-store-DqDF5aZD.js";import{t as d}from"./favorites-DfHnCJDr.js";import{t as f}from"./collection-template-B60OdItA.js";import{n as p,t as m}from"./sentiments-BrMyzAOo.js";var h={meta:{title:`Sentimento`},async render(n,g){let _=typeof g==`object`?g.slug:g,v=c(_||``),y=!!(v&&n.getAttribute(`data-prerendered`)===`/sentimento/${v}`);if(y||(n.innerHTML=`
        <section class="collection-detail fade-in">
          <header class="collection-header">
            <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 80%; height: 20px;"></div>
          </header>
          <div class="poems-list">
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 60px; margin-bottom: 1rem; border-radius: 4px;"></div>
          </div>
        </section>
      `),!v){this.renderNotFound(n);return}let b=[],x=``,S={};try{(await u()).forEach(e=>{let t=Array.isArray(e.tags)?e.tags:[],n=!1;t.forEach(e=>{c(e)===v&&(n=!0,x||=l(e))}),n&&(b.push(e),t.forEach(e=>{let t=c(e);t&&t!==v&&(S[t]||(S[t]={slug:t,name:p(t,l(e)),count:0}),S[t].count+=1)}))})}catch(e){console.error(`[Sentiment] Error fetching poems:`,e)}if(b.length===0){if(y){n.removeAttribute(`data-prerendered`);return}this.renderNotFound(n);return}b.sort((e,t)=>new Date(t.published_at)-new Date(e.published_at));let C=p(v,x),w=`Poemas sobre ${C}`,T=m(C,v),E=b.length,D=`${E===1?`1 poema`:`${E} poemas`} sobre ${C.toLowerCase()}. ${T}`.slice(0,160),O=`${r}/sentimento/${v}/`,k=[{name:`Início`,url:`${r}/`},{name:`Sentimentos`,url:`${r}/sentimentos/`},{name:C,url:O}],A=E>=3,j=A?void 0:`noindex, follow`;if(h.meta={title:w,description:D,robots:j},document.title=`${w} — Natanael Fernando Gatti Brentano`,s({title:w,description:D,url:O,robots:j,type:`website`,structuredData:A?[i(C,v,b,T),o(k)]:[]}),y){n.removeAttribute(`data-prerendered`);return}let M=Object.values(S).sort((e,t)=>t.count-e.count).slice(0,6),N=M.length>0?`
      <div class="sentiment-related" style="margin: 1.5rem 0 2rem 0;">
        <span class="filter-label" style="display: block; margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Sentimentos relacionados:</span>
        <div class="related-sentiment-chips" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${M.map(e=>`
            <a href="/sentimento/${t(e.slug)}/" class="filter-chip" data-link>
              ${t(e.name)} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em;">(${e.count})</span>
            </a>
          `).join(``)}
        </div>
      </div>
    `:``;n.innerHTML=e(`
      <section class="collection-detail sentiment-detail fade-in">
        <header class="collection-header">
          ${a(k)}
          <a href="/sentimentos/" class="back-link" data-link>← Ver todos os sentimentos</a>
          <h1 class="collection-title">${t(w)}</h1>
          <p class="collection-meta" style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
            ${E} poema${E===1?``:`s`}
          </p>
          <p class="collection-desc-large" style="margin-top: 1rem;">${t(T)}</p>
          ${N}
        </header>

        <div class="poems-list">
          ${(()=>{let e=d();return b.map(n=>{let r=new Date(n.published_at).getFullYear(),i=f(n,140),a=e.has(n.slug)||n.id&&e.has(n.id)?` <span class="favorite-badge" aria-label="Poema favoritado" title="Poema favoritado">🔖</span>`:``;return`
                <article class="poem-row">
                  <a href="/poema/${t(n.slug)}/" class="poem-row-link" data-link>
                    <div class="poem-row-main" style="flex: 1; min-width: 0;">
                      <h3 class="poem-row-title">${t(n.title)}${a}</h3>
                      ${i?`<p class="poem-row-excerpt" style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.25rem 0 0 0; line-height: 1.5;">${t(i)}</p>`:``}
                    </div>
                    <span class="poem-row-year">${r}</span>
                  </a>
                </article>
              `}).join(``)})()}
        </div>
      </section>
    `)},renderNotFound(t){h.meta={title:`Página não encontrada`,robots:`noindex, follow`},n(),t.innerHTML=e(`
      <div class="not-found-page fade-in">
        <p class="not-found-label">404</p>
        <h2 class="not-found-title">Sentimento não encontrado</h2>
        <p class="not-found-desc">Não encontramos poemas para o sentimento solicitado.</p>
        <a href="/sentimentos/" data-link class="not-found-link">← Ver todos os sentimentos</a>
      </div>
    `)}};export{h as default,h as sentiment};