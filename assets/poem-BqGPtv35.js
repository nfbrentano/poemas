const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-BEQkkLSx.js","assets/social-export-BQG9NDAW.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,r as n,t as r}from"./index-HEwGkHwt.js";import{n as i,t as a}from"./newsletter-CTtF0Vn9.js";var o=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function s(){let e=localStorage.getItem(`reaction_session_id`);return e||(e=crypto.randomUUID(),localStorage.setItem(`reaction_session_id`,e)),e}async function c(t){let{data:n,error:r}=await e.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,t);if(r)return{counts:{},userReactions:new Set};let i=s(),a={},c=new Set;return o.forEach(e=>a[e]=0),(n||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===i&&c.add(e.emoji)}),{counts:a,userReactions:c}}async function l(t,n){let r=s(),{data:i}=await e.from(`poem_reactions`).select(`id`).eq(`poem_id`,t).eq(`session_id`,r).eq(`emoji`,n).maybeSingle();return i?(await e.from(`poem_reactions`).delete().eq(`id`,i.id),`removed`):(await e.from(`poem_reactions`).insert({poem_id:t,emoji:n,session_id:r}),`added`)}function u(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var d=null,f=null,p=null,m=null,h={meta:{title:`Poema`},cleanup(){d&&window.removeEventListener(`scroll`,d),f&&document.removeEventListener(`touchstart`,f),p&&document.removeEventListener(`touchend`,p),m&&document.removeEventListener(`keydown`,m),document.documentElement.classList.remove(`immersive-mode`),d=null,f=null,p=null,m=null},async render(s,h){let g=h.slug;s.innerHTML=`
      <div class="poem-container fade-in">
        <article class="single-poem">
          <header>
            <div class="skeleton skeleton-title" style="margin: 0 auto 1.5rem auto; width: 60%; height: 3.5rem;"></div>
            <div class="poem-meta" style="justify-content: center;">
              <div class="skeleton" style="width: 80px; height: 1rem;"></div>
              <div class="skeleton" style="width: 100px; height: 1rem;"></div>
            </div>
          </header>
          
          <div class="poem-content" style="display: flex; flex-direction: column; align-items: center; gap: 0.8rem; margin-top: 4rem;">
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
            <div class="skeleton skeleton-text" style="width: 35%;"></div>
            <div class="skeleton skeleton-text" style="width: 45%;"></div>
            <div class="skeleton skeleton-text" style="width: 30%;"></div>
            <div class="skeleton skeleton-text" style="width: 0; height: 1rem; margin: 1rem 0;"></div>
            <div class="skeleton skeleton-text" style="width: 38%;"></div>
            <div class="skeleton skeleton-text" style="width: 42%;"></div>
            <div class="skeleton skeleton-text" style="width: 33%;"></div>
          </div>
          
          <div class="share-section" style="margin-top: 4rem;">
            <div class="skeleton" style="width: 120px; height: 0.8rem; margin-bottom: 1rem;"></div>
            <div class="share-buttons">
              <div class="skeleton" style="width: 80px; height: 2.2rem; border-radius: 4px;"></div>
              <div class="skeleton" style="width: 80px; height: 2.2rem; border-radius: 4px;"></div>
              <div class="skeleton" style="width: 80px; height: 2.2rem; border-radius: 4px;"></div>
              <div class="skeleton" style="width: 120px; height: 2.2rem; border-radius: 4px;"></div>
            </div>
          </div>

          <div class="poem-actions" style="margin-top: 2rem; border-top: 1px solid var(--border-subtle); padding-top: 2rem; justify-content: center;">
            <div class="skeleton" style="width: 140px; height: 3rem; border-radius: 4px;"></div>
            <div class="skeleton" style="width: 140px; height: 3rem; border-radius: 4px;"></div>
          </div>
        </article>
      </div>
    `;let{data:_,error:v}=await e.rpc(`get_poem_with_navigation`,{target_slug:g}).single();if(v||!_){s.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}let y=_.prev_slug,b=_.next_slug,x=_.total_count,S=_.current_index,C=(_.content||``).replace(/<[^>]*>/g,` `).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,w=Math.ceil(C/200),T=w<=1?`1 min de leitura`:`${w} min de leitura`;n(`/poema/`+_.slug,_.id);let E=window.location.href,D=(_.excerpt||_.content).replace(/<[^>]*>?/gm,``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;i({title:_.title,description:D,url:E,type:`article`,publishedTime:_.published_at,tags:_.tags});let{data:{session:O}}=await e.auth.getSession(),k=!!O;s.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${_.title}</h1>
            <div class="poem-meta">
              <span>${new Date(_.published_at).toLocaleDateString(`pt-BR`)}</span>
              ${_.tags&&_.tags.length>0?`<span>•</span><span>${_.tags.join(`, `)}</span>`:``}
              <span>- </span>
              <span class="reading-time">${T}</span>
            </div>
          </header>
          
          <div id="poem-text" class="poem-content">${_.content}</div>
          
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
            
            ${k?`
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
          <button id="prev-btn" class="nav-btn" style="${y?``:`display:none;`}" aria-label="Poema anterior">
            ← Anterior
          </button>
          
          <div class="nav-center">
            <div id="progress" class="nav-progress">
              Poema ${S} de ${x}
            </div>
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${b?``:`display:none;`}" aria-label="Próximo poema">
            Próximo →
          </button>
        </div>
      </div>
    `;let A=window.location.href,j=`Leia "${_.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(j+` `+A)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(j)}&url=${encodeURIComponent(A)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(A)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let M=document.getElementById(`web-share-btn`);navigator.share?M.addEventListener(`click`,async()=>{try{await navigator.share({title:_.title,text:j,url:A})}catch{}}):(M.innerText=`Copiar Link`,M.addEventListener(`click`,()=>{navigator.clipboard.writeText(A).then(()=>{M.innerText=`Copiado!`,setTimeout(()=>M.innerText=`Copiar Link`,2e3)})}));let N=document.getElementById(`copy-poem-btn`);N&&N.addEventListener(`click`,()=>{let e=document.getElementById(`poem-text`).innerText;navigator.clipboard.writeText(e).then(()=>{let e=N.innerText;N.innerText=`Copiado!`,N.style.color=`var(--success)`,N.style.borderColor=`var(--success)`,setTimeout(()=>{N.innerText=e,N.style.color=`var(--text-secondary)`,N.style.borderColor=`var(--border-strong)`},2e3)})});let{counts:P,userReactions:F}=await c(_.id),I=(e,t)=>{o.forEach(n=>{let r=s.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=s.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};I(P,F),s.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await l(_.id,t);let{counts:n,userReactions:r}=await c(_.id);I(n,r),e.disabled=!1})});let L=document.getElementById(`immersive-btn`),R=!1,z=()=>{R=!0,document.documentElement.classList.add(`immersive-mode`),L.innerHTML=`✕ Sair da Leitura`,L.setAttribute(`aria-label`,`Sair do modo leitura imersiva`)},B=()=>{R=!1,document.documentElement.classList.remove(`immersive-mode`),L.innerHTML=`⬜ Leitura Imersiva`,L.setAttribute(`aria-label`,`Modo leitura imersiva`)};L?.addEventListener(`click`,()=>{R?B():z()}),m=e=>{e.key===`Escape`&&R&&B()},document.addEventListener(`keydown`,m);let V=document.getElementById(`scroll-bar`),H=document.querySelector(`.poem-nav`),U=document.getElementById(`next-btn`),W=!1;d=u(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;V&&(V.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;H&&(t>50?H.classList.add(`visible`):H.classList.remove(`visible`)),t+r>n*.9&&b&&!W&&(W=!0,U&&(U.style.transform=`scale(1.05)`),setTimeout(()=>{U&&(U.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,d);let G=0;if(f=e=>G=e.touches[0].clientX,p=e=>{let t=G-e.changedTouches[0].clientX;Math.abs(t)>80&&(t>0&&b?r(`/poema/${b}`):t<0&&y&&r(`/poema/${y}`))},document.addEventListener(`touchstart`,f,{passive:!0}),document.addEventListener(`touchend`,p,{passive:!0}),U?.addEventListener(`click`,()=>{b&&r(`/poema/${b}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{y&&r(`/poema/${y}`)}),a.init(),k){let e=document.getElementById(`export-ig-btn`);e.addEventListener(`click`,async()=>{e.innerText=`Gerando...`,e.disabled=!0;try{let{generateSocialCard:e}=await t(async()=>{let{generateSocialCard:e}=await import(`./social-export-BEQkkLSx.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1]));await e(_,document.getElementById(`social-card-container`))}catch(e){console.error(e),alert(`Erro ao gerar imagem.`)}finally{e.innerText=`Exportar p/ Instagram`,e.disabled=!1}})}}};export{h as default};