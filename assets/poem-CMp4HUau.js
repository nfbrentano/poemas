const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BZJzOh7M.css","assets/social-export-hcu2himr.css"])))=>i.map(i=>d[i]);
import{C as e,E as t,S as n,T as r,_ as i,b as a,d as o,i as s,n as c,o as l,p as u,r as d,s as f,y as p}from"./index-3IBTfuIH.js";import{t as m}from"./newsletter-DysXpQEz.js";import{trackPageView as h}from"./analytics-DXBFFTdz.js";var g={init(e,t){let n=e.querySelectorAll(`.ambient-btn`),r=document.getElementById(`ambient-audio`),i={rain:`${t}sounds/rain.mp3`,fire:`${t}sounds/fire.mp3`};n.forEach(t=>{t.addEventListener(`click`,()=>{let a=t.dataset.sound;if(t.classList.contains(`active`)&&a!==`silence`){n.forEach(e=>e.classList.remove(`active`));let t=e.querySelector(`.ambient-btn[data-sound="silence"]`);t&&t.classList.add(`active`),r&&(r.pause(),r.currentTime=0)}else if(n.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),r){if(a===`silence`)r.pause(),r.currentTime=0;else if(i[a]){let e=i[a];r.src.endsWith(e)||(r.src=e),r.volume=.5,r.play().catch(e=>console.error(`Audio play failed:`,e))}}})});let a=e.querySelector(`.ambient-btn[data-sound="silence"]`);a&&a.classList.add(`active`);let o=document.getElementById(`narration-audio`),s=document.getElementById(`narration-play-btn`),c=document.getElementById(`narration-play-icon`),l=document.getElementById(`narration-pause-icon`),u=document.getElementById(`narration-current-time`),d=document.getElementById(`narration-duration`),f=document.getElementById(`narration-progress`),p=document.getElementById(`narration-speed-btn`),m=document.getElementById(`narration-mute-btn`),h=document.getElementById(`narration-vol-icon-on`),g=document.getElementById(`narration-vol-icon-off`),_=document.getElementById(`narration-vol-slider`);if(o&&s){let e=e=>{if(!e||isNaN(e)||!isFinite(e))return`00:00`;let t=Math.floor(e/60),n=Math.floor(e%60);return`${t<10?`0`:``}${t}:${n<10?`0`:``}${n}`},t=e=>{if(f){let t=Math.max(0,Math.min(100,e));f.value=t,f.style.background=`linear-gradient(to right, var(--accent-subtle) ${t}%, var(--border-strong) ${t}%)`}},n=e=>{e?(c&&(c.style.display=`none`),l&&(l.style.display=`block`),s.setAttribute(`aria-label`,`Pausar narração`)):(c&&(c.style.display=`block`),l&&(l.style.display=`none`),s.setAttribute(`aria-label`,`Reproduzir narração`))};s.addEventListener(`click`,()=>{o.paused?o.play().catch(e=>console.error(`Narration play error:`,e)):o.pause()}),o.addEventListener(`play`,()=>n(!0)),o.addEventListener(`pause`,()=>n(!1)),o.addEventListener(`ended`,()=>{n(!1),t(0),u&&(u.textContent=`00:00`)}),o.addEventListener(`loadedmetadata`,()=>{d&&(d.textContent=e(o.duration))}),o.addEventListener(`timeupdate`,()=>{let n=o.currentTime,r=o.duration;u&&(u.textContent=e(n)),r>0&&t(n/r*100)}),f&&f.addEventListener(`input`,e=>{let n=parseFloat(e.target.value),r=o.duration;r&&!isNaN(r)&&(o.currentTime=n/100*r),t(n)});let r=[1,1.25,1.5,2],i=0;p&&p.addEventListener(`click`,()=>{i=(i+1)%r.length;let e=r[i];o.playbackRate=e,p.textContent=`${e}x`});let a=()=>{let e=o.muted||o.volume===0;h&&(h.style.display=e?`none`:`block`),g&&(g.style.display=e?`block`:`none`)};m&&m.addEventListener(`click`,()=>{o.muted=!o.muted,a(),_&&(_.value=o.muted?0:o.volume)}),_&&_.addEventListener(`input`,e=>{let t=parseFloat(e.target.value);o.volume=t,o.muted=t===0,a()})}},cleanup(){let e=document.getElementById(`ambient-audio`);e&&(e.pause(),e.removeAttribute(`src`),e.load());let t=document.getElementById(`narration-audio`);t&&(t.pause(),t.removeAttribute(`src`),t.load())}},_={init(e){let t=document.getElementById(`immersive-btn`),n=document.getElementById(`immersive-exit-btn`),r=document.getElementById(`immersive-size-slider`),i=document.getElementById(`immersive-size-value`),a=document.getElementById(`immersive-height-slider`),o=document.getElementById(`immersive-height-value`),s=document.getElementById(`poem-text`),c=localStorage.getItem(`immersive-reading-font-size`)||`20`,l=localStorage.getItem(`immersive-reading-line-height`)||`22`;s&&(s.style.setProperty(`--immersive-font-size`,`${c}px`),s.style.setProperty(`--immersive-line-height`,`${parseFloat(l)/10}`)),r&&i&&(r.value=c,i.textContent=`${c}px`,r.addEventListener(`input`,e=>{let t=e.target.value;i.textContent=`${t}px`,s?.style.setProperty(`--immersive-font-size`,`${t}px`),localStorage.setItem(`immersive-reading-font-size`,t)})),a&&o&&(a.value=l,o.textContent=`${(parseFloat(l)/10).toFixed(1)}`,a.addEventListener(`input`,e=>{let t=e.target.value,n=(parseFloat(t)/10).toFixed(1);o.textContent=n,s?.style.setProperty(`--immersive-line-height`,n),localStorage.setItem(`immersive-reading-line-height`,t)})),t?.addEventListener(`click`,()=>{if(document.documentElement.classList.add(`immersive-mode`),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}}),n?.addEventListener(`click`,()=>{document.documentElement.classList.remove(`immersive-mode`)})},cleanup(){document.documentElement.classList.remove(`immersive-mode`)}},v=null,y=!1,b=!1,x=null,S={openForm(e=x||document){let t=e||x||document,n=t.querySelector(`#comment-form`),r=t.querySelector(`#toggle-comment-btn`),i=t.querySelector(`#comment-author`);n&&(n.hidden=!1,n.style.display=``),r&&(r.hidden=!0,r.style.display=``,r.setAttribute(`aria-expanded`,`true`)),i?.focus(),v&&!b&&!y&&this.loadComments(v,t)},closeForm(e=x||document){let t=e||x||document,n=t.querySelector(`#comment-form`),r=t.querySelector(`#toggle-comment-btn`);n&&(n.hidden=!0,n.style.display=``),r&&(r.hidden=!1,r.style.display=``,r.setAttribute(`aria-expanded`,`false`))},async loadComments(e=v,t=x||document){let n=t||x||document;if(!e||y||b&&e===v)return;y=!0;let i=[],o=null;try{let{db:t}=await r(async()=>{let{db:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:n,query:a,where:o,orderBy:s,getDocs:c}=await r(async()=>{let{collection:e,query:t,where:n,orderBy:r,getDocs:i}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.o);return{collection:e,query:t,where:n,orderBy:r,getDocs:i}},[]);(await c(a(n(t,`poem_comments`),o(`poem_id`,`==`,e),o(`approved`,`==`,!0),s(`created_at`,`asc`)))).forEach(e=>{i.push(e.data())}),b=!0}catch(e){o=e,console.error(`Error loading comments:`,e)}finally{y=!1}let s=n.querySelector(`#comments-list`);s&&(s.innerHTML=o?`<p class="comments-error" style="font-style: italic; color: var(--text-secondary); font-size: 0.9rem;">Não foi possível carregar as notas agora.</p>`:i.length===0?`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`:i.map(e=>`
      <div class="comment-item fade-in">
        <div class="comment-meta">
          <span class="comment-author">${a(e.author_name)}</span>
          <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
        </div>
        <div class="comment-text">${a(e.content)}</div>
      </div>
    `).join(``))},init(e,n){this.cleanup(),x=e,v=n;let i=e.querySelector(`#toggle-comment-btn`),a=e.querySelector(`#comment-form`);i?.addEventListener(`click`,()=>{this.openForm(e)}),a?.addEventListener(`submit`,async i=>{i.preventDefault();let o=e.querySelector(`#comment-msg`);if(o&&(o.textContent=``),e.querySelector(`#comment-website`)?.value){t.show(`Sua nota foi enviada e aguarda moderação.`,`success`),a.reset(),this.closeForm(e);return}let s=localStorage.getItem(`last_comment_time`);if(s&&Date.now()-parseInt(s)<6e4){let e=`Por favor, aguarde 1 minuto entre os envios.`;t.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`);return}let c=e.querySelector(`#comment-author`),l=e.querySelector(`#comment-content`),u=c?.value.trim(),d=l?.value.trim();if(!u||!d){let e=`Preencha os campos corretamente.`;t.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`);return}let f=e.querySelector(`#submit-comment-btn`);f&&(f.disabled=!0,f.innerText=`Enviando...`);let p=null;try{let{db:e}=await r(async()=>{let{db:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:t,addDoc:i}=await r(async()=>{let{collection:e,addDoc:t}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.o);return{collection:e,addDoc:t}},[]);await i(t(e,`poem_comments`),{poem_id:n,author_name:u,content:d,approved:!1,created_at:new Date().toISOString()}),localStorage.setItem(`last_comment_time`,Date.now().toString())}catch(e){p=e,console.error(`Error adding comment:`,e)}if(f&&(f.disabled=!1,f.innerText=`Enviar Nota`),p){let e=`Erro ao enviar comentário.`;t.show(e,`error`),o&&(o.textContent=e,o.style.color=`var(--text-error, #e53e3e)`)}else t.show(`Sua nota foi enviada e aguarda moderação.`,`success`),a.reset(),this.closeForm(e)})},cleanup(){v=null,y=!1,b=!1,x=null}},C=e=>{if(!e)return``;let t=e.split(/\n\s*\n/).filter(e=>e.trim()),n=0;return t.map(e=>`<div class="stanza stagger-reveal">${e.split(`
`).map(e=>(n++,`<span class="line-reveal" style="transition-delay: ${parseFloat((n*.05).toFixed(2))}s">${e}</span>`)).join(``)}</div>`).join(``)},w=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`,`❤️`];function T(e,t=new Date){if(!e)return``;let n=e.title||`Sem título`,r=e.published_at?new Date(e.published_at):new Date,i=isNaN(r.getTime())?new Date().getFullYear():r.getFullYear(),a=`https://nfgbrentano.art.br/poema/${e.slug||``}/`,o=t instanceof Date?t:new Date(t);return`BRENTANO, Natanael Fernando Gatti. ${n}. In: Poemas Brasileiros, ${i}. Disponível em: <${a}>. Acesso em: ${isNaN(o.getTime())?new Date().toLocaleDateString(`pt-BR`):o.toLocaleDateString(`pt-BR`)}.`}function ee({poem:t,prevSlug:r=``,nextSlug:o=``,prevTitle:s=``,nextTitle:c=``,collectionsData:l=[],relatedPoems:d=[],baseUrl:f=`/`}){let h=e(t.content||``).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,g=Math.ceil(h/200),_=g<=1?`1 min de leitura`:`${g} min de leitura`,v=C(t.content),y=t.audio_url?n(t.audio_url):``,b=T(t),x=``;l&&l.length>0&&(x=l.map(e=>`
      <a href="${f}colecao/${a(e.slug)}/" class="btn-secondary" style="font-size: 0.85rem; padding: 4px 12px; border-radius: 20px; display: inline-flex; align-items: center; gap: 4px;" data-link>
         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
         ${a(e.name)}
      </a>
    `).join(` `));let S=``;t.tags&&t.tags.length>0&&(S=t.tags.map(e=>{let t=i(e);return`<a href="${f}sentimento/${p(e)}/" class="tag-chip" data-link>#${a(t)}</a>`}).join(` `));let ee=x||S?`
    <div class="poem-taxonomy" style="margin-top: var(--space-2xl); text-align: center; display: flex; flex-direction: column; gap: var(--space-md); align-items: center;">
      ${x?`<div class="poem-collections" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-sm);">${x}</div>`:``}
      ${S?`<div class="poem-tags" style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--space-xs);">${S}</div>`:``}
    </div>
  `:``,te=d&&d.length>0?d.map(t=>`
    <a href="${f}poema/${a(t.slug)}/" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${a(t.title)}</h3>
      ${t.excerpt?`<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${a(e(t.excerpt).substring(0,100))}...</p>`:``}
    </a>
  `).join(``):``,E=t.published_at?new Date(t.published_at):new Date,D=isNaN(E.getTime())?``:E.toISOString().slice(0,10),O=isNaN(E.getTime())?``:E.toLocaleDateString(`pt-BR`),k=`<span>Obra avulsa</span>`;l&&l.length>0&&(k=l.map(e=>`
      <a href="${f}colecao/${a(e.slug)}/" data-link>${a(e.name)}</a>
    `).join(`, `));let A=`<span>—</span>`;t.tags&&t.tags.length>0&&(A=t.tags.map(e=>{let t=i(e);return`<a href="${f}sentimento/${p(e)}/" data-link>#${a(t)}</a>`}).join(` `));let j=l&&l.length>0?l[0]:null,M=j?[{name:`Início`,url:f},{name:j.name,url:`${f}colecao/${j.slug}/`},{name:t.title,url:`${f}poema/${t.slug}/`}]:[{name:`Início`,url:f},{name:t.title,url:`${f}poema/${t.slug}/`}];return`
    <div class="poem-container">
      <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
      
      <article class="single-poem fade-in">
        ${u(M)}
        <header>
          <h1>${a(t.title)}</h1>
          <div class="poem-meta">
            <span>Por <a href="${f}sobre/" rel="author" data-link>Natanael Fernando Gatti Brentano</a></span>
            <span>•</span>
            <span><time datetime="${D}">${O}</time></span>
            <span>•</span>
            <span class="reading-time">${_}</span>
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
              <source src="${y}" type="${t.audio_url.toLowerCase().includes(`.m4a`)?`audio/mp4`:t.audio_url.toLowerCase().includes(`.wav`)?`audio/wav`:`audio/mpeg`}">
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

        ${ee}

        <section class="poem-metadata-section" aria-label="Ficha técnica da obra">
          <dl class="poem-metadata-list">
            <div class="poem-metadata-item">
              <dt>Autor</dt>
              <dd><a href="${f}sobre/" rel="author" data-link>Natanael Fernando Gatti Brentano</a></dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Publicado em</dt>
              <dd><time datetime="${D}">${O}</time></dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Coleção</dt>
              <dd>${k}</dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Sentimentos</dt>
              <dd>${A}</dd>
            </div>
            <div class="poem-metadata-item">
              <dt>Tempo de leitura</dt>
              <dd>${_}</dd>
            </div>
          </dl>
        </section>

        <section class="poem-citation-box" aria-label="Como citar este poema">
          <div class="citation-header">
            <span class="citation-label">Como citar esta obra (ABNT)</span>
            <button type="button" class="btn-copy-citation" id="copy-citation-btn" aria-label="Copiar citação para área de transferência" data-citation="${a(b)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span class="copy-citation-text">Copiar citação</span>
            </button>
          </div>
          <p class="citation-text" id="citation-text-block">${a(b)}</p>
        </section>

        <div id="related-poems-section" style="${te?``:`display: none; `}margin-top: var(--space-2xl); margin-bottom: var(--space-2xl);">
          <p class="share-label" style="text-align: center; margin-bottom: var(--space-md);">Você também pode gostar</p>
          <div id="related-poems-list" style="display: flex; flex-direction: column; gap: var(--space-sm);">
            ${te}
          </div>
        </div>

        <div class="poem-nav">
          ${r?`
            <a id="prev-btn" href="${f}poema/${a(r)}/" class="nav-btn" data-link rel="prev" aria-label="Poema anterior: ${a(s||``)}" title="${a(s||``)}">
              <span class="nav-btn-label">← Anterior</span>
              <span class="nav-btn-title">${a(s||``)}</span>
            </a>
          `:`
            <div id="prev-btn" class="nav-btn" style="visibility: hidden;" aria-hidden="true"></div>
          `}
          
          <div class="nav-center">
          </div>
          
          ${o?`
            <a id="next-btn" href="${f}poema/${a(o)}/" class="nav-btn nav-btn-next" data-link rel="next" aria-label="Próximo poema: ${a(c||``)}" title="${a(c||``)}">
              <span class="nav-btn-label">Próximo →</span>
              <span class="nav-btn-title">${a(c||``)}</span>
            </a>
          `:`
            <div id="next-btn" class="nav-btn nav-btn-next" style="visibility: hidden;" aria-hidden="true"></div>
          `}
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
            ${w.map(e=>`
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
      ${m.render()}
      
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
  `}function te(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var E=null,D=null,O=null,k=null,A=!1,j=``,M={meta:{title:`Poema`},cleanup(){E&&window.removeEventListener(`scroll`,E),D&&document.removeEventListener(`touchstart`,D),O&&document.removeEventListener(`touchend`,O),k&&document.removeEventListener(`keydown`,k),_.cleanup(),g.cleanup(),S.cleanup(),document.body.classList.remove(`poem-page-active`),E=null,D=null,O=null,k=null,A=!1,j=``},async render(n,i){document.body.classList.add(`poem-page-active`);let u=i.slug,p=`/poema/`+u,v=n.getAttribute(`data-prerendered`)===p,y=null,b=``,x=``,C=``,w=``,T=[],M=[];if(v){let e=document.getElementById(`__DATA__`);if(e)try{let t=JSON.parse(e.textContent);y=t.poem,b=t.prev?.slug||``,x=t.next?.slug||``,C=t.prev?.title||``,w=t.next?.title||``,T=t.collections||[],M=t.related||[]}catch(e){console.warn(`[Poem] Failed to parse __DATA__:`,e)}n.removeAttribute(`data-prerendered`)}if(!y){n.innerHTML=`
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
      `,console.log(`[Poem] Fetching slug:`,u);let e=null;try{let{db:e}=await r(async()=>{let{db:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:t,query:n,where:i,getDocs:a,limit:o,orderBy:s}=await r(async()=>{let{collection:e,query:t,where:n,getDocs:r,limit:i,orderBy:a}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.o);return{collection:e,query:t,where:n,getDocs:r,limit:i,orderBy:a}},[]),c=await a(n(t(e,`poems`),i(`slug`,`==`,u),i(`status`,`==`,`published`),o(1)));if(!c.empty){let r=c.docs[0];if(y={id:r.id,...r.data()},!y.prev_slug||!y.next_slug)try{let r=n(t(e,`poems`),i(`status`,`==`,`published`),i(`published_at`,`<`,y.published_at),s(`published_at`,`desc`),o(1)),c=n(t(e,`poems`),i(`status`,`==`,`published`),i(`published_at`,`>`,y.published_at),s(`published_at`,`asc`),o(1)),[l,u]=await Promise.all([a(r).catch(e=>(console.warn(`Error fetching prev poem:`,e),null)),a(c).catch(e=>(console.warn(`Error fetching next poem:`,e),null))]);if(l&&!l.empty){let e=l.docs[0].data();y.prev_slug=e.slug,y.prev_title=e.title}if(u&&!u.empty){let e=u.docs[0].data();y.next_slug=e.slug,y.next_title=e.title}}catch(e){console.warn(`Error in parallel prev/next query:`,e)}}}catch(t){e=t,console.error(`[Poem] Error:`,e)}if(e||!y){console.warn(`[Poem] Poem not found or error occurred`),d(),n.innerHTML=`
          <div class="not-found-page fade-in">
            <p class="not-found-label">404</p>
            <h2 class="not-found-title">Página não encontrada</h2>
            <p class="not-found-desc">O poema que você procura pode ter mudado de endereço ou ainda não foi publicado.</p>
            <a href="/" data-link class="not-found-link">← Voltar ao sumário</a>
          </div>
        `;return}if(b=y.prev_slug||``,x=y.next_slug||``,C=y.prev_title||``,w=y.next_title||``,y.collection_slugs&&y.collection_slugs.length>0)try{let{db:e}=await r(async()=>{let{db:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:t,query:n,where:i,getDocs:a}=await r(async()=>{let{collection:e,query:t,where:n,getDocs:r}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.o);return{collection:e,query:t,where:n,getDocs:r}},[]),o=await a(n(t(e,`collections`),i(`slug`,`in`,y.collection_slugs)));T=[],o.forEach(e=>T.push(e.data()))}catch(e){console.warn(e)}n.innerHTML=ee({poem:y,prevSlug:b,nextSlug:x,prevTitle:C,nextTitle:w,collectionsData:T,relatedPoems:M,baseUrl:`/`})}h(`/poema/`+y.slug,y.id);let N=`${l}/poema/${y.slug}/`,ne=e(y.excerpt||y.content||``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,re=a(y.title||``),P=T&&T.length>0?T[0]:null,ie=P?[{name:`Início`,url:`${l}/`},{name:P.name,url:`${l}/colecao/${P.slug}/`},{name:re,url:N}]:[{name:`Início`,url:`${l}/`},{name:re,url:N}],ae=`${window.location.origin}/og-cover.jpg`;s({title:y.title,description:ne,url:N,imageUrl:ae,type:`article`,publishedTime:y.published_at,modifiedTime:y.updated_at,poemTitle:y.title,tags:y.tags,structuredData:[o(y,T),f(ie)]}),(()=>{if(typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||typeof IntersectionObserver>`u`){n.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px`,threshold:0}),t=window.innerHeight;n.querySelectorAll(`.stagger-reveal`).forEach(n=>{n.getBoundingClientRect().top<t?n.classList.add(`revealed`):(n.classList.add(`js-reveal-ready`),e.observe(n))})})();let oe=document.getElementById(`mobile-reading-settings-btn`),F=document.getElementById(`poem-settings-panel`),I=document.getElementById(`poem-settings-overlay`),L=()=>{F?.classList.remove(`active`),I?.classList.remove(`active`),oe?.focus()};oe?.addEventListener(`click`,()=>{F.classList.toggle(`active`),I.classList.toggle(`active`)}),I?.addEventListener(`click`,L);let se=0;F?.addEventListener(`touchstart`,e=>{se=e.touches[0].clientY},{passive:!0}),F?.addEventListener(`touchend`,e=>{e.changedTouches[0].clientY-se>50&&L()},{passive:!0}),S.init(n,y.id);let R=window.location.href,z=`Leia "${y.title}", um poema de Natanael Fernando Gatti Brentano:`;document.querySelectorAll(`[data-platform]`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(z+` `+R)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(z)}&url=${encodeURIComponent(R)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(R)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let ce=document.getElementById(`share-native`),le=document.getElementById(`share-fallback`);navigator.share&&/Mobi|Android/i.test(navigator.userAgent)?(ce.style.display=`flex`,document.getElementById(`web-share-btn`)?.addEventListener(`click`,async()=>{try{await navigator.share({title:y.title,text:z,url:R})}catch{}})):(le.style.display=`flex`,document.getElementById(`copy-link-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(R).then(()=>{t.show(`Link copiado para a área de transferência!`,`success`)})}));let B=n.querySelectorAll(`.size-btn`),V=n.querySelectorAll(`.family-btn`),H=n.querySelectorAll(`.height-btn`),U=n.querySelectorAll(`.align-btn`),W=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t||e.dataset.align===t))},ue=localStorage.getItem(`reading-font-size`)||`md`,de=localStorage.getItem(`reading-font-family`)||`serif`,fe=localStorage.getItem(`reading-line-height`)||`normal`,pe=localStorage.getItem(`reading-alignment`)||`center`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${ue}`),document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${de}`),document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${fe}`),document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${pe}`),W(B,ue),W(V,de),W(H,fe),W(U,pe),B.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),W(B,t)})}),V.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),W(V,t)})}),H.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),W(H,t)})}),U.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.align;document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${t}`),localStorage.setItem(`reading-alignment`,t),W(U,t)})}),g.init(n,`/`),_.init(n);let me=document.getElementById(`poem-text`),G=0;me?.addEventListener(`touchend`,e=>{let t=Date.now();if(t-G<300&&t-G>0){let t=document.querySelector(`.reaction-btn[data-emoji="❤️"]`);t&&!t.classList.contains(`active`)&&t.click(),he(e.changedTouches[0].clientX,e.changedTouches[0].clientY)}G=t},{passive:!0});function he(e,t){let n=document.createElement(`span`);n.textContent=`♥`,n.style.cssText=`
        position:fixed; left:${e}px; top:${t}px;
        font-size:3rem; color:var(--accent-subtle);
        pointer-events:none; z-index:9999;
        animation: heartFloat 0.8s ease forwards;
        transform: translate(-50%,-50%);
        text-shadow: 0 0 10px rgba(0,0,0,0.2);
      `,document.body.appendChild(n),setTimeout(()=>n.remove(),800)}let K=document.getElementById(`highlight-tooltip`),q=``,J=document.getElementById(`mobile-share-selection-btn`);me?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){K?.classList.remove(`visible`),J&&J.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();q=e.toString().trim(),q.length>0?/Mobi|Android/i.test(navigator.userAgent)?J&&J.classList.add(`visible`):K&&(K.style.left=`${t.left+t.width/2}px`,K.style.top=`${t.top+window.scrollY}px`,K.classList.add(`visible`)):(K?.classList.remove(`visible`),J&&J.classList.remove(`visible`))}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&(K?.classList.remove(`visible`),J&&J.classList.remove(`visible`))}),J?.addEventListener(`click`,async()=>{if(navigator.share)try{await navigator.share({title:y.title,text:`"${q}" — Natanael Fernando Gatti Brentano`,url:window.location.href})}catch{}else{let e=`"${q}" — Natanael Fernando Gatti Brentano\n${window.location.href}`;navigator.clipboard.writeText(e).then(()=>{t.show(`Trecho copiado!`,`success`)})}window.getSelection().removeAllRanges(),J.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(q).then(()=>{t.show(`Trecho copiado para a área de transferência!`,`success`),window.getSelection().removeAllRanges(),K?.classList.remove(`visible`)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${q}" — Natanael Fernando Gatti Brentano\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),K?.classList.remove(`visible`)}),document.getElementById(`highlight-card-btn`)?.addEventListener(`click`,()=>{window.getSelection().removeAllRanges(),K?.classList.remove(`visible`),J&&J.classList.remove(`visible`),A=!0,j=q||e(y.content).substring(0,150)+`...`;let t=document.getElementById(`card-preview-modal`);t&&(t.style.display=`flex`,t.classList.add(`active`))});let Y=document.getElementById(`copy-citation-btn`);Y&&Y.addEventListener(`click`,async()=>{let e=Y.getAttribute(`data-citation`)||``;try{await navigator.clipboard.writeText(e);let n=Y.querySelector(`.copy-citation-text`),r=n?n.textContent:`Copiar citação`;n&&(n.textContent=`Copiado!`),Y.classList.add(`copied`),t.show(`Citação copiada para a área de transferência!`,`success`),setTimeout(()=>{n&&(n.textContent=r),Y.classList.remove(`copied`)},2500)}catch{t.show(`Não foi possível copiar automaticamente.`,`error`)}}),k=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:document.getElementById(`poem-settings-panel`)?.classList.contains(`active`)?L():document.documentElement.classList.contains(`immersive-mode`)&&document.getElementById(`immersive-exit-btn`)?.click();break;case`ArrowRight`:x&&c(`/poema/${x}/`);break;case`ArrowLeft`:b&&c(`/poema/${b}/`);break;case`i`:case`I`:document.documentElement.classList.contains(`immersive-mode`)?document.getElementById(`immersive-exit-btn`)?.click():document.getElementById(`immersive-btn`)?.click()}},document.addEventListener(`keydown`,k);let ge=document.getElementById(`scroll-bar`),X=document.querySelector(`.poem-nav`),Z=document.getElementById(`next-btn`),_e=!1;E=te(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;ge&&(ge.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;X&&(t>50?X.classList.add(`visible`):X.classList.remove(`visible`)),t+r>n*.9&&x&&!_e&&(_e=!0,Z&&(Z.style.transform=`scale(1.05)`),setTimeout(()=>{Z&&(Z.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,E);let ve=0,ye=0,be=0;D=e=>{ve=e.touches[0].clientX,ye=e.touches[0].clientY,be=Date.now()},O=e=>{let t=ve-e.changedTouches[0].clientX,n=ye-e.changedTouches[0].clientY;Date.now()-be<=500&&Math.abs(t)>100&&Math.abs(t)>Math.abs(n)*3&&(t>0&&x?c(`/poema/${x}/`):t<0&&b&&c(`/poema/${b}/`))},document.addEventListener(`touchstart`,D,{passive:!0}),document.addEventListener(`touchend`,O,{passive:!0}),m.init();let xe=document.getElementById(`share-card-btn-mobile`),Se=document.getElementById(`share-card-btn-desktop`),Q=document.getElementById(`card-preview-modal`),Ce=document.getElementById(`close-preview-btn`),$=document.getElementById(`download-card-btn`),we=n.querySelectorAll(`.preview-theme-btn`),Te=n.querySelectorAll(`.preview-ratio-btn`),Ee=`dark`,De=`feed`,Oe=()=>{Q&&(A=!1,j=``,Q.style.display=`flex`,Q.classList.add(`active`))};xe?.addEventListener(`click`,Oe),Se?.addEventListener(`click`,Oe),Ce?.addEventListener(`click`,()=>{Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}),we.forEach(e=>{e.addEventListener(`click`,()=>{we.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),Ee=e.dataset.theme})}),Te.forEach(e=>{e.addEventListener(`click`,()=>{Te.forEach(e=>{e.classList.remove(`active`),e.style.borderColor=`var(--border-subtle)`}),e.classList.add(`active`),e.style.borderColor=`var(--border-strong)`,De=e.dataset.ratio})}),$?.addEventListener(`click`,async()=>{$.innerText=`Gerando...`,$.disabled=!0;try{let{generateSocialCard:e}=await r(async()=>{let{generateSocialCard:e}=await import(`./social-export-CEN6FbX8.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1])),n=A?j:null;await e(y,document.getElementById(`social-card-container`),Ee,n,De),t.show(`Card gerado com sucesso!`,`success`)}catch(e){console.error(e),t.show(`Erro ao gerar card.`,`error`)}finally{$.innerText=`Baixar Imagem`,$.disabled=!1,A=!1,j=``,Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}}),(async()=>{if(localStorage.getItem(`has_admin_session`)===`1`)try{let{getFirebaseAuth:e}=await r(async()=>{let{getFirebaseAuth:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{getFirebaseAuth:e}},__vite__mapDeps([0])),t=await e(),n=()=>{if(!t.currentUser){localStorage.removeItem(`has_admin_session`);return}let e=document.getElementById(`poem-admin-actions`);if(e){e.textContent=``;let t=document.createElement(`a`);t.href=`/admin?view=editor&id=${encodeURIComponent(y.id||``)}`,t.className=`btn-secondary`,t.setAttribute(`data-link`,``),t.textContent=`Editar Obra`;let n=document.createElement(`button`);n.id=`resend-email-btn`,n.className=`btn-secondary`,n.textContent=`Reenviar Email`,e.appendChild(t),e.appendChild(document.createTextNode(` `)),e.appendChild(n),n.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){n.innerText=`Enviando...`,n.disabled=!0;try{let{getFirebaseFunctions:e}=await r(async()=>{let{getFirebaseFunctions:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{getFirebaseFunctions:e}},__vite__mapDeps([0])),{httpsCallable:t}=await r(async()=>{let{httpsCallable:e}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.i);return{httpsCallable:e}},[]),n=await t(await e(),`sendNewsletter`)({poemId:y.id});alert(`Email reenviado com sucesso para ${n.data?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e),alert(`Houve um erro ao reenviar a newsletter: ${e.message||`Erro`}`)}finally{n.innerText=`Reenviar Email`,n.disabled=!1}}})}};t.currentUser?n():t.authStateReady().then(()=>n()).catch(()=>{})}catch{}})();let ke=()=>{r(async()=>{let{loadReactions:e,toggleReaction:t,EMOJIS:n}=await import(`./reactions-DyeTlhZE.js`);return{loadReactions:e,toggleReaction:t,EMOJIS:n}},__vite__mapDeps([0])).then(({loadReactions:e,toggleReaction:t,EMOJIS:r})=>{let i=(e,t)=>{r.forEach(r=>{let i=n.querySelector(`.reaction-btn[data-emoji="${r}"]`),a=n.querySelector(`.reaction-count[data-count="${r}"]`);i&&i.classList.toggle(`reacted`,t.has(r)),a&&(a.textContent=e[r]||0)})};e(y.id).then(({counts:e,userReactions:t})=>{i(e,t)}).catch(()=>{}),n.querySelectorAll(`.reaction-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.emoji;n.disabled=!0,await t(y.id,r);let{counts:a,userReactions:o}=await e(y.id);i(a,o),n.classList.add(`reacted`),setTimeout(()=>{n.style.animation=`none`,n.offsetHeight,n.style.animation=null},10),n.disabled=!1})})}).catch(e=>console.debug?.(`[reactions]`,e)),S.loadComments(y.id,n),(!M||M.length===0)&&y.tags&&y.tags.length>0&&(async()=>{try{let{db:t}=await r(async()=>{let{db:e}=await import(`./firebase-DJUlHAWI.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{collection:n,query:i,where:o,getDocs:s,limit:c}=await r(async()=>{let{collection:e,query:t,where:n,getDocs:r,limit:i}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.o);return{collection:e,query:t,where:n,getDocs:r,limit:i}},[]),l=y.tags.slice(0,10),u=await s(i(n(t,`poems`),o(`status`,`==`,`published`),o(`tags`,`array-contains-any`,l),c(20))),d=[];if(u.forEach(e=>{e.id!==y.id&&d.push({id:e.id,...e.data()})}),d.length>0){d.forEach(e=>{e._commonTags=(e.tags||[]).filter(e=>y.tags.includes(e)).length,e._sameCollection=0,y.collection_slugs&&e.collection_slugs&&(e._sameCollection=+!!e.collection_slugs.some(e=>y.collection_slugs.includes(e)))}),d.sort((e,t)=>t._commonTags===e._commonTags?t._sameCollection===e._sameCollection?t.published_at.localeCompare(e.published_at):t._sameCollection-e._sameCollection:t._commonTags-e._commonTags);let t=d.slice(0,3);if(t.length>0){let n=document.getElementById(`related-poems-list`);if(n){n.innerHTML=t.map(t=>`
                    <a href="/poema/${t.slug}/" class="related-poem-card" style="padding: var(--space-md); border: 1px solid var(--border-subtle); border-radius: 4px; display: block; text-decoration: none; color: var(--text-primary); transition: background-color var(--transition-fast);" data-link onmouseover="this.style.backgroundColor='var(--border-subtle)'" onmouseout="this.style.backgroundColor='transparent'">
                      <h3 style="font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 4px;">${a(t.title)}</h3>
                      ${t.excerpt?`<p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">${a(e(t.excerpt).substring(0,100))}...</p>`:``}
                    </a>
                  `).join(``);let r=document.getElementById(`related-poems-section`);r&&(r.style.display=`block`)}}}}catch(e){console.warn(`Error fetching related poems:`,e)}})()};`requestIdleCallback`in window?window.requestIdleCallback(ke,{timeout:3e3}):setTimeout(ke,1e3);let Ae=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;setTimeout(()=>{[b,x].filter(e=>typeof e==`string`&&Ae.test(e)).forEach(e=>{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=`${window.location.origin}/poema/${encodeURIComponent(e)}/`,document.head.appendChild(t)})},2e3)}};export{M as default};