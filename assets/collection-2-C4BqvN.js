import{b as e,c as t,i as n,o as r,p as i,r as a,s as o}from"./index-3IBTfuIH.js";import{_ as s,g as c,p as l,u,y as d}from"./vendor-firebase-vW9DHoZS.js";import{t as f}from"./firebase-DJUlHAWI.js";function p({col:t,poemsList:n=[],baseUrl:a=`/`}={}){let o=`${r}/colecao/${t.slug}/`,s=[{name:`Início`,url:a},{name:`Coleções`,url:`${a}colecoes/`},{name:t.name,url:o}],c=(t.description||``).trim(),l=c?`<p class="collection-desc-large" style="margin-top: 1rem;">${e(c)}</p>`:``;return`
      <section class="collection-detail fade-in">
        <header class="collection-header">
          ${i(s)}
          <a href="${a}colecoes/" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${e(t.name)}</h1>
          <p class="collection-meta" style="color: var(--text-muted); margin-top: 0.5rem; font-size: 0.9rem;">
            ${n.length} poema${n.length===1?``:`s`}
          </p>
          ${l}
        </header>

        <div class="poems-list">
          ${n.length>0?n.map(t=>{let n=t.published_at?new Date(t.published_at).getFullYear():``;return`
            <article class="poem-row">
              <a href="${a}poema/${e(t.slug)}/" class="poem-row-link" data-link>
                <h3 class="poem-row-title">${e(t.title)}</h3>
                ${n?`<span class="poem-row-year">${n}</span>`:``}
              </a>
            </article>
          `}).join(``):`<p class="empty-state-desc">Nenhum poema publicado nesta coleção ainda.</p>`}
        </div>
      </section>
  `}var m={meta:{title:`Coleção`},async render(e,i){let h=typeof i==`object`?i.slug:i;e.innerHTML=`
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
    `;let g=null,_=null,v=[];try{let e=l(s(f,`collections`),c(`slug`,`==`,h)),t=await u(e);if(t.empty)_=Error(`Not found`);else{let e=t.docs[0];g={id:e.id,...e.data()};let n=l(s(f,`collection_poems`),c(`collection_id`,`==`,g.id)),r=await u(n),i={};r.forEach(e=>{let t=e.data();i[t.poem_id]=typeof t.order==`number`?t.order:0});let a=Object.keys(i);if(a.length>0){let e=[];for(let t=0;t<a.length;t+=30)e.push(a.slice(t,t+30));for(let t of e){let e=l(s(f,`poems`),c(d(),`in`,t),c(`status`,`==`,`published`));(await u(e)).forEach(e=>{v.push({id:e.id,...e.data(),_order:i[e.id]})})}v.sort((e,t)=>e._order!==void 0&&t._order!==void 0&&e._order!==t._order?e._order-t._order:new Date(e.published_at)-new Date(t.published_at))}}}catch(e){_=e}if(_||!g){a(),e.innerHTML=`
        <div class="not-found-page fade-in">
          <p class="not-found-label">404</p>
          <h2 class="not-found-title">Página não encontrada</h2>
          <p class="not-found-desc">A coleção que você procura não existe ou foi removida.</p>
          <a href="/colecoes/" data-link class="not-found-link">← Voltar para coleções</a>
        </div>
      `;return}let y=g.name,b=g.description||`Coleção de poemas.`,x=`${r}/colecao/${g.slug}/`,S=[{name:`Início`,url:`${r}/`},{name:`Coleções`,url:`${r}/colecoes/`},{name:g.name,url:x}];n({title:y,description:b,url:x,type:`website`,structuredData:[t(g,v),o(S)]}),m.meta.title=y,document.title=`${y} — Natanael Fernando Gatti Brentano`,e.getAttribute(`data-prerendered`)===`/colecao/${g.slug}`?e.removeAttribute(`data-prerendered`):e.innerHTML=p({col:g,poemsList:v,baseUrl:`/`})}};export{m as collection,m as default};