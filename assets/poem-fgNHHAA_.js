const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-DdRQ7wQL.js","assets/social-export-BQG9NDAW.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,o as n,r,t as i}from"./index-BnXqJDju.js";import{t as a}from"./html-BzoIVJF0.js";import{t as o}from"./seo-Cx_atl1Z.js";import{t as s}from"./newsletter-DlikxJLK.js";var c=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function l(){let e=localStorage.getItem(`reaction_session_id`);return e||(e=typeof crypto<`u`&&crypto.randomUUID?crypto.randomUUID():`xxx-xx-4xxx-yxx-xxxxxxxxxxxx`.replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e===`x`?t:t&3|8).toString(16)}),localStorage.setItem(`reaction_session_id`,e)),e}async function u(e){let{data:t,error:r}=await n.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,e);if(r)return{counts:{},userReactions:new Set};let i=l(),a={},o=new Set;return c.forEach(e=>a[e]=0),(t||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===i&&o.add(e.emoji)}),{counts:a,userReactions:o}}async function d(e,t){let r=l(),{data:i}=await n.from(`poem_reactions`).select(`id`).eq(`poem_id`,e).eq(`session_id`,r).eq(`emoji`,t).maybeSingle();return i?(await n.from(`poem_reactions`).delete().eq(`id`,i.id),`removed`):(await n.from(`poem_reactions`).insert({poem_id:e,emoji:t,session_id:r}),`added`)}function f(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var p=null,m=null,h=null,g=null,_={meta:{title:`Poema`},cleanup(){p&&window.removeEventListener(`scroll`,p),m&&document.removeEventListener(`touchstart`,m),h&&document.removeEventListener(`touchend`,h),g&&document.removeEventListener(`keydown`,g),document.documentElement.classList.remove(`immersive-mode`),p=null,m=null,h=null,g=null},async render(l,_){let v=_.slug;l.innerHTML=`
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
          </div>
        </article>
      </div>
    `,console.log(`[Poem] Fetching slug:`,v);let{data:y,error:b}=await n.rpc(`get_poem_with_navigation`,{target_slug:v});b&&console.error(`[Poem] RPC Error:`,b);let x=y&&Array.isArray(y)&&y.length>0?y[0]:null;if(b||!x){console.warn(`[Poem] Poem not found or error occurred`),l.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}let S=x.prev_slug,C=x.next_slug,w=x.prev_title,T=x.next_title,ee=(x.content||``).replace(/<[^>]*>/g,` `).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,E=Math.ceil(ee/200),D=E<=1?`1 min de leitura`:`${E} min de leitura`;e(`/poema/`+x.slug,x.id);let O=window.location.href,k=(x.excerpt||x.content).replace(/<[^>]*>?/gm,``).replace(/\s+/g,` `).trim().slice(0,160)+`...`;o({title:x.title,description:k,url:O,type:`article`,publishedTime:x.published_at,tags:x.tags});let{data:{session:A}}=await n.auth.getSession(),j=!!A,M=(e=>e?e.split(/\n\s*\n/).filter(e=>e.trim()).map(e=>`<div class="stanza stagger-reveal">${e}</div>`).join(``):``)(x.content);l.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${x.title}</h1>
            <div class="poem-meta">
              <span>${new Date(x.published_at).toLocaleDateString(`pt-BR`)}</span>
              ${x.tags&&x.tags.length>0?`<span>•</span><span class="sentiments-list">Sentimentos: ${x.tags.join(`, `)}</span>`:``}
              <span>•</span>
              <span class="reading-time">${D}</span>
            </div>
          </header>

          
          
          <div id="poem-text" class="poem-content">${M}</div>

          <div class="read-next-section">
            ${C?`
              <p class="read-next-label">Próxima Obra</p>
              <a href="/poemas/poema/${C}" class="read-next-card" data-link>
                <h2 class="read-next-title">${T}</h2>
                <span class="read-next-btn">Ler Agora →</span>
              </a>
            `:`
              <p class="read-next-label">Fim da Jornada</p>
              <a href="/poemas/" class="read-next-card" data-link>
                <h2 class="read-next-title">Voltar ao Início</h2>
                <p class="read-next-excerpt">Há sempre algo novo no silêncio da página inicial.</p>
              </a>
            `}
          </div>

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
              ${c.map(e=>`
                <button class="reaction-btn" data-emoji="${e}" aria-label="Reagir com ${e}">
                  <span class="reaction-emoji">${e}</span>
                  <span class="reaction-count" data-count="${e}">…</span>
                </button>
              `).join(``)}
            </div>
          </div>

          <div class="comments-section">
            <p class="comments-label">Notas de quem passou por aqui</p>
            <div id="comments-list" class="comments-list">
              <p class="comments-empty">Silêncio... nenhum comentário ainda.</p>
            </div>
            
            <form id="comment-form" class="comment-form">
              <p class="comment-form-title">Deixe sua nota</p>
              <div class="comment-form-group">
                <input type="text" id="comment-author" placeholder="Seu nome" required maxlength="50">
              </div>
              <div class="comment-form-group">
                <textarea id="comment-content" placeholder="Sua percepção sobre esta obra..." required maxlength="500"></textarea>
              </div>
              <button type="submit" id="submit-comment-btn" class="btn-primary">Enviar Nota</button>
              <p id="comment-msg" class="comment-msg"></p>
            </form>
          </div>

          <div class="poem-actions">
            <div class="font-controls">
              <button class="font-btn" data-size="sm" title="Diminuir fonte">A-</button>
              <button class="font-btn" data-size="md" title="Fonte padrão">A</button>
              <button class="font-btn" data-size="lg" title="Aumentar fonte">A+</button>
            </div>
            <button id="fav-btn" class="btn-secondary" aria-label="Salvar poema">
              <span class="fav-icon">♡</span> <span class="fav-text">Salvar</span>
            </button>
            
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${j?`
              <a href="/poemas/admin?view=editor&id=${x.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="export-ig-btn" class="btn-secondary">Gerar Card Instagram</button>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `:``}
          </div>
        </article>
        
        <!-- Newsletter Section -->
        ${s.render()}

        <div style="text-align: center; margin-top: var(--space-3xl); margin-bottom: var(--space-xl);">
          <a href="/poemas/" data-link class="back-link">
            ← Voltar para o início
          </a>
        </div>
        
        <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${S?``:`display:none;`}" aria-label="Poema anterior" title="${w||``}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${w||``}</span>
          </button>
          
          <div class="nav-center">
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${C?``:`display:none;`}" aria-label="Próximo poema" title="${T||``}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${T||``}</span>
          </button>
        </div>
      </div>
      <div id="immersive-hint" class="immersive-hint">Deslize para navegar →</div>
    `,(()=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){l.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px 0px -10% 0px`,threshold:.1});l.querySelectorAll(`.stagger-reveal`).forEach(t=>e.observe(t))})();let N=window.location.href,P=`Leia "${x.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(P+` `+N)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(P)}&url=${encodeURIComponent(N)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(N)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let F=document.getElementById(`web-share-btn`);navigator.share?F.addEventListener(`click`,async()=>{try{await navigator.share({title:x.title,text:P,url:N})}catch{}}):(F.innerText=`Copiar Link`,F.addEventListener(`click`,()=>{navigator.clipboard.writeText(N).then(()=>{F.innerText=`Copiado!`,setTimeout(()=>F.innerText=`Copiar Link`,2e3)})}));let{counts:I,userReactions:L}=await u(x.id),R=(e,t)=>{c.forEach(n=>{let r=l.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=l.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};R(I,L),l.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await d(x.id,t);let{counts:n,userReactions:r}=await u(x.id);R(n,r),e.disabled=!1})}),(async()=>{let{data:e,error:t}=await n.from(`poem_comments`).select(`author_name, content, created_at`).eq(`poem_id`,x.id).eq(`approved`,!0).order(`created_at`,{ascending:!0}),r=document.getElementById(`comments-list`);if(t||!e||e.length===0){r.innerHTML=`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`;return}r.innerHTML=e.map(e=>`
        <div class="comment-item fade-in">
          <div class="comment-meta">
            <span class="comment-author">${a(e.author_name)}</span>
            <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
          </div>
          <div class="comment-text">${a(e.content)}</div>
        </div>
      `).join(``)})();let z=document.getElementById(`comment-form`);z?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`comment-author`).value,r=document.getElementById(`comment-content`).value,i=document.getElementById(`submit-comment-btn`),a=document.getElementById(`comment-msg`);i.disabled=!0,i.innerText=`Enviando...`;let{error:o}=await n.from(`poem_comments`).insert([{poem_id:x.id,author_name:t,content:r}]);o?(a.innerText=`Erro ao enviar comentário.`,a.style.color=`var(--error)`,i.disabled=!1,i.innerText=`Enviar Nota`):(a.innerText=`Sua nota foi enviada e aguarda moderação.`,a.style.color=`var(--success)`,z.reset())});let B=document.getElementById(`fav-btn`),V=async()=>{let e=await i.has(x.slug);B&&(B.querySelector(`.fav-icon`).textContent=e?`♥`:`♡`,B.querySelector(`.fav-text`).textContent=e?`Salvo`:`Salvar`,B.classList.toggle(`active`,e))};V(),B?.addEventListener(`click`,async()=>{await i.has(x.slug)?await i.remove(x.slug):await i.save(x),V(),window.dispatchEvent(new CustomEvent(`favorites-updated`))});let H=document.getElementById(`immersive-btn`),U=!1,W=()=>{U=!0,document.documentElement.classList.add(`immersive-mode`),H.innerHTML=`✕ Sair da Leitura`,H.setAttribute(`aria-label`,`Sair do modo leitura imersiva`)},G=()=>{U=!1,document.documentElement.classList.remove(`immersive-mode`),H.innerHTML=`⬜ Leitura Imersiva`,H.setAttribute(`aria-label`,`Modo leitura imersiva`)};H?.addEventListener(`click`,()=>{if(U)G();else if(W(),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}});let K=l.querySelectorAll(`.font-btn`),q=e=>{K.forEach(t=>{t.classList.toggle(`active`,t.dataset.size===e)})};q((localStorage.getItem(`reading-font-size`)||`font-reading-md`).replace(`font-reading-`,``)),K.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size,n=`font-reading-${t}`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(n),localStorage.setItem(`reading-font-size`,n),q(t)})}),g=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:U&&G();break;case`ArrowRight`:C&&t(`/poema/${C}`);break;case`ArrowLeft`:S&&t(`/poema/${S}`);break;case`f`:case`F`:B?.click();break;case`i`:case`I`:H?.click();break}},document.addEventListener(`keydown`,g);let J=document.getElementById(`scroll-bar`),Y=document.querySelector(`.poem-nav`),X=document.getElementById(`next-btn`),Z=!1;p=f(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;J&&(J.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;Y&&(t>50?Y.classList.add(`visible`):Y.classList.remove(`visible`)),t+r>n*.9&&C&&!Z&&(Z=!0,X&&(X.style.transform=`scale(1.05)`),setTimeout(()=>{X&&(X.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,p);let Q=0,$=0;if(m=e=>{Q=e.touches[0].clientX,$=e.touches[0].clientY},h=e=>{let n=Q-e.changedTouches[0].clientX,r=$-e.changedTouches[0].clientY;Math.abs(n)>80&&Math.abs(n)>Math.abs(r)*2&&(n>0&&C?t(`/poema/${C}`):n<0&&S&&t(`/poema/${S}`))},document.addEventListener(`touchstart`,m,{passive:!0}),document.addEventListener(`touchend`,h,{passive:!0}),X?.addEventListener(`click`,()=>{C&&t(`/poema/${C}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{S&&t(`/poema/${S}`)}),s.init(),j){let e=document.getElementById(`export-ig-btn`);e.addEventListener(`click`,async()=>{e.innerText=`Gerando...`,e.disabled=!0;try{let{generateSocialCard:e}=await r(async()=>{let{generateSocialCard:e}=await import(`./social-export-DdRQ7wQL.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1]));await e(x,document.getElementById(`social-card-container`))}catch(e){console.error(e),alert(`Erro ao gerar imagem.`)}finally{e.innerText=`Exportar p/ Instagram`,e.disabled=!1}});let t=document.getElementById(`resend-email-btn`);t&&t.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){t.innerText=`Enviando...`,t.disabled=!0;try{let{data:e,error:t}=await n.functions.invoke(`send-newsletter`,{body:{poemId:x.id}});if(t)throw t;alert(`Email reenviado com sucesso para ${e?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Houve um erro ao reenviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}finally{t.innerText=`Reenviar Email`,t.disabled=!1}}})}}};export{_ as default};