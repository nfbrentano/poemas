import{a as e,i as t,r as n,t as r}from"./html-MqnEuzWn.js";import{n as i}from"./index-DM_Ebsql.js";import{a,d as o,i as s,n as c,o as l,s as u,t as d,u as ee}from"./data-CjgvvypU.js";import{n as te,t as ne}from"./text-format-8DzgO6Rx.js";import{t as f}from"./debounce-C89F3TY9.js";function re(e=``){let n=String(e||``);if(!n.trim())return{stanzas:0,verses:0,words:0,readingMinutes:0,readingLabel:`0 min de leitura`,summary:`0 estrofes · 0 versos`};let r=n.split(/\n\s*\n/).filter(e=>e.trim().length>0).length,i=n.split(`
`).map(e=>e.trim()).filter(e=>e.length>0).length,a=t(n).replace(/\s+/g,` `).trim(),o=a.length>0?a.split(` `).filter(e=>e.length>0).length:0,s=Math.max(1,Math.ceil(o/200));return{stanzas:r,verses:i,words:o,readingMinutes:s,readingLabel:s<=1?`1 min de leitura`:`${s} min de leitura`,summary:`${r===1?`1 estrofe`:`${r} estrofes`} · ${i===1?`1 verso`:`${i} versos`}`}}function p(e){return`admin_draft_${e||`new`}`}function ie(e,t={}){try{let n=p(e),r={...t,savedAt:new Date().toISOString()};return localStorage.setItem(n,JSON.stringify(r)),!0}catch(e){return console.warn(`[Autosave] Não foi possível salvar rascunho no localStorage:`,e),!1}}function ae(e){try{let t=p(e),n=localStorage.getItem(t);return n?JSON.parse(n):null}catch(e){return console.warn(`[Autosave] Não foi possível carregar rascunho do localStorage:`,e),null}}function m(e){try{let t=p(e);return localStorage.removeItem(t),!0}catch(e){return console.warn(`[Autosave] Não foi possível remover rascunho do localStorage:`,e),!1}}function oe(e={},t={}){if(!t||typeof t!=`object`)return!1;if(!e||!e.id)return!!(t.title&&t.title.trim()||t.content&&t.content.trim());let n=e=>String(e||``).trim();return n(e.title)!==n(t.title)||n(e.slug)!==n(t.slug)||n(e.content)!==n(t.content)||n(e.excerpt)!==n(t.excerpt)||n(e.dedication)!==n(t.dedication)||n(e.author_note)!==n(t.author_note)||n(e.written_at)!==n(t.written_at)||n(e.written_location)!==n(t.written_location)||n(e.status)!==n(t.status)||(Array.isArray(e.tags)?e.tags.join(`,`):``)!==(Array.isArray(t.tags)?t.tags.join(`,`):t.tags||``)}async function se(e,t=null,n=u){if(!e||!e.trim())return{hasConflict:!1,conflictingPoem:null};let{data:r,error:i}=await n(`poems`,{where:[[`slug`,`==`,e.trim().toLowerCase()]]});if(i||!Array.isArray(r)||r.length===0)return{hasConflict:!1,conflictingPoem:null};let a=r.filter(e=>e.id!==t);return a.length>0?{hasConflict:!0,conflictingPoem:a[0]}:{hasConflict:!1,conflictingPoem:null}}async function ce(e,t=[],n={}){let r=n.listDocs||u,i=n.insertDocs||l,a=n.deleteDocById||c;if(!e)return{error:null,added:0,removed:0};try{let{data:n,error:o}=await r(`collection_poems`,{where:[[`poem_id`,`==`,e]]});if(o)throw o;let s=n||[],c=new Set(s.map(e=>e.collection_id)),l=new Set(t||[]),u=0,d=0;for(let e of s)l.has(e.collection_id)||(await a(`collection_poems`,e.id),d++);for(let n of t||[])if(!c.has(n)){let{data:t}=await r(`collection_poems`,{where:[[`collection_id`,`==`,n]]}),a=(t||[]).map(e=>typeof e.order==`number`?e.order:0);await i(`collection_poems`,{collection_id:n,poem_id:e,order:(a.length>0?Math.max(...a):0)+1}),u++}return{error:null,added:u,removed:d}}catch(e){return{error:e,added:0,removed:0}}}async function h(t,c){let p={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`,audio_url:``,dedication:``,author_note:``,written_at:``,written_location:``,collection_slugs:[],notify_newsletter_on_publish:!1,notify_push_on_publish:!1},h=[],le=[];if(c){t.innerHTML=`<div class="loading">Carregando poema...</div>`;let[{data:e},{data:n},{data:r}]=await Promise.all([s(`poems`,c),u(`collections`),u(`collection_poems`,{where:[[`poem_id`,`==`,c]]})]);e&&(p={...p,...e},p.content=te(p.content)),h=n||[],le=(r||[]).map(e=>e.collection_id).filter(Boolean)}else{let{data:e}=await u(`collections`);h=e||[]}let ue=h.length>0?h.map(e=>{let t=le.includes(e.id)||Array.isArray(p.collection_slugs)&&p.collection_slugs.includes(e.slug);return`
      <label class="poem-collection-checkbox-label">
        <input type="checkbox" name="poem_collection" class="poem-collection-checkbox" value="${r(e.id)}" data-slug="${r(e.slug)}" ${t?`checked`:``}>
        <span>${r(e.name)}</span>
      </label>
    `}).join(``):`<span style="font-size: 0.82rem; color: var(--text-muted);">Nenhuma coleção cadastrada no momento.</span>`,g=re(p.content);t.innerHTML=e(`
    <aside id="draft-recovery-banner" class="draft-recovery-banner" style="display: none;" role="status">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-sm);">
        <div style="display: flex; align-items: center; gap: var(--space-xs);">
          <span aria-hidden="true" style="color: var(--accent-subtle);">💾</span>
          <span id="draft-banner-text" style="font-size: 0.88rem; color: var(--text-primary); font-family: var(--font-ui);"></span>
        </div>
        <div style="display: flex; gap: var(--space-xs);">
          <button type="button" id="restore-draft-btn" class="btn-primary" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 2px; border: none; cursor: pointer;">
            Restaurar rascunho local
          </button>
          <button type="button" id="discard-draft-btn" class="btn-secondary" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; border: 1px solid var(--border-strong); border-radius: 2px; cursor: pointer; color: var(--text-secondary);">
            Descartar
          </button>
        </div>
      </div>
    </aside>

    <form id="editor-form" style="font-family: var(--font-ui);">
      <div class="editor-layout">
        <div class="editor-pane">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
              <input type="text" id="poem-title" value="${r(p.title)}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
              <input type="text" id="poem-slug" value="${r(p.slug)}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              <p id="slug-error" class="field-error" style="display: none; color: var(--error); font-size: 0.8rem; margin-top: 4px;"></p>
            </div>
          </div>
          
          <div style="margin-top: var(--space-md);">
            <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
            <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${r(p.content)}</textarea>
            
            <div id="poem-metrics-bar" class="poem-metrics-bar" aria-live="polite">
              <span id="poem-metrics-stanzas-verses">${g.summary}</span>
              <span>•</span>
              <span id="poem-metrics-words">${g.words} ${g.words===1?`palavra`:`palavras`}</span>
              <span>•</span>
              <span id="poem-metrics-reading-time">${g.readingLabel}</span>
            </div>
          </div>
          
          <div>
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
            <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${r(p.excerpt||``)}</textarea>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
              <input type="text" id="poem-tags" value="${r(p.tags?p.tags.join(`, `):``)}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
            </div>
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
              <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                <option value="draft" ${p.status===`draft`?`selected`:``}>Rascunho</option>
                <option value="scheduled" ${p.status===`scheduled`?`selected`:``}>Agendado</option>
                <option value="published" ${p.status===`published`?`selected`:``}>Publicado</option>
              </select>
            </div>
          </div>

          <!-- Coleções Integradas (RF04, CA05) -->
          <div class="editor-collections-card">
            <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
              Coleções da Obra (Opcional)
            </label>
            <div id="editor-collections-container" style="display: flex; flex-wrap: wrap; gap: var(--space-xs); margin-top: var(--space-2xs);">
              ${ue}
            </div>
            <p class="field-help">
              Selecione em quais coleções este poema deve ser incluído. A ordenação é mantida automaticamente ao final.
            </p>
          </div>

          <!-- Contexto da Obra (RF01, CA01) -->
          <details id="admin-context-card" style="margin-top: var(--space-md); border: 1px solid var(--border-strong); border-radius: 2px; padding: var(--space-sm) var(--space-md); background: var(--bg-primary);" ${p.dedication||p.author_note||p.written_at||p.written_location?`open`:``}>
            <summary style="cursor: pointer; font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase; color: var(--text-secondary); font-weight: 500; user-select: none;">
              Contexto da Obra, Dedicatória e Criação (Opcional)
            </summary>
            <div style="margin-top: var(--space-md); display: flex; flex-direction: column; gap: var(--space-md);">
              <div>
                <label for="poem-dedication" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Dedicatória / Epígrafe (Máx. 160 caracteres)</label>
                <input type="text" id="poem-dedication" maxlength="160" value="${r(p.dedication||``)}" placeholder="Ex: Para Maria, com afeto" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary); font-style: italic;">
              </div>

              <div>
                <label for="poem-author-note" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Nota do Autor / Bastidores da Criação (Máx. 2000 caracteres)</label>
                <textarea id="poem-author-note" maxlength="2000" placeholder="História, sentimentos ou contexto de escrita..." style="width: 100%; min-height: 90px; font-family: var(--font-body); font-size: 0.95rem; line-height: 1.5; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${r(p.author_note||``)}</textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
                <div>
                  <label for="poem-written-at" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Escrita</label>
                  <input type="text" id="poem-written-at" maxlength="30" value="${r(p.written_at||``)}" placeholder="Ex: 2018-04-10 ou Outono de 2018" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <p class="field-help" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Data da composição original (distinta da publicação).</p>
                </div>
                <div>
                  <label for="poem-written-location" style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Local de Escrita</label>
                  <input type="text" id="poem-written-location" maxlength="100" value="${r(p.written_location||``)}" placeholder="Ex: Porto Alegre, RS" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <p class="field-help" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">Cidade ou local onde os versos nasceram.</p>
                </div>
              </div>
            </div>
          </details>

          <!-- Audio Upload Section -->
          <div class="admin-audio-card">
            <div class="admin-audio-header">
              <label style="display: flex; align-items: center; gap: 6px; margin: 0; color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
                <span>📎</span> Áudio da Narração (Opcional)
              </label>
              <span id="audio-upload-status" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
            </div>
            
            <input type="hidden" id="poem-audio-url" value="${r(p.audio_url||``)}">
            
            <div style="display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; margin-top: var(--space-2xs);">
              <label class="btn-secondary" style="cursor: pointer; padding: 0.5rem 1rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-strong); border-radius: 2px;">
                <span>📁 Escolher Arquivo</span>
                <input type="file" id="poem-audio-file" accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,audio/aac" style="display: none;">
              </label>
              <button type="button" id="remove-audio-btn" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem; color: var(--error); border-color: var(--error); display: ${p.audio_url?`inline-block`:`none`};">
                Remover Áudio
              </button>
            </div>
            
            <p class="field-help" style="font-size: 0.78rem; color: var(--text-muted); margin-top: var(--space-2xs);">
              Formatos aceitos: MP3, WAV, M4A — Máx 10MB.
            </p>

            <div id="audio-preview-container" class="admin-audio-preview" style="display: ${p.audio_url?`flex`:`none`};">
              <div style="display: flex; align-items: center; gap: var(--space-xs); flex: 1; min-width: 200px;">
                <span style="font-size: 0.85rem; color: var(--accent-subtle);">▶</span>
                <audio id="audio-preview-player" controls src="${n(p.audio_url||``)}" style="height: 32px; width: 100%; max-width: 400px;"></audio>
              </div>
              <span id="audio-file-name" style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all;">
                ${p.audio_url?`Áudio vinculado`:``}
              </span>
            </div>
          </div>

          <div id="scheduling-fields" style="margin-top: var(--space-md); ${p.status===`scheduled`?``:`display: none;`}">
            <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
            <input type="datetime-local" id="scheduled-at" value="${p.scheduled_at?new Date(p.scheduled_at).toISOString().slice(0,16):``}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
            <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
            <label style="display: flex; align-items: center; gap: var(--space-2xs); margin-top: var(--space-sm); font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="notify-newsletter-on-publish" ${p.notify_newsletter_on_publish?`checked`:``}>
              Enviar newsletter automaticamente ao publicar
            </label>
            <label style="display: flex; align-items: center; gap: var(--space-2xs); margin-top: var(--space-xs); font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="notify-push-on-publish" ${p.notify_push_on_publish?`checked`:``}>
              Enviar notificação Web Push aos leitores ao publicar
            </label>
            ${p.status===`scheduled`?`<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(p.scheduled_at).toLocaleString(`pt-BR`)}.</p>`:``}
          </div>
          
          <div style="display: flex; justify-content: flex-end; align-items: center; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg); flex-wrap: wrap;">
            <span id="autosave-status" style="font-size: 0.78rem; color: var(--text-muted); font-family: var(--font-ui); margin-right: auto;"></span>
            <a href="/admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
            <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
            ${p.status===`draft`?`<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>`:``}
          </div>
        </div>

        <div class="preview-pane">
          <div class="preview-header">
            <span class="preview-label">Preview em tempo real</span>
          </div>
          <article class="preview-poem">
            <h1 id="preview-title">${r(p.title||`Título da Obra`)}</h1>
            <div class="poem-meta preview-meta">
              <span id="preview-date">${p.published_at?new Date(p.published_at).toLocaleDateString(`pt-BR`):new Date().toLocaleDateString(`pt-BR`)}</span>
              <span id="preview-tags-container">${p.tags&&p.tags.length>0?`<span>•</span> <span>Sentimentos: ${r(p.tags.join(`, `))}</span>`:``}</span>
            </div>
            <div id="preview-dedication" class="poem-dedication" style="${p.dedication?``:`display: none;`}">
              <em>${r(p.dedication||``)}</em>
            </div>
            <div id="preview-content" class="poem-content">${ne(p.content||``)}</div>
            <details id="preview-author-note" class="poem-author-note" style="${p.author_note||p.written_location||p.written_at?``:`display: none;`}">
              <summary class="poem-author-note-summary">
                <span class="author-note-icon" aria-hidden="true">✍️</span>
                <span>Sobre este poema / Nota do autor</span>
              </summary>
              <div class="poem-author-note-body">
                <div id="preview-author-note-text" class="poem-author-note-text">${r(p.author_note||``)}</div>
                <p id="preview-written-meta" class="poem-written-meta" style="${p.written_location||p.written_at?``:`display: none;`}"></p>
              </div>
            </details>
          </article>
        </div>
      </div>
    </form>
  `);let _=document.getElementById(`poem-title`),v=document.getElementById(`poem-slug`),y=document.getElementById(`slug-error`),b=document.getElementById(`poem-content-input`),x=document.getElementById(`poem-excerpt`),S=document.getElementById(`poem-tags`),C=document.getElementById(`poem-status`),w=document.getElementById(`scheduled-at`),T=document.getElementById(`notify-newsletter-on-publish`),E=document.getElementById(`notify-push-on-publish`),D=document.getElementById(`poem-dedication`),O=document.getElementById(`poem-author-note`),k=document.getElementById(`poem-written-at`),A=document.getElementById(`poem-written-location`),j=document.getElementById(`poem-audio-file`),M=document.getElementById(`poem-audio-url`),N=document.getElementById(`audio-upload-status`),P=document.getElementById(`audio-preview-container`),F=document.getElementById(`audio-preview-player`),de=document.getElementById(`audio-file-name`),I=document.getElementById(`remove-audio-btn`),L=document.getElementById(`autosave-status`),R=document.getElementById(`draft-recovery-banner`),z=document.getElementById(`draft-banner-text`),fe=document.getElementById(`restore-draft-btn`),pe=document.getElementById(`discard-draft-btn`),B=document.getElementById(`preview-title`),me=document.getElementById(`preview-content`),V=document.getElementById(`preview-tags-container`),H=document.getElementById(`preview-dedication`),U=document.getElementById(`preview-author-note`),he=document.getElementById(`preview-author-note-text`),W=document.getElementById(`preview-written-meta`),ge=document.getElementById(`scheduling-fields`),_e=document.getElementById(`poem-metrics-stanzas-verses`),ve=document.getElementById(`poem-metrics-words`),ye=document.getElementById(`poem-metrics-reading-time`),G=!1,K=e=>{G&&(e.preventDefault(),e.returnValue=``)};window.addEventListener(`beforeunload`,K);let q=()=>{let e=t.querySelectorAll(`.poem-collection-checkbox:checked`),n=[],r=[];return e.forEach(e=>{n.push(e.value),e.dataset.slug&&r.push(e.dataset.slug)}),{ids:n,slugs:r}},J=()=>{let e=S.value.split(`,`).map(e=>e.trim()).filter(Boolean),{ids:t,slugs:n}=q();return{title:_.value,slug:v.value,content:b.value,excerpt:x.value,tags:e,collection_ids:t,collection_slugs:n,audio_url:M&&M.value.trim()||null,status:C.value,scheduled_at:w&&w.value?new Date(w.value).toISOString():null,notify_newsletter_on_publish:T?T.checked:!1,notify_push_on_publish:E?E.checked:!1,dedication:D&&D.value.trim()||null,author_note:O&&O.value.trim()||null,written_at:k&&k.value.trim()||null,written_location:A&&A.value.trim()||null}},be=()=>{let e=re(b.value);_e&&(_e.textContent=e.summary),ve&&(ve.textContent=`${e.words} ${e.words===1?`palavra`:`palavras`}`),ye&&(ye.textContent=e.readingLabel)},xe=()=>{me&&(me.innerHTML=e(ne(b.value))),be()},Se=()=>{let e=S.value.split(`,`).map(e=>e.trim()).filter(Boolean);if(V&&(V.replaceChildren(),e.length>0)){let t=document.createElement(`span`);t.textContent=`•`;let n=document.createElement(`span`);n.textContent=`Sentimentos: ${e.join(`, `)}`,V.append(t,` `,n)}},Y=()=>{let e=D?D.value.trim():``;H&&(e?(H.style.display=`block`,H.innerHTML=`<em>${r(e)}</em>`):(H.style.display=`none`,H.replaceChildren()));let t=O?O.value.trim():``,n=A?A.value.trim():``,i=k?k.value.trim():``;if(U){if(t||n||i){if(U.style.display=`block`,he&&(he.textContent=t),W){let e=[];n&&e.push(n),i&&e.push(i),e.length>0?(W.style.display=`block`,W.textContent=`Escrito em ${e.join(`, `)}.`):(W.style.display=`none`,W.textContent=``)}}else U.style.display=`none`}},X=async()=>{let e=v.value.trim();if(!e)return y&&(y.textContent=``,y.style.display=`none`),!0;let{hasConflict:t,conflictingPoem:n}=await se(e,c);return t?(y&&(y.textContent=`Este link (slug) já está em uso pelo poema "${n?.title||`Sem título`}". Escolha um slug diferente.`,y.style.display=`block`),!1):(y&&(y.textContent=``,y.style.display=`none`),!0)},Ce=f(()=>{if(ie(c,J()),G=!0,L){let e=new Date().toLocaleTimeString(`pt-BR`,{hour:`2-digit`,minute:`2-digit`,second:`2-digit`});L.textContent=`Salvo localmente às ${e}`}},800),Z=()=>{G=!0,Ce()};_.addEventListener(`input`,()=>{if(B&&(B.textContent=_.value||`Título da Obra`),!c||v.value===``){let e=_.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``);v.value=e}Z()}),v.addEventListener(`input`,Z),v.addEventListener(`blur`,X),b.addEventListener(`input`,()=>{Z()}),b.addEventListener(`input`,f(xe,200)),x.addEventListener(`input`,Z),S.addEventListener(`input`,Z),S.addEventListener(`input`,f(Se,250)),C.addEventListener(`change`,()=>{ge.style.display=C.value===`scheduled`?`block`:`none`,Z()}),w&&w.addEventListener(`change`,Z),T&&T.addEventListener(`change`,Z),E&&E.addEventListener(`change`,Z),D&&(D.addEventListener(`input`,Z),D.addEventListener(`input`,f(Y,250))),O&&(O.addEventListener(`input`,Z),O.addEventListener(`input`,f(Y,250))),k&&(k.addEventListener(`input`,Z),k.addEventListener(`input`,f(Y,250))),A&&(A.addEventListener(`input`,Z),A.addEventListener(`input`,f(Y,250))),t.querySelectorAll(`.poem-collection-checkbox`).forEach(e=>{e.addEventListener(`change`,Z)});let Q=ae(c);if(Q&&oe(p,Q)&&R&&z){let e=(Q.savedAt?new Date(Q.savedAt):new Date).toLocaleDateString(`pt-BR`,{day:`2-digit`,month:`2-digit`,year:`numeric`,hour:`2-digit`,minute:`2-digit`});z.replaceChildren();let n=document.createElement(`span`);n.textContent=`Rascunho local não salvo detectado (salvo em `;let r=document.createElement(`strong`);r.textContent=e;let i=document.createElement(`span`);i.textContent=`). Deseja restaurá-lo?`,z.append(n,r,i),R.style.display=`block`,fe&&fe.addEventListener(`click`,()=>{Q.title!==void 0&&(_.value=Q.title),Q.slug!==void 0&&(v.value=Q.slug),Q.content!==void 0&&(b.value=Q.content),Q.excerpt!==void 0&&(x.value=Q.excerpt),Q.tags!==void 0&&(S.value=Array.isArray(Q.tags)?Q.tags.join(`, `):Q.tags),Q.status!==void 0&&(C.value=Q.status,ge.style.display=C.value===`scheduled`?`block`:`none`),Q.scheduled_at&&w&&(w.value=Q.scheduled_at.slice(0,16)),T&&Q.notify_newsletter_on_publish!==void 0&&(T.checked=!!Q.notify_newsletter_on_publish),E&&Q.notify_push_on_publish!==void 0&&(E.checked=!!Q.notify_push_on_publish),D&&Q.dedication!==void 0&&(D.value=Q.dedication||``),O&&Q.author_note!==void 0&&(O.value=Q.author_note||``),k&&Q.written_at!==void 0&&(k.value=Q.written_at||``),A&&Q.written_location!==void 0&&(A.value=Q.written_location||``),Array.isArray(Q.collection_ids)&&t.querySelectorAll(`.poem-collection-checkbox`).forEach(e=>{e.checked=Q.collection_ids.includes(e.value)}),B&&(B.textContent=_.value||`Título da Obra`),xe(),Se(),Y(),be(),R.style.display=`none`,G=!0,L&&(L.textContent=`Rascunho local restaurado.`)}),pe&&pe.addEventListener(`click`,()=>{m(c),R.style.display=`none`,L&&(L.textContent=`Rascunho local descartado.`)})}j&&j.addEventListener(`change`,async e=>{let t=e.target.files?.[0];if(!t)return;let r=[`.mp3`,`.wav`,`.m4a`,`.aac`,`.ogg`],i=`.`+t.name.split(`.`).pop().toLowerCase();if(!r.includes(i)&&!t.type.startsWith(`audio/`))alert(`Formato de áudio inválido. Por favor selecione um arquivo .mp3, .wav, .m4a ou .aac.`),j.value=``;else if(t.size>10485760)alert(`O arquivo de áudio excede o tamanho máximo de 10MB.`),j.value=``;else{N.textContent=`Enviando áudio...`,N.style.color=`var(--accent-subtle)`,j.disabled=!0;try{let e=`narration_${Date.now()}${i}`,r=await o(`audios`,e,t),s=`audios`;if(r.error&&(console.warn(`Bucket audios retornou erro, tentando fallback para avatars:`,r.error),r=await o(`avatars`,e,t),s=`avatars`),r.error)throw r.error;let c=a(s,e);M.value=c,F.src=n(c),F.load(),de.textContent=t.name,P.style.display=`flex`,I.style.display=`inline-block`,N.textContent=`Áudio carregado!`,N.style.color=`var(--success)`,Z()}catch(e){console.error(`Erro no upload de áudio:`,e),N.textContent=`Erro no envio`,N.style.color=`var(--error)`,alert(`Erro ao enviar áudio: `+(e.message||`Falha de conexão`))}finally{j.disabled=!1,j.value=``,setTimeout(()=>{N&&(N.textContent=``)},3500)}}}),I&&I.addEventListener(`click`,()=>{confirm(`Deseja realmente remover o áudio desta poesia?`)&&(M.value=``,F.pause(),F.removeAttribute(`src`),F.load(),P.style.display=`none`,I.style.display=`none`,de.textContent=``,N.textContent=`Áudio removido.`,N.style.color=`var(--text-muted)`,Z(),setTimeout(()=>{N&&(N.textContent=``)},2500))}),document.getElementById(`editor-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`save-btn`);if(t.innerText=`Salvando...`,t.disabled=!0,!await X()){alert(`O slug informado já está em uso por outro poema. Por favor, escolha um slug único.`),t.innerText=`Gravar Alterações`,t.disabled=!1,v.focus();return}let{ids:n,slugs:r}=q(),a=J();if(a.collection_slugs=r,delete a.collection_ids,a.status===`scheduled`&&!a.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),t.innerText=`Gravar Alterações`,t.disabled=!1;return}a.status===`published`&&p.status!==`published`&&(a.published_at=new Date().toISOString());let o=c,s=null;if(c)a.updated_at=new Date().toISOString(),s=(await ee(`poems`,c,a)).error;else{a.created_at=new Date().toISOString(),a.updated_at=a.published_at||a.created_at;let e=await l(`poems`,a);s=e.error,e.data&&(o=e.data.id)}s?(console.error(s),alert(`Erro ao salvar: `+s.message),t.innerText=`Gravar Alterações`,t.disabled=!1):(o&&await ce(o,n),m(c),G=!1,window.removeEventListener(`beforeunload`,K),i(`/admin`))});let $=document.getElementById(`publish-btn`);if($){let e=!1;$.addEventListener(`click`,async t=>{if(t.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!await X()){alert(`O slug informado já está em uso por outro poema. Por favor, escolha um slug único.`),v.focus();return}if(!e){$.innerText=`Tem certeza? Clique para confirmar.`,$.style.background=`var(--error)`,e=!0,setTimeout(()=>{$&&!$.disabled&&($.innerText=`Publicar e Notificar Assinantes`,$.style.background=`var(--success)`,e=!1)},4e3);return}$.innerText=`Publicando...`,$.disabled=!0;let{ids:n,slugs:r}=q(),a=J();a.collection_slugs=r,delete a.collection_ids,a.status=`published`,a.published_at=new Date().toISOString(),a.updated_at=a.published_at;let o=c,s=null;if(c)s=(await ee(`poems`,c,a)).error;else{a.created_at=new Date().toISOString();let e=await l(`poems`,a);s=e.error,e.data&&(o=e.data.id)}if(s)console.error(s),alert(`Erro ao publicar: `+s.message),$.innerText=`Publicar e Notificar Assinantes`,$.disabled=!1;else{if(o&&await ce(o,n),m(c),G=!1,window.removeEventListener(`beforeunload`,K),o)try{$.innerText=`Enviando newsletter...`;let{data:e,error:t}=await d(`sendNewsletter`,{poemId:o});if(t)throw t;alert(`Obra publicada e newsletter enviada com sucesso para ${e.count} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}i(`/admin`)}})}}export{h as renderEditor};