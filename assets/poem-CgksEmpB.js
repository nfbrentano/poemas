const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/social-export-B96gbeMi.js","assets/social-export-BgX4m17A.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,o as n,r,s as i,t as a}from"./index-05tUdvTZ.js";import{t as o}from"./html-BzoIVJF0.js";import{t as s}from"./seo-BlITGSmq.js";import{t as ee}from"./newsletter-ByzdoRLe.js";var c=[`🕯️`,`💧`,`🌿`,`🌙`,`✨`];function l(){let e=localStorage.getItem(`reaction_session_id`);return e||(e=typeof crypto<`u`&&crypto.randomUUID?crypto.randomUUID():`xxx-xx-4xxx-yxx-xxxxxxxxxxxx`.replace(/[xy]/g,e=>{let t=Math.random()*16|0;return(e===`x`?t:t&3|8).toString(16)}),localStorage.setItem(`reaction_session_id`,e)),e}async function te(e){let{data:t,error:r}=await n.from(`poem_reactions`).select(`emoji, session_id`).eq(`poem_id`,e);if(r)return{counts:{},userReactions:new Set};let i=l(),a={},o=new Set;return c.forEach(e=>a[e]=0),(t||[]).forEach(e=>{a[e.emoji]=(a[e.emoji]||0)+1,e.session_id===i&&o.add(e.emoji)}),{counts:a,userReactions:o}}async function ne(e,t){let r=l(),{data:i}=await n.from(`poem_reactions`).select(`id`).eq(`poem_id`,e).eq(`session_id`,r).eq(`emoji`,t).maybeSingle();return i?(await n.from(`poem_reactions`).delete().eq(`id`,i.id),`removed`):(await n.from(`poem_reactions`).insert({poem_id:e,emoji:t,session_id:r}),`added`)}var u={init(){if(!document.getElementById(`toast-container`)){let e=document.createElement(`div`);e.id=`toast-container`,e.className=`toast-container`,e.setAttribute(`aria-live`,`polite`),document.body.appendChild(e)}},show(e,t=`default`,n=3e3){this.init();let r=document.getElementById(`toast-container`),i=document.createElement(`div`);i.className=`toast-message toast-${t}`;let a=``;t===`success`&&(a=`✓ `),t===`error`&&(a=`⚠ `),t===`info`&&(a=`ℹ `),t===`heart`&&(a=`♥ `),i.innerHTML=`<span class="toast-icon">${a}</span><span class="toast-text">${e}</span>`,r.appendChild(i),i.offsetWidth,i.classList.add(`show`),setTimeout(()=>{i.classList.remove(`show`),i.addEventListener(`transitionend`,()=>{i.parentNode&&i.parentNode.removeChild(i)})},n)}},re=`poemas_db`,d=`poem_notes`,f=2,p=null;function m(){return p?Promise.resolve(p):new Promise((e,t)=>{let n=indexedDB.open(re,f);n.onsuccess=t=>{p=t.target.result,e(p)},n.onerror=e=>t(e.target.error)})}var h={async get(e){let t=await m();return new Promise((n,r)=>{let i=t.transaction(d,`readonly`).objectStore(d).get(e);i.onsuccess=()=>n(i.result?i.result.note:``),i.onerror=()=>r(i.error)})},async save(e,t){let n=await m();return new Promise((r,i)=>{let a=n.transaction(d,`readwrite`).objectStore(d),o={slug:e,note:t,updated_at:new Date().toISOString()},s=a.put(o);s.onsuccess=()=>r(!0),s.onerror=()=>i(s.error)})},async delete(e){let t=await m();return new Promise((n,r)=>{let i=t.transaction(d,`readwrite`).objectStore(d).delete(e);i.onsuccess=()=>n(!0),i.onerror=()=>r(i.error)})}};function ie(e,t){let n;return function(){let r=arguments,i=this;n||(e.apply(i,r),n=!0,setTimeout(()=>n=!1,t))}}var g=null,_=null,v=null,y=null,b=!1,x=``,S={meta:{title:`Poema`},cleanup(){g&&window.removeEventListener(`scroll`,g),_&&document.removeEventListener(`touchstart`,_),v&&document.removeEventListener(`touchend`,v),y&&document.removeEventListener(`keydown`,y),document.documentElement.classList.remove(`immersive-mode`),g=null,_=null,v=null,y=null,b=!1,x=``},async render(l,re){let d=re.slug;l.innerHTML=`
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
    `,console.log(`[Poem] Fetching slug:`,d);let{data:f,error:p}=await n.rpc(`get_poem_with_navigation`,{target_slug:d});p&&console.error(`[Poem] RPC Error:`,p);let m=f&&Array.isArray(f)&&f.length>0?f[0]:null;if(p||!m){console.warn(`[Poem] Poem not found or error occurred`),l.innerHTML=`
        <div class="error-container">
          <h2 style="margin-bottom: 1rem; font-family: var(--font-display);">Obra não encontrada</h2>
          <p><a href="/poemas/" data-link style="color: var(--accent-subtle); border-bottom: 1px solid var(--accent-subtle);">Voltar ao sumário</a></p>
        </div>
      `;return}let S=m.prev_slug,C=m.next_slug,ae=m.prev_title,w=m.next_title;try{t.add(m),window.dispatchEvent(new CustomEvent(`history-updated`))}catch(e){console.error(`Erro ao salvar no histórico:`,e)}let oe=(m.content||``).replace(/<[^>]*>/g,` `).replace(/\s+/g,` `).trim().split(` `).filter(e=>e.length>0).length,se=Math.ceil(oe/200),ce=se<=1?`1 min de leitura`:`${se} min de leitura`;e(`/poema/`+m.slug,m.id);let le=window.location.href,ue=(m.excerpt||m.content).replace(/<[^>]*>?/gm,``).replace(/\s+/g,` `).trim().slice(0,160)+`...`,de=`${window.location.origin}/poemas/og-cover.jpg`;s({title:m.title,description:ue,url:le,imageUrl:de,type:`article`,publishedTime:m.published_at,tags:m.tags});let{data:{session:fe}}=await n.auth.getSession(),pe=!!fe,me=(e=>{if(!e)return``;let t=e.split(/\n\s*\n/).filter(e=>e.trim()),n=0;return t.map(e=>`<div class="stanza stagger-reveal">${e.split(`
`).map(e=>(n++,`<span class="line-reveal" style="transition-delay: ${n*.05}s">${e}</span>`)).join(``)}</div>`).join(``)})(m.content);l.innerHTML=`
      <div class="poem-container">
        <div class="scroll-progress-container"><div id="scroll-bar" class="scroll-progress-bar"></div></div>
        
        <article class="single-poem fade-in">
          <header>
            <h1>${m.title}</h1>
            <div class="poem-meta">
              <span>${new Date(m.published_at).toLocaleDateString(`pt-BR`)}</span>
              ${m.tags&&m.tags.length>0?`<span>•</span><span class="sentiments-list">Sentimentos: ${m.tags.join(`, `)}</span>`:``}
              <span>•</span>
              <span class="reading-time">${ce}</span>
            </div>
          </header>

          
          
          <div id="poem-text" class="poem-content">${me}</div>

          <div class="read-next-section">
            ${C?`
              <p class="read-next-label">Próxima Obra</p>
              <a href="/poemas/poema/${C}" class="read-next-card" data-link>
                <h2 class="read-next-title">${w}</h2>
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
            <div class="instagram-cta" style="margin-top: var(--space-md); text-align: center; font-size: 0.85rem; color: var(--text-secondary); font-family: var(--font-ui); letter-spacing: 0.5px;">
              Gostou do poema? Acompanhe também no Instagram: <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" class="instagram-link" style="color: var(--accent-subtle, var(--text-primary)); text-decoration: none; border-bottom: 1px solid currentColor; font-weight: 500; transition: opacity 0.2s;">@nfgbrentano</a>
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

          <!-- Painel de Notas Pessoais -->
          <div id="notes-panel" class="notes-panel" style="display: none;">
            <p style="font-family: var(--font-ui); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-xs); color: var(--text-secondary);">Minha percepção íntima (salva offline)</p>
            <textarea id="note-textarea" placeholder="Escreva suas impressões mais íntimas sobre este poema..." style="width: 100%; min-height: 120px; background: transparent; border: none; resize: vertical; outline: none; font-family: var(--font-poem); line-height: 1.6; color: var(--text-primary); margin-bottom: var(--space-xs);"></textarea>
            <div style="display: flex; gap: var(--space-xs); justify-content: flex-end;">
              <button id="delete-note-btn" class="btn-secondary" style="font-size: 0.75rem; color: var(--error);">Excluir</button>
              <button id="save-note-btn" class="btn-primary" style="font-size: 0.75rem;">Salvar Nota</button>
            </div>
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
            <button id="fav-btn" class="btn-secondary" aria-label="Salvar poema">
              <span class="fav-icon">♡</span> <span class="fav-text">Salvar</span>
            </button>
            
            <button id="note-btn" class="btn-secondary" aria-label="Anotações pessoais">
              <span class="note-icon">✏</span> <span class="note-text">Anotar</span>
            </button>
            
            <button id="share-card-btn" class="btn-secondary" aria-label="Gerar card para compartilhar">
              🖼 Compartilhar Card
            </button>
            
            <button id="immersive-btn" class="btn-secondary" aria-label="Modo leitura imersiva">
              ⬜ Leitura Imersiva
            </button>
            
            ${pe?`
              <a href="/poemas/admin?view=editor&id=${m.id}" class="btn-secondary" data-link>Editar Obra</a>
              <button id="resend-email-btn" class="btn-secondary">Reenviar Email</button>
            `:``}
          </div>
        </article>
        
        <!-- Newsletter Section -->
        ${ee.render()}

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
          <button id="highlight-card-btn" class="highlight-btn">Gerar Card</button>
        </div>

        <div class="poem-nav">
          <button id="prev-btn" class="nav-btn" style="${S?``:`display:none;`}" aria-label="Poema anterior" title="${ae||``}">
            <span class="nav-btn-label">← Anterior</span>
            <span class="nav-btn-title">${ae||``}</span>
          </button>
          
          <div class="nav-center">
            <div class="nav-footer-text">
              &copy; ${new Date().getFullYear()} Natanael Brentano <span class="footer-separator">•</span> <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" class="footer-social-link" style="letter-spacing: 0.5px; text-transform: none; display: inline-flex; align-items: center; gap: 4px;"><svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align: middle;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> @nfgbrentano</a>
            </div>
          </div>
          
          <button id="next-btn" class="nav-btn nav-btn-next" style="${C?``:`display:none;`}" aria-label="Próximo poema" title="${w||``}">
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
              <button class="preview-theme-btn active" data-theme="dark" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: #050505; color: #e2e2e2; cursor: pointer; font-size: 0.8rem;">Escuro</button>
              <button class="preview-theme-btn" data-theme="light" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #fdfdfd; color: #1a1a1a; cursor: pointer; font-size: 0.8rem;">Claro</button>
              <button class="preview-theme-btn" data-theme="sepia" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: #eae0c7; color: #433422; cursor: pointer; font-size: 0.8rem;">Sépia</button>
            </div>

            <p style="color: var(--text-secondary); font-size: 0.85rem; margin: var(--space-md) 0 var(--space-xs) 0;">Formato do Card:</p>
            <div class="ratio-selector" style="display: flex; justify-content: center; gap: var(--space-sm); margin-bottom: var(--space-lg);">
              <button class="preview-ratio-btn active" data-ratio="feed" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); cursor: pointer; font-size: 0.8rem;">Feed (4:5)</button>
              <button class="preview-ratio-btn" data-ratio="stories" style="padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border-subtle); background: var(--bg-primary); color: var(--text-primary); cursor: pointer; font-size: 0.8rem;">Stories (9:16)</button>
            </div>

            <div style="display: flex; gap: var(--space-xs); justify-content: center;">
              <button id="close-preview-btn" class="btn-secondary" style="padding: var(--space-xs) var(--space-md); font-size: 0.85rem;">Cancelar</button>
              <button id="download-card-btn" class="btn-primary" style="padding: var(--space-xs) var(--space-md); font-size: 0.85rem;">Baixar Imagem</button>
            </div>
          </div>
        </div>
      </div>
      <div id="immersive-hint" class="immersive-hint">Deslize para navegar →</div>
    `,(()=>{if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches){l.querySelectorAll(`.stagger-reveal`).forEach(e=>e.classList.add(`revealed`));return}let e=new IntersectionObserver((e,t)=>{e.forEach(e=>{e.isIntersecting&&(e.target.classList.add(`revealed`),t.unobserve(e.target))})},{root:null,rootMargin:`0px 0px -10% 0px`,threshold:.1});l.querySelectorAll(`.stagger-reveal`).forEach(t=>e.observe(t))})();let T=window.location.href,E=`Leia "${m.title}", um poema de Natanael Brentano:`;document.querySelectorAll(`.share-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.platform,n=``;t===`whatsapp`&&(n=`https://api.whatsapp.com/send?text=${encodeURIComponent(E+` `+T)}`),t===`twitter`&&(n=`https://twitter.com/intent/tweet?text=${encodeURIComponent(E)}&url=${encodeURIComponent(T)}`),t===`facebook`&&(n=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(T)}`),window.open(n,`_blank`,`noopener,noreferrer`)})});let D=document.getElementById(`web-share-btn`);navigator.share?D.addEventListener(`click`,async()=>{try{await navigator.share({title:m.title,text:E,url:T})}catch{}}):(D.innerText=`Copiar Link`,D.addEventListener(`click`,()=>{navigator.clipboard.writeText(T).then(()=>{u.show(`Link copiado para a área de transferência!`,`success`)})}));let{counts:he,userReactions:ge}=await te(m.id),_e=(e,t)=>{c.forEach(n=>{let r=l.querySelector(`.reaction-btn[data-emoji="${n}"]`),i=l.querySelector(`.reaction-count[data-count="${n}"]`);r&&r.classList.toggle(`reacted`,t.has(n)),i&&(i.textContent=e[n]||0)})};_e(he,ge),l.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.emoji;e.disabled=!0,await ne(m.id,t);let{counts:n,userReactions:r}=await te(m.id);_e(n,r),e.classList.add(`reacted`),setTimeout(()=>{e.style.animation=`none`,e.offsetHeight,e.style.animation=null},10),e.disabled=!1})}),(async()=>{let{data:e,error:t}=await n.from(`poem_comments`).select(`author_name, content, created_at`).eq(`poem_id`,m.id).eq(`approved`,!0).order(`created_at`,{ascending:!0}),r=document.getElementById(`comments-list`);if(t||!e||e.length===0){r.innerHTML=`<p class="comments-empty">Silêncio... nenhum comentário ainda.</p>`;return}r.innerHTML=e.map(e=>`
        <div class="comment-item fade-in">
          <div class="comment-meta">
            <span class="comment-author">${o(e.author_name)}</span>
            <span class="comment-date">${new Date(e.created_at).toLocaleDateString(`pt-BR`)}</span>
          </div>
          <div class="comment-text">${o(e.content)}</div>
        </div>
      `).join(``)})();let ve=document.getElementById(`comment-form`);ve?.addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`comment-author`).value,r=document.getElementById(`comment-content`).value,i=document.getElementById(`submit-comment-btn`);document.getElementById(`comment-msg`),i.disabled=!0,i.innerText=`Enviando...`;let{error:a}=await n.from(`poem_comments`).insert([{poem_id:m.id,author_name:t,content:r}]);a?(u.show(`Erro ao enviar comentário.`,`error`),i.disabled=!1,i.innerText=`Enviar Nota`):(u.show(`Sua nota foi enviada e aguarda moderação.`,`success`),ve.reset(),i.disabled=!1,i.innerText=`Enviar Nota`)});let O=document.getElementById(`fav-btn`),ye=async()=>{let e=await a.has(m.slug);O&&(O.querySelector(`.fav-icon`).textContent=e?`♥`:`♡`,O.querySelector(`.fav-text`).textContent=e?`Salvo`:`Salvar`,O.classList.toggle(`active`,e))};ye(),O?.addEventListener(`click`,async()=>{await a.has(m.slug)?(await a.remove(m.slug),u.show(`Obra removida dos itens salvos.`,`info`)):(await a.save(m),u.show(`Obra salva com sucesso.`,`heart`),`serviceWorker`in navigator&&navigator.serviceWorker.controller&&fetch(`/poemas/poema/${m.slug}`).catch(()=>{})),ye(),O.classList.remove(`animate-fav`),O.offsetWidth,O.classList.add(`animate-fav`),setTimeout(()=>O.classList.remove(`animate-fav`),800),window.dispatchEvent(new CustomEvent(`favorites-updated`))});let be=document.getElementById(`immersive-btn`),xe=document.getElementById(`immersive-exit-btn`),k=document.getElementById(`immersive-size-slider`),A=document.getElementById(`immersive-size-value`),j=document.getElementById(`immersive-height-slider`),M=document.getElementById(`immersive-height-value`),N=document.getElementById(`poem-text`),P=!1,F=localStorage.getItem(`immersive-reading-font-size`)||`20`,I=localStorage.getItem(`immersive-reading-line-height`)||`22`;N&&(N.style.setProperty(`--immersive-font-size`,`${F}px`),N.style.setProperty(`--immersive-line-height`,`${parseFloat(I)/10}`)),k&&A&&(k.value=F,A.textContent=`${F}px`,k.addEventListener(`input`,e=>{let t=e.target.value;A.textContent=`${t}px`,N?.style.setProperty(`--immersive-font-size`,`${t}px`),localStorage.setItem(`immersive-reading-font-size`,t)})),j&&M&&(j.value=I,M.textContent=`${(parseFloat(I)/10).toFixed(1)}`,j.addEventListener(`input`,e=>{let t=e.target.value,n=(parseFloat(t)/10).toFixed(1);M.textContent=n,N?.style.setProperty(`--immersive-line-height`,n),localStorage.setItem(`immersive-reading-line-height`,t)}));let Se=()=>{if(P=!0,document.documentElement.classList.add(`immersive-mode`),!localStorage.getItem(`immersive-hint-shown`)){let e=document.getElementById(`immersive-hint`);e&&(e.classList.add(`visible`),setTimeout(()=>{e.classList.remove(`visible`),localStorage.setItem(`immersive-hint-shown`,`true`)},3e3))}},L=()=>{P=!1,document.documentElement.classList.remove(`immersive-mode`)};be?.addEventListener(`click`,Se),xe?.addEventListener(`click`,L);let R=document.getElementById(`note-btn`),z=document.getElementById(`notes-panel`),B=document.getElementById(`note-textarea`),Ce=document.getElementById(`save-note-btn`),we=document.getElementById(`delete-note-btn`),V=async()=>{try{let e=await h.get(d);B&&(B.value=e||``);let t=!!e;z&&z.classList.toggle(`has-content`,t),R&&R.classList.toggle(`active`,t)}catch(e){console.error(`Erro ao ler notas:`,e)}};V(),R?.addEventListener(`click`,()=>{if(z){let e=z.style.display===`none`;z.style.display=e?`block`:`none`,e&&B&&B.focus()}}),Ce?.addEventListener(`click`,async()=>{let e=B.value.trim();if(!e){u.show(`Escreva algo para salvar ou use Excluir.`,`info`);return}try{await h.save(d,e),u.show(`Sua percepção foi salva offline.`,`success`),V()}catch{u.show(`Erro ao salvar nota.`,`error`)}}),we?.addEventListener(`click`,async()=>{if(confirm(`Deseja excluir sua anotação pessoal?`))try{await h.delete(d),B&&(B.value=``),u.show(`Anotação excluída.`,`info`),V(),z&&(z.style.display=`none`)}catch{u.show(`Erro ao excluir nota.`,`error`)}});let H=l.querySelectorAll(`.size-btn`),U=l.querySelectorAll(`.family-btn`),W=l.querySelectorAll(`.height-btn`),G=l.querySelectorAll(`.align-btn`),K=(e,t)=>{e.forEach(e=>e.classList.toggle(`active`,e.dataset.size===t||e.dataset.family===t||e.dataset.height===t||e.dataset.align===t))},Te=localStorage.getItem(`reading-font-size`)||`md`,Ee=localStorage.getItem(`reading-font-family`)||`serif`,De=localStorage.getItem(`reading-line-height`)||`normal`,Oe=localStorage.getItem(`reading-alignment`)||`center`;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${Te}`),document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${Ee}`),document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${De}`),document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${Oe}`),K(H,Te),K(U,Ee),K(W,De),K(G,Oe),H.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.size;document.documentElement.classList.remove(`font-reading-sm`,`font-reading-md`,`font-reading-lg`),document.documentElement.classList.add(`font-reading-${t}`),localStorage.setItem(`reading-font-size`,t),K(H,t)})}),U.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.family;document.documentElement.classList.remove(`font-family-serif`,`font-family-sans`,`font-family-hand`),document.documentElement.classList.add(`font-family-${t}`),localStorage.setItem(`reading-font-family`,t),K(U,t)})}),W.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.height;document.documentElement.classList.remove(`line-height-normal`,`line-height-relaxed`),document.documentElement.classList.add(`line-height-${t}`),localStorage.setItem(`reading-line-height`,t),K(W,t)})}),G.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.align;document.documentElement.classList.remove(`align-reading-left`,`align-reading-center`),document.documentElement.classList.add(`align-reading-${t}`),localStorage.setItem(`reading-alignment`,t),K(G,t)})});let ke=l.querySelectorAll(`.ambient-btn`),q=document.getElementById(`ambient-audio`),Ae={rain:`https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=heavy-rain-nature-sounds-8186.mp3`,fire:`https://cdn.pixabay.com/download/audio/2022/02/07/audio_27d8ce6605.mp3?filename=fireplace-sound-21271.mp3`};ke.forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.sound;ke.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),t===`silence`?q.pause():(q.src=Ae[t],q.volume=.5,q.play().catch(e=>console.error(`Audio play failed:`,e)))})}),l.querySelector(`.ambient-btn[data-sound="silence"]`).classList.add(`active`);let je=document.getElementById(`poem-text`),J=document.getElementById(`highlight-tooltip`),Y=``;je?.addEventListener(`mouseup`,()=>{let e=window.getSelection();if(!e.rangeCount||e.isCollapsed){J.classList.remove(`visible`);return}let t=e.getRangeAt(0).getBoundingClientRect();Y=e.toString().trim(),Y.length>0?(J.style.left=`${t.left+t.width/2}px`,J.style.top=`${t.top+window.scrollY}px`,J.classList.add(`visible`)):J.classList.remove(`visible`)}),document.addEventListener(`selectionchange`,()=>{window.getSelection().isCollapsed&&J.classList.remove(`visible`)}),document.getElementById(`highlight-copy-btn`)?.addEventListener(`click`,()=>{navigator.clipboard.writeText(Y).then(()=>{u.show(`Trecho copiado para a área de transferência!`,`success`),window.getSelection().removeAllRanges(),J.classList.remove(`visible`)})}),document.getElementById(`highlight-share-btn`)?.addEventListener(`click`,()=>{let e=`"${Y}" — Natanael Brentano\n${window.location.href}`,t=`https://twitter.com/intent/tweet?text=${encodeURIComponent(e)}`;window.open(t,`_blank`,`noopener,noreferrer`),window.getSelection().removeAllRanges(),J.classList.remove(`visible`)}),document.getElementById(`highlight-card-btn`)?.addEventListener(`click`,()=>{window.getSelection().removeAllRanges(),J.classList.remove(`visible`),b=!0,x=Y;let e=document.getElementById(`card-preview-modal`);e&&(e.style.display=`flex`,e.classList.add(`active`))}),y=e=>{if(![`INPUT`,`TEXTAREA`].includes(e.target.tagName))switch(e.key){case`Escape`:P&&L();break;case`ArrowRight`:C&&r(`/poema/${C}`);break;case`ArrowLeft`:S&&r(`/poema/${S}`);break;case`f`:case`F`:O?.click();break;case`i`:case`I`:P?L():Se();break}},document.addEventListener(`keydown`,y);let Me=document.getElementById(`scroll-bar`),X=document.querySelector(`.poem-nav`),Z=document.getElementById(`next-btn`),Ne=!1;g=ie(()=>{let e=(document.body.scrollTop||document.documentElement.scrollTop)/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100;Me&&(Me.style.width=e+`%`);let t=window.pageYOffset||document.documentElement.scrollTop,n=document.documentElement.scrollHeight,r=document.documentElement.clientHeight;X&&(t>50?X.classList.add(`visible`):X.classList.remove(`visible`)),t+r>n*.9&&C&&!Ne&&(Ne=!0,Z&&(Z.style.transform=`scale(1.05)`),setTimeout(()=>{Z&&(Z.style.transform=`scale(1)`)},200))},100),window.addEventListener(`scroll`,g);let Pe=0,Fe=0;_=e=>{Pe=e.touches[0].clientX,Fe=e.touches[0].clientY},v=e=>{let t=Pe-e.changedTouches[0].clientX,n=Fe-e.changedTouches[0].clientY;Math.abs(t)>80&&Math.abs(t)>Math.abs(n)*2&&(t>0&&C?r(`/poema/${C}`):t<0&&S&&r(`/poema/${S}`))},document.addEventListener(`touchstart`,_,{passive:!0}),document.addEventListener(`touchend`,v,{passive:!0}),Z?.addEventListener(`click`,()=>{C&&r(`/poema/${C}`)}),document.getElementById(`prev-btn`)?.addEventListener(`click`,()=>{S&&r(`/poema/${S}`)}),ee.init();let Ie=document.getElementById(`share-card-btn`),Q=document.getElementById(`card-preview-modal`),Le=document.getElementById(`close-preview-btn`),$=document.getElementById(`download-card-btn`),Re=l.querySelectorAll(`.preview-theme-btn`),ze=l.querySelectorAll(`.preview-ratio-btn`),Be=`dark`,Ve=`feed`;if(Ie?.addEventListener(`click`,()=>{Q&&(Q.style.display=`flex`,Q.classList.add(`active`))}),Le?.addEventListener(`click`,()=>{Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}),Re.forEach(e=>{e.addEventListener(`click`,()=>{Re.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),Be=e.dataset.theme})}),ze.forEach(e=>{e.addEventListener(`click`,()=>{ze.forEach(e=>{e.classList.remove(`active`),e.style.borderColor=`var(--border-subtle)`}),e.classList.add(`active`),e.style.borderColor=`var(--border-strong)`,Ve=e.dataset.ratio})}),$?.addEventListener(`click`,async()=>{$.innerText=`Gerando...`,$.disabled=!0;try{let{generateSocialCard:e}=await i(async()=>{let{generateSocialCard:e}=await import(`./social-export-B96gbeMi.js`);return{generateSocialCard:e}},__vite__mapDeps([0,1])),t=b?x:null;await e(m,document.getElementById(`social-card-container`),Be,t,Ve),u.show(`Card gerado com sucesso!`,`success`)}catch(e){console.error(e),u.show(`Erro ao gerar card.`,`error`)}finally{$.innerText=`Baixar Imagem`,$.disabled=!1,b=!1,x=``,Q&&(Q.style.display=`none`,Q.classList.remove(`active`))}}),pe){let e=document.getElementById(`resend-email-btn`);e&&e.addEventListener(`click`,async()=>{if(confirm(`Deseja realmente reenviar o email desta obra para todos os assinantes?`)){e.innerText=`Enviando...`,e.disabled=!0;try{let{data:e,error:t}=await n.functions.invoke(`send-newsletter`,{body:{poemId:m.id}});if(t)throw t;alert(`Email reenviado com sucesso para ${e?.count||0} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Houve um erro ao reenviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}finally{e.innerText=`Reenviar Email`,e.disabled=!1}}})}setTimeout(()=>{[S,C].filter(Boolean).forEach(e=>{let t=document.createElement(`link`);t.rel=`prefetch`,t.href=`${window.location.origin}/poemas/poema/${e}`,document.head.appendChild(t)})},2e3)}};export{S as default};