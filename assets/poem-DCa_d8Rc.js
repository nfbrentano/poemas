const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DeJaqZLU.css","assets/social-export-hcu2himr.css"])))=>i.map(i=>d[i]);
import{a as e,i as t,r as n,t as r}from"./html-DUzinkfe.js";import{t as i}from"./toast-CApwxsHH.js";import{C as a,a as o,c as s,h as c,l,n as u,o as d,p as f,x as p,y as m}from"./index-BNfYksz6.js";import{a as h,r as g}from"./favorites-DfHnCJDr.js";import{t as _}from"./newsletter-DB90I0rG.js";import{trackPageView as v}from"./analytics-DkHn7e9s.js";var y={init(e,t){let n=e.querySelectorAll(`.ambient-btn`),r=document.getElementById(`ambient-audio`),i={rain:`${t}sounds/rain.mp3`,fire:`${t}sounds/fire.mp3`};n.forEach(t=>{t.addEventListener(`click`,()=>{let o=t.dataset.sound;if(t.classList.contains(`active`)&&o!==`silence`){n.forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`.ambient-btn[data-sound="silence"]`);t&&t.classList.add(`active`),r&&(r.pause(),r.currentTime=0)}else if(n.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),r){if(o===`silence`)r.pause(),r.currentTime=0;else if(i[o]){let e=i[o];r.src.endsWith(e)||(r.src=e),r.volume=.5,r.play().catch(e=>{typeof navigator<`u`&&!navigator.onLine?a(async()=>{let{toast:e}=await import(`./toast-CApwxsHH.js`).then(e=>e.n);return{toast:e}},[]).then(({toast:e})=>{e.show(`A reprodução de som ambiente requer conexão com a internet.`,`info`)}).catch(()=>{}):console.error(`Audio play failed:`,e)})}}})});let o=e.querySelector(`.ambient-btn[data-sound="silence"]`);o&&o.classList.add(`active`);let s=document.getElementById(`narration-audio`),c=document.getElementById(`narration-play-btn`),l=document.getElementById(`narration-play-icon`),u=document.getElementById(`narration-pause-icon`),d=document.getElementById(`narration-current-time`),f=document.getElementById(`narration-duration`),p=document.getElementById(`narration-progress`),m=document.getElementById(`narration-speed-btn`),h=document.getElementById(`narration-mute-btn`),g=document.getElementById(`narration-vol-icon-on`),_=document.getElementById(`narration-vol-icon-off`),v=document.getElementById(`narration-vol-slider`);if(s&&c){let e=e=>{if(!e||isNaN(e)||!isFinite(e))return`00:00`;let t=Math.floor(e/60),n=Math.floor(e%60);return`${t<10?`0`:``}${t}:${n<10?`0`:``}${n}`},t=e=>{if(p){let t=Math.max(0,Math.min(100,e));p.value=t,p.style.background=`linear-gradient(to right, var(--accent-subtle) ${t}%, var(--border-strong) ${t}%)`}},n=e=>{e?(l&&(l.style.display=`none`),u&&(u.style.display=`block`),c.setAttribute(`aria-label`,`Pausar narração`)):(l&&(l.style.display=`block`),u&&(u.style.display=`none`),c.setAttribute(`aria-label`,`Reproduzir narração`))};c.addEventListener(`click`,()=>{if(s.paused){if(typeof navigator<`u`&&navigator.onLine===!1&&!s.duration){a(async()=>{let{toast:e}=await import(`./toast-CApwxsHH.js`).then(e=>e.n);return{toast:e}},[]).then(({toast:e})=>{e.show(`A reprodução da narração requer conexão com a internet.`,`info`)}).catch(()=>{});return}s.play().catch(e=>{typeof navigator<`u`&&!navigator.onLine?a(async()=>{let{toast:e}=await import(`./toast-CApwxsHH.js`).then(e=>e.n);return{toast:e}},[]).then(({toast:e})=>{e.show(`A reprodução da narração requer conexão com a internet.`,`info`)}).catch(()=>{}):console.error(`Narration play error:`,e)})}else s.pause()}),s.addEventListener(`play`,()=>n(!0)),s.addEventListener(`pause`,()=>n(!1)),s.addEventListener(`ended`,()=>{n(!1),t(0),d&&(d.textContent=`00:00`)}),s.addEventListener(`loadedmetadata`,()=>{f&&(f.textContent=e(s.duration))}),s.addEventListener(`timeupdate`,()=>{let n=s.currentTime,r=s.duration;d&&(d.textContent=e(n)),r>0&&t(n/r*100)}),p&&p.addEventListener(`input`,e=>{let n=parseFloat(e.target.value),r=s.duration;r&&!isNaN(r)&&(s.currentTime=n/100*r),t(n)});let r=[1,1.25,1.5,2],i=0;m&&m.addEventListener(`click`,()=>{i=(i+1)%r.length;let e=r[i];s.playbackRate=e,m.textContent=`${e}x`});let o=()=>{let e=s.muted||s.volume===0;g&&(g.style.display=e?`none`:`block`),_&&(_.style.display=e?`block`:`none`)};h&&h.addEventListener(`click`,()=>{s.muted=!s.muted,o(),v&&(v.value=s.muted?0:s.volume)}),v&&v.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);s.volume=t,s.muted=t===0,o()})}},cleanup(){let e=document.getElementById(`ambient-audio`);e&&(e.pause(),e.removeAttribute(`src`),e.load());let t=document.getElementById(`narration-audio`);t&&(t.pause(),t.removeAttribute(`src`),t.load())}},b={init(e){let t=document.getElementById(`immersive-btn`),n=document.getElementById(`immersive-exit-btn`),r=document.getElementById(`immersive-size-slider`),i=document.getElementById(`immersive-size-value`),a=document.getElementById(`immersive-height-slider`),o=document.getElementById(`immersive-height-value`),s=document.getElementById(`poem-text`),c=localStorage.getItem(`immersive-reading-font-size`)||`20`,l=localStorage.getItem(`immersive-reading-line-height`)||`22`;s&&(s.style.setProperty(`--immersive-font-size`,`${c}px`),s.style.setProperty(`--immersive-line-height`,`${parseFloat(l)/10}`)),r&&i&&(r.value=c,i.textContent=`${c}px`,r.addEventListener(`input`,e=>{let t=e.target.value;i.textContent=`${t}px`,s?.style.setProperty(`--immersive-font-size`,`${t}px`),localStorage.setItem(`immersive-reading-font-size`,t)})),a&&o&&(a.value=l,o.textContent=`${(parseFloat(l)/10).toFixed(1)}`,a.addEventListener(`input`,e=>{let t=e.target.value,n=(parseFloat(t)/10).toFixed(1);o.textContent=n,s?.style.setProperty(`--immersive-line-height`,n),localStorage.setItem(`immersive-reading-line-height`,t)})),t?.addEventListener(`click`,()=>{if(document.documentElement.classList.add(`immersive-mode`),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}}),n?.addEventListener(`click`,()=>{document.documentElement.classList.remove(`immersive-mode`)})},cleanup(){document.documentElement.classList.remove(`immersive-mode`)}},x=null,S=!1,C=!1,w=null,T={openForm(e=w||document){let t=e||w||document,n=t.querySelector(`#comment-form`),r=t.querySelector(`#toggle-comment-btn`),i=t.querySelector(`#comment-author`);n&&(n.hidden=!1,n.style.display=``),r&&(r.hidden=!0,r.style.display=``,r.setAttribute(`aria-expanded`,`true`)),i?.focus(),x&&!C&&!S&&this.loadComments(x,t)},closeForm(e=w||document){let t=e||w||document,n=t.querySelector(`#comment-form`),r=t.querySelector(`#toggle-comment-btn`);n&&(n.hidden=!0,n.style.display=``),r&&(r.hidden=!1,r.style.display=``,r.setAttribute(`aria-expanded`,`false`))},async loadComments(t=x,n=w||document){let i=n||w||document;if(!t||S||C&&t===x)return;S=!0;let o=[],s=null;try{let{db:e}=await a(async()=>{let{db:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:n,query:r,where:i,orderBy:s,getDocs:c}=await a(async()=>{let{collection:e,query:t,where:n,orderBy:r,getDocs:i}=await import(`./vendor-firebase-Dd5ijz69.js`).then(e=>e.o);return{collection:e,query:t,where:n,orderBy:r,getDocs:i}},[]);(await c(r(n(e,`poem_comments`),i(`poem_id`,`==`,t),i(`approved`,`==`,!0),s(`created_at`,`asc`)))).forEach(e=>{o.push(e.data())}),C=!0}catch(e){s=e,console.error(`Error loading comments:`,e)}finally{S=!1}let c=i.querySelector(`#comments-list`);c&&(c.innerHTML=s?`<p class="comments-error" style="font-style: italic; color: var(--text-secondary); font-size: 0.9rem;">Não foi possível carregar as notas agora.</p>`:o.length===0?`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`:e(o.map(e=>`
      <div class="comment-item fade-in">
        <div class="comment-meta">
          <span class="comment-author">${r(e.author_name)}</span>
          <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
        </div>
        <div class="comment-text">${r(e.content)}</div>
      </div>
    `).join(``)))},init(e,t){this.cleanup(),w=e,x=t;let n=e.querySelector(`#toggle-comment-btn`),r=e.querySelector(`#comment-form`);n?.addEventListener(`click`,()=>{this.openForm(e)}),r?.addEventListener(`submit`,async n=>{n.preventDefault();let o=e.querySelector(`#comment-msg`);if(o&&(o.textContent=``),e.querySelector(`#comment-website`)?.value){i.show(`Sua nota foi enviada e aguarda moderação.`,`success`),r.reset(),this.closeForm(e);return}if(typeof navigator<`u`&&navigator.onLine===!1){let e=`Você está offline. Conecte-se à internet para enviar comentários.`;i.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`);return}let s=localStorage.getItem(`last_comment_time`);if(s&&Date.now()-parseInt(s)<6e4){let e=`Por favor, aguarde 1 minuto entre os envios.`;i.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`);return}let c=e.querySelector(`#comment-author`),l=e.querySelector(`#comment-content`),u=c?.value.trim(),d=l?.value.trim();if(!u||!d){let e=`Preencha os campos corretamente.`;i.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`);return}let f=e.querySelector(`#submit-comment-btn`);f&&(f.disabled=!0,f.innerText=`Enviando...`);let p=null;try{let{db:e}=await a(async()=>{let{db:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:n,addDoc:r}=await a(async()=>{let{collection:e,addDoc:t}=await import(`./vendor-firebase-Dd5ijz69.js`).then(e=>e.o);return{collection:e,addDoc:t}},[]);await r(n(e,`poem_comments`),{poem_id:t,author_name:u,content:d,approved:!1,created_at:new Date().toISOString()}),localStorage.setItem(`last_comment_time`,Date.now().toString())}catch(e){p=e,typeof navigator<`u`&&!navigator.onLine?console.warn(`[Comments] Tentativa de envio em modo offline.`):console.error(`Error adding comment:`,e)}if(f&&(f.disabled=!1,f.innerText=`Enviar Nota`),p){let e=typeof navigator<`u`&&!navigator.onLine?`Você está offline. Conecte-se à internet para enviar comentários.`:`Erro ao enviar comentário.`;i.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`)}else i.show(`Sua nota foi enviada e aguarda moderação.`,`success`),r.reset(),this.closeForm(e)})},cleanup(){x=null,S=!1,C=!1,w=null}},E=e=>{if(!e)return``;let t=e.split(/\n\s*\n/).filter(e=>e.trim()),n=0;return t.map(e=>`<div class="stanza stagger-reveal">${e.split(`
`).map(e=>(n++,`<span class="line-reveal" style="transition-delay: ${parseFloat((n*.05).toFixed(2))}s">${e}</span>`)).join(``)}</div>`).join(``)},D=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`,`❤️`];function O(e,t=new Date){if(!e)return``;let n=e.title||`Sem título`,r=e.published_at?new Date(e.published_at):new Date,i=isNaN(r.getTime())?new Date().getFullYear():r.getFullYear(),a=`https://nfgbrentano.art.br/poema/${e.slug||``}/`,o=t instanceof Date?t:new Date(t);return`BRENTANO, Natanael Fernando Gatti. ${n}. In: Poemas Brasileiros, ${i}. Disponível em: <${a}>. Acesso em: ${isNaN(o.getTime())?new Date().toLocaleDateString(`pt-BR`):o.toLocaleDateString(`pt-BR`)}.`}function ee({poem:e,prevSlug:i=``,nextSlug:a=``,prevTitle:o=``,nextTitle:s=``,collectionsData:l=[],relatedPoems:u=[],baseUrl:d=`/`}){let f=t(e.content||``).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,h=Math.ceil(f/200),g=h<=1?`1 min de leitura`:`${h} min de leitura`,v=E(e.content),y=e.audio_url?n(e.audio_url):``,b=O(e),x=``;l&&l.length>0&&(x=l.map(e=>`
      <a href="${d}colecao/${r(e.slug)}/" class="btn-secondary" style="font-size: 0.85rem; padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;" data-link>
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
         ${r(e.name)}
      </a>
    `).join(` `));let S=``;e.tags&&e.tags.length>0&&(S=e.tags.map(e=>{let t=m(e);return`<a href="${d}sentimento/${p(e)}/" class="tag-chip" data-link>#${r(t)}</a>`}).join(` `));let C=x||S?`
    <div class="poem-taxonomy" style="margin-top: var(--space-2xl); text-align: center; display: flex; flex-direction: column; gap: var(--space-md); align-items: center;">
      ${x?`<div class="poem-collections" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-sm);">${x}</div>`:``}
      ${S?`<div class="poem-tags" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xs);">${S}</div>`:``}
    </div>
  `:``,w=u&&u.length>0?u.map(e=>`
    <a href="${d}poema/${r(e.slug)}/" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${r(e.title)}</h3>
      ${e.excerpt?`<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${r(t(e.excerpt).substring(0,100))}...</p>`:``}
    </a>
  `).join(``):``,T=e.published_at?new Date(e.published_at):new Date,ee=isNaN(T.getTime())?``:T.toISOString().slice(0,10),k=isNaN(T.getTime())?``:T.toLocaleDateString(`pt-BR`),te=`<span>Obra avulsa</span>`;l&&l.length>0&&(te=l.map(e=>`
      <a href="${d}colecao/${r(e.slug)}/" data-link>${r(e.name)}</a>
    `).join(`, `));let A=`<span>—</span>`;e.tags&&e.tags.length>0&&(A=e.tags.map(e=>{let t=m(e);return`<a href="${d}sentimento/${p(e)}/" data-link>#${r(t)}</a>`}).join(` `));let j=l&&l.length>0?l[0]:null,M=j?[{name:`Início`,url:d},{name:j.name,url:`${d}colecao/${j.slug}/`},{name:e.title,url:`${d}poema/${e.slug}/`}]:[{name:`Início`,url:d},{name:e.title,url:`${d}poema/${e.slug}/`}];return`
    <div class="poem-container">
      <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
      
      <article class="single-poem fade-in">
        ${c(M)}
        <header>
          <h1>${r(e.title)}</h1>
          <div class="poem-meta">
            <span>Por <a href="${d}sobre/" rel="author" data-link>Natanael Fernando Gatti Brentano</a></span>
            <span>•</span>
            <span><time datetime="${ee}">${k}</time></span>
            <span>•</span>
            <span class="reading-time">${g}</span>
          </div>
          
          <div class="reading-settings-trigger-container">
            <button id="mobile-reading-settings-btn" class="btn-reading-settings" aria-label="Ajustes de leitura">Aa</button>
          </div>
          
          <!-- Bottom sheet para configurações de leitura -->
          <div id="poem-settings-overlay" class="bottom-sheet-overlay"></div>
          <div id="poem-settings-panel" class="poem-settings-panel bottom-sheet">
            <div class="bottom-sheet-handle"></div>
            <div class="bottom-sheet-content">
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
              <div class="immersive-controls" style="margin-top: var(--space-sm);">
                <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva" style="width: 100%;">
                  ⬜ Leitura Imersiva
                </button>
              </div>
            </div>
          </div>
        </header>

        ${y?`
          <section class="poem-narration-player" aria-label="Player de áudio da poesia: Ouvir narração do autor" role="region">
            <audio id="narration-audio" preload="metadata" playsinline webkit-playsinline src="${y}">
              <source src="${y}" type="${e.audio_url.toLowerCase().includes(`.m4a`)?`audio/mp4`:e.audio_url.toLowerCase().includes(`.wav`)?`audio/wav`:`audio/mpeg`}">
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

        <div id="poem-text" class="poem-content">${v}</div>

        ${C}

        <section class="poem-metadata-section" aria-label="Ficha técnica da obra">
          <dl class="poem-metadata-list">
            <div class="poem-metadata-item">
              <dt>Autor</dt>
              <dd><a href="${d}sobre/" rel="author" data-link>Natanael Fernando Gatti Brentano</a></dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Publicado em</dt>
              <dd><time datetime="${ee}">${k}</time></dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Coleção</dt>
              <dd>${te}</dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Sentimentos</dt>
              <dd>${A}</dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Tempo de leitura</dt>
              <dd>${g}</dd>
            </div>
          </dl>
        </section>

        <section class="poem-citation-box" aria-label="Como citar este poema">
          <div class="citation-header">
            <span class="citation-label">Como citar esta obra (ABNT)</span>
            <button type="button" class="btn-copy-citation" id="copy-citation-btn" aria-label="Copiar citação para área de transferência" data-citation="${r(b)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span class="copy-citation-text">Copiar citação</span>
            </button>
          </div>
          <p class="citation-text" id="citation-text-block">${r(b)}</p>
        </section>

        <div id="related-poems-section" style="${w?``:`display: none; `}margin-top: var(--space-2xl); margin-bottom: var(--space-2xl);">
          <p class="share-label" style="text-align: center; margin-bottom: var(--space-md);">Você também pode gostar</p>
          <div id="related-poems-list" style="display: flex; flex-direction: column; gap: var(--space-sm);">
            ${w}
          </div>
        </div>

        <div class="poem-nav">
          ${i?`
            <a id="prev-btn" href="${d}poema/${r(i)}/" class="nav-btn" data-link rel="prev" aria-label="Poema anterior: ${r(o||``)}" title="${r(o||``)}">
              <span class="nav-btn-label">← Anterior</span>
              <span class="nav-btn-title">${r(o||``)}</span>
            </a>
          `:`
            <div id="prev-btn" class="nav-btn" style="visibility: hidden;" aria-hidden="true"></div>
          `}
          
          <div class="nav-center">
          </div>
          
          ${a?`
            <a id="next-btn" href="${d}poema/${r(a)}/" class="nav-btn nav-btn-next" data-link rel="next" aria-label="Próximo poema: ${r(s||``)}" title="${r(s||``)}">
              <span class="nav-btn-label">Próximo →</span>
              <span class="nav-btn-title">${r(s||``)}</span>
            </a>
          `:`
            <div id="next-btn" class="nav-btn nav-btn-next" style="visibility: hidden;" aria-hidden="true"></div>
          `}
        </div>

        <div class="poem-actions">
          <button id="favorite-poem-btn" type="button" class="btn-favorite" aria-pressed="false" aria-label="Salvar poema nos favoritos">
            <svg class="bookmark-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <span class="favorite-btn-text">Favoritar</span>
          </button>
        </div>

        <div class="share-section">
          <p class="share-label">Compartilhar obra</p>
          
          <div id="share-fallback" class="share-fallback" style="display: none;">
            <div class="share-grid">
              <button class="btn-secondary share-btn-mono" aria-label="Compartilhar no WhatsApp" data-platform="whatsapp">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                WhatsApp
              </button>
              <button class="btn-secondary share-btn-mono" aria-label="Compartilhar no X (Twitter)" data-platform="twitter">
                <svg width="20" height="20" viewBox="0 0 19 19" fill="currentColor"><path fill-rule="evenodd" d="M1.893 1.98c.052.072 1.245 1.769 2.653 3.77l2.892 4.114c.183.261.333.48.333.486s-.068.089-.152.183l-.522.593-.765.867-3.597 4.087c-.375.426-.734.834-.798.905a1 1 0 0 0-.118.148c0 .01.236.017.664.017h.663l.729-.83c.4-.457.796-.906.879-.999a692 692 0 0 0 1.794-2.038c.034-.037.301-.34.594-.675l.551-.624.345-.392a7 7 0 0 1 .34-.374c.006 0 .93 1.306 2.052 2.903l2.084 2.965.045.063h2.275c1.87 0 2.273-.003 2.266-.021-.008-.02-1.098-1.572-3.894-5.547-2.013-2.862-2.28-3.246-2.273-3.266.008-.019.282-.332 2.085-2.38l2-2.274 1.567-1.782c.022-.028-.016-.03-.65-.03h-.674l-.3.342a871 871 0 0 1-1.782 2.025c-.067.075-.405.458-.75.852a100 100 0 0 1-.803.91c-.148.172-.299.344-.99 1.127-.304.343-.32.358-.345.327-.015-.019-.904-1.282-1.976-2.808L6.365 1.85H1.8zm1.782.91 8.078 11.294c.772 1.08 1.413 1.973 1.425 1.984.016.017.241.02 1.05.017l1.03-.004-2.694-3.766L7.796 5.75 5.722 2.852l-1.039-.004-1.039-.004z" clip-rule="evenodd"/></svg>
                X
              </button>
              <button class="btn-secondary share-btn-mono" aria-label="Compartilhar no Facebook" data-platform="facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
              <button id="copy-link-btn" class="btn-secondary share-btn-mono" aria-label="Copiar link da obra">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copiar
              </button>
            </div>
            <button id="share-card-btn-desktop" class="btn-secondary share-btn-mono share-btn-full" aria-label="Gerar card para compartilhar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Gerar Card
            </button>
          </div>

          <div id="share-native" class="share-native" style="display: none;">
            <button id="web-share-btn" class="btn-primary share-btn-primary" aria-label="Compartilhar obra">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              Compartilhar
            </button>
            <button id="share-card-btn-mobile" class="btn-secondary share-btn-mono" aria-label="Gerar card para Stories">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              Gerar Card
            </button>
          </div>
        </div>

        <div class="reactions-section">
          <p class="reactions-label">O que este poema desperta?</p>
          <div class="reactions-bar" id="reactions-bar">
            ${D.map(e=>`
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
          
          <button id="toggle-comment-btn" class="btn-secondary" aria-expanded="false" aria-controls="comment-form" style="margin-top: var(--space-sm); width: 100%;">+ Deixar uma nota</button>
          <form id="comment-form" class="comment-form" hidden style="margin-top: var(--space-md);">
            <p class="comment-form-title">Deixe sua nota</p>
            <div class="comment-form-group" style="display: none;" aria-hidden="true">
              <input type="text" id="comment-website" name="website" tabindex="-1" autocomplete="off">
            </div>
            <div class="comment-form-group">
              <input type="text" id="comment-author" placeholder="Seu nome" required maxlength="50">
            </div>
            <div class="comment-form-group">
              <textarea id="comment-content" placeholder="Sua percepção sobre esta obra..." required maxlength="500"></textarea>
            </div>
            <button type="submit" id="submit-comment-btn" class="btn-primary">Enviar Nota</button>
            <p id="comment-msg" class="comment-msg" aria-live="polite"></p>
          </form>
        </div>

        <div class="poem-actions">
          <div id="poem-admin-actions" style="display: contents;"></div>
        </div>
      </article>
      
      <!-- Newsletter Section -->
      ${_.render()}
      
      <div id="social-card-container" style="position: absolute; left: -9999px; top: 0;"></div>

      <audio id="ambient-audio" loop></audio>
      <div id="highlight-tooltip" class="highlight-tooltip">
        <button id="highlight-copy-btn" class="highlight-btn">Copiar</button>
        <button id="highlight-share-btn" class="highlight-btn">Compartilhar</button>
        <button id="highlight-card-btn" class="highlight-btn">Gerar Card</button>
      </div>
      <button id="mobile-share-selection-btn" class="mobile-share-selection-btn" aria-label="Compartilhar trecho selecionado">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
        Compartilhar trecho
      </button>

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
  `}var k=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;function te(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var A=null,j=null,M=null,N=null,P=!1,F=``,I={meta:{title:`Poema`},cleanup(){A&&window.removeEventListener(`scroll`,A),j&&document.removeEventListener(`touchstart`,j),M&&document.removeEventListener(`touchend`,M),N&&document.removeEventListener(`keydown`,N),b.cleanup(),y.cleanup(),T.cleanup(),document.body.classList.remove(`poem-page-active`),A=null,j=null,M=null,N=null,P=!1,F=``},async render(n,c){document.body.classList.add(`poem-page-active`);let p=c.slug,m=`/poema/`+p,x=n.getAttribute(`data-prerendered`)===m,S=null,C=``,w=``,E=``,D=``,O=[],I=[];if(x){let e=document.getElementById(`__DATA__`);if(e)try{let t=JSON.parse(e.textContent);S=t.poem,C=t.prev?.slug||``,w=t.next?.slug||``,E=t.prev?.title||``,D=t.next?.title||``,O=t.collections||[],I=t.related||[]}catch(e){console.warn(`[Poem] Failed to parse __DATA__:`,e)}n.removeAttribute(`data-prerendered`)}if(!S){n.innerHTML=e(`
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
      `),console.log(`[Poem] Fetching slug:`,p);let t=null;try{if(typeof navigator>`u`||navigator.onLine!==!1){let{db:e}=await a(async()=>{let{db:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:t,query:n,where:r,getDocs:i,limit:o,orderBy:s}=await a(async()=>{let{collection:e,query:t,where:n,getDocs:r,limit:i,orderBy:a}=await import(`./vendor-firebase-Dd5ijz69.js`).then(e=>e.o);return{collection:e,query:t,where:n,getDocs:r,limit:i,orderBy:a}},[]),c=await i(n(t(e,`poems`),r(`slug`,`==`,p),r(`status`,`==`,`published`),o(1)));if(!c.empty){let a=c.docs[0];if(S={id:a.id,...a.data()},!S.prev_slug||!S.next_slug)try{let a=n(t(e,`poems`),r(`status`,`==`,`published`),r(`published_at`,`<`,S.published_at),s(`published_at`,`desc`),o(1)),c=n(t(e,`poems`),r(`status`,`==`,`published`),r(`published_at`,`>`,S.published_at),s(`published_at`,`asc`),o(1)),[l,u]=await Promise.all([i(a).catch(e=>(console.warn(`Error fetching prev poem:`,e),null)),i(c).catch(e=>(console.warn(`Error fetching next poem:`,e),null))]);if(l&&!l.empty){let e=l.docs[0].data();S.prev_slug=e.slug,S.prev_title=e.title}if(u&&!u.empty){let e=u.docs[0].data();S.next_slug=e.slug,S.next_title=e.title}}catch(e){console.warn(`Error in parallel prev/next query:`,e)}}}}catch(e){t=e,console.error(`[Poem] Error:`,t)}if(!S)try{let{getPublishedPoems:e}=await a(async()=>{let{getPublishedPoems:e}=await import(`./poems-store-DqDF5aZD.js`).then(e=>e.r);return{getPublishedPoems:e}},__vite__mapDeps([0])),n=await e(),r=n.find(e=>e.slug===p);if(r){S={...r},t=null;let e=n.findIndex(e=>e.slug===p);if(e!==-1&&(e<n.length-1&&!S.prev_slug&&(S.prev_slug=n[e+1].slug,S.prev_title=n[e+1].title),e>0&&!S.next_slug&&(S.next_slug=n[e-1].slug,S.next_title=n[e-1].title)),Array.isArray(S.tags)&&S.tags.length>0&&I.length===0){let e=new Set(S.tags);I=n.filter(t=>t.slug!==p&&Array.isArray(t.tags)&&t.tags.some(t=>e.has(t))).slice(0,3)}}}catch(e){console.warn(`[Poem] Falha no fallback local:`,e)}if(t||!S){console.warn(`[Poem] Poem not found or error occurred`),o(),n.innerHTML=e(`
          <div class="not-found-page fade-in">
            <p class="not-found-label">404</p>
            <h2 class="not-found-title">Página não encontrada</h2>
            <p class="not-found-desc">O poema que você procura pode ter mudado de endereço ou ainda não foi publicado.</p>
            <a href="/" data-link class="not-found-link">← Voltar ao sumário</a>
          </div>
        `);return}if(C=S.prev_slug||``,w=S.next_slug||``,E=S.prev_title||``,D=S.next_title||``,S.collection_slugs&&S.collection_slugs.length>0){try{let{db:e}=await a(async()=>{let{db:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:t,query:n,where:r,getDocs:i}=await a(async()=>{let{collection:e,query:t,where:n,getDocs:r}=await import(`./vendor-firebase-Dd5ijz69.js`).then(e=>e.o);return{collection:e,query:t,where:n,getDocs:r}},[]),o=await i(n(t(e,`collections`),r(`slug`,`in`,S.collection_slugs)));O=[],o.forEach(e=>O.push(e.data()))}catch(e){console.warn(e)}if(O.length===0)try{let{enrichCollectionsWithCurated:e}=await a(async()=>{let{enrichCollectionsWithCurated:e}=await import(`./collections-DuSS-6xZ.js`);return{enrichCollectionsWithCurated:e}},[]);O=e([]).filter(e=>S.collection_slugs.includes(e.slug))}catch{}}n.innerHTML=e(ee({poem:S,prevSlug:C,nextSlug:w,prevTitle:E,nextTitle:D,collectionsData:O,relatedPoems:I,baseUrl:`/`}))}v(`/poema/`+S.slug,S.id);let L=S.slug||p||``,ne=typeof L==`string`&&k.test(L)?L:encodeURIComponent(String(L)),R=`${s}/poema/${ne}/`,re=t(S.excerpt||S.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,ie=r(S.title||``),z=O&&O.length>0?O[0]:null,ae=z?[{name:`Início`,url:`${s}/`},{name:z.name,url:`${s}/colecao/${z.slug}/`},{name:ie,url:R}]:[{name:`Início`,url:`${s}/`},{name:ie,url:R}],oe=`${window.location.origin}/og-cover.jpg`;d({title:S.title,description:re,url:R,imageUrl:oe,type:`article`,publishedTime:S.published_at,modifiedTime:S.updated_at,poemTitle:S.title,tags:S.tags,structuredData:[f(S,O),l(ae)]}),(()=>{if(typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||typeof IntersectionObserver>`u`){n.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px`,threshold:0}),t=window.innerHeight;n.querySelectorAll(`.stagger-reveal`).forEach(n=>{n.getBoundingClientRect().top<t?n.classList.add(`revealed`):(n.classList.add(`js-reveal-ready`),e.observe(n))})})();let se=document.getElementById(`mobile-reading-settings-btn`),B=document.getElementById(`poem-settings-panel`),V=document.getElementById(`poem-settings-overlay`),ce=()=>{B?.classList.remove(`active`),V?.classList.remove(`active`),se?.focus()};se?.addEventListener(`click`,()=>{B.classList.toggle(`active`),V.classList.toggle(`active`)}),V?.addEventListener(`click`,ce);let le=0;B?.addEventListener(`touchstart`,e=>{le=e.touches[0].clientY},{passive:!0}),B?.addEventListener(`touchend`,e=>{e.changedTouches[0].clientY-le>50&&ce()},{passive:!0}),T.init(n,S.id);let H=n.querySelector(`#favorite-poem-btn`);if(H){let e=e=>{H.classList.toggle(`active`,e),H.setAttribute(`aria-pressed`,e?`true`:`false`),H.setAttribute(`aria-label`,e?`Remover poema dos favoritos`:`Salvar poema nos favoritos`);let t=H.querySelector(`.favorite-btn-text`);t&&(t.textContent=e?`Favoritado`:`Favoritar`)};e(g(S.slug)||S.id&&g(S.id));let t=()=>{let t=h(S);t.success?(e(t.isFavorite),t.isFavorite?i.show(`Poema salvo nos seus favoritos!`,`success`):i.show(`Poema removido dos favoritos.`,`info`)):i.show(`Não foi possível salvar o favorito no navegador.`,`error`)};H.addEventListener(`click`,t),H.addEventListener(`keydown`,e=>{(e.key===`Enter`||e.key===` `||e.key===`Spacebar`)&&(e.preventDefault(),t())})}let U=window.location.href,W=`Leia "${S.title}", um poema de Natanael Fernando Gatti Brentano:`;document.querySelectorAll(`[data-platform]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(W+` `+U)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(W)}&url=${encodeURIComponent(U)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(U)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let ue=document.getElementById(`share-native`),de=document.getElementById(`share-fallback`);navigator.share&&/Mobi|Android/i.test(navigator.userAgent)?(ue.style.display=`flex`,document.getElementById(`web-share-btn`)?.addEventListener(`click`,async()=>{try{await navigator.share({title:S.title,text:W,url:U})}catch{}})):(de.style.display=`flex`,document.getElementById(`copy-link-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(U).then(()=>{i.show(`Link copiado para a área de transferência!`,`success`)})}));let G=n.querySelectorAll(`.size-btn`),fe=n.querySelectorAll(`.family-btn`),pe=n.querySelectorAll(`.height-btn`),me=n.querySelectorAll(`.align-btn`),K=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t||e.dataset.align===t))},he=localStorage.getItem(`reading-font-size`)||`md`,ge=localStorage.getItem(`reading-font-family`)||`serif`,_e=localStorage.getItem(`reading-line-height`)||`normal`,ve=localStorage.getItem(`reading-alignment`)||`center`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${he}`),document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${ge}`),document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${_e}`),document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${ve}`),K(G,he),K(fe,ge),K(pe,_e),K(me,ve),G.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),K(G,t)})}),fe.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),K(fe,t)})}),pe.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),K(pe,t)})}),me.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.align;document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${t}`),localStorage.setItem(`reading-alignment`,t),K(me,t)})}),y.init(n,`/`),b.init(n);let ye=document.getElementById(`poem-text`),be=0;ye?.addEventListener(`touchend`,e=>{let t=Date.now();if(t-be<300&&t-be>0){let t=document.querySelector(`.reaction-btn[data-emoji="❤️"]`);t&&!t.classList.contains(`active`)&&t.click(),xe(e.changedTouches[0].clientX,e.changedTouches[0].clientY)}be=t},{passive:!0});function xe(e,t){let n=document.createElement(`span`);n.textContent=`♥`,n.style.cssText=`
        position:fixed; left:${e}px; top:${t}px;
        font-size:3rem; color:var(--accent-subtle);
        pointer-events:none; z-index:9999;
        animation: heartFloat 0.8s ease forwards;
        transform: translate(-50%,-50%);
        text-shadow: 0 0 10px rgba(0,0,0,0.2);
      `,document.body.appendChild(n),setTimeout(()=>n.remove(),800)}let q=document.getElementById(`highlight-tooltip`),J=``,Y=document.getElementById(`mobile-share-selection-btn`);ye?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){q?.classList.remove(`visible`),Y&&Y.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();J=e.toString().trim(),J.length>0?/Mobi|Android/i.test(navigator.userAgent)?Y&&Y.classList.add(`visible`):q&&(q.style.left=`${t.left+t.width/2}px`,q.style.top=`${t.top+window.scrollY}px`,q.classList.add(`visible`)):(q?.classList.remove(`visible`),Y&&Y.classList.remove(`visible`))}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&(q?.classList.remove(`visible`),Y&&Y.classList.remove(`visible`))}),Y?.addEventListener(`click`,async()=>{if(navigator.share)try{await navigator.share({title:S.title,text:`"${J}" — Natanael Fernando Gatti Brentano`,url:window.location.href})}catch{}else{let e=`"${J}" — Natanael Fernando Gatti Brentano\n${window.location.href}`;navigator.clipboard.writeText(e).then(()=>{i.show(`Trecho copiado!`,`success`)})}window.getSelection().removeAllRanges(),Y.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(J).then(()=>{i.show(`Trecho copiado para a área de transferência!`,`success`),window.getSelection().removeAllRanges(),q?.classList.remove(`visible`)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${J}" — Natanael Fernando Gatti Brentano\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),q?.classList.remove(`visible`)}),document.getElementById(`highlight-card-btn`)?.addEventListener(`click`,()=>{window.getSelection().removeAllRanges(),q?.classList.remove(`visible`),Y&&Y.classList.remove(`visible`),P=!0,F=J||t(S.content).substring(0,150)+`...`;let e=document.getElementById(`card-preview-modal`);e&&(e.style.display=`flex`,e.classList.add(`active`))});let X=document.getElementById(`copy-citation-btn`);X&&X.addEventListener(`click`,async()=>{let e=X.getAttribute(`data-citation`)||``;try{await navigator.clipboard.writeText(e);let t=X.querySelector(`.copy-citation-text`),n=t?t.textContent:`Copiar citação`;t&&(t.textContent=`Copiado!`),X.classList.add(`copied`),i.show(`Citação copiada para a área de transferência!`,`success`),setTimeout(()=>{t&&(t.textContent=n),X.classList.remove(`copied`)},2500)}catch{i.show(`Não foi possível copiar automaticamente.`,`error`)}}),N=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:document.getElementById(`poem-settings-panel`)?.classList.contains(`active`)?ce():document.documentElement.classList.contains(`immersive-mode`)&&document.getElementById(`immersive-exit-btn`)?.click();break;case`ArrowRight`:w&&u(`/poema/${w}/`);break;case`ArrowLeft`:C&&u(`/poema/${C}/`);break;case`i`:case`I`:document.documentElement.classList.contains(`immersive-mode`)?document.getElementById(`immersive-exit-btn`)?.click():document.getElementById(`immersive-btn`)?.click()}},document.addEventListener(`keydown`,N);let Se=document.getElementById(`scroll-bar`),Ce=document.querySelector(`.poem-nav`),Z=document.getElementById(`next-btn`),we=!1;A=te(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;Se&&(Se.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;Ce&&(t>50?Ce.classList.add(`visible`):Ce.classList.remove(`visible`)),t+r>n*.9&&w&&!we&&(we=!0,Z&&(Z.style.transform=`scale(1.05)`),setTimeout(()=>{Z&&(Z.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,A);let Te=0,Ee=0,De=0;j=e=>{Te=e.touches[0].clientX,Ee=e.touches[0].clientY,De=Date.now()},M=e=>{let t=Te-e.changedTouches[0].clientX,n=Ee-e.changedTouches[0].clientY;Date.now()-De<=500&&Math.abs(t)>100&&Math.abs(t)>Math.abs(n)*3&&(t>0&&w?u(`/poema/${w}/`):t<0&&C&&u(`/poema/${C}/`))},document.addEventListener(`touchstart`,j,{passive:!0}),document.addEventListener(`touchend`,M,{passive:!0}),_.init();let Oe=document.getElementById(`share-card-btn-mobile`),ke=document.getElementById(`share-card-btn-desktop`),Q=document.getElementById(`card-preview-modal`),Ae=document.getElementById(`close-preview-btn`),$=document.getElementById(`download-card-btn`),je=n.querySelectorAll(`.preview-theme-btn`),Me=n.querySelectorAll(`.preview-ratio-btn`),Ne=`dark`,Pe=`feed`,Fe=()=>{Q&&(P=!1,F=``,Q.style.display=`flex`,Q.classList.add(`active`))};Oe?.addEventListener(`click`,Fe),ke?.addEventListener(`click`,Fe),Ae?.addEventListener(`click`,()=>{Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}),je.forEach(e=>{e.addEventListener(`click`,()=>{je.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),Ne=e.dataset.theme})}),Me.forEach(e=>{e.addEventListener(`click`,()=>{Me.forEach(e=>{e.classList.remove(`active`),e.style.borderColor=`var(--border-subtle)`}),e.classList.add(`active`),e.style.borderColor=`var(--border-strong)`,Pe=e.dataset.ratio})}),$?.addEventListener(`click`,async()=>{$.innerText=`Gerando...`,$.disabled=!0;try{let{generateSocialCard:e}=await a(async()=>{let{generateSocialCard:e}=await import(`./social-export-rO8YduSJ.js`);return{generateSocialCard:e}},__vite__mapDeps([1])),t=P?F:null;await e(S,document.getElementById(`social-card-container`),Ne,t,Pe),i.show(`Card gerado com sucesso!`,`success`)}catch(e){console.error(e),a(async()=>{let{reportError:e}=await import(`./index-BNfYksz6.js`).then(e=>e.r);return{reportError:e}},__vite__mapDeps([0])).then(({reportError:t})=>t(e,{category:`runtime`,severity:`warning`,context:{action:`generateSocialCard`,slug:S?.slug}})).catch(()=>{}),i.show(`Erro ao gerar card.`,`error`)}finally{$.innerText=`Baixar Imagem`,$.disabled=!1,P=!1,F=``,Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}}),(async()=>{if(localStorage.getItem(`has_admin_session`)===`1`)try{let{getFirebaseAuth:e}=await a(async()=>{let{getFirebaseAuth:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{getFirebaseAuth:e}},__vite__mapDeps([0])),t=await e(),n=()=>{if(!t.currentUser){localStorage.removeItem(`has_admin_session`);return}let e=document.getElementById(`poem-admin-actions`);if(e){e.textContent=``;let t=document.createElement(`a`);t.href=`/admin?view=editor&id=${encodeURIComponent(S.id||``)}`,t.className=`btn-secondary`,t.setAttribute(`data-link`,``),t.textContent=`Editar Obra`;let n=document.createElement(`button`);n.id=`resend-email-btn`,n.className=`btn-secondary`,n.textContent=`Reenviar Email`,e.appendChild(t),e.appendChild(document.createTextNode(` `)),e.appendChild(n),n.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){n.innerText=`Enviando...`,n.disabled=!0;try{let{getFirebaseFunctions:e}=await a(async()=>{let{getFirebaseFunctions:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{getFirebaseFunctions:e}},__vite__mapDeps([0])),{httpsCallable:t}=await a(async()=>{let{httpsCallable:e}=await import(`./vendor-firebase-Dd5ijz69.js`).then(e=>e.i);return{httpsCallable:e}},[]),n=await t(await e(),`sendNewsletter`)({poemId:S.id});alert(`Email reenviado com sucesso para ${n.data?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e),alert(`Houve um erro ao reenviar a newsletter: ${e.message||`Erro`}`)}finally{n.innerText=`Reenviar Email`,n.disabled=!1}}})}};t.currentUser?n():t.authStateReady().then(()=>n()).catch(()=>{})}catch{}})();let Ie=()=>{a(async()=>{let{loadReactions:e,toggleReaction:t,EMOJIS:n}=await import(`./reactions-B_x-TfyZ.js`);return{loadReactions:e,toggleReaction:t,EMOJIS:n}},__vite__mapDeps([0])).then(({loadReactions:e,toggleReaction:t,EMOJIS:r})=>{let a=(e,t)=>{r.forEach(r=>{let i=n.querySelector(`.reaction-btn[data-emoji="${r}"]`),a=n.querySelector(`.reaction-count[data-count="${r}"]`);i&&i.classList.toggle(`reacted`,t.has(r)),a&&(a.textContent=e[r]||0)})};e(S.id).then(({counts:e,userReactions:t})=>{a(e,t)}).catch(()=>{}),n.querySelectorAll(`.reaction-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.emoji;if(n.disabled=!0,typeof navigator<`u`&&navigator.onLine===!1||await t(S.id,r)===`offline`){i.show(`Você está offline. Conecte-se à internet para reagir.`,`info`),n.disabled=!1;return}let{counts:o,userReactions:s}=await e(S.id);a(o,s),n.classList.add(`reacted`),setTimeout(()=>{n.style.animation=`none`,n.offsetHeight,n.style.animation=null},10),n.disabled=!1})})}).catch(e=>console.debug?.(`[reactions]`,e)),T.loadComments(S.id,n),(!I||I.length===0)&&S.tags&&S.tags.length>0&&(async()=>{try{let{db:n}=await a(async()=>{let{db:e}=await import(`./firebase-BNXSdU2z.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:i,query:o,where:s,getDocs:c,limit:l}=await a(async()=>{let{collection:e,query:t,where:n,getDocs:r,limit:i}=await import(`./vendor-firebase-Dd5ijz69.js`).then(e=>e.o);return{collection:e,query:t,where:n,getDocs:r,limit:i}},[]),u=S.tags.slice(0,10),d=await c(o(i(n,`poems`),s(`status`,`==`,`published`),s(`tags`,`array-contains-any`,u),l(20))),f=[];if(d.forEach(e=>{e.id!==S.id&&f.push({id:e.id,...e.data()})}),f.length>0){f.forEach(e=>{e._commonTags=(e.tags||[]).filter(e=>S.tags.includes(e)).length,e._sameCollection=0,S.collection_slugs&&e.collection_slugs&&(e._sameCollection=+!!e.collection_slugs.some(e=>S.collection_slugs.includes(e)))}),f.sort((e,t)=>t._commonTags===e._commonTags?t._sameCollection===e._sameCollection?t.published_at.localeCompare(e.published_at):t._sameCollection-e._sameCollection:t._commonTags-e._commonTags);let n=f.slice(0,3);if(n.length>0){let i=document.getElementById(`related-poems-list`);if(i){i.innerHTML=e(n.map(e=>`
                    <a href="/poema/${e.slug}/" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
                      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${r(e.title)}</h3>
                      ${e.excerpt?`<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${r(t(e.excerpt).substring(0,100))}...</p>`:``}
                    </a>
                  `).join(``));let a=document.getElementById(`related-poems-section`);a&&(a.style.display=`block`)}}}}catch(e){console.warn(`Error fetching related poems:`,e)}})()};`requestIdleCallback`in window?window.requestIdleCallback(Ie,{timeout:3e3}):setTimeout(Ie,1e3),setTimeout(()=>{[C,w].filter(e=>typeof e==`string`&&k.test(e)).forEach(e=>{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=`${window.location.origin}/poema/${encodeURIComponent(e)}/`,document.head.appendChild(t)})},2e3)}};export{I as default};