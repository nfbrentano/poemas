import{_ as e,b as t,i as n,m as r,o as i,p as a,r as o,s,y as c}from"./index-fdOadyoa.js";import{_ as l,g as u,p as d,u as f}from"./vendor-firebase-vW9DHoZS.js";import{t as p}from"./firebase-B_dJRC60.js";import{n as m,t as h}from"./sentiments-2sfSWUex.js";var g={meta:{title:`Sentimento`},async render(o,_){let v=typeof _==`object`?_.slug:_,y=c(v||``);if(o.innerHTML=`
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
    `,!y){this.renderNotFound(o);return}let b=[],x=``,S={};try{let t=d(l(p,`poems`),u(`status`,`==`,`published`));(await f(t)).forEach(t=>{let n={id:t.id,...t.data()},r=Array.isArray(n.tags)?n.tags:[],i=!1;r.forEach(t=>{c(t)===y&&(i=!0,x||=e(t))}),i&&(b.push(n),r.forEach(t=>{let n=c(t);n&&n!==y&&(S[n]||(S[n]={slug:n,name:e(t),count:0}),S[n].count+=1)}))})}catch(e){console.error(`[Sentiment] Error fetching poems:`,e)}if(b.length===0){this.renderNotFound(o);return}b.sort((e,t)=>new Date(t.published_at)-new Date(e.published_at));let C=m(y,x),w=`Poemas sobre ${C}`,T=h(C,y),E=b.length,D=`${E===1?`1 poema`:`${E} poemas`} sobre ${C.toLowerCase()}. ${T}`.slice(0,160),O=`${i}/sentimento/${y}/`,k=[{name:`Início`,url:`${i}/`},{name:`Sentimentos`,url:`${i}/sentimentos/`},{name:C,url:O}],A=E>=3,j=A?void 0:`noindex, follow`;g.meta={title:w,description:D,robots:j},document.title=`${w} — Natanael Fernando Gatti Brentano`,n({title:w,description:D,url:O,robots:j,type:`website`,structuredData:A?[r(C,y,b,T),s(k)]:[]});let M=Object.values(S).sort((e,t)=>t.count-e.count).slice(0,6),N=M.length>0?`
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
    `:``;o.innerHTML=`
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
          ${b.map(e=>{let n=new Date(e.published_at).getFullYear();return`
              <article class="poem-row">
                <a href="/poema/${t(e.slug)}/" class="poem-row-link" data-link>
                  <h3 class="poem-row-title">${t(e.title)}</h3>
                  <span class="poem-row-year">${n}</span>
                </a>
              </article>
            `}).join(``)}
        </div>
      </section>
    `},renderNotFound(e){g.meta={title:`Página não encontrada`,robots:`noindex, follow`},o(),e.innerHTML=`
      <div class="not-found-page fade-in">
        <p class="not-found-label">404</p>
        <h2 class="not-found-title">Sentimento não encontrado</h2>
        <p class="not-found-desc">Não encontramos poemas para o sentimento solicitado.</p>
        <a href="/sentimentos/" data-link class="not-found-link">← Ver todos os sentimentos</a>
      </div>
    `}};export{g as default,g as sentiment};