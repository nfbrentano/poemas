const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/analytics-CcBEg3t1.js","assets/supabase-C7rZ412s.js"])))=>i.map(i=>d[i]);
import{t as e}from"./supabase-C7rZ412s.js";import{n as t,r as n}from"./index-Wu1speV6.js";function r(e,t){let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}}var i={meta:{title:`Dashboard Admin`},async render(r,i){let{data:{session:a}}=await e.auth.getSession();if(!a){t(`/login`);return}let o=new URLSearchParams(window.location.search),s=o.get(`view`)||`list`;r.innerHTML=`
      <div class="admin-layout" style="max-width: var(--container-admin); margin: 0 auto;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary);">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-sm); align-items: center; font-family: var(--font-ui);">
            <a href="/poemas/admin?view=list" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">Obras</a>
            <a href="/poemas/admin?view=analytics" data-link 
               style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">
              Estatísticas
            </a>
            <a href="/poemas/admin?view=emails" data-link 
               style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">
              Histórico de Emails
            </a>
            <a href="/poemas/admin?view=subscribers" data-link 
               style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">
              Assinantes
            </a>
            <a href="/poemas/admin?view=comments" data-link 
               style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--text-secondary); transition: color var(--transition-fast);">
              Comentários
            </a>
            <a href="/poemas/admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast);">Nova Obra</a>

            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `,document.getElementById(`logout-btn`).addEventListener(`click`,async()=>{await e.auth.signOut(),t(`/login`)});let c=document.getElementById(`admin-content`);if(s===`list`)await this.renderList(c);else if(s===`editor`)await this.renderEditor(c,o.get(`id`));else if(s===`analytics`){let{default:e}=await n(async()=>{let{default:e}=await import(`./analytics-CcBEg3t1.js`);return{default:e}},__vite__mapDeps([0,1]));await e.render(c)}else s===`emails`?await this.renderEmailHistory(c):s===`subscribers`?await this.renderSubscribers(c):s===`comments`&&await this.renderComments(c)},async renderList(n){n.innerHTML=`<div class="loading">Carregando poemas...</div>`;let{data:r,error:i}=await e.from(`poems`).select(`id, title, slug, status, published_at, scheduled_at`).order(`created_at`,{ascending:!1});if(i){n.innerHTML=`<div class="error">Erro ao carregar. ${i.message}</div>`;return}if(r.length===0){n.innerHTML=`<p>Nenhum poema encontrado.</p>`;return}n.innerHTML=`
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
    `,n.querySelectorAll(`.delete-btn`).forEach(n=>{let r=!1;n.addEventListener(`click`,async i=>{if(i.preventDefault(),!r){let e=n.innerText;n.innerText=`Tem certeza?`,n.style.color=`#fff`,n.style.backgroundColor=`var(--error)`,n.style.padding=`0.2rem 0.5rem`,n.style.borderRadius=`2px`,n.style.opacity=`1`,r=!0,setTimeout(()=>{n&&!n.disabled&&(n.innerText=e,n.style.color=`var(--error)`,n.style.backgroundColor=`transparent`,n.style.padding=`0`,n.style.opacity=`0.7`,r=!1)},3e3);return}n.innerText=`Excluindo...`,n.disabled=!0;let a=i.target.dataset.id,{error:o}=await e.from(`poems`).delete().eq(`id`,a);if(o){console.error(o),alert(`Erro ao excluir: `+o.message),n.innerText=`Excluir`,n.disabled=!1;return}t(`/admin`)})})},async renderEditor(n,i){let a={title:``,slug:``,content:``,excerpt:``,tags:[],status:`draft`};if(i){n.innerHTML=`<div class="loading">Carregando poema...</div>`;let{data:t}=await e.from(`poems`).select(`*`).eq(`id`,i).single();t&&(a=t,a.content=(a.content||``).replace(/<br\s*[\/]?>/gi,`
`).replace(/<\/p>\s*<p>/gi,`

`).replace(/<\/?(p|pre|div|span|strong|em|b|i)[^>]*>/gi,``).trim())}n.innerHTML=`
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
                <label style="display: block; margin-bottom: var(--space-3xs); color: var(--text-secondary); font-size: 0.85rem; letter-spacing: 1px; text-transform: uppercase;">Sentimentos (vírgula)</label>
                <input type="text" id="poem-tags" value="${a.tags?a.tags.join(`, `):``}" placeholder="Ex: Amor, Saudade, Melancolia" style="width: 100%; padding: var(--space-xs) 0; border: none; border-bottom: 1px solid var(--border-strong); background: transparent; border-radius: 0;">
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
                <span id="preview-tags-container">${a.tags&&a.tags.length>0?`<span>•</span> <span>Sentimentos: ${a.tags.join(`, `)}</span>`:``}</span>
              </div>
              <div id="preview-content" class="poem-content">${a.content||``}</div>
            </article>
          </div>
        </div>
      </form>
    `;let o=document.getElementById(`poem-title`),s=document.getElementById(`poem-slug`);o.addEventListener(`input`,()=>{document.getElementById(`preview-title`).innerText=o.value||`Título da Obra`,(!i||s.value===``)&&(s.value=o.value.toLowerCase().trim().replace(/[áàãâä]/g,`a`).replace(/[éèêë]/g,`e`).replace(/[íìîï]/g,`i`).replace(/[óòõôö]/g,`o`).replace(/[úùûü]/g,`u`).replace(/ç/g,`c`).replace(/[^a-z0-9\s-]/g,``).replace(/\s+/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``))});let c=document.getElementById(`poem-content-input`),l=document.getElementById(`preview-content`),u=document.getElementById(`poem-tags`),d=document.getElementById(`poem-status`),f=document.getElementById(`scheduling-fields`);c.addEventListener(`input`,r(()=>{l.innerHTML=c.value},250)),u.addEventListener(`input`,r(()=>{let e=u.value.split(`,`).map(e=>e.trim()).filter(e=>e);document.getElementById(`preview-tags-container`).innerHTML=e.length>0?`<span>•</span> <span>Sentimentos: ${e.join(`, `)}</span>`:``},250)),d.addEventListener(`change`,()=>{f.style.display=d.value===`scheduled`?`block`:`none`});let p=()=>{let e=u.value.split(`,`).map(e=>e.trim()).filter(e=>e),t=document.getElementById(`scheduled-at`);return{title:document.getElementById(`poem-title`).value,slug:document.getElementById(`poem-slug`).value,content:document.getElementById(`poem-content-input`).value,excerpt:document.getElementById(`poem-excerpt`).value,tags:e,status:document.getElementById(`poem-status`).value,scheduled_at:t.value?new Date(t.value).toISOString():null}};document.getElementById(`editor-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`save-btn`);r.innerText=`Salvando...`,r.disabled=!0;let o=p();if(o.status===`scheduled`&&!o.scheduled_at){alert(`Por favor, defina uma data para o agendamento.`),r.innerText=`Gravar Alterações`,r.disabled=!1;return}o.status===`published`&&a.status!==`published`&&(o.published_at=new Date().toISOString());let s=null;if(s=i?(await e.from(`poems`).update(o).eq(`id`,i)).error:(await e.from(`poems`).insert([o])).error,s){console.error(s),alert(`Erro ao salvar: `+s.message),r.innerText=`Gravar Alterações`,r.disabled=!1;return}t(`/admin`)});let m=document.getElementById(`publish-btn`);if(m){let n=!1;m.addEventListener(`click`,async r=>{if(r.preventDefault(),!document.getElementById(`editor-form`).reportValidity())return;if(!n){m.innerText=`Tem certeza? Clique para confirmar.`,m.style.background=`var(--error)`,n=!0,setTimeout(()=>{m&&!m.disabled&&(m.innerText=`Publicar e Notificar Assinantes`,m.style.background=`var(--success)`,n=!1)},4e3);return}m.innerText=`Publicando...`,m.disabled=!0;let a=p();a.status=`published`,a.published_at=new Date().toISOString();let o=i,s=null;if(i)s=(await e.from(`poems`).update(a).eq(`id`,i)).error;else{let t=await e.from(`poems`).insert([a]).select().single();s=t.error,t.data&&(o=t.data.id)}if(s){console.error(s),alert(`Erro ao publicar: `+s.message),m.innerText=`Publicar e Notificar Assinantes`,m.disabled=!1;return}if(o)try{m.innerText=`Enviando newsletter...`;let{data:t,error:n}=await e.functions.invoke(`send-newsletter`,{body:{poemId:o}});if(n)throw n;alert(`Obra publicada e newsletter enviada com sucesso para ${t.count} assinantes!`)}catch(e){console.error(`Newsletter erro:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Obra publicada, mas houve um erro ao enviar a newsletter:\n${t||e.message||`Erro na Edge Function`}`)}t(`/admin`)})}},async renderEmailHistory(t){t.innerHTML=`<div class="loading">Carregando histórico...</div>`;let{data:n,error:r}=await e.from(`email_campaign_logs`).select(`id, sent_at, status, details, poems(title)`).order(`sent_at`,{ascending:!1});if(r){t.innerHTML=`<div class="error">Erro ao carregar: ${r.message}</div>`;return}if(!n||n.length===0){t.innerHTML=`<p>Nenhum envio de email registrado.</p>`;return}t.innerHTML=`
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Data do Envio</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          ${n.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-display);">${e.poems?.title||`Desconhecido`}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">
          ${new Date(e.sent_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`})}
        </td>
        <td style="padding: var(--space-md) 0;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${e.status===`success`?`var(--success)`:`var(--error)`}; color: ${e.status===`success`?`var(--success)`:`var(--error)`}; text-transform: uppercase; letter-spacing: 1px;">
            ${e.status}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted);">
          ${e.details||`-`}
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `},async renderSubscribers(t){t.innerHTML=`<div class="loading">Carregando assinantes...</div>`;let{data:n,error:r}=await e.from(`subscribers`).select(`email, active, created_at, unsubscribed_at`).order(`created_at`,{ascending:!1});if(r){t.innerHTML=`<div class="error">Erro ao carregar: ${r.message}</div>`;return}if(!n||n.length===0){t.innerHTML=`<p>Nenhum assinante encontrado.</p>`;return}let i=n.filter(e=>e.active).length,a=n.length,o=new Date;o.setDate(o.getDate()-30);let s=n.filter(e=>new Date(e.created_at)>o).length,c=n.filter(e=>!e.active&&e.unsubscribed_at&&new Date(e.unsubscribed_at)>o).length;t.innerHTML=`
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Total de Assinantes</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${a}</div>
          <div style="font-size: 0.8rem; color: var(--success);">${i} ativos</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Novos (30 dias)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">+${s}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Crescimento constante</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Taxa de Evasão (Churn)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${(c/(i||1)*100).toFixed(1)}%</div>
          <div style="font-size: 0.8rem; color: var(--error);">${c} saídas no mês</div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-bottom: var(--space-lg);">
        <button id="export-csv-btn" class="btn-secondary" style="font-size: 0.8rem;">Exportar CSV</button>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">E-mail</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Inscrição</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Cancelamento</th>
          </tr>
        </thead>
        <tbody>
          ${n.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui);">${e.email}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">
          ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}
        </td>
        <td style="padding: var(--space-md) 0;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${e.active?`var(--success)`:`var(--error)`}; color: ${e.active?`var(--success)`:`var(--error)`}; text-transform: uppercase; letter-spacing: 1px;">
            ${e.active?`Ativo`:`Inativo`}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted);">
          ${e.unsubscribed_at?new Date(e.unsubscribed_at).toLocaleDateString(`pt-BR`):`-`}
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `,t.querySelector(`#export-csv-btn`)?.addEventListener(`click`,()=>{let e=`data:text/csv;charset=utf-8,Email,Ativo,Data Inscrição,Data Saída
`+n.map(e=>`${e.email},${e.active},${e.created_at},${e.unsubscribed_at||``}`).join(`
`),t=encodeURI(e),r=document.createElement(`a`);r.setAttribute(`href`,t),r.setAttribute(`download`,`assinantes_${new Date().toISOString().split(`T`)[0]}.csv`),document.body.appendChild(r),r.click(),document.body.removeChild(r)})},async renderComments(t){t.innerHTML=`<div class="loading">Carregando comentários...</div>`;let{data:n,error:r}=await e.from(`poem_comments`).select(`id, author_name, content, approved, created_at, poems(title)`).order(`created_at`,{ascending:!1});if(r){t.innerHTML=`<div class="error">Erro ao carregar: ${r.message}</div>`;return}if(!n||n.length===0){t.innerHTML=`<p>Nenhum comentário encontrado.</p>`;return}t.innerHTML=`
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Data</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Autor e Comentário</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
            <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${n.map(e=>`
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
          ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}
        </td>
        <td style="padding: var(--space-md) 0;">
          <div style="font-family: var(--font-display); font-size: 1.1rem;">${e.author_name}</div>
          <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">Em: ${e.poems?.title||`Obra removida`}</div>
          <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${e.content}</div>
        </td>
        <td style="padding: var(--space-md) 0; vertical-align: middle;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${e.approved?`var(--success)`:`var(--accent-subtle)`}; color: ${e.approved?`var(--success)`:`var(--accent-subtle)`}; text-transform: uppercase; letter-spacing: 1px;">
            ${e.approved?`Aprovado`:`Pendente`}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; text-align: right; vertical-align: middle;">
          ${e.approved?``:`<button class="approve-btn" data-id="${e.id}" style="color: var(--success); margin-right: 1rem;">Aprovar</button>`}
          <button class="delete-comment-btn" data-id="${e.id}" style="color: var(--error);">Excluir</button>
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `,t.querySelectorAll(`.approve-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{let r=n.dataset.id,{error:i}=await e.from(`poem_comments`).update({approved:!0}).eq(`id`,r);i?alert(`Erro ao aprovar: `+i.message):this.renderComments(t)})}),t.querySelectorAll(`.delete-comment-btn`).forEach(n=>{n.addEventListener(`click`,async()=>{if(!confirm(`Excluir este comentário?`))return;let r=n.dataset.id,{error:i}=await e.from(`poem_comments`).delete().eq(`id`,r);i?alert(`Erro ao excluir: `+i.message):this.renderComments(t)})})}};export{i as default};