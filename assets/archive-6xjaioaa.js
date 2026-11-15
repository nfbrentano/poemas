import{a as e,t}from"./html-MqnEuzWn.js";import{S as n,b as r,c as i,g as a,l as o,o as s,u as c}from"./index-DM_Ebsql.js";import{t as l}from"./poems-store-vfUtCRue.js";import{trackPageView as u}from"./analytics-CvdsQXZE.js";function d(e){if(!e){let e=new Date;return{date:e,year:e.getFullYear(),timestamp:e.getTime()}}if(typeof e==`object`&&typeof e.toDate==`function`){let t=e.toDate();return{date:t,year:t.getFullYear(),timestamp:t.getTime()}}if(typeof e==`object`&&typeof e.seconds==`number`){let t=new Date(e.seconds*1e3);return{date:t,year:t.getFullYear(),timestamp:t.getTime()}}if(typeof e==`string`){let t=e.trim();if(/^\d{4}-\d{2}-\d{2}$/.test(t)){let e=parseInt(t.slice(0,4),10),n=new Date(`${t}T12:00:00Z`);return{date:n,year:e,timestamp:n.getTime()}}}let t=new Date(e),n=t.getTime();if(Number.isNaN(n)){let e=new Date;return{date:e,year:e.getFullYear(),timestamp:e.getTime()}}let r=t.getFullYear();if(typeof e==`string`&&/^\d{4}/.test(e)){let t=parseInt(e.slice(0,4),10);!Number.isNaN(t)&&Math.abs(t-r)===1&&(r=t)}return{date:t,year:r,timestamp:n}}function f(e=[]){return Array.isArray(e)?e.filter(e=>{if(!e||typeof e!=`object`||e.status!==`published`||!e.slug||typeof e.slug!=`string`)return!1;let t=e.published_at||e.created_at;if(!t)return!1;let{timestamp:n}=d(t);return!Number.isNaN(n)}):[]}function p(e=[]){let t=f(e);if(t.length===0)return[];let n=[...t].sort((e,t)=>d(e.published_at||e.created_at).timestamp-d(t.published_at||t.created_at).timestamp),r=[];return n.forEach((e,t)=>{let n=t+1,i=t===0,a=n%50==0;if(i||a){let{date:t,year:a}=d(e.published_at||e.created_at);r.push({number:n,label:i?`1º Poema Publicado`:`${n}º Poema Catalogado`,poemId:e.id,title:e.title||`Sem título`,slug:e.slug,date:t.toISOString(),year:a,dateFormatted:t.toLocaleDateString(`pt-BR`,{day:`numeric`,month:`long`,year:`numeric`,timeZone:`UTC`})})}}),r}function m(e=[],{sortOrder:t=`desc`}={}){let i=f(e);if(i.length===0)return[];let a=p(i),o=new Map;a.forEach(e=>{o.has(e.year)||o.set(e.year,[]),o.get(e.year).push(e)});let s=new Map;i.forEach(e=>{let{year:t}=d(e.published_at||e.created_at);s.has(t)||s.set(t,{year:t,poems:[],tagCounts:{}});let n=s.get(t);n.poems.push(e),Array.isArray(e.tags)&&e.tags.forEach(e=>{if(!e)return;let t=String(e).trim();t&&(n.tagCounts[t]=(n.tagCounts[t]||0)+1)})});let c=Array.from(s.values()).map(e=>{let i=[...e.poems].sort((e,n)=>{let r=d(e.published_at||e.created_at).timestamp,i=d(n.published_at||n.created_at).timestamp;return t===`asc`?r-i:i-r}),a=Object.entries(e.tagCounts).sort((e,t)=>t[1]-e[1]||e[0].localeCompare(t[0])).slice(0,4).map(([e,t])=>({tag:e,count:t,slug:n(e),name:r(e)}));return{year:e.year,count:e.poems.length,poems:i,topSentiments:a,milestones:o.get(e.year)||[]}});return c.sort((e,n)=>t===`asc`?e.year-n.year:n.year-e.year),c}function h(e=[]){let t=f(e);if(t.length===0)return{totalPoems:0,startYear:new Date().getFullYear(),latestYear:new Date().getFullYear(),yearsCount:0,peakYear:null,milestones:[]};let n=p(t),r=t.map(e=>d(e.published_at||e.created_at).year),i=Array.from(new Set(r)).sort((e,t)=>e-t),a={};r.forEach(e=>{a[e]=(a[e]||0)+1});let o=null,s=-1;return Object.entries(a).forEach(([e,t])=>{let n=Number(e);(t>s||t===s&&n>(o?o.year:0))&&(s=t,o={year:n,count:t})}),{totalPoems:t.length,startYear:i[0]||new Date().getFullYear(),latestYear:i[i.length-1]||new Date().getFullYear(),yearsCount:i.length,peakYear:o,milestones:n}}function g({poems:e=[],sortOrder:n=`desc`,baseUrl:r=`/`}={}){let i=r.endsWith(`/`)?r:`${r}/`,o=h(e),s=m(e,{sortOrder:n}),c=[{name:`Início`,url:i},{name:`Arquivo e Linha do Tempo`,url:`${i}arquivo/`}],l=a(c),u=s.map(e=>`
    <a href="#ano-${e.year}" class="year-chip" title="Ir para o ano ${e.year}">
      <span class="year-chip-label">${e.year}</span>
      <span class="year-chip-count">${e.count}</span>
    </a>
  `).join(``),f=``;o.milestones.length>0&&(f=`
      <section class="archive-milestones-section" aria-label="Marcos Literários da Obra">
        <div class="archive-section-header">
          <h2 class="archive-section-title">Marcos Literários da Trajetória</h2>
          <span class="archive-section-subtitle">Obras que marcaram o crescimento do acervo poético</span>
        </div>
        <div class="archive-milestones-grid">
          ${o.milestones.map(e=>`
      <div class="archive-milestone-card">
        <div class="milestone-badge">
          <span class="milestone-badge-icon" aria-hidden="true">✦</span>
          <span class="milestone-badge-label">${t(e.label)}</span>
        </div>
        <a href="${i}poema/${t(e.slug)}/" class="milestone-title-link" data-link>
          ${t(e.title)}
        </a>
        <div class="milestone-date">
          <time datetime="${t(e.date.slice(0,10))}">${t(e.dateFormatted)}</time>
        </div>
      </div>
    `).join(``)}
        </div>
      </section>
    `);let p=s.map(e=>{let n=e.topSentiments.length>0?`
      <div class="archive-year-sentiments">
        <span class="archive-sentiments-label">Temas frequentes:</span>
        ${e.topSentiments.map(e=>`
          <a href="${i}sentimento/${t(e.slug)}/" class="archive-tag-chip" data-link>#${t(e.name)}</a>
        `).join(``)}
      </div>
    `:``,r=e.milestones.length>0?`
      <div class="archive-year-milestones-banner" role="note">
        ${e.milestones.map(e=>`
          <div class="year-milestone-item">
            <span class="milestone-star" aria-hidden="true">★</span>
            <span><strong>${t(e.label)}:</strong> <a href="${i}poema/${t(e.slug)}/" data-link>${t(e.title)}</a></span>
          </div>
        `).join(``)}
      </div>
    `:``,a=e.poems.map(e=>{let{date:n}=d(e.published_at||e.created_at),r=n.toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`short`,timeZone:`UTC`}).replace(`.`,``);return`
        <li class="archive-poem-item">
          <time datetime="${n.toISOString().slice(0,10)}" class="archive-poem-date">${r}</time>
          <a href="${i}poema/${t(e.slug)}/" class="archive-poem-link" data-link>
            ${t(e.title)}
          </a>
        </li>
      `}).join(``);return`
      <section id="ano-${e.year}" class="archive-year-section">
        <div class="archive-year-header">
          <div class="archive-year-headline">
            <h2 class="archive-year-title">${e.year}</h2>
            <span class="archive-year-count-badge">${e.count} ${e.count===1?`poema`:`poemas`}</span>
          </div>
          ${n}
        </div>
        ${r}
        <ul class="archive-poems-list">
          ${a}
        </ul>
      </section>
    `}).join(``);return`
    <div class="archive-container container">
      ${l}
      
      <header class="archive-hero fade-in">
        <h1 class="page-title">Arquivo & Linha do Tempo</h1>
        <p class="page-subtitle">
          Uma jornada poética viva através dos anos: <strong>${o.totalPoems}</strong> poemas publicados desde <strong>${o.startYear}</strong> até <strong>${o.latestYear}</strong>.
        </p>
        
        <div class="archive-stats-strip">
          <div class="archive-stat-item">
            <span class="archive-stat-value">${o.totalPoems}</span>
            <span class="archive-stat-label">Poemas Catalogados</span>
          </div>
          <div class="archive-stat-item">
            <span class="archive-stat-value">${o.yearsCount}</span>
            <span class="archive-stat-label">Anos de Publicação</span>
          </div>
          ${o.peakYear?`
            <div class="archive-stat-item">
              <span class="archive-stat-value">${o.peakYear.year}</span>
              <span class="archive-stat-label">Ano Mais Produtivo (${o.peakYear.count} poemas)</span>
            </div>
          `:``}
        </div>
      </header>

      ${f}

      <div class="archive-toolbar" role="region" aria-label="Controles e navegação por ano">
        <div class="archive-nav-wrapper">
          <span class="archive-nav-title">Saltar para o ano:</span>
          <nav class="archive-year-nav" aria-label="Navegação rápida por ano">
            ${u}
          </nav>
        </div>

        <div class="archive-sort-wrapper">
          <span class="archive-sort-title">Ordem dos anos:</span>
          <div class="archive-sort-buttons" role="group" aria-label="Alternar ordem cronológica">
            <button type="button" id="archive-sort-desc" class="btn-archive-sort ${n===`desc`?`active`:``}" data-sort="desc" aria-pressed="${n===`desc`}">
              Mais recentes primeiro
            </button>
            <button type="button" id="archive-sort-asc" class="btn-archive-sort ${n===`asc`?`active`:``}" data-sort="asc" aria-pressed="${n===`asc`}">
              Ordem cronológica (2015 → atual)
            </button>
          </div>
        </div>
      </div>

      <div id="archive-years-container" class="archive-years-container">
        ${p}
      </div>

      <div class="archive-footer-callout">
        <p>Procurando um sentimento ou tema específico?</p>
        <div style="display: flex; gap: var(--space-sm); justify-content: center; flex-wrap: wrap;">
          <a href="${i}sentimentos/" class="btn-secondary" data-link>Explorar Sentimentos</a>
          <a href="${i}colecoes/" class="btn-secondary" data-link>Explorar Coleções</a>
          <a href="${i}aleatorio" class="btn-primary" data-link>⚄ Poema Aleatório</a>
        </div>
      </div>
    </div>
  `}var _=`desc`,v=null,y={meta:{title:`Arquivo e Linha do Tempo Literária — Natanael Fernando Gatti Brentano`},async render(t,n={}){let r=`${i}/arquivo/`,a=[{name:`Início`,url:`${i}/`},{name:`Arquivo e Linha do Tempo`,url:r}],d=t.getAttribute(`data-prerendered`)===`/arquivo`;s({title:`Arquivo e Linha do Tempo Literária — Natanael Fernando Gatti Brentano`,description:`Linha do tempo cronológica com marcos literários de todas as obras publicadas desde 2015 por Natanael Fernando Gatti Brentano.`,url:r,type:`website`,structuredData:[o([]),c(a)]}),u(`/arquivo`,`Arquivo e Linha do Tempo Literária`);let p=[];if(d)t.removeAttribute(`data-prerendered`),l().then(e=>{p=e}).catch(()=>{});else{t.innerHTML=e(`
        <div class="archive-container container fade-in">
          <header class="archive-hero" style="text-align: center; margin-bottom: var(--space-xl);">
            <div class="skeleton-row" style="height: 36px; max-width: 320px; margin: 0 auto var(--space-xs); border-radius: 4px;"></div>
            <div class="skeleton-row" style="height: 20px; max-width: 500px; margin: 0 auto var(--space-lg); border-radius: 4px;"></div>
          </header>
          <div class="archive-milestones-section" style="margin-bottom: var(--space-2xl);">
            <div class="skeleton-row" style="height: 120px; border-radius: 8px;"></div>
          </div>
          <div class="archive-years-container">
            <div class="skeleton-row" style="height: 180px; margin-bottom: var(--space-lg); border-radius: 6px;"></div>
            <div class="skeleton-row" style="height: 180px; margin-bottom: var(--space-lg); border-radius: 6px;"></div>
          </div>
        </div>
      `);try{p=await l()}catch(e){console.error(`[Archive] Erro ao carregar poemas:`,e),p=[]}let n=f(p);s({title:`Arquivo e Linha do Tempo Literária — Natanael Fernando Gatti Brentano`,description:`Linha do tempo cronológica com marcos literários de todas as obras publicadas desde 2015 por Natanael Fernando Gatti Brentano.`,url:r,type:`website`,structuredData:[o(n),c(a)]}),t.innerHTML=e(g({poems:n,sortOrder:_,baseUrl:`/`}))}this.cleanup(),v=async n=>{let r=n.target.closest(`.btn-archive-sort`);if(r){n.preventDefault();let i=r.getAttribute(`data-sort`);i&&i!==_&&(_=i,(!p||p.length===0)&&(p=await l()),t.innerHTML=e(g({poems:p,sortOrder:_,baseUrl:`/`})))}},t.addEventListener(`click`,v)},cleanup(){v&&=(document.removeEventListener(`click`,v),null)}};export{y as archive,y as default};