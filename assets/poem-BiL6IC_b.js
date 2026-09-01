const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-DSDJYUgX.js","assets/html-Ca31mHym.js","assets/social-export-hcu2himr.css","assets/firebase-DbnQPwBn.js","assets/index.esm-C77q4Vsq.js","assets/index-5Z0EvPl5.js","assets/index-D3qnpX2x.css","assets/index.esm-tXuATA5w.js"])))=>i.map(i=>d[i]);
import{a as e,c as t,d as n,f as r,n as i,p as a,r as o,s}from"./index.esm-C77q4Vsq.js";import{r as c,t as l}from"./index-5Z0EvPl5.js";import{db as u,getFirebaseAuth as d}from"./firebase-DbnQPwBn.js";import{n as f,r as p,t as m}from"./html-Ca31mHym.js";import{t as h}from"./seo-BF0uIWTH.js";import{t as g}from"./newsletter-2RAkzR_l.js";import{trackPageView as _}from"./analytics-ByF8poca.js";var v=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`,`❤️`];function y(){let e=localStorage.getItem(`reaction_session_id`);if(!e){if(typeof crypto<`u`&&typeof crypto.randomUUID==`function`)e=crypto.randomUUID();else if(typeof crypto<`u`&&typeof crypto.getRandomValues==`function`){let t=new Uint8Array(16);crypto.getRandomValues(t),t[6]=t[6]&15|64,t[8]=t[8]&63|128;let n=Array.from(t,e=>e.toString(16).padStart(2,`0`)).join(``);e=`${n.slice(0,8)}-${n.slice(8,12)}-${n.slice(12,16)}-${n.slice(16,20)}-${n.slice(20)}`}e&&localStorage.setItem(`reaction_session_id`,e)}return e}async function ee(i){let a=[];try{let o=t(r(u,`poem_reactions`),n(`poem_id`,`==`,i));(await e(o)).forEach(e=>{a.push(e.data())})}catch{return{counts:{},userReactions:new Set}}let o=y(),s={},c=new Set;return v.forEach(e=>s[e]=0),(a||[]).forEach(e=>{s[e.emoji]=(s[e.emoji]||0)+1,e.session_id===o&&c.add(e.emoji)}),{counts:s,userReactions:c}}async function te(s,c){let l=y();try{let d=t(r(u,`poem_reactions`),n(`poem_id`,`==`,s),n(`session_id`,`==`,l),n(`emoji`,`==`,c)),f=await e(d);if(f.empty)return await i(r(u,`poem_reactions`),{poem_id:s,emoji:c,session_id:l}),`added`;{let e=f.docs[0];return await o(a(u,`poem_reactions`,e.id)),`removed`}}catch(e){return console.error(`Error toggling reaction:`,e),null}}var b={init(){if(!document.getElementById(`toast-container`)){let e=document.createElement(`div`);e.id=`toast-container`,e.className=`toast-container`,e.setAttribute(`aria-live`,`polite`),document.body.appendChild(e)}},show(e,t=`default`,n=3e3){this.init();let r=document.getElementById(`toast-container`),i=document.createElement(`div`);i.className=`toast-message toast-${t}`;let a=``;t===`success`&&(a=`✓ `),t===`error`&&(a=`⚠ `),t===`info`&&(a=`ℹ `),t===`heart`&&(a=`♥ `),i.innerHTML=`<span class="toast-icon">${a}</span><span class="toast-text">${e}</span>`,r.appendChild(i),i.offsetWidth,i.classList.add(`show`),setTimeout(()=>{i.classList.remove(`show`),i.addEventListener(`transitionend`,()=>{i.parentNode&&i.parentNode.removeChild(i)})},n)}},ne=e=>{if(!e)return``;let t=e.split(/\n\s*\n/).filter(e=>e.trim()),n=0;return t.map(e=>`<div class="stanza stagger-reveal">${e.split(`
`).map(e=>(n++,`<span class="line-reveal" style="transition-delay: ${parseFloat((n*.05).toFixed(2))}s">${e}</span>`)).join(``)}</div>`).join(``)},x={init(e,t){let n=e.querySelectorAll(`.ambient-btn`),r=document.getElementById(`ambient-audio`),i={rain:`${t}sounds/rain.mp3`,fire:`${t}sounds/fire.mp3`};n.forEach(t=>{t.addEventListener(`click`,()=>{let a=t.dataset.sound;if(t.classList.contains(`active`)&&a!==`silence`){n.forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`.ambient-btn[data-sound="silence"]`);t&&t.classList.add(`active`),r&&(r.pause(),r.currentTime=0);return}if(n.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),r){if(a===`silence`)r.pause(),r.currentTime=0;else if(i[a]){let e=i[a];r.src.endsWith(e)||(r.src=e),r.volume=.5,r.play().catch(e=>console.error(`Audio play failed:`,e))}}})});let a=e.querySelector(`.ambient-btn[data-sound="silence"]`);a&&a.classList.add(`active`);let o=document.getElementById(`narration-audio`),s=document.getElementById(`narration-play-btn`),c=document.getElementById(`narration-play-icon`),l=document.getElementById(`narration-pause-icon`),u=document.getElementById(`narration-current-time`),d=document.getElementById(`narration-duration`),f=document.getElementById(`narration-progress`),p=document.getElementById(`narration-speed-btn`),m=document.getElementById(`narration-mute-btn`),h=document.getElementById(`narration-vol-icon-on`),g=document.getElementById(`narration-vol-icon-off`),_=document.getElementById(`narration-vol-slider`);if(o&&s){let e=e=>{if(!e||isNaN(e)||!isFinite(e))return`00:00`;let t=Math.floor(e/60),n=Math.floor(e%60);return`${t<10?`0`:``}${t}:${n<10?`0`:``}${n}`},t=e=>{if(f){let t=Math.max(0,Math.min(100,e));f.value=t,f.style.background=`linear-gradient(to right, var(--accent-subtle) ${t}%, var(--border-strong) ${t}%)`}},n=e=>{e?(c&&(c.style.display=`none`),l&&(l.style.display=`block`),s.setAttribute(`aria-label`,`Pausar narração`)):(c&&(c.style.display=`block`),l&&(l.style.display=`none`),s.setAttribute(`aria-label`,`Reproduzir narração`))};s.addEventListener(`click`,()=>{o.paused?o.play().catch(e=>console.error(`Narration play error:`,e)):o.pause()}),o.addEventListener(`play`,()=>n(!0)),o.addEventListener(`pause`,()=>n(!1)),o.addEventListener(`ended`,()=>{n(!1),t(0),u&&(u.textContent=`00:00`)}),o.addEventListener(`loadedmetadata`,()=>{d&&(d.textContent=e(o.duration))}),o.addEventListener(`timeupdate`,()=>{let n=o.currentTime,r=o.duration;u&&(u.textContent=e(n)),r>0&&t(n/r*100)}),f&&f.addEventListener(`input`,e=>{let n=parseFloat(e.target.value),r=o.duration;r&&!isNaN(r)&&(o.currentTime=n/100*r),t(n)});let r=[1,1.25,1.5,2],i=0;p&&p.addEventListener(`click`,()=>{i=(i+1)%r.length;let e=r[i];o.playbackRate=e,p.textContent=`${e}x`});let a=()=>{let e=o.muted||o.volume===0;h&&(h.style.display=e?`none`:`block`),g&&(g.style.display=e?`block`:`none`)};m&&m.addEventListener(`click`,()=>{o.muted=!o.muted,a(),_&&(_.value=o.muted?0:o.volume)}),_&&_.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);o.volume=t,o.muted=t===0,a()})}},cleanup(){let e=document.getElementById(`ambient-audio`);e&&(e.pause(),e.removeAttribute(`src`),e.load());let t=document.getElementById(`narration-audio`);t&&(t.pause(),t.removeAttribute(`src`),t.load())}},S={init(e){let t=document.getElementById(`immersive-btn`),n=document.getElementById(`immersive-exit-btn`),r=document.getElementById(`immersive-size-slider`),i=document.getElementById(`immersive-size-value`),a=document.getElementById(`immersive-height-slider`),o=document.getElementById(`immersive-height-value`),s=document.getElementById(`poem-text`),c=localStorage.getItem(`immersive-reading-font-size`)||`20`,l=localStorage.getItem(`immersive-reading-line-height`)||`22`;s&&(s.style.setProperty(`--immersive-font-size`,`${c}px`),s.style.setProperty(`--immersive-line-height`,`${parseFloat(l)/10}`)),r&&i&&(r.value=c,i.textContent=`${c}px`,r.addEventListener(`input`,e=>{let t=e.target.value;i.textContent=`${t}px`,s?.style.setProperty(`--immersive-font-size`,`${t}px`),localStorage.setItem(`immersive-reading-font-size`,t)})),a&&o&&(a.value=l,o.textContent=`${(parseFloat(l)/10).toFixed(1)}`,a.addEventListener(`input`,e=>{let t=e.target.value,n=(parseFloat(t)/10).toFixed(1);o.textContent=n,s?.style.setProperty(`--immersive-line-height`,n),localStorage.setItem(`immersive-reading-line-height`,t)})),t?.addEventListener(`click`,()=>{if(document.documentElement.classList.add(`immersive-mode`),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}}),n?.addEventListener(`click`,()=>{document.documentElement.classList.remove(`immersive-mode`)})},cleanup(){document.documentElement.classList.remove(`immersive-mode`)}},re={async init(a,o){let c=document.getElementById(`toggle-comment-btn`),l=document.getElementById(`comment-form`);c?.addEventListener(`click`,()=>{l.style.display=l.style.display===`none`?`block`:`none`,c.style.display=`none`}),(async()=>{let i=[],a=null;try{let a=t(r(u,`poem_comments`),n(`poem_id`,`==`,o),n(`approved`,`==`,!0),s(`created_at`,`asc`));(await e(a)).forEach(e=>{i.push(e.data())})}catch(e){a=e,console.error(`Error loading comments:`,e)}let c=document.getElementById(`comments-list`);if(a||i.length===0){c&&(c.innerHTML=`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`);return}c&&(c.innerHTML=i.map(e=>`
          <div class="comment-item fade-in">
            <div class="comment-meta">
              <span class="comment-author">${m(e.author_name)}</span>
              <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
            </div>
            <div class="comment-text">${m(e.content)}</div>
          </div>
        `).join(``))})(),l?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`comment-author`).value,n=document.getElementById(`comment-content`).value,a=document.getElementById(`submit-comment-btn`);a.disabled=!0,a.innerText=`Enviando...`;let s=null;try{await i(r(u,`poem_comments`),{poem_id:o,author_name:t,content:n,approved:!1,created_at:new Date().toISOString()})}catch(e){s=e,console.error(`Error adding comment:`,e)}s?(b.show(`Erro ao enviar comentário.`,`error`),a.disabled=!1,a.innerText=`Enviar Nota`):(b.show(`Sua nota foi enviada e aguarda moderação.`,`success`),l.reset(),a.disabled=!1,a.innerText=`Enviar Nota`)})}};function ie(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var C=null,w=null,T=null,E=null,D=!1,O=``,k={meta:{title:`Poema`},cleanup(){C&&window.removeEventListener(`scroll`,C),w&&document.removeEventListener(`touchstart`,w),T&&document.removeEventListener(`touchend`,T),E&&document.removeEventListener(`keydown`,E),S.cleanup(),x.cleanup(),C=null,w=null,T=null,E=null,D=!1,O=``},async render(i,a){let o=a.slug;i.innerHTML=`
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
    `,console.log(`[Poem] Fetching slug:`,o);let s=null,m=null;try{let i=t(r(u,`poems`),n(`status`,`==`,`published`)),a=await e(i),c=[];a.forEach(e=>c.push({id:e.id,...e.data()})),c.sort((e,t)=>new Date(t.published_at)-new Date(e.published_at));let l=c.findIndex(e=>e.slug===o);if(l!==-1){s=c[l];let e=c[l+1],t=c[l-1];s.prev_slug=e?e.slug:null,s.prev_title=e?e.title:null,s.next_slug=t?t.slug:null,s.next_title=t?t.title:null}}catch(e){m=e,console.error(`[Poem] Error:`,m)}if(m||!s){console.warn(`[Poem] Poem not found or error occurred`),document.title=`Obra não encontrada — Natanael Brentano`,i.innerHTML=`
        <div class="not-found-page fade-in">
          <p class="not-found-label">404</p>
          <h2 class="not-found-title">Obra não encontrada</h2>
          <p class="not-found-desc">O poema que você procura pode ter mudado de endereço ou ainda não foi publicado.</p>
          <a href="/poemas/" data-link class="not-found-link">← Voltar ao sumário</a>
        </div>
      `;return}let y=s.prev_slug,k=s.next_slug,A=s.prev_title,j=s.next_title,ae=p(s.content||``).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,oe=Math.ceil(ae/200),se=oe<=1?`1 min de leitura`:`${oe} min de leitura`;_(`/poema/`+s.slug,s.id);let ce=window.location.href,le=p(s.excerpt||s.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,ue=`${window.location.origin}/poemas/og-cover.jpg`;h({title:s.title,description:le,url:ce,imageUrl:ue,type:`article`,publishedTime:s.published_at,tags:s.tags});let M=!1;try{M=!!(await d()).currentUser}catch{}let de=ne(s.content),N=s.audio_url?f(s.audio_url):``;i.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${s.title}</h1>
            <div class="poem-meta">
              <span>${new Date(s.published_at).toLocaleDateString(`pt-BR`)}</span>
              <span>•</span>
              <span class="reading-time">${se}</span>
            </div>
          </header>

          ${N?`
            <section class="poem-narration-player" aria-label="Player de áudio da poesia: Ouvir narração do autor" role="region">
              <audio id="narration-audio" preload="metadata" playsinline webkit-playsinline src="${N}">
                <source src="${N}" type="${s.audio_url.toLowerCase().includes(`.m4a`)?`audio/mp4`:s.audio_url.toLowerCase().includes(`.wav`)?`audio/wav`:`audio/mpeg`}">
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

          <div id="poem-text" class="poem-content">${de}</div>



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
              ${v.map(e=>`
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
            
            ${M?`
              <a href="/poemas/admin?view=editor&id=${s.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `:``}
          </div>
        </article>
        
        <!-- Newsletter Section -->
        ${g.render()}
        
        <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

        <audio id="ambient-audio" loop></audio>
        <div id="highlight-tooltip" class="highlight-tooltip">
          <button id="highlight-copy-btn" class="highlight-btn">Copiar</button>
          <button id="highlight-share-btn" class="highlight-btn">Compartilhar</button>
          <button id="highlight-card-btn" class="highlight-btn">Gerar Card</button>
        </div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${y?``:`display:none;`}" aria-label="Poema anterior" title="${A||``}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${A||``}</span>
          </button>
          
          <div class="nav-center">
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${k?``:`display:none;`}" aria-label="Próximo poema" title="${j||``}">
            <span class="nav-btn-label">Próximo →</span>
            <span class="nav-btn-title">${j||``}</span>
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
              <button class="preview-ratio-btn" data-ratio="10x15" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer;">Foto (10x15)</button>
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
    `,(()=>{if(typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||typeof IntersectionObserver>`u`){i.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px 0px -10% 0px`,threshold:.1});i.querySelectorAll(`.stagger-reveal`).forEach(t=>e.observe(t))})();let fe=document.getElementById(`toggle-settings-btn`),pe=document.getElementById(`poem-settings-panel`);fe?.addEventListener(`click`,()=>{pe.classList.toggle(`active`)});let P=document.getElementById(`toggle-comment-btn`),F=document.getElementById(`comment-form`);P?.addEventListener(`click`,()=>{F.style.display=F.style.display===`none`?`block`:`none`,P.style.display=`none`});let I=window.location.href,L=`Leia "${s.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(L+` `+I)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(L)}&url=${encodeURIComponent(I)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(I)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let R=document.getElementById(`web-share-btn`);navigator.share?R.addEventListener(`click`,async()=>{try{await navigator.share({title:s.title,text:L,url:I})}catch{}}):(R.innerText=`Copiar Link`,R.addEventListener(`click`,()=>{navigator.clipboard.writeText(I).then(()=>{b.show(`Link copiado para a área de transferência!`,`success`)})}));let{counts:me,userReactions:he}=await ee(s.id),z=(e,t)=>{v.forEach(n=>{let r=i.querySelector(`.reaction-btn[data-emoji="${n}"]`),a=i.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),a&&(a.textContent=e[n]||0)})};z(me,he),i.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await te(s.id,t);let{counts:n,userReactions:r}=await ee(s.id);z(n,r),e.classList.add(`reacted`),setTimeout(()=>{e.style.animation=`none`,e.offsetHeight,e.style.animation=null},10),e.disabled=!1})}),re.init(i,s.id),S.init(i);let B=i.querySelectorAll(`.size-btn`),V=i.querySelectorAll(`.family-btn`),H=i.querySelectorAll(`.height-btn`),U=i.querySelectorAll(`.align-btn`),W=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t||e.dataset.align===t))},ge=localStorage.getItem(`reading-font-size`)||`md`,_e=localStorage.getItem(`reading-font-family`)||`serif`,ve=localStorage.getItem(`reading-line-height`)||`normal`,ye=localStorage.getItem(`reading-alignment`)||`center`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${ge}`),document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${_e}`),document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${ve}`),document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${ye}`),W(B,ge),W(V,_e),W(H,ve),W(U,ye),B.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),W(B,t)})}),V.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),W(V,t)})}),H.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),W(H,t)})}),U.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.align;document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${t}`),localStorage.setItem(`reading-alignment`,t),W(U,t)})}),x.init(i,`/poemas/`);let be=document.getElementById(`poem-text`),G=0;be?.addEventListener(`touchend`,e=>{let t=Date.now();if(t-G<300&&t-G>0){let t=document.querySelector(`.reaction-btn[data-emoji="❤️"]`);t&&!t.classList.contains(`active`)&&t.click(),xe(e.changedTouches[0].clientX,e.changedTouches[0].clientY)}G=t},{passive:!0});function xe(e,t){let n=document.createElement(`span`);n.textContent=`♥`,n.style.cssText=`
        position:fixed; left:${e}px; top:${t}px;
        font-size:3rem; color:var(--accent-subtle);
        pointer-events:none; z-index:9999;
        animation: heartFloat 0.8s ease forwards;
        transform: translate(-50%,-50%);
        text-shadow: 0 0 10px rgba(0,0,0,0.2);
      `,document.body.appendChild(n),setTimeout(()=>n.remove(),800)}let K=document.getElementById(`highlight-tooltip`),q=``;be?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){K.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();q=e.toString().trim(),q.length>0?(K.style.left=`${t.left+t.width/2}px`,K.style.top=`${t.top+window.scrollY}px`,K.classList.add(`visible`)):K.classList.remove(`visible`)}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&K.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(q).then(()=>{b.show(`Trecho copiado para a área de transferência!`,`success`),window.getSelection().removeAllRanges(),K.classList.remove(`visible`)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${q}" — Natanael Brentano\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),K.classList.remove(`visible`)}),document.getElementById(`highlight-card-btn`)?.addEventListener(`click`,()=>{window.getSelection().removeAllRanges(),K.classList.remove(`visible`),D=!0,O=q;let e=document.getElementById(`card-preview-modal`);e&&(e.style.display=`flex`,e.classList.add(`active`))}),E=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:isImmersive&&exitImmersive();break;case`ArrowRight`:k&&l(`/poema/${k}`);break;case`ArrowLeft`:y&&l(`/poema/${y}`);break;case`i`:case`I`:document.documentElement.classList.contains(`immersive-mode`)?document.getElementById(`immersive-exit-btn`)?.click():document.getElementById(`immersive-btn`)?.click()}},document.addEventListener(`keydown`,E);let J=document.getElementById(`scroll-bar`),Y=document.querySelector(`.poem-nav`),X=document.getElementById(`next-btn`),Se=!1;C=ie(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;J&&(J.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;Y&&(t>50?Y.classList.add(`visible`):Y.classList.remove(`visible`)),t+r>n*.9&&k&&!Se&&(Se=!0,X&&(X.style.transform=`scale(1.05)`),setTimeout(()=>{X&&(X.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,C);let Ce=0,we=0,Te=0;w=e=>{Ce=e.touches[0].clientX,we=e.touches[0].clientY,Te=Date.now()},T=e=>{let t=Ce-e.changedTouches[0].clientX,n=we-e.changedTouches[0].clientY;Date.now()-Te<=500&&Math.abs(t)>100&&Math.abs(t)>Math.abs(n)*3&&(t>0&&k?l(`/poema/${k}`):t<0&&y&&l(`/poema/${y}`))},document.addEventListener(`touchstart`,w,{passive:!0}),document.addEventListener(`touchend`,T,{passive:!0}),X?.addEventListener(`click`,()=>{k&&l(`/poema/${k}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{y&&l(`/poema/${y}`)}),g.init();let Ee=document.getElementById(`share-card-btn`),Z=document.getElementById(`card-preview-modal`),De=document.getElementById(`close-preview-btn`),Q=document.getElementById(`download-card-btn`),Oe=i.querySelectorAll(`.preview-theme-btn`),ke=i.querySelectorAll(`.preview-ratio-btn`),Ae=`dark`,$=`feed`;if(Ee?.addEventListener(`click`,()=>{Z&&(Z.style.display=`flex`,Z.classList.add(`active`))}),De?.addEventListener(`click`,()=>{Z&&(Z.style.display=`none`,Z.classList.remove(`active`))}),Oe.forEach(e=>{e.addEventListener(`click`,()=>{Oe.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),Ae=e.dataset.theme})}),ke.forEach(e=>{e.addEventListener(`click`,()=>{ke.forEach(e=>{e.classList.remove(`active`),e.style.borderColor=`var(--border-subtle)`}),e.classList.add(`active`),e.style.borderColor=`var(--border-strong)`,$=e.dataset.ratio})}),Q?.addEventListener(`click`,async()=>{Q.innerText=`Gerando...`,Q.disabled=!0;try{let{generateSocialCard:e}=await c(async()=>{let{generateSocialCard:e}=await import(`./social-export-DSDJYUgX.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1,2])),t=D?O:null;await e(s,document.getElementById(`social-card-container`),Ae,t,$),b.show(`Card gerado com sucesso!`,`success`)}catch(e){console.error(e),b.show(`Erro ao gerar card.`,`error`)}finally{Q.innerText=`Baixar Imagem`,Q.disabled=!1,D=!1,O=``,Z&&(Z.style.display=`none`,Z.classList.remove(`active`))}}),M){let e=document.getElementById(`resend-email-btn`);e&&e.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){e.innerText=`Enviando...`,e.disabled=!0;try{let{getFirebaseFunctions:e}=await c(async()=>{let{getFirebaseFunctions:e}=await import(`./firebase-DbnQPwBn.js`);return{getFirebaseFunctions:e}},__vite__mapDeps([3,4,5,6])),{httpsCallable:t}=await c(async()=>{let{httpsCallable:e}=await import(`./index.esm-tXuATA5w.js`);return{httpsCallable:e}},__vite__mapDeps([7,4])),n=await t(await e(),`send-newsletter`)({poemId:s.id});alert(`Email reenviado com sucesso para ${n.data?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Houve um erro ao reenviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}finally{e.innerText=`Reenviar Email`,e.disabled=!1}}})}setTimeout(()=>{[y,k].filter(Boolean).forEach(e=>{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=`${window.location.origin}/poemas/poema/${e}`,document.head.appendChild(t)})},2e3)}};export{k as default};