import{b as e}from"./index-fdOadyoa.js";import{l as t,n,s as r}from"./data-BTLoZLnW.js";function i(e,t){let n=new Map;return(t||[]).forEach(e=>{e&&(e.id&&n.set(String(e.id),e),e.slug&&n.set(String(e.slug),e))}),(e||[]).map(e=>{if(!e)return e;let t=e.poem_id||e.poemId,r=t?n.get(String(t)):null,i=e.created_at;return i&&typeof i.toDate==`function`?i=i.toDate().toISOString():i&&i.seconds&&(i=new Date(i.seconds*1e3).toISOString()),{...e,created_at:i,poems:r?{id:r.id,title:r.title,slug:r.slug}:e.poems||null}})}function a(t,n=`/`){if(t?.poems?.title){let r=e(t.poems.title);return t.poems.slug?`Em: <a href="${`${n.endsWith(`/`)?n:`${n}/`}poema/${encodeURIComponent(t.poems.slug)}`}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-subtle); text-decoration: underline;" title="Ver poema publicado">${r}</a>`:`Em: ${r}`}return`Em: <span style="font-style: italic; color: var(--text-muted);">Obra removida</span>`}async function o(s){s.innerHTML=`<div class="loading">Carregando comentários...</div>`;try{let[c,l]=await Promise.all([r(`poem_comments`,{orderBy:[`created_at`,`desc`]}),r(`poems`)]);if(c.error){s.innerHTML=`<div class="error">Erro ao carregar: ${c.error.message}</div>`;return}let u=c.data||[],d=l.data||[];if(u.length===0){s.innerHTML=`<p>Nenhum comentário encontrado.</p>`;return}s.innerHTML=`
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
            ${i(u,d).map(t=>`
        <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
          <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
            ${new Date(t.created_at).toLocaleDateString(`pt-BR`)}
          </td>
          <td style="padding: var(--space-md) 0;">
            <div style="font-family: var(--font-display); font-size: 1.1rem;">${e(t.author_name)}</div>
            <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${a(t)}</div>
            <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${e(t.content)}</div>
          </td>
          <td style="padding: var(--space-md) 0; vertical-align: middle;">
            <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${t.approved?`var(--success)`:`var(--accent-subtle)`}; color: ${t.approved?`var(--success)`:`var(--accent-subtle)`}; text-transform: uppercase; letter-spacing: 1px;">
              ${t.approved?`Aprovado`:`Pendente`}
            </span>
          </td>
          <td style="padding: var(--space-md) 0; text-align: right; vertical-align: middle;">
            ${t.approved?``:`<button class="approve-btn" data-id="${t.id}" style="color: var(--success); margin-right: 1rem;">Aprovar</button>`}
            <button class="delete-comment-btn" data-id="${t.id}" style="color: var(--error);">Excluir</button>
          </td>
        </tr>
      `).join(``)}
          </tbody>
        </table>
      `,s.querySelectorAll(`.approve-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let n=e.dataset.id,{error:r}=await t(`poem_comments`,n,{approved:!0});r?alert(`Erro ao aprovar: `+r.message):o(s)})}),s.querySelectorAll(`.delete-comment-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(!confirm(`Excluir este comentário?`))return;let t=e.dataset.id,{error:r}=await n(`poem_comments`,t);r?alert(`Erro ao excluir: `+r.message):o(s)})})}catch(e){s.innerHTML=`<div class="error">Erro ao carregar: ${e.message}</div>`}}export{a as n,o as renderComments,i as t};