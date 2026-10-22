import{_ as e,n as t,t as n}from"./index-DadoRXS-.js";import{_ as r,g as i,p as a,u as o}from"./vendor-firebase-vW9DHoZS.js";import{t as s}from"./firebase-D6obsgpN.js";var c=null,l={async fetchMetadata(t=null){if(c)return{tags:c};let n=t;if(!n)try{let e=a(r(s,`poems`),i(`status`,`==`,`published`)),t=await o(e),c=[];t.forEach(e=>{let t=e.data();c.push({tags:t.tags})}),n=c}catch{n=[]}let l={};n?.forEach(t=>{(t.tags||[]).forEach(t=>{let n=e(t);n&&(l[n]=(l[n]||0)+1)})});let u=Object.keys(l).map(e=>({name:e,count:l[e]})).sort((e,t)=>t.count-e.count).slice(0,20);return u.length>0&&(c=u),{tags:u}},render(e=[]){return`
      <div class="filter-section fade-in">
        <div class="filter-group">
          <span class="filter-label">Sentimentos:</span>
          <div class="filter-chips" id="tag-filters">
            <div id="dynamic-tags" class="filter-chips-scroll">
              <button class="filter-chip ${e.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>
            </div>
          </div>
        </div>
      </div>
    `},async init(e,r=[],i=null){let{tags:a}=await this.fetchMetadata(i),o=e.querySelector(`#dynamic-tags`);o&&(o.innerHTML=`<button class="filter-chip ${r.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>`+a.map(e=>`
        <button class="filter-chip ${r.includes(e.name)?`active`:``}" data-type="tag" data-value="${e.name}">
          ${e.name} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em; margin-left: 2px;">(${e.count})</span>
        </button>
      `).join(``)),e.querySelectorAll(`.filter-chip`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.value,i=[...r];if(n===`all`)i=[];else{let e=i.indexOf(n);e>-1?i.splice(e,1):i.push(n)}let a=new URLSearchParams(window.location.search);i.length>0?a.set(`tags`,i.join(`,`)):a.delete(`tags`);let o=a.toString(),s=`/`.replace(/\/$/,``),c=window.location.pathname.replace(s,``)||`/`;t(c+(o?`?${o}`:``))})});let s=e.querySelector(`.filter-chip.active`);s&&o&&setTimeout(()=>{let e=o.getBoundingClientRect(),t=s.getBoundingClientRect().left-e.left-20;t!==0&&typeof o.scrollBy==`function`&&o.scrollBy({left:t,behavior:n()})},50)}};export{l as t};