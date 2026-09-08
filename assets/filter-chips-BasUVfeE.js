import{_ as e,g as t,p as n,u as r}from"./vendor-firebase-BaoyJsfj.js";import{t as i}from"./index-Bzky9zOq.js";import{db as a}from"./firebase-DvthlrAF.js";function o(e){return typeof e==`string`?e.trim().replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim():``}function s(e){let t=o(e);return t?t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():``}var c=null,l={async fetchMetadata(i=null){if(c)return{tags:c};let o=i;if(!o)try{let i=n(e(a,`poems`),t(`status`,`==`,`published`)),s=await r(i),c=[];s.forEach(e=>{let t=e.data();c.push({tags:t.tags})}),o=c}catch{o=[]}let l={};o?.forEach(e=>{(e.tags||[]).forEach(e=>{let t=s(e);t&&(l[t]=(l[t]||0)+1)})});let u=Object.keys(l).map(e=>({name:e,count:l[e]})).sort((e,t)=>t.count-e.count).slice(0,20);return u.length>0&&(c=u),{tags:u}},render(e=[]){return`
      <div class="filter-section fade-in">
        <div class="filter-group">
          <span class="filter-label">Sentimentos:</span>
          <div class="filter-chips" id="tag-filters">
            <button class="filter-chip ${e.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>
            <div id="dynamic-tags" class="filter-chips-scroll"></div>
          </div>
        </div>
      </div>
    `},async init(e,t=[],n=null){let{tags:r}=await this.fetchMetadata(n),a=e.querySelector(`#dynamic-tags`);a&&(a.innerHTML=r.map(e=>`
        <button class="filter-chip ${t.includes(e.name)?`active`:``}" data-type="tag" data-value="${e.name}">
          ${e.name} <span class="chip-count" style="opacity: 0.6; font-size: 0.85em; margin-left: 2px;">(${e.count})</span>
        </button>
      `).join(``)),e.querySelectorAll(`.filter-chip`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.value,r=[...t];if(n===`all`)r=[];else{let e=r.indexOf(n);e>-1?r.splice(e,1):r.push(n)}let a=new URLSearchParams(window.location.search);r.length>0?a.set(`tags`,r.join(`,`)):a.delete(`tags`);let o=a.toString(),s=`/`.replace(/\/$/,``),c=window.location.pathname.replace(s,``)||`/`;i(c+(o?`?${o}`:``))})})}};export{s as n,o as r,l as t};