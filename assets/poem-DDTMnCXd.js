const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-b3MWKN4-.js","assets/html-Ca31mHym.js","assets/social-export-DdOctoXY.css"])))=>i.map(i=>d[i]);
import{a as e,n as t,r as n,t as r}from"./index-Cv2mpsBb.js";import{supabase as i}from"./supabase-Cmo813Sf.js";import{r as a,t as o}from"./html-Ca31mHym.js";import{t as ee}from"./seo-BlITGSmq.js";import{t as s}from"./newsletter-DAlyYhrx.js";import{trackPageView as te}from"./analytics-DsbAerZP.js";var c=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function l(){let e=localStorage.getItem(`reaction_session_id`);if(!e){if(typeof crypto<`u`&&typeof crypto.randomUUID==`function`)e=crypto.randomUUID();else if(typeof crypto<`u`&&typeof crypto.getRandomValues==`function`){let t=new Uint8Array(16);crypto.getRandomValues(t),t[6]=t[6]&15|64,t[8]=t[8]&63|128;let n=Array.from(t,e=>e.toString(16).padStart(2,`0`)).join(``);e=`${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}e&&localStorage.setItem(`reaction_session_id`,e)}return e}async function u(e){let{data:t,error:n}=await i.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,e);if(n)return{counts:{},userReactions:new Set};let r=l(),a={},o=new Set;return c.forEach(e=>a[e]=0),(t||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===r&&o.add(e.emoji)}),{counts:a,userReactions:o}}async function ne(e,t){let n=l(),{data:r}=await i.from(`poem_reactions`).select(`id`).eq(`poem_id`,e).eq(`session_id`,n).eq(`emoji`,t).maybeSingle();return r?(await i.from(`poem_reactions`).delete().eq(`id`,r.id),`removed`):(await i.from(`poem_reactions`).insert({poem_id:e,emoji:t,session_id:n}),`added`)}var d={init(){if(!document.getElementById(`toast-container`)){let e=document.createElement(`div`);e.id=`toast-container`,e.className=`toast-container`,e.setAttribute(`aria-live`,`polite`),document.body.appendChild(e)}},show(e,t=`default`,n=3e3){this.init();let r=document.getElementById(`toast-container`),i=document.createElement(`div`);i.className=`toast-message toast-${t}`;let a=``;t===`success`&&(a=`✓ `),t===`error`&&(a=`⚠ `),t===`info`&&(a=`ℹ `),t===`heart`&&(a=`♥ `),i.innerHTML=`<span class="toast-icon">${a}</span><span class="toast-text">${e}</span>`,r.appendChild(i),i.offsetWidth,i.classList.add(`show`),setTimeout(()=>{i.classList.remove(`show`),i.addEventListener(`transitionend`,()=>{i.parentNode&&i.parentNode.removeChild(i)})},n)}};function re(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var f=null,p=null,m=null,h=null,g=!1,_=``,ie={meta:{title:`Poema`},cleanup(){f&&window.removeEventListener(`scroll`,f),p&&document.removeEventListener(`touchstart`,p),m&&document.removeEventListener(`touchend`,m),h&&document.removeEventListener(`keydown`,h),document.documentElement.classList.remove(`immersive-mode`),f=null,p=null,m=null,h=null,g=!1,_=``},async render(l,ie){let ae=ie.slug;l.innerHTML=`
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
    `,console.log(`[Poem] Fetching slug:`,ae);let{data:v,error:y}=await i.rpc(`get_poem_with_navigation`,{target_slug:ae});y&&console.error(`[Poem] RPC Error:`,y);let b=v&&Array.isArray(v)&&v.length>0?v[0]:null;if(y||!b){console.warn(`[Poem] Poem not found or error occurred`),l.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}let x=b.prev_slug,S=b.next_slug,C=b.prev_title,w=b.next_title;try{t.add(b),window.dispatchEvent(new CustomEvent(`history-updated`))}catch(e){console.error(`Erro ao salvar no histórico:`,e)}let oe=a(b.content||``).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,se=Math.ceil(oe/200),ce=se<=1?`1 min de leitura`:`${se} min de leitura`;te(`/poema/`+b.slug,b.id);let le=window.location.href,ue=a(b.excerpt||b.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,de=`${window.location.origin}/poemas/og-cover.jpg`;ee({title:b.title,description:ue,url:le,imageUrl:de,type:`article`,publishedTime:b.published_at,tags:b.tags});let{data:{session:fe}}=await i.auth.getSession(),pe=!!fe,me=(e=>{if(!e)return``;let t=e.split(/\n\s*\n/).filter(e=>e.trim()),n=0;return t.map(e=>`<div class="stanza stagger-reveal">${e.split(`
`).map(e=>(n++,`<span class="line-reveal" style="transition-delay: ${n*.05}s">${e}</span>`)).join(``)}</div>`).join(``)})(b.content);l.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${b.title}</h1>
            <div class="poem-meta">
              <span>${new Date(b.published_at).toLocaleDateString(`pt-BR`)}</span>
              <span>•</span>
              <span class="reading-time">${ce}</span>
            </div>
          </header>

          
          
          <div id="poem-text" class="poem-content">${me}</div>



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
            
            <button id="toggle-comment-btn" class="btn-secondary" style="margin-top: var(--space-sm); width: 100%;">+ Deixar uma nota</button>
            <form id="comment-form" class="comment-form" style="display: none; margin-top: var(--space-md);">
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
            <button id="toggle-settings-btn" class="btn-secondary mobile-only" aria-label="Configurações de leitura" style="display: none;">⚙️ Layout</button>
            <div id="poem-settings-panel" class="poem-settings-panel">
              <div class="ambient-audio-controls">
                <button class="ambient-btn" data-sound="silence" title="Silêncio">Mudo</button>
                <button class="ambient-btn" data-sound="rain" title="Som de Chuva">Chuva</button>
                <button class="ambient-btn" data-sound="fire" title="Som de Lareira">Lareira</button>
              </div>
              <div class="font-controls">
                <button class="font-btn family-btn" data-family="serif" title="Fonte Clássica">Serif</button>
                <button class="font-btn family-btn" data-family="sans" title="Fonte Moderna">Sans</button>
                <button class="font-btn family-btn" data-family="hand" title="Fonte Manuscrita">Manuscrita</button>
                <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
                <button class="font-btn align-btn" data-align="left" title="Alinhar à Esquerda">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align: middle;"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="12" x2="3" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                </button>
                <button class="font-btn align-btn" data-align="center" title="Centralizar">
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align: middle;"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="17" y1="12" x2="7" y2="12"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                </button>
                <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
                <button class="font-btn height-btn" data-height="normal" title="Espaçamento Normal">≡</button>
                <button class="font-btn height-btn" data-height="relaxed" title="Espaçamento Maior">↕</button>
                <span style="color: var(--border-subtle); margin: 0 4px;">|</span>
                <button class="font-btn size-btn" data-size="sm" title="Diminuir fonte">A-</button>
                <button class="font-btn size-btn" data-size="md" title="Fonte padrão">A</button>
                <button class="font-btn size-btn" data-size="lg" title="Aumentar fonte">A+</button>
              </div>
            </div>
            <button id="fav-btn" class="btn-secondary" aria-label="Salvar poema">
              <span class="fav-icon">♡</span> <span class="fav-text">Salvar</span>
            </button>
            
            <button id="share-card-btn" class="btn-secondary" aria-label="Gerar card para compartilhar">
              🖼 Compartilhar Card
            </button>
            
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${pe?`
              <a href="/poemas/admin?view=editor&id=${b.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `:``}
          </div>
        </article>
        
        <!-- Newsletter Section -->
        ${s.render()}
        
        <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

        <audio id="ambient-audio" loop></audio>
        <div id="highlight-tooltip" class="highlight-tooltip">
          <button id="highlight-copy-btn" class="highlight-btn">Copiar</button>
          <button id="highlight-share-btn" class="highlight-btn">Compartilhar</button>
          <button id="highlight-card-btn" class="highlight-btn">Gerar Card</button>
        </div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${x?``:`display:none;`}" aria-label="Poema anterior" title="${C||``}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${C||``}</span>
          </button>
          
          <div class="nav-center">
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${S?``:`display:none;`}" aria-label="Próximo poema" title="${w||``}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${w||``}</span>
          </button>
        </div>

        <!-- Painel de Controle da Leitura Imersiva -->
        <div id="immersive-control-panel" class="immersive-control-panel">
          <div class="immersive-panel-row">
            <label for="immersive-size-slider">Tamanho do texto</label>
            <div class="slider-wrapper">
              <input type="range" id="immersive-size-slider" min="16" max="32" value="20" step="1">
              <span id="immersive-size-value" class="immersive-panel-value">20px</span>
            </div>
          </div>
          <div class="immersive-panel-row">
            <label for="immersive-height-slider">Espaçamento</label>
            <div class="slider-wrapper">
              <input type="range" id="immersive-height-slider" min="15" max="30" value="22" step="1">
              <span id="immersive-height-value" class="immersive-panel-value">2.2</span>
            </div>
          </div>
          <button id="immersive-exit-btn" class="btn-secondary" style="width: 100%; margin-top: var(--space-xs);">✕ Sair da Leitura</button>
        </div>

        <!-- Modal de Preview do Card -->
        <div id="card-preview-modal" class="card-preview-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 3000; background: rgba(0,0,0,0.85); align-items: center; justify-content: center; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
          <div class="card-preview-content" style="background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: var(--space-lg); max-width: 420px; width: 90%; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.5); font-family: var(--font-ui);">
            <h3 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-sm); color: var(--text-primary);">Exportar Card</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: var(--space-md);">Escolha um estilo visual para o card antes do download.</p>
            
            <div class="theme-selector" style="display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-lg);">
              <button class="preview-theme-btn active" data-theme="dark" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: #050505; color: #e2e2e2; cursor: pointer;">Escuro</button>
              <button class="preview-theme-btn" data-theme="light" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #fdfdfd; color: #1a1a1a; cursor: pointer;">Claro</button>
              <button class="preview-theme-btn" data-theme="sepia" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #eae0c7; color: #433422; cursor: pointer;">Sépia</button>
            </div>

            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: var(--space-md) 0 var(--space-xs) 0;">Formato do Card:</p>
            <div class="ratio-selector" style="display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-lg); flex-wrap: wrap;">
              <button class="preview-ratio-btn active" data-ratio="feed" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Feed (4:5)</button>
              <button class="preview-ratio-btn" data-ratio="15x21" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Foto (15x21)</button>
              <button class="preview-ratio-btn" data-ratio="stories" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Stories (9:16)</button>
            </div>

            <div style="display: flex; gap: var(--space-xs); justify-content: center;">
              <button id="close-preview-btn" class="btn-secondary" style="padding: var(--space-xs) var(--space-md);">Cancelar</button>
              <button id="download-card-btn" class="btn-primary" style="padding: var(--space-xs) var(--space-md);">Baixar Imagem</button>
            </div>
          </div>
        </div>
      </div>
      <div id="immersive-hint" class="immersive-hint">Deslize para navegar →</div>
    `,(()=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){l.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px 0px -10% 0px`,threshold:.1});l.querySelectorAll(`.stagger-reveal`).forEach(t=>e.observe(t))})();let he=document.getElementById(`toggle-settings-btn`),ge=document.getElementById(`poem-settings-panel`);he?.addEventListener(`click`,()=>{ge.classList.toggle(`active`)});let _e=document.getElementById(`toggle-comment-btn`),T=document.getElementById(`comment-form`);_e?.addEventListener(`click`,()=>{T.style.display=T.style.display===`none`?`block`:`none`,_e.style.display=`none`});let E=window.location.href,D=`Leia "${b.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(D+` `+E)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(D)}&url=${encodeURIComponent(E)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(E)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let O=document.getElementById(`web-share-btn`);navigator.share?O.addEventListener(`click`,async()=>{try{await navigator.share({title:b.title,text:D,url:E})}catch{}}):(O.innerText=`Copiar Link`,O.addEventListener(`click`,()=>{navigator.clipboard.writeText(E).then(()=>{d.show(`Link copiado para a área de transferência!`,`success`)})}));let{counts:ve,userReactions:ye}=await u(b.id),be=(e,t)=>{c.forEach(n=>{let r=l.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=l.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};be(ve,ye),l.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await ne(b.id,t);let{counts:n,userReactions:r}=await u(b.id);be(n,r),e.classList.add(`reacted`),setTimeout(()=>{e.style.animation=`none`,e.offsetHeight,e.style.animation=null},10),e.disabled=!1})}),(async()=>{let{data:e,error:t}=await i.from(`poem_comments`).select(`author_name, content, created_at`).eq(`poem_id`,b.id).eq(`approved`,!0).order(`created_at`,{ascending:!0}),n=document.getElementById(`comments-list`);if(t||!e||e.length===0){n.innerHTML=`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`;return}n.innerHTML=e.map(e=>`
        <div class="comment-item fade-in">
          <div class="comment-meta">
            <span class="comment-author">${o(e.author_name)}</span>
            <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
          </div>
          <div class="comment-text">${o(e.content)}</div>
        </div>
      `).join(``)})(),T?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`comment-author`).value,n=document.getElementById(`comment-content`).value,r=document.getElementById(`submit-comment-btn`);document.getElementById(`comment-msg`),r.disabled=!0,r.innerText=`Enviando...`;let{error:a}=await i.from(`poem_comments`).insert([{poem_id:b.id,author_name:t,content:n}]);a?(d.show(`Erro ao enviar comentário.`,`error`),r.disabled=!1,r.innerText=`Enviar Nota`):(d.show(`Sua nota foi enviada e aguarda moderação.`,`success`),T.reset(),r.disabled=!1,r.innerText=`Enviar Nota`)});let k=document.getElementById(`fav-btn`),A=async()=>{let e=await r.has(b.slug);k&&(k.querySelector(`.fav-icon`).textContent=e?`♥`:`♡`,k.querySelector(`.fav-text`).textContent=e?`Salvo`:`Salvar`,k.classList.toggle(`active`,e))};A();let xe=(e,t)=>{let n=document.createElement(`span`);n.textContent=`♥`,n.className=`floating-heart-particle`,n.style.left=`${e}px`,n.style.top=`${t}px`,document.body.appendChild(n),setTimeout(()=>n.remove(),800)};k?.addEventListener(`click`,async()=>{await r.has(b.slug)?(await r.remove(b.slug),d.show(`Obra removida dos itens salvos.`,`info`)):(await r.save(b),d.show(`Obra salva com sucesso.`,`heart`)),A(),k.classList.remove(`animate-fav`),k.offsetWidth,k.classList.add(`animate-fav`),setTimeout(()=>k.classList.remove(`animate-fav`),800),window.dispatchEvent(new CustomEvent(`favorites-updated`))});let j=0;document.getElementById(`poem-text`)?.addEventListener(`touchend`,e=>{let t=Date.now();t-j<300&&t-j>0&&(k?.click(),e.changedTouches&&e.changedTouches[0]&&xe(e.changedTouches[0].clientX,e.changedTouches[0].clientY)),j=t},{passive:!0});let Se=document.getElementById(`immersive-btn`),Ce=document.getElementById(`immersive-exit-btn`),M=document.getElementById(`immersive-size-slider`),N=document.getElementById(`immersive-size-value`),P=document.getElementById(`immersive-height-slider`),F=document.getElementById(`immersive-height-value`),I=document.getElementById(`poem-text`),L=!1,R=localStorage.getItem(`immersive-reading-font-size`)||`20`,z=localStorage.getItem(`immersive-reading-line-height`)||`22`;I&&(I.style.setProperty(`--immersive-font-size`,`${R}px`),I.style.setProperty(`--immersive-line-height`,`${parseFloat(z)/10}`)),M&&N&&(M.value=R,N.textContent=`${R}px`,M.addEventListener(`input`,e=>{let t=e.target.value;N.textContent=`${t}px`,I?.style.setProperty(`--immersive-font-size`,`${t}px`),localStorage.setItem(`immersive-reading-font-size`,t)})),P&&F&&(P.value=z,F.textContent=`${(parseFloat(z)/10).toFixed(1)}`,P.addEventListener(`input`,e=>{let t=e.target.value,n=(parseFloat(t)/10).toFixed(1);F.textContent=n,I?.style.setProperty(`--immersive-line-height`,n),localStorage.setItem(`immersive-reading-line-height`,t)}));let we=()=>{if(L=!0,document.documentElement.classList.add(`immersive-mode`),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}},B=()=>{L=!1,document.documentElement.classList.remove(`immersive-mode`)};Se?.addEventListener(`click`,we),Ce?.addEventListener(`click`,B);let V=l.querySelectorAll(`.size-btn`),H=l.querySelectorAll(`.family-btn`),U=l.querySelectorAll(`.height-btn`),W=l.querySelectorAll(`.align-btn`),G=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t||e.dataset.align===t))},Te=localStorage.getItem(`reading-font-size`)||`md`,Ee=localStorage.getItem(`reading-font-family`)||`serif`,De=localStorage.getItem(`reading-line-height`)||`normal`,Oe=localStorage.getItem(`reading-alignment`)||`center`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${Te}`),document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${Ee}`),document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${De}`),document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${Oe}`),G(V,Te),G(H,Ee),G(U,De),G(W,Oe),V.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),G(V,t)})}),H.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),G(H,t)})}),U.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),G(U,t)})}),W.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.align;document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${t}`),localStorage.setItem(`reading-alignment`,t),G(W,t)})});let ke=l.querySelectorAll(`.ambient-btn`),K=document.getElementById(`ambient-audio`),Ae={rain:`https://upload.wikimedia.org/wikipedia/commons/4/4b/Rain_on_a_Tin_Roof.ogg`,fire:`https://upload.wikimedia.org/wikipedia/commons/a/ab/Crackling_fireplace.ogg`};ke.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sound;ke.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),t===`silence`?K.pause():(K.src=Ae[t],K.volume=.5,K.play().catch(e=>console.error(`Audio play failed:`,e)))})}),l.querySelector(`.ambient-btn[data-sound="silence"]`).classList.add(`active`);let je=document.getElementById(`poem-text`),q=document.getElementById(`highlight-tooltip`),J=``;je?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){q.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();J=e.toString().trim(),J.length>0?(q.style.left=`${t.left+t.width/2}px`,q.style.top=`${t.top+window.scrollY}px`,q.classList.add(`visible`)):q.classList.remove(`visible`)}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&q.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(J).then(()=>{d.show(`Trecho copiado para a área de transferência!`,`success`),window.getSelection().removeAllRanges(),q.classList.remove(`visible`)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${J}" — Natanael Brentano\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),q.classList.remove(`visible`)}),document.getElementById(`highlight-card-btn`)?.addEventListener(`click`,()=>{window.getSelection().removeAllRanges(),q.classList.remove(`visible`),g=!0,_=J;let e=document.getElementById(`card-preview-modal`);e&&(e.style.display=`flex`,e.classList.add(`active`))}),h=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:L&&B();break;case`ArrowRight`:S&&n(`/poema/${S}`);break;case`ArrowLeft`:x&&n(`/poema/${x}`);break;case`f`:case`F`:k?.click();break;case`i`:case`I`:L?B():we()}},document.addEventListener(`keydown`,h);let Me=document.getElementById(`scroll-bar`),Y=document.querySelector(`.poem-nav`),X=document.getElementById(`next-btn`),Z=!1;f=re(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;Me&&(Me.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;Y&&(t>50?Y.classList.add(`visible`):Y.classList.remove(`visible`)),t+r>n*.9&&S&&!Z&&(Z=!0,X&&(X.style.transform=`scale(1.05)`),setTimeout(()=>{X&&(X.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,f);let Ne=0,Pe=0,Fe=0;p=e=>{Ne=e.touches[0].clientX,Pe=e.touches[0].clientY,Fe=Date.now()},m=e=>{let t=Ne-e.changedTouches[0].clientX,r=Pe-e.changedTouches[0].clientY;Date.now()-Fe<=500&&Math.abs(t)>100&&Math.abs(t)>Math.abs(r)*3&&(t>0&&S?n(`/poema/${S}`):t<0&&x&&n(`/poema/${x}`))},document.addEventListener(`touchstart`,p,{passive:!0}),document.addEventListener(`touchend`,m,{passive:!0}),X?.addEventListener(`click`,()=>{S&&n(`/poema/${S}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{x&&n(`/poema/${x}`)}),s.init();let Ie=document.getElementById(`share-card-btn`),Q=document.getElementById(`card-preview-modal`),Le=document.getElementById(`close-preview-btn`),$=document.getElementById(`download-card-btn`),Re=l.querySelectorAll(`.preview-theme-btn`),ze=l.querySelectorAll(`.preview-ratio-btn`),Be=`dark`,Ve=`feed`;if(Ie?.addEventListener(`click`,()=>{Q&&(Q.style.display=`flex`,Q.classList.add(`active`))}),Le?.addEventListener(`click`,()=>{Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}),Re.forEach(e=>{e.addEventListener(`click`,()=>{Re.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),Be=e.dataset.theme})}),ze.forEach(e=>{e.addEventListener(`click`,()=>{ze.forEach(e=>{e.classList.remove(`active`),e.style.borderColor=`var(--border-subtle)`}),e.classList.add(`active`),e.style.borderColor=`var(--border-strong)`,Ve=e.dataset.ratio})}),$?.addEventListener(`click`,async()=>{$.innerText=`Gerando...`,$.disabled=!0;try{let{generateSocialCard:t}=await e(async()=>{let{generateSocialCard:e}=await import(`./social-export-b3MWKN4-.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1,2])),n=g?_:null;await t(b,document.getElementById(`social-card-container`),Be,n,Ve),d.show(`Card gerado com sucesso!`,`success`)}catch(e){console.error(e),d.show(`Erro ao gerar card.`,`error`)}finally{$.innerText=`Baixar Imagem`,$.disabled=!1,g=!1,_=``,Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}}),pe){let e=document.getElementById(`resend-email-btn`);e&&e.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){e.innerText=`Enviando...`,e.disabled=!0;try{let{data:e,error:t}=await i.functions.invoke(`send-newsletter`,{body:{poemId:b.id}});if(t)throw t;alert(`Email reenviado com sucesso para ${e?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Houve um erro ao reenviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}finally{e.innerText=`Reenviar Email`,e.disabled=!1}}})}setTimeout(()=>{[x,S].filter(Boolean).forEach(e=>{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=`${window.location.origin}/poemas/poema/${e}`,document.head.appendChild(t)})},2e3)}};export{ie as default};