const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-b3MWKN4-.js","assets/html-Ca31mHym.js","assets/social-export-DdOctoXY.css"])))=>i.map(i=>d[i]);
import{r as e,t}from"./index-mEssQEaL.js";import{supabase as n}from"./supabase-Cmo813Sf.js";import{n as r,r as i,t as a}from"./html-Ca31mHym.js";import{t as o}from"./seo-BlITGSmq.js";import{t as ee}from"./newsletter-DAlyYhrx.js";import{trackPageView as te}from"./analytics-DsbAerZP.js";var s=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function c(){let e=localStorage.getItem(`reaction_session_id`);if(!e){if(typeof crypto<`u`&&typeof crypto.randomUUID==`function`)e=crypto.randomUUID();else if(typeof crypto<`u`&&typeof crypto.getRandomValues==`function`){let t=new Uint8Array(16);crypto.getRandomValues(t),t[6]=t[6]&15|64,t[8]=t[8]&63|128;let n=Array.from(t,e=>e.toString(16).padStart(2,`0`)).join(``);e=`${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}e&&localStorage.setItem(`reaction_session_id`,e)}return e}async function ne(e){let{data:t,error:r}=await n.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,e);if(r)return{counts:{},userReactions:new Set};let i=c(),a={},o=new Set;return s.forEach(e=>a[e]=0),(t||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===i&&o.add(e.emoji)}),{counts:a,userReactions:o}}async function re(e,t){let r=c(),{data:i}=await n.from(`poem_reactions`).select(`id`).eq(`poem_id`,e).eq(`session_id`,r).eq(`emoji`,t).maybeSingle();return i?(await n.from(`poem_reactions`).delete().eq(`id`,i.id),`removed`):(await n.from(`poem_reactions`).insert({poem_id:e,emoji:t,session_id:r}),`added`)}var l={init(){if(!document.getElementById(`toast-container`)){let e=document.createElement(`div`);e.id=`toast-container`,e.className=`toast-container`,e.setAttribute(`aria-live`,`polite`),document.body.appendChild(e)}},show(e,t=`default`,n=3e3){this.init();let r=document.getElementById(`toast-container`),i=document.createElement(`div`);i.className=`toast-message toast-${t}`;let a=``;t===`success`&&(a=`✓ `),t===`error`&&(a=`⚠ `),t===`info`&&(a=`ℹ `),t===`heart`&&(a=`♥ `),i.innerHTML=`<span class="toast-icon">${a}</span><span class="toast-text">${e}</span>`,r.appendChild(i),i.offsetWidth,i.classList.add(`show`),setTimeout(()=>{i.classList.remove(`show`),i.addEventListener(`transitionend`,()=>{i.parentNode&&i.parentNode.removeChild(i)})},n)}};function ie(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var u=null,d=null,f=null,p=null,m=!1,h=``,ae={meta:{title:`Poema`},cleanup(){u&&window.removeEventListener(`scroll`,u),d&&document.removeEventListener(`touchstart`,d),f&&document.removeEventListener(`touchend`,f),p&&document.removeEventListener(`keydown`,p),document.documentElement.classList.remove(`immersive-mode`);let e=document.getElementById(`ambient-audio`);e&&(e.pause(),e.removeAttribute(`src`),e.load());let t=document.getElementById(`narration-audio`);t&&(t.pause(),t.removeAttribute(`src`),t.load()),u=null,d=null,f=null,p=null,m=!1,h=``},async render(c,ae){let oe=ae.slug;c.innerHTML=`
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
    `,console.log(`[Poem] Fetching slug:`,oe);let{data:g,error:_}=await n.rpc(`get_poem_with_navigation`,{target_slug:oe});_&&console.error(`[Poem] RPC Error:`,_);let v=g&&Array.isArray(g)&&g.length>0?g[0]:null;if(_||!v){console.warn(`[Poem] Poem not found or error occurred`),c.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}if(v&&v.audio_url===void 0)try{let{data:e}=await n.from(`poems`).select(`audio_url`).eq(`id`,v.id).single();e&&e.audio_url&&(v.audio_url=e.audio_url)}catch(e){console.warn(`Fallback query for audio_url failed:`,e)}let y=v.prev_slug,b=v.next_slug,se=v.prev_title,ce=v.next_title,le=i(v.content||``).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,ue=Math.ceil(le/200),de=ue<=1?`1 min de leitura`:`${ue} min de leitura`;te(`/poema/`+v.slug,v.id);let fe=window.location.href,pe=i(v.excerpt||v.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,me=`${window.location.origin}/poemas/og-cover.jpg`;o({title:v.title,description:pe,url:fe,imageUrl:me,type:`article`,publishedTime:v.published_at,tags:v.tags});let{data:{session:he}}=await n.auth.getSession(),ge=!!he,_e=(e=>{if(!e)return``;let t=e.split(/\n\s*\n/).filter(e=>e.trim()),n=0;return t.map(e=>`<div class="stanza stagger-reveal">${e.split(`
`).map(e=>(n++,`<span class="line-reveal" style="transition-delay: ${n*.05}s">${e}</span>`)).join(``)}</div>`).join(``)})(v.content);c.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${v.title}</h1>
            <div class="poem-meta">
              <span>${new Date(v.published_at).toLocaleDateString(`pt-BR`)}</span>
              <span>•</span>
              <span class="reading-time">${de}</span>
            </div>
          </header>

          ${v.audio_url?`
            <section class="poem-narration-player" aria-label="Player de áudio da poesia: Ouvir narração do autor" role="region">
              <audio id="narration-audio" preload="metadata" playsinline webkit-playsinline src="${r(v.audio_url)}">
                <source src="${r(v.audio_url)}" type="${v.audio_url.toLowerCase().includes(`.m4a`)?`audio/mp4`:v.audio_url.toLowerCase().includes(`.wav`)?`audio/wav`:`audio/mpeg`}">
              </audio>
              <div class="narration-header">
                <div class="narration-badge">
                  <span class="narration-badge-dot"></span>
                  <span>Ouvir narração do autor</span>
                </div>
                <div class="narration-actions">
                  <button id="narration-speed-btn" class="narration-speed-btn" aria-label="Velocidade de reprodução" title="Velocidade de reprodução">1x</button>
                  <div class="narration-volume-container">
                    <button id="narration-mute-btn" class="narration-volume-btn" aria-label="Mutar áudio" title="Mutar / Ativar som">
                      <svg id="narration-vol-icon-on" viewBox="0 0 24 24" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      <svg id="narration-vol-icon-off" style="display:none;" viewBox="0 0 24 24" width="16" height="16"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    </button>
                    <input type="range" id="narration-vol-slider" class="narration-volume-slider" min="0" max="1" step="0.05" value="1" aria-label="Controle de volume da narração">
                  </div>
                </div>
              </div>

              <div class="narration-controls">
                <button id="narration-play-btn" class="narration-play-btn" aria-label="Reproduzir narração">
                  <svg id="narration-play-icon" viewBox="0 0 24 24"><polygon points="8,5 19,12 8,19" fill="currentColor"/></svg>
                  <svg id="narration-pause-icon" style="display: none;" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" fill="currentColor"/><rect x="14" y="5" width="4" height="14" fill="currentColor"/></svg>
                </button>

                <div class="narration-timeline">
                  <span id="narration-current-time" class="narration-time">00:00</span>
                  <div class="narration-slider-container">
                    <input type="range" id="narration-progress" class="narration-slider" min="0" max="100" value="0" step="0.1" aria-label="Progresso da narração">
                  </div>
                  <span id="narration-duration" class="narration-time">--:--</span>
                </div>
              </div>
            </section>
          `:``}

          <div id="poem-text" class="poem-content">${_e}</div>



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
              ${s.map(e=>`
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
            
            <button id="share-card-btn" class="btn-secondary" aria-label="Gerar card para compartilhar">
              🖼 Compartilhar Card
            </button>
            
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${ge?`
              <a href="/poemas/admin?view=editor&id=${v.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `:``}
          </div>
        </article>
        
        <!-- Newsletter Section -->
        ${ee.render()}
        
        <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

        <audio id="ambient-audio" loop></audio>
        <div id="highlight-tooltip" class="highlight-tooltip">
          <button id="highlight-copy-btn" class="highlight-btn">Copiar</button>
          <button id="highlight-share-btn" class="highlight-btn">Compartilhar</button>
          <button id="highlight-card-btn" class="highlight-btn">Gerar Card</button>
        </div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${y?``:`display:none;`}" aria-label="Poema anterior" title="${se||``}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${se||``}</span>
          </button>
          
          <div class="nav-center">
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${b?``:`display:none;`}" aria-label="Próximo poema" title="${ce||``}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${ce||``}</span>
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
    `,(()=>{if(typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||typeof IntersectionObserver>`u`){c.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px 0px -10% 0px`,threshold:.1});c.querySelectorAll(`.stagger-reveal`).forEach(t=>e.observe(t))})();let ve=document.getElementById(`toggle-settings-btn`),ye=document.getElementById(`poem-settings-panel`);ve?.addEventListener(`click`,()=>{ye.classList.toggle(`active`)});let be=document.getElementById(`toggle-comment-btn`),x=document.getElementById(`comment-form`);be?.addEventListener(`click`,()=>{x.style.display=x.style.display===`none`?`block`:`none`,be.style.display=`none`});let S=window.location.href,C=`Leia "${v.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(C+` `+S)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(C)}&url=${encodeURIComponent(S)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(S)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let w=document.getElementById(`web-share-btn`);navigator.share?w.addEventListener(`click`,async()=>{try{await navigator.share({title:v.title,text:C,url:S})}catch{}}):(w.innerText=`Copiar Link`,w.addEventListener(`click`,()=>{navigator.clipboard.writeText(S).then(()=>{l.show(`Link copiado para a área de transferência!`,`success`)})}));let{counts:xe,userReactions:Se}=await ne(v.id),Ce=(e,t)=>{s.forEach(n=>{let r=c.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=c.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};Ce(xe,Se),c.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await re(v.id,t);let{counts:n,userReactions:r}=await ne(v.id);Ce(n,r),e.classList.add(`reacted`),setTimeout(()=>{e.style.animation=`none`,e.offsetHeight,e.style.animation=null},10),e.disabled=!1})}),(async()=>{let{data:e,error:t}=await n.from(`poem_comments`).select(`author_name, content, created_at`).eq(`poem_id`,v.id).eq(`approved`,!0).order(`created_at`,{ascending:!0}),r=document.getElementById(`comments-list`);if(t||!e||e.length===0){r.innerHTML=`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`;return}r.innerHTML=e.map(e=>`
        <div class="comment-item fade-in">
          <div class="comment-meta">
            <span class="comment-author">${a(e.author_name)}</span>
            <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
          </div>
          <div class="comment-text">${a(e.content)}</div>
        </div>
      `).join(``)})(),x?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`comment-author`).value,r=document.getElementById(`comment-content`).value,i=document.getElementById(`submit-comment-btn`);document.getElementById(`comment-msg`),i.disabled=!0,i.innerText=`Enviando...`;let{error:a}=await n.from(`poem_comments`).insert([{poem_id:v.id,author_name:t,content:r}]);a?(l.show(`Erro ao enviar comentário.`,`error`),i.disabled=!1,i.innerText=`Enviar Nota`):(l.show(`Sua nota foi enviada e aguarda moderação.`,`success`),x.reset(),i.disabled=!1,i.innerText=`Enviar Nota`)});let we=document.getElementById(`immersive-btn`),Te=document.getElementById(`immersive-exit-btn`),T=document.getElementById(`immersive-size-slider`),E=document.getElementById(`immersive-size-value`),D=document.getElementById(`immersive-height-slider`),O=document.getElementById(`immersive-height-value`),k=document.getElementById(`poem-text`),A=!1,j=localStorage.getItem(`immersive-reading-font-size`)||`20`,M=localStorage.getItem(`immersive-reading-line-height`)||`22`;k&&(k.style.setProperty(`--immersive-font-size`,`${j}px`),k.style.setProperty(`--immersive-line-height`,`${parseFloat(M)/10}`)),T&&E&&(T.value=j,E.textContent=`${j}px`,T.addEventListener(`input`,e=>{let t=e.target.value;E.textContent=`${t}px`,k?.style.setProperty(`--immersive-font-size`,`${t}px`),localStorage.setItem(`immersive-reading-font-size`,t)})),D&&O&&(D.value=M,O.textContent=`${(parseFloat(M)/10).toFixed(1)}`,D.addEventListener(`input`,e=>{let t=e.target.value,n=(parseFloat(t)/10).toFixed(1);O.textContent=n,k?.style.setProperty(`--immersive-line-height`,n),localStorage.setItem(`immersive-reading-line-height`,t)}));let Ee=()=>{if(A=!0,document.documentElement.classList.add(`immersive-mode`),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}},N=()=>{A=!1,document.documentElement.classList.remove(`immersive-mode`)};we?.addEventListener(`click`,Ee),Te?.addEventListener(`click`,N);let P=c.querySelectorAll(`.size-btn`),F=c.querySelectorAll(`.family-btn`),I=c.querySelectorAll(`.height-btn`),L=c.querySelectorAll(`.align-btn`),R=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t||e.dataset.align===t))},De=localStorage.getItem(`reading-font-size`)||`md`,Oe=localStorage.getItem(`reading-font-family`)||`serif`,ke=localStorage.getItem(`reading-line-height`)||`normal`,Ae=localStorage.getItem(`reading-alignment`)||`center`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${De}`),document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${Oe}`),document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${ke}`),document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${Ae}`),R(P,De),R(F,Oe),R(I,ke),R(L,Ae),P.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),R(P,t)})}),F.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),R(F,t)})}),I.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),R(I,t)})}),L.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.align;document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${t}`),localStorage.setItem(`reading-alignment`,t),R(L,t)})});let z=c.querySelectorAll(`.ambient-btn`),B=document.getElementById(`ambient-audio`),je={rain:`/poemas/sounds/rain.mp3`,fire:`/poemas/sounds/fire.mp3`};z.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sound;if(e.classList.contains(`active`)&&t!==`silence`){z.forEach(e=>e.classList.remove(`active`));let e=c.querySelector(`.ambient-btn[data-sound="silence"]`);e&&e.classList.add(`active`),B&&(B.pause(),B.currentTime=0);return}if(z.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),B){if(t===`silence`)B.pause(),B.currentTime=0;else if(je[t]){let e=je[t];B.src.endsWith(e)||(B.src=e),B.volume=.5,B.play().catch(e=>console.error(`Audio play failed:`,e))}}})});let Me=c.querySelector(`.ambient-btn[data-sound="silence"]`);Me&&Me.classList.add(`active`);let V=document.getElementById(`narration-audio`),H=document.getElementById(`narration-play-btn`),U=document.getElementById(`narration-play-icon`),W=document.getElementById(`narration-pause-icon`),G=document.getElementById(`narration-current-time`),K=document.getElementById(`narration-duration`),q=document.getElementById(`narration-progress`),Ne=document.getElementById(`narration-speed-btn`),Pe=document.getElementById(`narration-mute-btn`),Fe=document.getElementById(`narration-vol-icon-on`),Ie=document.getElementById(`narration-vol-icon-off`),Le=document.getElementById(`narration-vol-slider`);if(V&&H){let e=e=>{if(!e||isNaN(e)||!isFinite(e))return`00:00`;let t=Math.floor(e/60),n=Math.floor(e%60);return`${t<10?`0`:``}${t}:${n<10?`0`:``}${n}`},t=e=>{if(q){let t=Math.max(0,Math.min(100,e));q.value=t,q.style.background=`linear-gradient(to right, var(--accent-subtle) ${t}%, var(--border-strong) ${t}%)`}},n=e=>{e?(U&&(U.style.display=`none`),W&&(W.style.display=`block`),H.setAttribute(`aria-label`,`Pausar narração`)):(U&&(U.style.display=`block`),W&&(W.style.display=`none`),H.setAttribute(`aria-label`,`Reproduzir narração`))};H.addEventListener(`click`,async()=>{try{V.paused?await V.play():V.pause()}catch(e){console.error(`Erro ao reproduzir narração:`,e),n(!1),l.show(`Não foi possível iniciar o áudio.`,`error`)}}),V.addEventListener(`play`,()=>n(!0)),V.addEventListener(`pause`,()=>n(!1)),V.addEventListener(`timeupdate`,()=>{if(G&&(G.textContent=e(V.currentTime)),V.duration&&isFinite(V.duration)){let e=V.currentTime/V.duration*100;t(e)}});let r=()=>{K&&V.duration&&isFinite(V.duration)&&(K.textContent=e(V.duration))};V.addEventListener(`loadedmetadata`,r),V.addEventListener(`durationchange`,r),V.addEventListener(`ended`,()=>{n(!1),t(0),G&&(G.textContent=`00:00`)}),V.addEventListener(`error`,e=>{console.error(`Erro no áudio de narração:`,e,V.error),K&&(K.textContent=`Erro`),n(!1)}),q&&(q.addEventListener(`input`,t=>{let n=parseFloat(t.target.value);if(V.duration&&isFinite(V.duration)){let t=n/100*V.duration;G&&(G.textContent=e(t))}q.style.background=`linear-gradient(to right, var(--accent-subtle) ${n}%, var(--border-strong) ${n}%)`}),q.addEventListener(`change`,e=>{let t=parseFloat(e.target.value);V.duration&&isFinite(V.duration)&&(V.currentTime=t/100*V.duration)}));let i=[1,1.25,1.5],a=0;Ne&&Ne.addEventListener(`click`,()=>{a=(a+1)%i.length;let e=i[a];V.playbackRate=e,Ne.textContent=`${e}x`});let o=()=>{let e=V.muted||V.volume===0;Fe&&Ie&&(Fe.style.display=e?`none`:`block`,Ie.style.display=e?`block`:`none`)};Pe&&Pe.addEventListener(`click`,()=>{V.muted=!V.muted,o()}),Le&&Le.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);V.volume=t,V.muted=t===0,o()})}let Re=document.getElementById(`poem-text`),J=document.getElementById(`highlight-tooltip`),Y=``;Re?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){J.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();Y=e.toString().trim(),Y.length>0?(J.style.left=`${t.left+t.width/2}px`,J.style.top=`${t.top+window.scrollY}px`,J.classList.add(`visible`)):J.classList.remove(`visible`)}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&J.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(Y).then(()=>{l.show(`Trecho copiado para a área de transferência!`,`success`),window.getSelection().removeAllRanges(),J.classList.remove(`visible`)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${Y}" — Natanael Brentano\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),J.classList.remove(`visible`)}),document.getElementById(`highlight-card-btn`)?.addEventListener(`click`,()=>{window.getSelection().removeAllRanges(),J.classList.remove(`visible`),m=!0,h=Y;let e=document.getElementById(`card-preview-modal`);e&&(e.style.display=`flex`,e.classList.add(`active`))}),p=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:A&&N();break;case`ArrowRight`:b&&t(`/poema/${b}`);break;case`ArrowLeft`:y&&t(`/poema/${y}`);break;case`i`:case`I`:A?N():Ee()}},document.addEventListener(`keydown`,p);let ze=document.getElementById(`scroll-bar`),X=document.querySelector(`.poem-nav`),Z=document.getElementById(`next-btn`),Be=!1;u=ie(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;ze&&(ze.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;X&&(t>50?X.classList.add(`visible`):X.classList.remove(`visible`)),t+r>n*.9&&b&&!Be&&(Be=!0,Z&&(Z.style.transform=`scale(1.05)`),setTimeout(()=>{Z&&(Z.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,u);let Ve=0,He=0,Ue=0;d=e=>{Ve=e.touches[0].clientX,He=e.touches[0].clientY,Ue=Date.now()},f=e=>{let n=Ve-e.changedTouches[0].clientX,r=He-e.changedTouches[0].clientY;Date.now()-Ue<=500&&Math.abs(n)>100&&Math.abs(n)>Math.abs(r)*3&&(n>0&&b?t(`/poema/${b}`):n<0&&y&&t(`/poema/${y}`))},document.addEventListener(`touchstart`,d,{passive:!0}),document.addEventListener(`touchend`,f,{passive:!0}),Z?.addEventListener(`click`,()=>{b&&t(`/poema/${b}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{y&&t(`/poema/${y}`)}),ee.init();let We=document.getElementById(`share-card-btn`),Q=document.getElementById(`card-preview-modal`),Ge=document.getElementById(`close-preview-btn`),$=document.getElementById(`download-card-btn`),Ke=c.querySelectorAll(`.preview-theme-btn`),qe=c.querySelectorAll(`.preview-ratio-btn`),Je=`dark`,Ye=`feed`;if(We?.addEventListener(`click`,()=>{Q&&(Q.style.display=`flex`,Q.classList.add(`active`))}),Ge?.addEventListener(`click`,()=>{Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}),Ke.forEach(e=>{e.addEventListener(`click`,()=>{Ke.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),Je=e.dataset.theme})}),qe.forEach(e=>{e.addEventListener(`click`,()=>{qe.forEach(e=>{e.classList.remove(`active`),e.style.borderColor=`var(--border-subtle)`}),e.classList.add(`active`),e.style.borderColor=`var(--border-strong)`,Ye=e.dataset.ratio})}),$?.addEventListener(`click`,async()=>{$.innerText=`Gerando...`,$.disabled=!0;try{let{generateSocialCard:t}=await e(async()=>{let{generateSocialCard:e}=await import(`./social-export-b3MWKN4-.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1,2])),n=m?h:null;await t(v,document.getElementById(`social-card-container`),Je,n,Ye),l.show(`Card gerado com sucesso!`,`success`)}catch(e){console.error(e),l.show(`Erro ao gerar card.`,`error`)}finally{$.innerText=`Baixar Imagem`,$.disabled=!1,m=!1,h=``,Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}}),ge){let e=document.getElementById(`resend-email-btn`);e&&e.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){e.innerText=`Enviando...`,e.disabled=!0;try{let{data:e,error:t}=await n.functions.invoke(`send-newsletter`,{body:{poemId:v.id}});if(t)throw t;alert(`Email reenviado com sucesso para ${e?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Houve um erro ao reenviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}finally{e.innerText=`Reenviar Email`,e.disabled=!1}}})}setTimeout(()=>{[y,b].filter(Boolean).forEach(e=>{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=`${window.location.origin}/poemas/poema/${e}`,document.head.appendChild(t)})},2e3)}};export{ae as default};