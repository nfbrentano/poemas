const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-DdRQ7wQL.js","assets/social-export-BQG9NDAW.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,o as n,r,t as i}from"./index-B96WzVUe.js";import{t as a}from"./html-BzoIVJF0.js";import{t as o}from"./seo-CzsjKMAB.js";import{t as s}from"./newsletter-DPnGW-VK.js";var c=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function l(){let e=localStorage.getItem(`reaction_session_id`);return e||(e=typeof crypto<`u`&&crypto.randomUUID?crypto.randomUUID():`xxx-xx-4xxx-yxx-xxxxxxxxxxxx`.replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e===`x`?t:t&3|8).toString(16)}),localStorage.setItem(`reaction_session_id`,e)),e}async function u(e){let{data:t,error:r}=await n.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,e);if(r)return{counts:{},userReactions:new Set};let i=l(),a={},o=new Set;return c.forEach(e=>a[e]=0),(t||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===i&&o.add(e.emoji)}),{counts:a,userReactions:o}}async function ee(e,t){let r=l(),{data:i}=await n.from(`poem_reactions`).select(`id`).eq(`poem_id`,e).eq(`session_id`,r).eq(`emoji`,t).maybeSingle();return i?(await n.from(`poem_reactions`).delete().eq(`id`,i.id),`removed`):(await n.from(`poem_reactions`).insert({poem_id:e,emoji:t,session_id:r}),`added`)}function te(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var d=null,f=null,p=null,m=null,h={meta:{title:`Poema`},cleanup(){d&&window.removeEventListener(`scroll`,d),f&&document.removeEventListener(`touchstart`,f),p&&document.removeEventListener(`touchend`,p),m&&document.removeEventListener(`keydown`,m),document.documentElement.classList.remove(`immersive-mode`),d=null,f=null,p=null,m=null},async render(l,h){let g=h.slug;l.innerHTML=`
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
    `,console.log(`[Poem] Fetching slug:`,g);let{data:_,error:v}=await n.rpc(`get_poem_with_navigation`,{target_slug:g});v&&console.error(`[Poem] RPC Error:`,v);let y=_&&Array.isArray(_)&&_.length>0?_[0]:null;if(v||!y){console.warn(`[Poem] Poem not found or error occurred`),l.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}let b=y.prev_slug,x=y.next_slug,S=y.prev_title,C=y.next_title,ne=(y.content||``).replace(/<[^>]*>/g,` `).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,w=Math.ceil(ne/200),re=w<=1?`1 min de leitura`:`${w} min de leitura`;e(`/poema/`+y.slug,y.id);let ie=window.location.href,ae=(y.excerpt||y.content).replace(/<[^>]*>?/gm,``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,oe=`${window.location.origin}/poemas/og-cover.jpg`;o({title:y.title,description:ae,url:ie,imageUrl:oe,type:`article`,publishedTime:y.published_at,tags:y.tags});let{data:{session:se}}=await n.auth.getSession(),T=!!se,ce=(e=>e?e.split(/\n\s*\n/).filter(e=>e.trim()).map(e=>`<div class="stanza stagger-reveal">${e}</div>`).join(``):``)(y.content);l.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${y.title}</h1>
            <div class="poem-meta">
              <span>${new Date(y.published_at).toLocaleDateString(`pt-BR`)}</span>
              ${y.tags&&y.tags.length>0?`<span>•</span><span class="sentiments-list">Sentimentos: ${y.tags.join(`, `)}</span>`:``}
              <span>•</span>
              <span class="reading-time">${re}</span>
            </div>
          </header>

          
          
          <div id="poem-text" class="poem-content">${ce}</div>

          <div class="read-next-section">
            ${x?`
              <p class="read-next-label">Próxima Obra</p>
              <a href="/poemas/poema/${x}" class="read-next-card" data-link>
                <h2 class="read-next-title">${C}</h2>
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
            <div class="ambient-audio-controls">
              <button class="ambient-btn" data-sound="silence" title="Silêncio">Mudo</button>
              <button class="ambient-btn" data-sound="rain" title="Som de Chuva">Chuva</button>
              <button class="ambient-btn" data-sound="fire" title="Som de Lareira">Lareira</button>
            </div>
            <div class="font-controls">
              <button class="font-btn family-btn" data-family="serif" title="Fonte Clássica">Serif</button>
              <button class="font-btn family-btn" data-family="sans" title="Fonte Moderna">Sans</button>
              <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
              <button class="font-btn height-btn" data-height="normal" title="Espaçamento Normal">≡</button>
              <button class="font-btn height-btn" data-height="relaxed" title="Espaçamento Maior">↕</button>
              <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
              <button class="font-btn size-btn" data-size="sm" title="Diminuir fonte">A-</button>
              <button class="font-btn size-btn" data-size="md" title="Fonte padrão">A</button>
              <button class="font-btn size-btn" data-size="lg" title="Aumentar fonte">A+</button>
            </div>
            <button id="fav-btn" class="btn-secondary" aria-label="Salvar poema">
              <span class="fav-icon">♡</span> <span class="fav-text">Salvar</span>
            </button>
            
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${T?`
              <a href="/poemas/admin?view=editor&id=${y.id}" class="btn-secondary" data-link>Editar Obra</a>
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

        <audio id="ambient-audio" loop></audio>
        <div id="highlight-tooltip" class="highlight-tooltip">
          <button id="highlight-copy-btn" class="highlight-btn">Copiar</button>
          <button id="highlight-share-btn" class="highlight-btn">Compartilhar</button>
        </div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${b?``:`display:none;`}" aria-label="Poema anterior" title="${S||``}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${S||``}</span>
          </button>
          
          <div class="nav-center">
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano. Todos os direitos reservados.
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${x?``:`display:none;`}" aria-label="Próximo poema" title="${C||``}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${C||``}</span>
          </button>
        </div>
      </div>
      <div id="immersive-hint" class="immersive-hint">Deslize para navegar →</div>
    `,(()=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){l.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px 0px -10% 0px`,threshold:.1});l.querySelectorAll(`.stagger-reveal`).forEach(t=>e.observe(t))})();let E=window.location.href,D=`Leia "${y.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(D+` `+E)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(D)}&url=${encodeURIComponent(E)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(E)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let O=document.getElementById(`web-share-btn`);navigator.share?O.addEventListener(`click`,async()=>{try{await navigator.share({title:y.title,text:D,url:E})}catch{}}):(O.innerText=`Copiar Link`,O.addEventListener(`click`,()=>{navigator.clipboard.writeText(E).then(()=>{O.innerText=`Copiado!`,setTimeout(()=>O.innerText=`Copiar Link`,2e3)})}));let{counts:le,userReactions:ue}=await u(y.id),k=(e,t)=>{c.forEach(n=>{let r=l.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=l.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};k(le,ue),l.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await ee(y.id,t);let{counts:n,userReactions:r}=await u(y.id);k(n,r),e.classList.add(`reacted`),setTimeout(()=>{e.style.animation=`none`,e.offsetHeight,e.style.animation=null},10),e.disabled=!1})}),(async()=>{let{data:e,error:t}=await n.from(`poem_comments`).select(`author_name, content, created_at`).eq(`poem_id`,y.id).eq(`approved`,!0).order(`created_at`,{ascending:!0}),r=document.getElementById(`comments-list`);if(t||!e||e.length===0){r.innerHTML=`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`;return}r.innerHTML=e.map(e=>`
        <div class="comment-item fade-in">
          <div class="comment-meta">
            <span class="comment-author">${a(e.author_name)}</span>
            <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
          </div>
          <div class="comment-text">${a(e.content)}</div>
        </div>
      `).join(``)})();let A=document.getElementById(`comment-form`);A?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`comment-author`).value,r=document.getElementById(`comment-content`).value,i=document.getElementById(`submit-comment-btn`),a=document.getElementById(`comment-msg`);i.disabled=!0,i.innerText=`Enviando...`;let{error:o}=await n.from(`poem_comments`).insert([{poem_id:y.id,author_name:t,content:r}]);o?(a.innerText=`Erro ao enviar comentário.`,a.style.color=`var(--error)`,i.disabled=!1,i.innerText=`Enviar Nota`):(a.innerText=`Sua nota foi enviada e aguarda moderação.`,a.style.color=`var(--success)`,A.reset())});let j=document.getElementById(`fav-btn`),M=async()=>{let e=await i.has(y.slug);j&&(j.querySelector(`.fav-icon`).textContent=e?`♥`:`♡`,j.querySelector(`.fav-text`).textContent=e?`Salvo`:`Salvar`,j.classList.toggle(`active`,e))};M(),j?.addEventListener(`click`,async()=>{await i.has(y.slug)?await i.remove(y.slug):await i.save(y),M(),j.classList.remove(`animate-fav`),j.offsetWidth,j.classList.add(`animate-fav`),setTimeout(()=>j.classList.remove(`animate-fav`),800),window.dispatchEvent(new CustomEvent(`favorites-updated`))});let N=document.getElementById(`immersive-btn`),P=!1,de=()=>{P=!0,document.documentElement.classList.add(`immersive-mode`),N.innerHTML=`✕ Sair da Leitura`,N.setAttribute(`aria-label`,`Sair do modo leitura imersiva`)},F=()=>{P=!1,document.documentElement.classList.remove(`immersive-mode`),N.innerHTML=`⬜ Leitura Imersiva`,N.setAttribute(`aria-label`,`Modo leitura imersiva`)};N?.addEventListener(`click`,()=>{if(P)F();else if(de(),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}});let I=l.querySelectorAll(`.size-btn`),L=l.querySelectorAll(`.family-btn`),R=l.querySelectorAll(`.height-btn`),z=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t))},B=localStorage.getItem(`reading-font-size`)||`md`,V=localStorage.getItem(`reading-font-family`)||`serif`,H=localStorage.getItem(`reading-line-height`)||`normal`;document.documentElement.classList.add(`font-reading-${B}`),document.documentElement.classList.add(`font-family-${V}`),document.documentElement.classList.add(`line-height-${H}`),z(I,B),z(L,V),z(R,H),I.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),z(I,t)})}),L.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),z(L,t)})}),R.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),z(R,t)})});let U=l.querySelectorAll(`.ambient-btn`),W=document.getElementById(`ambient-audio`),G={rain:`https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=heavy-rain-nature-sounds-8186.mp3`,fire:`https://cdn.pixabay.com/download/audio/2022/02/07/audio_27d8ce6605.mp3?filename=fireplace-sound-21271.mp3`};U.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sound;U.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),t===`silence`?W.pause():(W.src=G[t],W.volume=.5,W.play().catch(e=>console.error(`Audio play failed:`,e)))})}),l.querySelector(`.ambient-btn[data-sound="silence"]`).classList.add(`active`);let fe=document.getElementById(`poem-text`),K=document.getElementById(`highlight-tooltip`),q=``;fe?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){K.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();q=e.toString().trim(),q.length>0?(K.style.left=`${t.left+t.width/2}px`,K.style.top=`${t.top+window.scrollY}px`,K.classList.add(`visible`)):K.classList.remove(`visible`)}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&K.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(q).then(()=>{let e=document.getElementById(`highlight-copy-btn`);e.innerText=`Copiado!`,setTimeout(()=>{e.innerText=`Copiar`,window.getSelection().removeAllRanges(),K.classList.remove(`visible`)},1500)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${q}" — Natanael Brentano\\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),K.classList.remove(`visible`)}),m=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:P&&F();break;case`ArrowRight`:x&&t(`/poema/${x}`);break;case`ArrowLeft`:b&&t(`/poema/${b}`);break;case`f`:case`F`:j?.click();break;case`i`:case`I`:N?.click();break}},document.addEventListener(`keydown`,m);let J=document.getElementById(`scroll-bar`),Y=document.querySelector(`.poem-nav`),X=document.getElementById(`next-btn`),Z=!1;d=te(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;J&&(J.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;Y&&(t>50?Y.classList.add(`visible`):Y.classList.remove(`visible`)),t+r>n*.9&&x&&!Z&&(Z=!0,X&&(X.style.transform=`scale(1.05)`),setTimeout(()=>{X&&(X.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,d);let Q=0,$=0;if(f=e=>{Q=e.touches[0].clientX,$=e.touches[0].clientY},p=e=>{let n=Q-e.changedTouches[0].clientX,r=$-e.changedTouches[0].clientY;Math.abs(n)>80&&Math.abs(n)>Math.abs(r)*2&&(n>0&&x?t(`/poema/${x}`):n<0&&b&&t(`/poema/${b}`))},document.addEventListener(`touchstart`,f,{passive:!0}),document.addEventListener(`touchend`,p,{passive:!0}),X?.addEventListener(`click`,()=>{x&&t(`/poema/${x}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{b&&t(`/poema/${b}`)}),s.init(),T){let e=document.getElementById(`export-ig-btn`);e.addEventListener(`click`,async()=>{e.innerText=`Gerando...`,e.disabled=!0;try{let{generateSocialCard:e}=await r(async()=>{let{generateSocialCard:e}=await import(`./social-export-DdRQ7wQL.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1]));await e(y,document.getElementById(`social-card-container`))}catch(e){console.error(e),alert(`Erro ao gerar imagem.`)}finally{e.innerText=`Exportar p/ Instagram`,e.disabled=!1}});let t=document.getElementById(`resend-email-btn`);t&&t.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){t.innerText=`Enviando...`,t.disabled=!0;try{let{data:e,error:t}=await n.functions.invoke(`send-newsletter`,{body:{poemId:y.id}});if(t)throw t;alert(`Email reenviado com sucesso para ${e?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Houve um erro ao reenviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}finally{t.innerText=`Reenviar Email`,t.disabled=!1}}})}}};export{h as default};