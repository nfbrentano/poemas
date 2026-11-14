import{a as e,i as t,r as n,t as r}from"./html-DUzinkfe.js";import{n as i}from"./index-BNfYksz6.js";import{a,d as o,i as s,o as c,t as l,u}from"./data-BxfxRve7.js";import{t as d}from"./debounce-C89F3TY9.js";async function f(f,p){let m={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`,audio_url:``};if(p){f.innerHTML=`<div class="loading">Carregando poema...</div>`;let{data:e}=await s(`poems`,p);e&&(m=e,m.content=t(m.content))}f.innerHTML=e(`
      <form id="editor-form" style="font-family: var(--font-ui);">
        <div class="editor-layout">
          <div class="editor-pane">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
                <input type="text" id="poem-title" value="${r(m.title)}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
                <input type="text" id="poem-slug" value="${r(m.slug)}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${r(m.content)}</textarea>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
              <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${r(m.excerpt||``)}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
                <input type="text" id="poem-tags" value="${r(m.tags?m.tags.join(`, `):``)}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
                <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <option value="draft" ${m.status===`draft`?`selected`:``}>Rascunho</option>
                  <option value="scheduled" ${m.status===`scheduled`?`selected`:``}>Agendado</option>
                  <option value="published" ${m.status===`published`?`selected`:``}>Publicado</option>
                </select>
              </div>
            </div>

            <!-- Audio Upload Section -->
            <div class="admin-audio-card">
              <div class="admin-audio-header">
                <label style="display: flex; align-items: center; gap: 6px; margin: 0; color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
                  <span>📎</span> Áudio da Narração (Opcional)
                </label>
                <span id="audio-upload-status" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
              </div>
              
              <input type="hidden" id="poem-audio-url" value="${r(m.audio_url||``)}">
              
              <div style="display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; margin-top: var(--space-2xs);">
                <label class="btn-secondary" style="cursor: pointer; padding: 0.5rem 1rem; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-strong); border-radius: 2px;">
                  <span>📁 Escolher Arquivo</span>
                  <input type="file" id="poem-audio-file" accept=".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/x-m4a,audio/mp4,audio/aac" style="display: none;">
                </label>
                <button type="button" id="remove-audio-btn" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem; color: var(--error); border-color: var(--error); display: ${m.audio_url?`inline-block`:`none`};">
                  Remover Áudio
                </button>
              </div>
              
              <p class="field-help" style="font-size: 0.78rem; color: var(--text-muted); margin-top: var(--space-2xs);">
                Formatos aceitos: MP3, WAV, M4A — Máx 10MB.
              </p>

              <div id="audio-preview-container" class="admin-audio-preview" style="display: ${m.audio_url?`flex`:`none`};">
                <div style="display: flex; align-items: center; gap: var(--space-xs); flex: 1; min-width: 200px;">
                  <span style="font-size: 0.85rem; color: var(--accent-subtle);">▶</span>
                  <audio id="audio-preview-player" controls src="${n(m.audio_url||``)}" style="height: 32px; width: 100%; max-width: 400px;"></audio>
                </div>
                <span id="audio-file-name" style="font-size: 0.75rem; color: var(--text-muted); word-break: break-all;">
                  ${m.audio_url?`Áudio vinculado`:``}
                </span>
              </div>
            </div>

            <div id="scheduling-fields" style="margin-top: var(--space-md); ${m.status===`scheduled`?``:`display: none;`}">
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
              <input type="datetime-local" id="scheduled-at" value="${m.scheduled_at?new Date(m.scheduled_at).toISOString().slice(0,16):``}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
              <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
              <label style="display: flex; align-items: center; gap: var(--space-2xs); margin-top: var(--space-sm); font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
                <input type="checkbox" id="notify-newsletter-on-publish" ${m.notify_newsletter_on_publish?`checked`:``}>
                Enviar newsletter automaticamente ao publicar
              </label>
              ${m.status===`scheduled`?`<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(m.scheduled_at).toLocaleString(`pt-BR`)}.</p>`:``}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
              <a href="/admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
              <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
              ${m.status===`draft`?`<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>`:``}
            </div>
          </div>

          <div class="preview-pane">
            <div class="preview-header">
              <span class="preview-label">Preview em tempo real</span>
            </div>
            <article class="preview-poem">
              <h1 id="preview-title">${r(m.title||`Título da Obra`)}</h1>
              <div class="poem-meta preview-meta">
                <span id="preview-date">${m.published_at?new Date(m.published_at).toLocaleDateString(`pt-BR`):new Date().toLocaleDateString(`pt-BR`)}</span>
                <span id="preview-tags-container">${m.tags&&m.tags.length>0?`<span>•</span> <span>Sentimentos: ${r(m.tags.join(`, `))}</span>`:``}</span>
              </div>
              <div id="preview-content" class="poem-content">${r(m.content||``)}</div>
            </article>
          </div>
        </div>
      </form>
    `);let h=document.getElementById(`poem-title`),g=document.getElementById(`poem-slug`);h.addEventListener(`input`,()=>{if(document.getElementById(`preview-title`).textContent=h.value||`Título da Obra`,!p||g.value===``){let e=h.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``);g.value=e}});let _=document.getElementById(`poem-content-input`),v=document.getElementById(`preview-content`),y=document.getElementById(`poem-tags`),b=document.getElementById(`poem-status`),x=document.getElementById(`scheduling-fields`);_.addEventListener(`input`,d(()=>{v.textContent=_.value},250)),y.addEventListener(`input`,d(()=>{let e=y.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`preview-tags-container`);if(t&&(t.replaceChildren(),e.length>0)){let n=document.createElement(`span`);n.textContent=`•`;let r=document.createElement(`span`);r.textContent=`Sentimentos: ${e.join(`, `)}`,t.append(n,` `,r)}},250)),b.addEventListener(`change`,()=>{x.style.display=b.value===`scheduled`?`block`:`none`});let S=document.getElementById(`poem-audio-file`),C=document.getElementById(`poem-audio-url`),w=document.getElementById(`audio-upload-status`),T=document.getElementById(`audio-preview-container`),E=document.getElementById(`audio-preview-player`),D=document.getElementById(`audio-file-name`),O=document.getElementById(`remove-audio-btn`);S&&S.addEventListener(`change`,async e=>{let t=e.target.files?.[0];if(!t)return;let r=[`.mp3`,`.wav`,`.m4a`,`.aac`,`.ogg`],i=`.`+t.name.split(`.`).pop().toLowerCase();if(!r.includes(i)&&!t.type.startsWith(`audio/`))alert(`Formato de áudio inválido. Por favor selecione um arquivo .mp3, .wav, .m4a ou .aac.`),S.value=``;else if(t.size>10485760)alert(`O arquivo de áudio excede o tamanho máximo de 10MB.`),S.value=``;else{w.textContent=`Enviando áudio...`,w.style.color=`var(--accent-subtle)`,S.disabled=!0;try{let e=`narration_${Date.now()}${i}`,r=await o(`audios`,e,t),s=`audios`;if(r.error&&(console.warn(`Bucket audios retornou erro, tentando fallback para avatars:`,r.error),r=await o(`avatars`,e,t),s=`avatars`),r.error)throw r.error;let c=a(s,e);C.value=c,E.src=n(c),E.load(),D.textContent=t.name,T.style.display=`flex`,O.style.display=`inline-block`,w.textContent=`Áudio carregado!`,w.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de áudio:`,e),w.textContent=`Erro no envio`,w.style.color=`var(--error)`,alert(`Erro ao enviar áudio: `+(e.message||`Falha de conexão`))}finally{S.disabled=!1,S.value=``,setTimeout(()=>{w&&(w.textContent=``)},3500)}}}),O&&O.addEventListener(`click`,()=>{confirm(`Deseja realmente remover o áudio desta poesia?`)&&(C.value=``,E.pause(),E.removeAttribute(`src`),E.load(),T.style.display=`none`,O.style.display=`none`,D.textContent=``,w.textContent=`Áudio removido.`,w.style.color=`var(--text-muted)`,setTimeout(()=>{w&&(w.textContent=``)},2500))});let k=()=>{let e=y.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`scheduled-at`),n=document.getElementById(`notify-newsletter-on-publish`);return{title:document.getElementById(`poem-title`).value,slug:document.getElementById(`poem-slug`).value,content:document.getElementById(`poem-content-input`).value,excerpt:document.getElementById(`poem-excerpt`).value,tags:e,audio_url:C&&C.value.trim()||null,status:document.getElementById(`poem-status`).value,scheduled_at:t&&t.value?new Date(t.value).toISOString():null,notify_newsletter_on_publish:n?n.checked:!1}};document.getElementById(`editor-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`save-btn`);t.innerText=`Salvando...`,t.disabled=!0;let n=k();if(n.status===`scheduled`&&!n.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),t.innerText=`Gravar Alterações`,t.disabled=!1;return}n.status===`published`&&m.status!==`published`&&(n.published_at=new Date().toISOString());let r=null;p?(n.updated_at=new Date().toISOString(),r=(await u(`poems`,p,n)).error):(n.created_at=new Date().toISOString(),n.updated_at=n.published_at||n.created_at,r=(await c(`poems`,n)).error),r?(console.error(r),alert(`Erro ao salvar: `+r.message),t.innerText=`Gravar Alterações`,t.disabled=!1):i(`/admin`)});let A=document.getElementById(`publish-btn`);if(A){let e=!1;A.addEventListener(`click`,async t=>{if(t.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!e){A.innerText=`Tem certeza? Clique para confirmar.`,A.style.background=`var(--error)`,e=!0,setTimeout(()=>{A&&!A.disabled&&(A.innerText=`Publicar e Notificar Assinantes`,A.style.background=`var(--success)`,e=!1)},4e3);return}A.innerText=`Publicando...`,A.disabled=!0;let n=k();n.status=`published`,n.published_at=new Date().toISOString(),n.updated_at=n.published_at;let r=p,a=null;if(p)a=(await u(`poems`,p,n)).error;else{n.created_at=new Date().toISOString();let e=await c(`poems`,n);a=e.error,e.data&&(r=e.data.id)}if(a)console.error(a),alert(`Erro ao publicar: `+a.message),A.innerText=`Publicar e Notificar Assinantes`,A.disabled=!1;else{if(r)try{A.innerText=`Enviando newsletter...`;let{data:e,error:t}=await l(`sendNewsletter`,{poemId:r});if(t)throw t;alert(`Obra publicada e newsletter enviada com sucesso para ${e.count} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}i(`/admin`)}})}}export{f as renderEditor};