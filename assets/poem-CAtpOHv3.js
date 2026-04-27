const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-BEQkkLSx.js","assets/social-export-BQG9NDAW.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,r as n,t as r}from"./index-C-Khbs-6.js";import{n as i,t as a}from"./newsletter-BJ8K9ijl.js";var o=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function s(){let e=localStorage.getItem(`reaction_session_id`);return e||(e=crypto.randomUUID(),localStorage.setItem(`reaction_session_id`,e)),e}async function c(t){let{data:n,error:r}=await e.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,t);if(r)return{counts:{},userReactions:new Set};let i=s(),a={},c=new Set;return o.forEach(e=>a[e]=0),(n||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===i&&c.add(e.emoji)}),{counts:a,userReactions:c}}async function l(t,n){let r=s(),{data:i}=await e.from(`poem_reactions`).select(`id`).eq(`poem_id`,t).eq(`session_id`,r).eq(`emoji`,n).maybeSingle();return i?(await e.from(`poem_reactions`).delete().eq(`id`,i.id),`removed`):(await e.from(`poem_reactions`).insert({poem_id:t,emoji:n,session_id:r}),`added`)}function u(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var d=null,f=null,p=null,m=null,h={meta:{title:`Poema`},cleanup(){d&&window.removeEventListener(`scroll`,d),f&&document.removeEventListener(`touchstart`,f),p&&document.removeEventListener(`touchend`,p),m&&document.removeEventListener(`keydown`,m),document.documentElement.classList.remove(`immersive-mode`),d=null,f=null,p=null,m=null},async render(s,h){let g=h.slug;s.innerHTML=`
      <div class="poem-container fade-in">
        <article class="single-poem">
          <header>
            <div class="skeleton skeleton-title-large" style="width: 70%;"></div>
            <div class="skeleton-row" style="width: 40%; margin: 0 auto;"></div>
          </header>
          
          <div class="poem-content">
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row" style="width: 85%;"></div>
            <div class="skeleton skeleton-row" style="width: 90%;"></div>
            <div class="skeleton skeleton-row" style="width: 75%;"></div>
            <div class="skeleton-row" style="height: 2rem; border: none;"></div>
            <div class="skeleton skeleton-row" style="width: 80%;"></div>
            <div class="skeleton skeleton-row"></div>
            <div class="skeleton skeleton-row" style="width: 70%;"></div>
          </div>
          
          <div class="poem-actions">
            <div class="skeleton" style="width: 140px; height: 3rem;"></div>
            <div class="skeleton" style="width: 140px; height: 3rem;"></div>
          </div>
        </article>
      </div>
    `;let{data:_,error:v}=await e.rpc(`get_poem_with_navigation`,{target_slug:g}).single();if(v||!_){s.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}let{data:y}=await e.from(`poems`).select(`title, slug`).lt(`published_at`,_.published_at).eq(`status`,`published`).order(`published_at`,{ascending:!1}).limit(1).maybeSingle(),{data:b}=await e.from(`poems`).select(`title, slug`).gt(`published_at`,_.published_at).eq(`status`,`published`).order(`published_at`,{ascending:!0}).limit(1).maybeSingle(),x=y?.slug,S=b?.slug,C=y?.title,w=b?.title,T=(_.content||``).replace(/<[^>]*>/g,` `).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,E=Math.ceil(T/200),D=E<=1?`1 min de leitura`:`${E} min de leitura`;n(`/poema/`+_.slug,_.id);let O=window.location.href,k=(_.excerpt||_.content).replace(/<[^>]*>?/gm,``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;i({title:_.title,description:k,url:O,type:`article`,publishedTime:_.published_at,tags:_.tags});let{data:{session:A}}=await e.auth.getSession(),j=!!A;s.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${_.title}</h1>
            <div class="poem-meta">
              <span>${new Date(_.published_at).toLocaleDateString(`pt-BR`)}</span>
              ${_.tags&&_.tags.length>0?`<span>•</span><span>${_.tags.join(`, `)}</span>`:``}
              <span>- </span>
              <span class="reading-time">${D}</span>
            </div>
          </header>
          
          <div id="poem-text" class="poem-content">${_.content}</div>

          <nav class="poem-navigation" aria-label="Navegar entre poemas">
            ${x?`<a href="/poemas/poema/${x}" data-link class="poem-nav-prev">← ${C}</a>`:`<span></span>`}
            ${S?`<a href="/poemas/poema/${S}" data-link class="poem-nav-next">${w} →</a>`:`<span></span>`}
          </nav>
          
          <div class="share-section">
            <p class="share-label">Compartilhar obra</p>
            <div class="share-buttons">
              <button class="share-btn whatsapp" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp">WhatsApp</button>
              <button class="share-btn twitter" aria-label="Compartilhar no X (Twitter)" data-platform="twitter">𝕏 (Twitter)</button>
              <button class="share-btn facebook" aria-label="Compartilhar no Facebook" data-platform="facebook">Facebook</button>
              <button id="web-share-btn" class="share-btn generic" aria-label="Mais opções de compartilhamento">Compartilhar...</button>
            </div>
          </div>

          <div class="reactions-section">
            <p class="reactions-label">O que este poema desperta?</p>
            <div class="reactions-bar" id="reactions-bar">
              ${o.map(e=>`
                <button class="reaction-btn" data-emoji="${e}" aria-label="Reagir com ${e}">
                  <span class="reaction-emoji">${e}</span>
                  <span class="reaction-count" data-count="${e}">…</span>
                </button>
              `).join(``)}
            </div>
          </div>

          <div class="poem-actions">
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            <button id="copy-poem-btn" class="btn-secondary" aria-label="Copiar texto do poema">Copiar Poema</button>
            
            ${j?`
              <a href="/poemas/admin?view=editor&id=${_.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="export-ig-btn" class="btn-secondary">Gerar Card Instagram</button>
            `:``}
          </div>
        </article>

        
        <!-- Newsletter Section -->
        ${a.render()}

        <div style="text-align: center; margin-top: var(--space-3xl); margin-bottom: var(--space-xl);">
          <a href="/poemas/" data-link class="back-link">
            ← Voltar para o início
          </a>
        </div>
        
        <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${x?``:`display:none;`}" aria-label="Poema anterior">
            ← Anterior
          </button>
          
          <div class="nav-center">
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${S?``:`display:none;`}" aria-label="Próximo poema">
            Próximo →
          </button>
        </div>
      </div>
    `;let M=window.location.href,N=`Leia "${_.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(N+` `+M)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(N)}&url=${encodeURIComponent(M)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(M)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let P=document.getElementById(`web-share-btn`);navigator.share?P.addEventListener(`click`,async()=>{try{await navigator.share({title:_.title,text:N,url:M})}catch{}}):(P.innerText=`Copiar Link`,P.addEventListener(`click`,()=>{navigator.clipboard.writeText(M).then(()=>{P.innerText=`Copiado!`,setTimeout(()=>P.innerText=`Copiar Link`,2e3)})}));let F=document.getElementById(`copy-poem-btn`);F&&F.addEventListener(`click`,()=>{let e=document.getElementById(`poem-text`).innerText;navigator.clipboard.writeText(e).then(()=>{let e=F.innerText;F.innerText=`Copiado!`,F.style.color=`var(--success)`,F.style.borderColor=`var(--success)`,setTimeout(()=>{F.innerText=e,F.style.color=`var(--text-secondary)`,F.style.borderColor=`var(--border-strong)`},2e3)})});let{counts:I,userReactions:L}=await c(_.id),R=(e,t)=>{o.forEach(n=>{let r=s.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=s.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};R(I,L),s.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await l(_.id,t);let{counts:n,userReactions:r}=await c(_.id);R(n,r),e.disabled=!1})});let z=document.getElementById(`immersive-btn`),B=!1,V=()=>{B=!0,document.documentElement.classList.add(`immersive-mode`),z.innerHTML=`✕ Sair da Leitura`,z.setAttribute(`aria-label`,`Sair do modo leitura imersiva`)},H=()=>{B=!1,document.documentElement.classList.remove(`immersive-mode`),z.innerHTML=`⬜ Leitura Imersiva`,z.setAttribute(`aria-label`,`Modo leitura imersiva`)};z?.addEventListener(`click`,()=>{B?H():V()}),m=e=>{e.key===`Escape`&&B&&H()},document.addEventListener(`keydown`,m);let U=document.getElementById(`scroll-bar`),W=document.querySelector(`.poem-nav`),G=document.getElementById(`next-btn`),K=!1;d=u(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;U&&(U.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;W&&(t>50?W.classList.add(`visible`):W.classList.remove(`visible`)),t+r>n*.9&&S&&!K&&(K=!0,G&&(G.style.transform=`scale(1.05)`),setTimeout(()=>{G&&(G.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,d);let q=0;if(f=e=>q=e.touches[0].clientX,p=e=>{let t=q-e.changedTouches[0].clientX;Math.abs(t)>80&&(t>0&&S?r(`/poema/${S}`):t<0&&x&&r(`/poema/${x}`))},document.addEventListener(`touchstart`,f,{passive:!0}),document.addEventListener(`touchend`,p,{passive:!0}),G?.addEventListener(`click`,()=>{S&&r(`/poema/${S}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{x&&r(`/poema/${x}`)}),a.init(),j){let e=document.getElementById(`export-ig-btn`);e.addEventListener(`click`,async()=>{e.innerText=`Gerando...`,e.disabled=!0;try{let{generateSocialCard:e}=await t(async()=>{let{generateSocialCard:e}=await import(`./social-export-BEQkkLSx.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1]));await e(_,document.getElementById(`social-card-container`))}catch(e){console.error(e),alert(`Erro ao gerar imagem.`)}finally{e.innerText=`Exportar p/ Instagram`,e.disabled=!1}})}}};export{h as default};