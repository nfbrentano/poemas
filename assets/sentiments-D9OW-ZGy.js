import{a as e,t}from"./html-DUzinkfe.js";import{_ as n,c as r,h as i,l as a,o,x as s,y as c}from"./index-BNfYksz6.js";import{t as l}from"./poems-store-DqDF5aZD.js";import{n as u}from"./sentiments-BrMyzAOo.js";var d={meta:{title:`Poemas por Sentimento — Natanael Fernando Gatti Brentano`,description:`Explore todos os sentimentos e temas dos poemas de Natanael Fernando Gatti Brentano.`},async render(f){let p=f.getAttribute(`data-prerendered`)===`/sentimentos`;p||(f.innerHTML=`
        <section class="sentiments-page fade-in">
          <header class="page-header sentiments-header">
            <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
            <div class="skeleton" style="width: 80%; height: 20px;"></div>
          </header>
          <div class="sentiments-grid">
            <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
            <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
            <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
          </div>
        </section>
      `);let m=new Map;try{(await l()).forEach(e=>{(Array.isArray(e.tags)?e.tags:[]).forEach(e=>{let t=s(e);t&&(m.has(t)||m.set(t,{slug:t,name:u(t,c(e)),count:0}),m.get(t).count+=1)})})}catch(e){console.error(`[Sentiments] Error fetching poems:`,e)}let h=Array.from(m.values()).filter(e=>e.count>=3).sort((e,t)=>t.count-e.count||e.name.localeCompare(t.name));if(h.length===0&&p){f.removeAttribute(`data-prerendered`);return}let g=`${r}/sentimentos/`,_=[{name:`Início`,url:`${r}/`},{name:`Sentimentos`,url:g}],v=`Poemas por Sentimento — Natanael Fernando Gatti Brentano`,y=`Navegue pelos poemas organizados por sentimentos e temas, descobrindo versos sobre amor, saudade, efêmero e vida.`;d.meta={title:v,description:y},document.title=v,o({title:v,description:y,url:g,type:`website`,structuredData:[n(h),a(_)]}),p?f.removeAttribute(`data-prerendered`):f.innerHTML=e(`
      <section class="sentiments-page fade-in">
        <header class="page-header sentiments-header">
          ${i(_)}
          <h1 class="page-title sentiments-title">Poemas por Sentimento</h1>
          <p class="page-description sentiments-description">
            Navegue pelos poemas organizados por sentimentos e temas. Cada página reúne versos que exploram uma emoção, reflexão ou estado de espírito.
          </p>
        </header>

        <div class="sentiments-grid">
          ${h.length>0?h.map(e=>`
            <a href="/sentimento/${t(e.slug)}/" class="sentiment-card" data-link>
              <span class="sentiment-name">${t(e.name)}</span>
              <span class="sentiment-badge">${e.count} poemas</span>
            </a>
          `).join(``):`<p class="empty-state-desc">Nenhum sentimento com poemas suficientes encontrado.</p>`}
        </div>
      </section>
    `)}};export{d as default,d as sentiments};