import{a as e,t}from"./html-DUzinkfe.js";import{n,s as r,u as i}from"./data-BxfxRve7.js";function a(e,t){let n=new Map;return(t||[]).forEach(e=>{e&&(e.id&&n.set(String(e.id),e),e.slug&&n.set(String(e.slug),e))}),(e||[]).map(e=>{if(!e)return e;let t=e.poem_id||e.poemId,r=t?n.get(String(t)):null,i=e.created_at;return i&&typeof i.toDate==`function`?i=i.toDate().toISOString():i&&i.seconds&&(i=new Date(i.seconds*1e3).toISOString()),{...e,created_at:i,poems:r?{id:r.id,title:r.title,slug:r.slug}:e.poems||null}})}function o(e,n=`/`){if(e?.poems?.title){let r=t(e.poems.title);return e.poems.slug?`Em: <a href="${`${n.endsWith(`/`)?n:`${n}/`}poema/${encodeURIComponent(e.poems.slug)}`}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-subtle); text-decoration: underline;" title="Ver poema publicado">${r}</a>`:`Em: ${r}`}return`Em: <span style="font-style: italic; color: var(--text-muted);">Obra removida</span>`}async function s(c){c.innerHTML=`<div class="loading">Carregando comentários...</div>`;try{let[l,u]=await Promise.all([r(`poem_comments`,{orderBy:[`created_at`,`desc`]}),r(`poems`)]);if(l.error){c.innerHTML=e(`<div class="error">Erro ao carregar: ${t(l.error.message)}</div>`);return}let d=l.data||[],f=u.data||[];if(d.length===0){c.innerHTML=`<p>Nenhum comentário encontrado.</p>`;return}let p=a(d,f).map(e=>`
        <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
          <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); width: 150px;">
            ${new Date(e.created_at).toLocaleDateString(`pt-BR`)}
          </td>
          <td style="padding: var(--space-md) 0;">
            <div style="font-family: var(--font-display); font-size: 1.1rem;">${t(e.author_name)}</div>
            <div style="font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${o(e)}</div>
            <div style="font-family: var(--font-body); line-height: 1.4; color: var(--text-primary); max-width: 500px;">${t(e.content)}</div>
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
      `).join(``);c.innerHTML=e(`
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
            ${p}
          </tbody>
        </table>
      `),c.querySelectorAll(`.approve-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{let t=e.dataset.id,{error:n}=await i(`poem_comments`,t,{approved:!0});n?alert(`Erro ao aprovar: `+n.message):s(c)})}),c.querySelectorAll(`.delete-comment-btn`).forEach(e=>{e.addEventListener(`click`,async()=>{if(!confirm(`Excluir este comentário?`))return;let t=e.dataset.id,{error:r}=await n(`poem_comments`,t);r?alert(`Erro ao excluir: `+r.message):s(c)})})}catch(n){c.innerHTML=e(`<div class="error">Erro ao carregar: ${t(n.message)}</div>`)}}export{o as n,s as renderComments,a as t};