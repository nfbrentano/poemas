import{_ as e,b as t,h as n,i as r,o as i,p as a,s as o,y as s}from"./index-DadoRXS-.js";import{_ as c,g as l,p as u,u as d}from"./vendor-firebase-vW9DHoZS.js";import{t as f}from"./firebase-D6obsgpN.js";import{n as p}from"./sentiments-F9cSKC7i.js";var m={meta:{title:`Poemas por Sentimento — Natanael Fernando Gatti Brentano`,description:`Explore todos os sentimentos e temas dos poemas de Natanael Fernando Gatti Brentano.`},async render(h){h.innerHTML=`
      <section class="sentiments-page fade-in">
        <header class="page-header" style="margin-bottom: var(--space-2xl);">
          <div class="skeleton" style="width: 150px; height: 20px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="width: 60%; max-width: 400px; height: 40px; margin-bottom: 1rem;"></div>
          <div class="skeleton" style="width: 80%; height: 20px;"></div>
        </header>
        <div class="sentiments-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
          <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
          <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
          <div class="skeleton-row" style="height: 70px; border-radius: 8px;"></div>
        </div>
      </section>
    `;let g=new Map;try{let t=u(c(f,`poems`),l(`status`,`==`,`published`));(await d(t)).forEach(t=>{let n=t.data();(Array.isArray(n.tags)?n.tags:[]).forEach(t=>{let n=s(t);n&&(g.has(n)||g.set(n,{slug:n,name:p(n,e(t)),count:0}),g.get(n).count+=1)})})}catch(e){console.error(`[Sentiments] Error fetching poems:`,e)}let _=Array.from(g.values()).filter(e=>e.count>=3).sort((e,t)=>t.count-e.count||e.name.localeCompare(t.name)),v=`${i}/sentimentos/`,y=[{name:`Início`,url:`${i}/`},{name:`Sentimentos`,url:v}],b=`Poemas por Sentimento — Natanael Fernando Gatti Brentano`,x=`Navegue pelos poemas organizados por sentimentos e temas, descobrindo versos sobre amor, saudade, efêmero e vida.`;m.meta={title:b,description:x},document.title=b,r({title:b,description:x,url:v,type:`website`,structuredData:[n(_),o(y)]}),h.innerHTML=`
      <section class="sentiments-page fade-in">
        <header class="page-header" style="margin-bottom: var(--space-2xl);">
          ${a(y)}
          <h1 class="page-title" style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 2.75rem); margin-bottom: 0.75rem;">Poemas por Sentimento</h1>
          <p class="page-description" style="color: var(--text-muted); font-size: 1.05rem; max-width: 650px; line-height: 1.6;">
            Navegue pelos poemas organizados por sentimentos e temas. Cada página reúne versos que exploram uma emoção, reflexão ou estado de espírito.
          </p>
        </header>

        <div class="sentiments-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
          ${_.length>0?_.map(e=>`
            <a href="/sentimento/${t(e.slug)}/" class="sentiment-card" data-link style="padding: 1.25rem; border: 1px solid var(--border-subtle); border-radius: 8px; text-decoration: none; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease;">
              <span class="sentiment-name" style="font-weight: 500; font-family: var(--font-display); font-size: 1.1rem; color: var(--text-primary);">${t(e.name)}</span>
              <span class="sentiment-badge" style="color: var(--accent); font-size: 0.85rem; background: var(--border-subtle); padding: 3px 10px; border-radius: 12px;">${e.count} poemas</span>
            </a>
          `).join(``):`<p class="empty-state-desc">Nenhum sentimento com poemas suficientes encontrado.</p>`}
        </div>
      </section>
    `}};export{m as default,m as sentiments};