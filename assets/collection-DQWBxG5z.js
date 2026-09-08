import{_ as e,g as t,p as n,u as r}from"./vendor-firebase-BaoyJsfj.js";import{db as i}from"./firebase-DvthlrAF.js";var a={async render(a,o){let s=typeof o==`object`?o.slug:o;a.innerHTML=`<div class="loading">Carregando coleção...</div>`;let c=null,l=null;try{let a=n(e(i,`collections`),t(`slug`,`==`,s)),o=await r(a);if(o.empty)l=Error(`Not found`);else{let a=o.docs[0];c={id:a.id,...a.data(),collection_poems:[]};let s=n(e(i,`collection_poems`),t(`collection_id`,`==`,c.id)),l=(await r(s)).docs.map(e=>e.data().poem_id);if(l.length>0){let t=n(e(i,`poems`)),a=await r(t),o=[];a.forEach(e=>{l.includes(e.id)&&o.push({id:e.id,...e.data()})}),c.collection_poems=o.map(e=>({poems:e}))}}}catch(e){l=e}if(l||!c){a.innerHTML=`<div class="error">Coleção não encontrada.</div>`;return}let u=c.collection_poems.map(e=>e.poems).filter(e=>e.status===`published`);a.innerHTML=`
      <section class="collection-detail fade-in">
        <header class="collection-header">
          <a href="/colecoes" class="back-link" data-link>← Voltar para coleções</a>
          <h1 class="collection-title">${c.name}</h1>
          <p class="collection-desc-large">${c.description||``}</p>
        </header>

        <div class="poems-list">
          ${u.length>0?u.map(e=>`
            <article class="poem-row">
              <a href="/poema/${e.slug}" class="poem-row-link" data-link>
                <h3 class="poem-row-title">${e.title}</h3>
                <span class="poem-row-year">${new Date(e.published_at).getFullYear()}</span>
              </a>
            </article>
          `).join(``):`<p>Nenhum poema nesta coleção ainda.</p>`}
        </div>
      </section>
    `}};export{a as collection,a as default};