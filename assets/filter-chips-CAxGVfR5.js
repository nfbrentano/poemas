import{t as e}from"./supabase-C7rZ412s.js";import{n as t}from"./index-CpvUCwIo.js";var n={async fetchMetadata(){let{data:t}=await e.from(`poems`).select(`tags`).eq(`status`,`published`),n={};return t?.forEach(e=>{(e.tags||[]).forEach(e=>{let t=e.replace(/^(sentimento|sentimentos|tag de sentimento|tags de sentimento):/i,``).trim();t=t.charAt(0).toUpperCase()+t.slice(1).toLowerCase(),n[t]=(n[t]||0)+1})}),{tags:Object.keys(n).sort((e,t)=>n[t]-n[e]).slice(0,20)}},render(e=[]){return`
      <div class="filter-section fade-in">
        <div class="filter-group">
          <span class="filter-label">Sentimentos:</span>
          <div class="filter-chips" id="tag-filters">
            <button class="filter-chip ${e.length===0?`active`:``}" data-type="tag" data-value="all">Todos</button>
            <div id="dynamic-tags" class="filter-chips-scroll"></div>
          </div>
        </div>
      </div>
    `},async init(e,n=[]){let{tags:r}=await this.fetchMetadata(),i=e.querySelector(`#dynamic-tags`);i&&(i.innerHTML=r.map(e=>`
        <button class="filter-chip ${n.includes(e)?`active`:``}" data-type="tag" data-value="${e}">${e}</button>
      `).join(``)),e.querySelectorAll(`.filter-chip`).forEach(e=>{e.addEventListener(`click`,()=>{let r=e.dataset.value,i=[...n];if(r===`all`)i=[];else{let e=i.indexOf(r);e>-1?i.splice(e,1):i.push(r)}let a=new URLSearchParams(window.location.search);i.length>0?a.set(`tags`,i.join(`,`)):a.delete(`tags`);let o=a.toString();t(window.location.pathname+(o?`?${o}`:``))})})}};export{n as t};