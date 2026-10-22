import{l as e,o as t,s as n}from"./data-KIeY_Y8W.js";async function r(i){i.innerHTML=`<div class="loading">Carregando assinantes...</div>`;let{data:a,error:o}=await n(`subscribers`,{orderBy:[`created_at`,`desc`]});if(o){i.innerHTML=`<div class="error">Erro ao carregar: ${o.message}</div>`;return}if(!a||a.length===0){i.innerHTML=`<p>Nenhum assinante encontrado.</p>`;return}let s=a.filter(e=>e.active).length,c=a.length,l=new Date;l.setDate(l.getDate()-30);let u=a.filter(e=>new Date(e.created_at)>l).length,d=a.filter(e=>!e.active&&e.unsubscribed_at&&new Date(e.unsubscribed_at)>l).length;i.innerHTML=`
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Total de Assinantes</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${c}</div>
          <div style="font-size: 0.8rem; color: var(--success);">${s} ativos</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Novos (30 dias)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">+${u}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Crescimento constante</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Taxa de Evasão (Churn)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${(d/(s||1)*100).toFixed(1)}%</div>
          <div style="font-size: 0.8rem; color: var(--error);">${d} saídas no mês</div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-bottom: var(--space-lg);">
        <button id="add-subscriber-btn" class="btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; background: var(--accent-subtle); color: var(--bg-primary); border: none; border-radius: 2px; cursor: pointer;">Cadastrar Manualmente</button>
        <button id="export-csv-btn" class="btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; cursor: pointer;">Exportar CSV</button>
      </div>

      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">E-mail</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Inscrição</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500;">Cancelamento</th>
            <th style="padding-bottom: var(--space-sm); font-weight: 500; text-align: right;">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${a.map(e=>`
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
        <td style="padding: var(--space-md) 0; text-align: right;">
          <button class="toggle-subscriber-btn" data-id="${e.id}" data-active="${e.active}" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: transparent; border: 1px solid var(--border-strong); color: var(--text-primary); border-radius: 2px; cursor: pointer; transition: background var(--transition-fast);">
            ${e.active?`Inativar`:`Ativar`}
          </button>
        </td>
      </tr>
    `).join(``)}
        </tbody>
      </table>
    `,i.querySelector(`#export-csv-btn`)?.addEventListener(`click`,()=>{let e=`data:text/csv;charset=utf-8,Email,Ativo,Data Inscrição,Data Saída
`+a.map(e=>`${e.email},${e.active},${e.created_at},${e.unsubscribed_at||``}`).join(`
`),t=encodeURI(e),n=document.createElement(`a`);n.setAttribute(`href`,t),n.setAttribute(`download`,`assinantes_${new Date().toISOString().split(`T`)[0]}.csv`),document.body.appendChild(n),n.click(),document.body.removeChild(n)}),i.querySelector(`#add-subscriber-btn`)?.addEventListener(`click`,async()=>{let e=prompt(`Digite o e-mail do assinante para cadastrar:`);if(!e||!e.includes(`@`)){e!==null&&alert(`E-mail inválido.`);return}if(a.find(t=>t.email===e)){alert(`Este e-mail já está cadastrado.`);return}let n={email:e,active:!0,created_at:new Date().toISOString()},{error:o}=await t(`subscribers`,n);o?alert(`Erro ao cadastrar assinante: `+o.message):r(i)}),i.querySelectorAll(`.toggle-subscriber-btn`).forEach(t=>{t.addEventListener(`click`,async()=>{let n=t.dataset.id,a=t.dataset.active===`true`,o=!a;t.disabled=!0,t.innerText=`Processando...`;let s={active:o};s.unsubscribed_at=o?null:new Date().toISOString();let{error:c}=await e(`subscribers`,n,s);c?(alert(`Erro ao atualizar status: `+c.message),t.disabled=!1,t.innerText=a?`Inativar`:`Ativar`):r(i)})})}export{r as renderSubscribers};