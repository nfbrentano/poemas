import{o as e,r as t}from"./index-BWvw2nx1.js";function n(e){return typeof e==`string`?e.trim().replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim():``}function r(e){let t=n(e);return t?t.charAt(0).toUpperCase()+t.slice(1).toLowerCase():``}var i=null,a={async fetchMetadata(t=null){if(i)return{tags:i};let n=t;if(!n){let{data:t}=await e.from(`poems`).select(`tags`).eq(`status`,`published`);n=t}let a={};n?.forEach(e=>{(e.tags||[]).forEach(e=>{let t=r(e);t&&(a[t]=(a[t]||0)+1)})});let o=Object.keys(a).sort((e,t)=>a[t]-a[e]).slice(0,20);return o.length>0&&(i=o),{tags:o}},render(e=[]){return`
      <div class="filter-section fade-in">
        <div class="filter-group">
          <span class="filter-label">Sentimentos:</span>
          <div class="filter-chips" id="tag-filters">
            <button class="filter-chip ${e.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>
            <div id="dynamic-tags" class="filter-chips-scroll"></div>
          </div>
        </div>
      </div>
    `},async init(e,n=[],r=null){let{tags:i}=await this.fetchMetadata(r),a=e.querySelector(`#dynamic-tags`);a&&(a.innerHTML=i.map(e=>`
        <button class="filter-chip ${n.includes(e)?`active`:``}" data-type="tag" data-value="${e}">${e}</button>
      `).join(``)),e.querySelectorAll(`.filter-chip`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.dataset.value,i=[...n];if(r===`all`)i=[];else{let e=i.indexOf(r);e>-1?i.splice(e,1):i.push(r)}let a=new URLSearchParams(window.location.search);i.length>0?a.set(`tags`,i.join(`,`)):a.delete(`tags`);let o=a.toString(),s=`/poemas/`.replace(/\/$/,``);t((window.location.pathname.replace(s,``)||`/`)+(o?`?${o}`:``))})})}};export{r as n,n as r,a as t};