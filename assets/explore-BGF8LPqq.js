import{i as e,o as t}from"./index-DM3vFeyv.js";import{t as n}from"./seo-BlITGSmq.js";var r={meta:{title:`Explorar`},async render(r){e(`/explore`),n({title:`Explorar Poemas - Natanael Brentano`,description:`Navegue visualmente pelos temas e obras na forma de constelações literárias.`,url:window.location.href,type:`website`}),r.innerHTML=`
      <div class="explore-container fade-in">
        <header class="page-header" style="text-align: center; margin-bottom: 2rem;">
          <h1 class="page-title">Mapa Literário</h1>
          <p class="page-subtitle">Uma constelação de temas e sentimentos. Clique para explorar.</p>
        </header>
        <div class="explore-map" id="explore-map">
          <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color: var(--text-muted); font-family: var(--font-ui);">Mapeando sentimentos...</div>
        </div>
      </div>
    `;let i=document.getElementById(`explore-map`),{data:a,error:o}=await t.from(`poems`).select(`tags`).eq(`status`,`published`);if(o||!a){console.error(`Error fetching tags:`,o),i.innerHTML=`<p style="text-align:center; padding-top: 20%;">O mapa está obscurecido por nuvens. Tente novamente mais tarde.</p>`;return}let s={};a.forEach(e=>{Array.isArray(e.tags)&&e.tags.forEach(e=>{s[e]=(s[e]||0)+1})});let c=Object.keys(s).map(e=>({tag:e,count:s[e]})).sort((e,t)=>t.count-e.count);if(c.length===0){i.innerHTML=`<p style="text-align:center; padding-top: 20%;">Ainda não há sentimentos mapeados.</p>`;return}i.innerHTML=``;let l=window.innerWidth<768;l&&(i.style.display=`grid`,i.style.gridTemplateColumns=`repeat(auto-fill, minmax(130px, 1fr))`,i.style.gap=`var(--space-sm)`,i.style.padding=`var(--space-sm)`,i.style.height=`auto`,i.style.minHeight=`0`,i.style.background=`transparent`,i.style.border=`none`),c.forEach((e,t)=>{let n=Math.max(80,Math.min(160,60+e.count*15)),r=10+Math.random()*70,a=5+Math.random()*80,o=Math.random()*2+`s`,s=4+Math.random()*3+`s`,c=document.createElement(`a`);c.href=`/poemas/?tag=${encodeURIComponent(e.tag)}`,c.className=`explore-node fade-in`,c.setAttribute(`data-link`,``),l?(c.style.position=`relative`,c.style.width=`100%`,c.style.height=`auto`,c.style.aspectRatio=`1.3 / 1`,c.style.animation=`none`,c.style.transform=`none`,c.style.borderRadius=`16px`,c.style.padding=`var(--space-sm)`,c.style.boxShadow=`0 4px 12px rgba(0, 0, 0, 0.15)`):(c.style.width=n+`px`,c.style.height=n+`px`,c.style.top=r+`%`,c.style.left=a+`%`,c.style.zIndex=Math.floor(n),c.style.animationDelay=o,c.style.animationDuration=s),t%3==0&&(c.style.borderColor=`var(--accent-subtle)`,c.style.color=`var(--accent-subtle)`),c.innerHTML=`
        <div>
          <div class="explore-node-tag">${e.tag}</div>
          <div class="explore-node-count">${e.count} obra${e.count===1?``:`s`}</div>
        </div>
      `,i.appendChild(c)})}};export{r as default};