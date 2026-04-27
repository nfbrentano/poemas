const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/analytics-uAFDV_x2.js","assets/index-HEwGkHwt.js","assets/index-Dz_Kb28S.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,t as n}from"./index-HEwGkHwt.js";function r(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}}var i={meta:{title:`Dashboard Admin`},async render(r,i){let{data:{session:a}}=await e.auth.getSession();if(!a){n(`/login`);return}let o=new URLSearchParams(window.location.search),s=o.get(`view`)||`list`;r.innerHTML=`
      <div class="admin-layout" style="max-width: var(--container-admin); margin: 0 auto;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary);">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-sm); align-items: center; font-family: var(--font-ui);">
            <a href="/poemas/admin?view=list" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">Obras</a>
            <a href="/poemas/admin?view=analytics" data-link 
               style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">
              Estatísticas
            </a>
            <a href="/poemas/admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast);">Nova Obra</a>

            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `,document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await e.auth.signOut(),n(`/login`)});let c=document.getElementById(`admin-content`);if(s===`list`)await this.renderList(c);else if(s===`editor`)await this.renderEditor(c,o.get(`id`));else if(s===`analytics`){let{default:e}=await t(async()=>{let{default:e}=await import(`./analytics-uAFDV_x2.js`);return{default:e}},__vite__mapDeps([0,1,2]));await e.render(c)}},async renderList(t){t.innerHTML=`<div class="loading">Carregando poemas...</div>`;let{data:r,error:i}=await e.from(`poems`).select(`id, title, slug, status, published_at, scheduled_at`).order(`created_at`,{ascending:!1});if(i){t.innerHTML=`<div class="error">Erro ao carregar. ${i.message}</div>`;return}if(r.length===0){t.innerHTML=`<p>Nenhum poema encontrado.</p>`;return}t.innerHTML=`
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Link</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Estado</th>
            <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${r.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.2rem;">${e.title}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">${e.slug}</td>
        <td style="padding: var(--space-md) 0;">
          ${e.status===`scheduled`?`
            <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid var(--accent-subtle); color: var(--accent-subtle); text-transform: uppercase; letter-spacing: 1px; white-space: nowrap;">
              Agendado • ${new Date(e.scheduled_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}
            </span>
          `:`
            <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${e.status===`published`?`var(--success)`:`var(--border-strong)`}; color: ${e.status===`published`?`var(--success)`:`var(--text-muted)`}; text-transform: uppercase; letter-spacing: 1px;">
              ${e.status===`published`?`Publicado`:`Rascunho`}
            </span>
          `}
        </td>
        <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
          <a href="/poemas/admin?view=editor&id=${e.id}" data-link style="color: var(--text-primary); margin-right: var(--space-md); font-size: 0.85rem; transition: color var(--transition-fast);">Editar</a>
          <button class="delete-btn" data-id="${e.id}" style="color: var(--error); font-size: 0.85rem; opacity: 0.7; transition: opacity var(--transition-fast);">Excluir</button>
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.delete-btn`).forEach(t=>{let r=!1;t.addEventListener(`click`,async i=>{if(i.preventDefault(),!r){let e=t.innerText;t.innerText=`Tem certeza?`,t.style.color=`#fff`,t.style.backgroundColor=`var(--error)`,t.style.padding=`0.2rem 0.5rem`,t.style.borderRadius=`2px`,t.style.opacity=`1`,r=!0,setTimeout(()=>{t&&!t.disabled&&(t.innerText=e,t.style.color=`var(--error)`,t.style.backgroundColor=`transparent`,t.style.padding=`0`,t.style.opacity=`0.7`,r=!1)},3e3);return}t.innerText=`Excluindo...`,t.disabled=!0;let a=i.target.dataset.id,{error:o}=await e.from(`poems`).delete().eq(`id`,a);if(o){console.error(o),alert(`Erro ao excluir: `+o.message),t.innerText=`Excluir`,t.disabled=!1;return}n(`/admin`)})})},async renderEditor(t,i){let a={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`};if(i){t.innerHTML=`<div class="loading">Carregando poema...</div>`;let{data:n}=await e.from(`poems`).select(`*`).eq(`id`,i).single();n&&(a=n,a.content=(a.content||``).replace(/<br\s*[\/]?>/gi,`
`).replace(/<\/p>\s*<p>/gi,`

`).replace(/<\/?(p|pre|div|span|strong|em|b|i)[^>]*>/gi,``).trim())}t.innerHTML=`
      <form id="editor-form" style="font-family: var(--font-ui);">
        <div class="editor-layout">
          <div class="editor-pane">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Título</label>
                <input type="text" id="poem-title" value="${a.title}" required style="width: 100%; font-size: 1.5rem; font-family: var(--font-display); padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Link (Slug)</label>
                <input type="text" id="poem-slug" value="${a.slug}" required style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-muted);">
              </div>
            </div>
            
            <div style="margin-top: var(--space-md);">
              <label style="display: block; margin-bottom: var(--space-xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Conteúdo (HTML)</label>
              <textarea id="poem-content-input" required style="width: 100%; min-height: 500px; font-family: var(--font-body); font-size: 1.1rem; line-height: 1.6; padding: var(--space-md); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; color: var(--text-primary); resize: vertical;">${a.content}</textarea>
            </div>
            
            <div>
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Resumo / Trecho</label>
              <textarea id="poem-excerpt" style="width: 100%; min-height: 80px; font-family: var(--font-body); font-size: 1rem; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); border-radius: 2px; resize: vertical;">${a.excerpt||``}</textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Tags (vírgula)</label>
                <input type="text" id="poem-tags" value="${a.tags?a.tags.join(`, `):``}" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
              </div>
              <div>
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Estado</label>
                <select id="poem-status" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0; color: var(--text-primary);">
                  <option value="draft" ${a.status===`draft`?`selected`:``}>Rascunho</option>
                  <option value="scheduled" ${a.status===`scheduled`?`selected`:``}>Agendado</option>
                  <option value="published" ${a.status===`published`?`selected`:``}>Publicado</option>
                </select>
              </div>
            </div>

            <div id="scheduling-fields" style="margin-top: var(--space-md); ${a.status===`scheduled`?``:`display: none;`}">
              <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Data de Publicação</label>
              <input type="datetime-local" id="scheduled-at" value="${a.scheduled_at?new Date(a.scheduled_at).toISOString().slice(0,16):``}" style="width: 100%; padding: var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 2px;">
              <p class="field-help">Se definido e o status for "Agendado", o poema será publicado automaticamente.</p>
              ${a.status===`scheduled`?`<p class="field-help" style="color: var(--accent-subtle); font-style: italic;">Este poema será publicado automaticamente em ${new Date(a.scheduled_at).toLocaleString(`pt-BR`)}.</p>`:``}
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: var(--space-md); margin-top: var(--space-lg); border-top: 1px solid var(--border-subtle); padding-top: var(--space-lg);">
              <a href="/poemas/admin" data-link class="btn-secondary" style="padding: 0.75rem 1.5rem; color: var(--text-secondary);">Cancelar</a>
              <button type="submit" class="btn-primary" id="save-btn" style="padding: 0.75rem 1.5rem; background: var(--border-strong); color: var(--text-primary); border-radius: 2px;">Gravar Alterações</button>
              ${a.status===`draft`?`<button type="button" class="btn-primary" id="publish-btn" style="padding: 0.75rem 1.5rem; background: var(--success); color: #fff; border-radius: 2px; font-weight: 500;">Publicar Agora</button>`:``}
            </div>
          </div>

          <div class="preview-pane">
            <div class="preview-header">
              <span class="preview-label">Preview em tempo real</span>
            </div>
            <article class="preview-poem">
              <h1 id="preview-title">${a.title||`Título da Obra`}</h1>
              <div class="poem-meta preview-meta">
                <span id="preview-date">${a.published_at?new Date(a.published_at).toLocaleDateString(`pt-BR`):new Date().toLocaleDateString(`pt-BR`)}</span>
                <span id="preview-tags-container">${a.tags&&a.tags.length>0?`<span>•</span> <span>${a.tags.join(`, `)}</span>`:``}</span>
              </div>
              <div id="preview-content" class="poem-content">${a.content||``}</div>
            </article>
          </div>
        </div>
      </form>
    `;let o=document.getElementById(`poem-title`),s=document.getElementById(`poem-slug`);o.addEventListener(`input`,()=>{document.getElementById(`preview-title`).innerText=o.value||`Título da Obra`,(!i||s.value===``)&&(s.value=o.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``))});let c=document.getElementById(`poem-content-input`),l=document.getElementById(`preview-content`),u=document.getElementById(`poem-tags`),d=document.getElementById(`poem-status`),f=document.getElementById(`scheduling-fields`);c.addEventListener(`input`,r(()=>{l.innerHTML=c.value},250)),u.addEventListener(`input`,r(()=>{let e=u.value.split(`,`).map(e=>e.trim()).filter(e=>e);document.getElementById(`preview-tags-container`).innerHTML=e.length>0?`<span>•</span> <span>${e.join(`, `)}</span>`:``},250)),d.addEventListener(`change`,()=>{f.style.display=d.value===`scheduled`?`block`:`none`});let p=()=>{let e=u.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`scheduled-at`);return{title:document.getElementById(`poem-title`).value,slug:document.getElementById(`poem-slug`).value,content:document.getElementById(`poem-content-input`).value,excerpt:document.getElementById(`poem-excerpt`).value,tags:e,status:document.getElementById(`poem-status`).value,scheduled_at:t.value?new Date(t.value).toISOString():null}};document.getElementById(`editor-form`).addEventListener(`submit`,async t=>{t.preventDefault();let r=document.getElementById(`save-btn`);r.innerText=`Salvando...`,r.disabled=!0;let o=p();if(o.status===`scheduled`&&!o.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),r.innerText=`Gravar Alterações`,r.disabled=!1;return}o.status===`published`&&a.status!==`published`&&(o.published_at=new Date().toISOString());let s=null;if(s=i?(await e.from(`poems`).update(o).eq(`id`,i)).error:(await e.from(`poems`).insert([o])).error,s){console.error(s),alert(`Erro ao salvar: `+s.message),r.innerText=`Gravar Alterações`,r.disabled=!1;return}n(`/admin`)});let m=document.getElementById(`publish-btn`);if(m){let t=!1;m.addEventListener(`click`,async r=>{if(r.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!t){m.innerText=`Tem certeza? Clique para confirmar.`,m.style.background=`var(--error)`,t=!0,setTimeout(()=>{m&&!m.disabled&&(m.innerText=`Publicar e Notificar Assinantes`,m.style.background=`var(--success)`,t=!1)},4e3);return}m.innerText=`Publicando...`,m.disabled=!0;let a=p();a.status=`published`,a.published_at=new Date().toISOString();let o=i,s=null;if(i)s=(await e.from(`poems`).update(a).eq(`id`,i)).error;else{let t=await e.from(`poems`).insert([a]).select().single();s=t.error,t.data&&(o=t.data.id)}if(s){console.error(s),alert(`Erro ao publicar: `+s.message),m.innerText=`Publicar e Notificar Assinantes`,m.disabled=!1;return}if(o)try{let{data:t,error:r}=await e.from(`subscribers`).select(`email`).eq(`active`,!0);if(r)throw r;if(!t||t.length===0){alert(`Obra publicada, mas não há assinantes ativos para notificar.`),n(`/admin`);return}let i=`${window.location.origin+`/poemas/`.replace(/\/$/,``)}/poema/${a.slug}`,o=a.content.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/\n\n/g,`</p><p style="margin: 1.5em 0; line-height: 2;">`).replace(/\n/g,`<br>`),s=`
              <div style="font-family: Georgia, serif; color: #e2e2e2; background-color: #050505; padding: 40px 20px;">
                <h1 style="text-align: center; font-size: 32px; font-weight: 400;">${a.title}</h1>
                <div style="max-width: 600px; margin: 40px auto; font-size: 18px; line-height: 2;">
                  ${o}
                </div>
                <div style="text-align: center; margin-top: 60px;">
                  <a href="${i}" style="padding: 12px 24px; background: #e2e2e2; color: #050505; text-decoration: none; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Ler no site</a>
                </div>
                <p style="text-align: center; margin-top: 60px; color: #666; font-style: italic;">Natanael Brentano</p>
              </div>
            `,c=0;for(let e of t){c++,m.innerText=`Enviando (${c}/${t.length})...`;let n=await fetch(`https://api.emailjs.com/api/v1.0/email/send`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({service_id:`service_i2oc0um`,template_id:`template_140jswa`,user_id:`MiJ3eP6LS3i2FSf5k`,template_params:{title:a.title,to_email:e.email,message:s}})});if(!n.ok){let t=await n.text();console.error(`Erro ao enviar para ${e.email}:`,t)}}alert(`Obra publicada e ${c} e-mails processados com sucesso!`)}catch(e){console.error(`Newsletter erro:`,e),alert(`Obra publicada, mas houve um erro ao processar a newsletter: ${e.message}`)}n(`/admin`)})}}};export{i as default};