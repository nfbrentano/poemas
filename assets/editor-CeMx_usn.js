import{C as e,S as t,b as n,n as r}from"./index-3IBTfuIH.js";import{a as i,l as a,o,s,t as c,u as l}from"./data-C7fAQ5he.js";import{t as u}from"./debounce-C89F3TY9.js";async function d(d,f){let p={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`,audio_url:``};if(f){d.innerHTML=`<div class="loading">Carregando poema...</div>`;let{data:t}=await s(`poems`,{where:[[`id`,`==`,f]],single:!0});t&&(p=t,p.content=e(p.content))}d.innerHTML=`
      <form id="editor-form" style="font-family: var(--font-ui);">
        <div class="editor-layout">
          <div class="editor-pane">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
                <input type="text" id="poem-title" value="${n(p.title)}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
                <input type="text" id="poem-slug" value="${n(p.slug)}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${n(p.content)}</textarea>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
              <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${n(p.excerpt||``)}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
                <input type="text" id="poem-tags" value="${n(p.tags?p.tags.join(`, `):``)}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
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

            <!-- Audio Upload Section -->
            <div class="admin-audio-card">
              <div class="admin-audio-header">
                <label style="display: flex; align-items: center; gap: 6px; margin: 0; color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">
                  <span>📎</span> Áudio da Narração (Opcional)
                </label>
                <span id="audio-upload-status" style="font-size: 0.8rem; font-family: var(--font-ui);"></span>
              </div>
              
              <input type="hidden" id="poem-audio-url" value="${n(p.audio_url||``)}">
              
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
                  <audio id="audio-preview-player" controls src="${t(p.audio_url||``)}" style="height: 32px; width: 100%; max-width: 400px;"></audio>
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
              ${p.status===`scheduled`?`<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(p.scheduled_at).toLocaleString(`pt-BR`)}.</p>`:``}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
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
              <h1 id="preview-title">${n(p.title||`Título da Obra`)}</h1>
              <div class="poem-meta preview-meta">
                <span id="preview-date">${p.published_at?new Date(p.published_at).toLocaleDateString(`pt-BR`):new Date().toLocaleDateString(`pt-BR`)}</span>
                <span id="preview-tags-container">${p.tags&&p.tags.length>0?`<span>•</span> <span>Sentimentos: ${n(p.tags.join(`, `))}</span>`:``}</span>
              </div>
              <div id="preview-content" class="poem-content">${n(p.content||``)}</div>
            </article>
          </div>
        </div>
      </form>
    `;let m=document.getElementById(`poem-title`),h=document.getElementById(`poem-slug`);m.addEventListener(`input`,()=>{if(document.getElementById(`preview-title`).textContent=m.value||`Título da Obra`,!f||h.value===``){let e=m.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``);h.value=e}});let g=document.getElementById(`poem-content-input`),_=document.getElementById(`preview-content`),v=document.getElementById(`poem-tags`),y=document.getElementById(`poem-status`),b=document.getElementById(`scheduling-fields`);g.addEventListener(`input`,u(()=>{_.textContent=g.value},250)),v.addEventListener(`input`,u(()=>{let e=v.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`preview-tags-container`);if(t&&(t.replaceChildren(),e.length>0)){let n=document.createElement(`span`);n.textContent=`•`;let r=document.createElement(`span`);r.textContent=`Sentimentos: ${e.join(`, `)}`,t.append(n,` `,r)}},250)),y.addEventListener(`change`,()=>{b.style.display=y.value===`scheduled`?`block`:`none`});let x=document.getElementById(`poem-audio-file`),S=document.getElementById(`poem-audio-url`),C=document.getElementById(`audio-upload-status`),w=document.getElementById(`audio-preview-container`),T=document.getElementById(`audio-preview-player`),E=document.getElementById(`audio-file-name`),D=document.getElementById(`remove-audio-btn`);x&&x.addEventListener(`change`,async e=>{let n=e.target.files?.[0];if(!n)return;let r=[`.mp3`,`.wav`,`.m4a`,`.aac`,`.ogg`],a=`.`+n.name.split(`.`).pop().toLowerCase();if(!r.includes(a)&&!n.type.startsWith(`audio/`))alert(`Formato de áudio inválido. Por favor selecione um arquivo .mp3, .wav, .m4a ou .aac.`),x.value=``;else if({".m4a":`audio/mp4`,".mp3":`audio/mpeg`,".wav":`audio/wav`,".aac":`audio/aac`,".ogg":`audio/ogg`}[a]||n.type,n.size>10485760)alert(`O arquivo de áudio excede o tamanho máximo de 10MB.`),x.value=``;else{C.textContent=`Enviando áudio...`,C.style.color=`var(--accent-subtle)`,x.disabled=!0;try{let e=`narration_${Date.now()}${a}`,r=await l(`audios`,e,n),o=`audios`;if(r.error&&(console.warn(`Bucket audios retornou erro, tentando fallback para avatars:`,r.error),r=await l(`avatars`,e,n),o=`avatars`),r.error)throw r.error;let s=i(o,e);S.value=s,T.src=t(s),T.load(),E.textContent=n.name,w.style.display=`flex`,D.style.display=`inline-block`,C.textContent=`Áudio carregado!`,C.style.color=`var(--success)`}catch(e){console.error(`Erro no upload de áudio:`,e),C.textContent=`Erro no envio`,C.style.color=`var(--error)`,alert(`Erro ao enviar áudio: `+(e.message||`Falha de conexão`))}finally{x.disabled=!1,x.value=``,setTimeout(()=>{C&&(C.textContent=``)},3500)}}}),D&&D.addEventListener(`click`,()=>{confirm(`Deseja realmente remover o áudio desta poesia?`)&&(S.value=``,T.pause(),T.removeAttribute(`src`),T.load(),w.style.display=`none`,D.style.display=`none`,E.textContent=``,C.textContent=`Áudio removido.`,C.style.color=`var(--text-muted)`,setTimeout(()=>{C&&(C.textContent=``)},2500))});let O=()=>{let e=v.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`scheduled-at`);return{title:document.getElementById(`poem-title`).value,slug:document.getElementById(`poem-slug`).value,content:document.getElementById(`poem-content-input`).value,excerpt:document.getElementById(`poem-excerpt`).value,tags:e,audio_url:S&&S.value.trim()||null,status:document.getElementById(`poem-status`).value,scheduled_at:t.value?new Date(t.value).toISOString():null}};document.getElementById(`editor-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=document.getElementById(`save-btn`);t.innerText=`Salvando...`,t.disabled=!0;let n=O();if(n.status===`scheduled`&&!n.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),t.innerText=`Gravar Alterações`,t.disabled=!1;return}n.status===`published`&&p.status!==`published`&&(n.published_at=new Date().toISOString());let i=null;f?(n.updated_at=new Date().toISOString(),i=(await a(`poems`,f,n)).error):(n.created_at=new Date().toISOString(),n.updated_at=n.published_at||n.created_at,i=(await o(`poems`,[n])).error),i?(console.error(i),alert(`Erro ao salvar: `+i.message),t.innerText=`Gravar Alterações`,t.disabled=!1):r(`/admin`)});let k=document.getElementById(`publish-btn`);if(k){let e=!1;k.addEventListener(`click`,async t=>{if(t.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!e){k.innerText=`Tem certeza? Clique para confirmar.`,k.style.background=`var(--error)`,e=!0,setTimeout(()=>{k&&!k.disabled&&(k.innerText=`Publicar e Notificar Assinantes`,k.style.background=`var(--success)`,e=!1)},4e3);return}k.innerText=`Publicando...`,k.disabled=!0;let n=O();n.status=`published`,n.published_at=new Date().toISOString(),n.updated_at=n.published_at;let i=f,s=null;if(f)s=(await a(`poems`,f,n)).error;else{n.created_at=new Date().toISOString();let e=await o(`poems`,n);s=e.error,e.data&&(i=e.data.id)}if(s)console.error(s),alert(`Erro ao publicar: `+s.message),k.innerText=`Publicar e Notificar Assinantes`,k.disabled=!1;else{if(i)try{k.innerText=`Enviando newsletter...`;let{data:e,error:t}=await c(`sendNewsletter`,{poemId:i});if(t)throw t;alert(`Obra publicada e newsletter enviada com sucesso para ${e.count} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}r(`/admin`)}})}}export{d as renderEditor};