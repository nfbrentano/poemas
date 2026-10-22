import{b as e}from"./index-DadoRXS-.js";import{s as t,t as n}from"./data-KIeY_Y8W.js";import{t as r}from"./debounce-C89F3TY9.js";async function i(a){a.innerHTML=`<div class="loading">Carregando histórico e dados...</div>`;try{let[o,s]=await Promise.all([t(`email_campaign_logs`,{orderBy:[`created_at`,`desc`]}),t(`poems`,{where:[[`status`,`==`,`published`]]})]);if(o.error)throw o.error;if(s.error)throw s.error;let c=o.data||[],l=s.data||[];l.sort((e,t)=>e.title.localeCompare(t.title)),c.forEach(e=>{let t=l.find(t=>t.id===e.poem_id);t&&!e.poems&&(e.poems={title:t.title}),e.created_at&&typeof e.created_at.toDate==`function`?e.created_at=e.created_at.toDate().toISOString():e.created_at&&e.created_at.seconds&&(e.created_at=new Date(e.created_at.seconds*1e3).toISOString()),e.sent_at&&typeof e.sent_at.toDate==`function`?e.sent_at=e.sent_at.toDate().toISOString():e.sent_at&&e.sent_at.seconds&&(e.sent_at=new Date(e.sent_at.seconds*1e3).toISOString())});let u=c.length,d=c.filter(e=>e.status===`success`).length,f=u>0?(d/u*100).toFixed(1):`100.0`,p=c[0]||null;a.innerHTML=`
        <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
          
          <!-- Header and Primary Action -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-xs);">
            <div>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">Gerencie os disparos de newsletters enviados aos seus leitores.</p>
            </div>
            <button id="open-dispatch-modal-btn" class="btn-primary" style="padding: 0.6rem 1.2rem; background: var(--accent-subtle); color: var(--bg-primary); font-weight: 500; font-size: 0.85rem; border-radius: 4px; display: inline-flex; align-items: center; gap: 8px; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
              <span style="font-size: 1.1rem; line-height: 1;">✉</span> Novo Disparo Manual
            </button>
          </div>

          <!-- KPIs Row -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-md);">
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Total de Campanhas</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${u}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Registros de disparos de newsletter</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Taxa de Sucesso</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${f}%</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${d} envios bem-sucedidos</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Último Envio</div>
              <div style="font-size: 1.1rem; font-family: var(--font-ui); color: var(--accent-subtle); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;" title="${p?.poems?.title||`-`}">
                ${p?.poems?.title||`Nenhum envio registrado`}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: var(--space-3xs);">
                ${p?(e=>{let t=new Date(e),n=new Date-t,r=Math.floor(n/6e4),i=Math.floor(n/36e5),a=Math.floor(n/864e5);return r<1?`Agora mesmo`:r<60?`Há ${r} min`:i<24?`Há ${i} h`:a===1?`Ontem`:a<30?`Há ${a} dias`:t.toLocaleDateString(`pt-BR`)})(p.created_at||p.sent_at):`Nenhum dado`}
              </div>
            </div>
          </div>
          
          <!-- Filters Toolbar -->
          <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; background: var(--bg-elevated); padding: var(--space-sm); border-radius: 6px; border: 1px solid var(--border-subtle);">
            <input type="text" id="email-search" placeholder="Buscar por obra ou detalhes..." style="flex-grow: 1; padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; min-width: 200px; font-size: 0.85rem;">
            
            <select id="email-filter-status" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
              <option value="all">Todos os Status</option>
              <option value="success">Sucesso</option>
              <option value="failed">Falhas / Erros</option>
            </select>
            
            <select id="email-sort" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
              <option value="newest">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="title-az">Obra (A-Z)</option>
              <option value="title-za">Obra (Z-A)</option>
            </select>
          </div>
          
          <!-- Table Results count -->
          <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
            <div>
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${c.length}</strong> envios
            </div>
          </div>
          
          <!-- Table -->
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 700px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Obra</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Tipo</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Data do Envio</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Status</th>
                  <th style="padding-bottom: var(--space-sm); font-weight: 500;">Detalhes</th>
                  <th style="padding-bottom: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
                </tr>
              </thead>
              <tbody id="email-tbody"></tbody>
            </table>
          </div>
        </div>

        <!-- MODAL: Novo Disparo Manual -->
        <div id="manual-dispatch-modal" class="modal">
          <div class="modal-content" style="max-width: 500px; display: flex; flex-direction: column; gap: var(--space-md);">
            <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); margin: 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs);">Novo Disparo de Newsletter</h3>
            <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin: 0;">
              Selecione uma obra publicada para enviar por e-mail a todos os assinantes ativos.
            </p>
            
            <form id="manual-dispatch-form" style="display: flex; flex-direction: column; gap: var(--space-md); margin-top: var(--space-2xs);">
              <div style="display: flex; flex-direction: column; gap: var(--space-3xs);">
                <label for="dispatch-poem-select" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Selecione a Obra</label>
                <select id="dispatch-poem-select" required style="padding: var(--space-xs); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.95rem; cursor: pointer; width: 100%;">
                  <option value="" disabled selected>Escolha um poema...</option>
                  ${l.map(t=>`<option value="${t.id}">${e(t.title)}</option>`).join(``)}
                </select>
                ${l.length===0?`<p style="color: var(--error); font-size: 0.8rem; margin: 4px 0 0 0;">Nenhuma obra publicada disponível.</p>`:``}
              </div>
              
              <div style="display: flex; flex-direction: column; gap: var(--space-3xs); margin-top: var(--space-sm);">
                <label for="dispatch-target-email" style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-secondary);">Destinatário Único (Opcional)</label>
                <input type="email" id="dispatch-target-email" placeholder="Deixe em branco para enviar a todos os assinantes" style="padding: var(--space-xs); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.95rem; width: 100%;">
                <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Se preenchido, envia apenas para este e-mail (ideal para testes).</p>
              </div>

              <div style="display: flex; align-items: flex-start; gap: var(--space-2xs); margin-top: var(--space-sm);">
                <input type="checkbox" id="dispatch-confirm-chk" style="margin-top: 3px; cursor: pointer;">
                <label for="dispatch-confirm-chk" style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; cursor: pointer; user-select: none;">
                  Confirmo que desejo enviar esta obra imediatamente (obrigatório se o destinatário não for preenchido).
                </label>
              </div>

              <div class="modal-actions" style="margin-top: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
                <button type="button" id="close-dispatch-modal-btn" class="btn-secondary" style="padding: 0.5rem 1rem; color: var(--text-secondary); font-size: 0.85rem; border: none; background: transparent; cursor: pointer;">Cancelar</button>
                <button type="submit" id="submit-dispatch-btn" class="btn-primary" ${l.length===0?`disabled`:``} style="padding: 0.5rem 1.2rem; background: var(--success); color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
                  Disparar Newsletter
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- MODAL: Detalhes do Log -->
        <div id="log-details-modal" class="modal">
          <div class="modal-content" style="max-width: 550px; display: flex; flex-direction: column; gap: var(--space-md);">
            <h3 style="font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); margin: 0; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2xs);">Detalhes da Campanha</h3>
            
            <div style="display: grid; gap: var(--space-sm); font-size: 0.9rem; margin-top: var(--space-2xs);">
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs);">
                <span style="color: var(--text-muted); font-weight: 500;">Obra:</span>
                <span id="detail-poem-title" style="color: var(--text-primary); font-weight: 500; font-family: var(--font-display); font-size: 1.1rem;">-</span>
              </div>
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs);">
                <span style="color: var(--text-muted); font-weight: 500;">Tipo:</span>
                <span id="detail-type" style="color: var(--text-primary); font-family: var(--font-ui);">-</span>
              </div>
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs); align-items: center;">
                <span style="color: var(--text-muted); font-weight: 500;">Status:</span>
                <span id="detail-status-badge">-</span>
              </div>
              <div style="display: grid; grid-template-columns: 100px 1fr; gap: var(--space-xs);">
                <span style="color: var(--text-muted); font-weight: 500;">Data/Hora:</span>
                <span id="detail-date" style="color: var(--text-secondary);">-</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-3xs); margin-top: var(--space-3xs);">
                <span style="color: var(--text-muted); font-weight: 500; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px;">Resposta / Detalhes do Servidor SMTP:</span>
                <pre id="detail-description" style="margin: 0; padding: var(--space-sm); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; font-family: monospace; font-size: 0.85rem; color: var(--text-primary); overflow-x: auto; white-space: pre-wrap; word-break: break-all; max-height: 180px; overflow-y: auto;"></pre>
              </div>
            </div>

            <div class="modal-actions" style="margin-top: var(--space-md); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
              <button type="button" id="close-details-modal-btn" class="btn-secondary" style="padding: 0.5rem 1rem; color: var(--text-secondary); font-size: 0.85rem; border: none; background: transparent; cursor: pointer;">Fechar</button>
              <button type="button" id="resend-from-modal-btn" class="btn-primary" style="padding: 0.5rem 1.2rem; background: var(--accent-subtle); color: var(--bg-primary); border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer;">Reenviar Agora</button>
            </div>
          </div>
        </div>
      `;let m=a.querySelector(`#email-tbody`),h=a.querySelector(`#results-count`),g=a.querySelector(`#manual-dispatch-modal`),_=a.querySelector(`#log-details-modal`);a.querySelector(`#open-dispatch-modal-btn`).addEventListener(`click`,()=>{g.style.display=`flex`,a.querySelector(`#manual-dispatch-form`).reset()}),a.querySelector(`#close-dispatch-modal-btn`).addEventListener(`click`,()=>{g.style.display=`none`}),a.querySelector(`#close-details-modal-btn`).addEventListener(`click`,()=>{_.style.display=`none`}),[g,_].forEach(e=>{e.addEventListener(`click`,t=>{t.target===e&&(e.style.display=`none`)})});let v=null,y=async(e,t,r)=>{if(!e){alert(`Não é possível reenviar: id da obra indisponível.`);return}if(!confirm(`Deseja reenviar a newsletter da obra "${t}" para todos os assinantes ativos?`))return;let o=r.innerText;r.disabled=!0,r.innerText=`Enviando...`,r.style.opacity=`0.5`;try{let{data:r,error:o}=await n(`sendNewsletter`,{poemId:e});if(o)throw o;alert(`Newsletter para "${t}" reenviada com sucesso para ${r?.count||0} assinantes!`),_.style.display=`none`,i(a)}catch(e){console.error(`Erro ao reenviar:`,e);let t=``;if(e.context&&typeof e.context.json==`function`)try{let n=await e.context.json();t=n.error||n.message||``}catch{}alert(`Erro ao enviar newsletter:\n${t||e.message||`Erro na Edge Function`}`),r.disabled=!1,r.innerText=o,r.style.opacity=`1`}};a.querySelector(`#resend-from-modal-btn`).addEventListener(`click`,async e=>{e.preventDefault(),v&&v.poem_id&&await y(v.poem_id,v.poems?.title||`Desconhecido`,e.currentTarget)});let b=t=>{h.innerText=t.length,t.length===0?m.innerHTML=`
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum registro de envio encontrado com os filtros aplicados.
              </td>
            </tr>
          `:(m.innerHTML=t.map(t=>{let n=t.poems?.title||`Desconhecido`,r=t.created_at||t.sent_at,i=r?new Date(r).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`}):`N/A`,a=t.status===`success`?`
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--success); box-shadow: 0 0 6px var(--success);"></span>
                Sucesso
              </span>
            `:`
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--error); box-shadow: 0 0 6px var(--error);"></span>
                Falha
              </span>
            `,o=`<span style="padding: 0.2rem 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">${t.type===`individual`?`Individual`:t.type===`newsletter`?`Newsletter`:`Desconhecido`}</span>`,s=t.details?t.details.length>50?`${e(t.details.slice(0,48))}...`:e(t.details):`-`;return`
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.15rem; color: var(--text-primary); font-weight: 400;">${e(n)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui);">${o}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.85rem;">${i}</td>
              <td style="padding: var(--space-md) 0;">${a}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${s}</td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <button class="view-details-btn" data-id="${t.id}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; margin-right: var(--space-sm); transition: color var(--transition-fast); text-decoration: underline; padding: 0;">Detalhes</button>
                <button class="resend-log-btn" data-poem-id="${t.poem_id||``}" data-title="${e(n)}" style="color: var(--accent-subtle); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; transition: opacity var(--transition-fast); text-decoration: none; padding: 0; font-weight: 500;">Reenviar</button>
              </td>
            </tr>
          `}).join(``),m.querySelectorAll(`tr`).forEach(e=>{e.style.transition=`background-color var(--transition-fast)`,e.addEventListener(`mouseenter`,()=>{e.style.backgroundColor=`var(--bg-secondary)`}),e.addEventListener(`mouseleave`,()=>{e.style.backgroundColor=`transparent`})}),m.querySelectorAll(`.view-details-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let n=e.dataset.id,r=t.find(e=>e.id===n);if(!r)return;v=r,a.querySelector(`#detail-poem-title`).innerText=r.poems?.title||`Desconhecido`;let i=r.type===`individual`?`Individual${r.target_email?` (${r.target_email})`:``}`:r.type===`newsletter`?`Newsletter`:`Desconhecido`;a.querySelector(`#detail-type`).innerText=i;let o=r.created_at||r.sent_at;a.querySelector(`#detail-date`).innerText=o?new Date(o).toLocaleString(`pt-BR`,{dateStyle:`long`,timeStyle:`medium`}):`Desconhecida`;let s=r.status===`success`;a.querySelector(`#detail-status-badge`).innerHTML=s?`<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase;">Sucesso</span>`:`<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase;">Falha</span>`,a.querySelector(`#detail-description`).innerText=r.details||`Nenhum detalhe adicional disponível.`;let c=a.querySelector(`#resend-from-modal-btn`);r.poem_id?(c.style.display=`inline-block`,c.innerText=s?`Disparar Novamente`:`Tentar Reenviar`):c.style.display=`none`,_.style.display=`flex`})}),m.querySelectorAll(`.resend-log-btn`).forEach(e=>{e.addEventListener(`click`,t=>{t.preventDefault();let n=e.dataset.poemId,r=e.dataset.title;y(n,r,e)})}))},x=a.querySelector(`#email-search`),S=a.querySelector(`#email-filter-status`),C=a.querySelector(`#email-sort`),w=()=>{let e=x.value.toLowerCase().trim(),t=S.value,n=C.value,r=[...c];e&&(r=r.filter(t=>{let n=(t.poems?.title||``).toLowerCase(),r=(t.details||``).toLowerCase();return n.includes(e)||r.includes(e)})),t!==`all`&&(r=t===`success`?r.filter(e=>e.status===`success`):r.filter(e=>e.status!==`success`)),n===`newest`?r.sort((e,t)=>new Date(t.created_at||t.sent_at)-new Date(e.created_at||e.sent_at)):n===`oldest`?r.sort((e,t)=>new Date(e.created_at||e.sent_at)-new Date(t.created_at||t.sent_at)):n===`title-az`?r.sort((e,t)=>{let n=e.poems?.title||``,r=t.poems?.title||``;return n.localeCompare(r)}):n===`title-za`&&r.sort((e,t)=>{let n=e.poems?.title||``;return(t.poems?.title||``).localeCompare(n)}),b(r)};x.addEventListener(`input`,r(w,150)),S.addEventListener(`change`,w),C.addEventListener(`change`,w),w(),a.querySelector(`#manual-dispatch-form`).addEventListener(`submit`,async e=>{e.preventDefault();let t=a.querySelector(`#dispatch-poem-select`),r=t.value,o=t.options[t.selectedIndex].text,s=a.querySelector(`#dispatch-target-email`),c=s?s.value.trim():``,l=a.querySelector(`#dispatch-confirm-chk`);if(!c&&!l.checked){alert(`Você precisa confirmar o envio para todos os assinantes caso não preencha um e-mail de destino.`);return}let u=a.querySelector(`#submit-dispatch-btn`),d=a.querySelector(`#close-dispatch-modal-btn`);u.disabled=!0,u.innerText=`Enviando...`,t.disabled=!0,s&&(s.disabled=!0),l.disabled=!0,d.style.display=`none`;try{let e={poemId:r};c&&(e.targetEmail=c);let{data:t,error:s}=await n(`sendNewsletter`,e);if(s)throw s;alert(c?`Newsletter para "${o}" enviada com sucesso para o e-mail: ${c}!`:`Newsletter para "${o}" enviada com sucesso para ${t?.count||0} assinantes!`),t?.logError&&(console.error(`Log error:`,t.logError),alert(`ATENÇÃO: Os emails foram enviados, mas houve um erro ao salvar o histórico no banco de dados.\nErro: ${t.logError.message||JSON.stringify(t.logError)}`)),g.style.display=`none`,i(a)}catch(e){console.error(`Erro na Edge Function:`,e);let n=``;if(e.context&&typeof e.context.json==`function`)try{let t=await e.context.json();n=t.error||t.message||``}catch{}alert(`Erro ao disparar newsletter:\n${n||e.message||`Erro inesperado`}`),u.disabled=!1,u.innerText=`Disparar Newsletter`,t.disabled=!1,s&&(s.disabled=!1),l.disabled=!1,d.style.display=`inline-block`}})}catch(e){console.error(e),a.innerHTML=`<div class="error">Erro ao carregar dados do histórico: ${e.message}</div>`}}export{i as renderEmailHistory};