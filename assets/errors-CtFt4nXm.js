import{a as e,t}from"./html-DUzinkfe.js";import{n,s as r,u as i}from"./data-BxfxRve7.js";import{t as a}from"./debounce-C89F3TY9.js";function o(e={}){let t=e.created_at||`N/A`,n=e.source||`frontend`,r=e.category||`runtime`,i=e.severity||`error`,a=e.status||`open`,o=e.route_or_task||`/`,s=e.fingerprint||`N/A`,c=e.user_agent||`N/A`,l=e.message||`Sem mensagem`,u=e.stack||`Sem stack trace disponível`,d=typeof e.context==`string`?e.context:JSON.stringify(e.context||{},null,2);return[`### Diagnóstico de Erro (${i.toUpperCase()})`,`- **ID:** \`${e.id||`N/A`}\``,`- **Mensagem:** ${l}`,`- **Origem:** \`${n}\` · **Categoria:** \`${r}\` · **Status:** \`${a}\``,`- **Rota / Tarefa:** \`${o}\``,`- **Fingerprint:** \`${s}\``,`- **Data/Hora:** ${t}`,`- **User-Agent:** \`${c}\``,``,`#### Contexto`,"```json",d,"```",``,`#### Stack Trace`,"```text",u,"```"].join(`
`)}function s(e){return e?typeof e==`string`?e:typeof e.toDate==`function`?e.toDate().toISOString():typeof e.seconds==`number`?new Date(e.seconds*1e3).toISOString():String(e):``}async function c(c){c.innerHTML=e(`<div class="loading">Carregando observabilidade de erros...</div>`);try{let l=await r(`error_logs`,{orderBy:[`created_at`,`desc`]});if(l.error)throw l.error;let u=(l.data||[]).map(e=>({...e,created_at:s(e.created_at),status:e.status||`open`,source:e.source||`frontend`,category:e.category||`runtime`,severity:e.severity||`error`}));u.sort((e,t)=>(t.created_at||``).localeCompare(e.created_at||``));let d=e=>{let t=Date.now();return{openCount:e.filter(e=>e.status===`open`).length,resolvedOrIgnoredCount:e.filter(e=>e.status===`resolved`||e.status===`ignored`).length,last24hCount:e.filter(e=>{let n=new Date(e.created_at).getTime();return!isNaN(n)&&t-n<=864e5}).length,last7dCount:e.filter(e=>{let n=new Date(e.created_at).getTime();return!isNaN(n)&&t-n<=6048e5}).length,frontendCount:e.filter(e=>e.source===`frontend`).length,backendCount:e.filter(e=>String(e.source).startsWith(`backend`)).length}},f=d(u);c.innerHTML=e(`
      <style>
        .error-table-wrapper {
          overflow: auto;
          max-inline-size: 100%;
          max-block-size: min(640px, 80vh);
          container-type: inline-size;
          border: 1px solid var(--border-subtle);
          border-radius: 6px;
          background: var(--bg-elevated);
        }
        .error-logs-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }
        .error-logs-table thead {
          position: sticky;
          inset-block-start: 0;
          z-index: 1;
          background: var(--bg-elevated);
        }
        .error-logs-table tbody th {
          position: sticky;
          inset-inline-start: 0;
          background: var(--bg-elevated);
          font-weight: 500;
        }
        @container (width < 600px) {
          .error-logs-table,
          .error-logs-table thead,
          .error-logs-table tbody,
          .error-logs-table tr,
          .error-logs-table th,
          .error-logs-table td {
            display: block;
          }
          .error-logs-table thead {
            display: none;
          }
          .error-logs-table tr {
            margin-block-end: 1rem;
            border: 1px solid var(--border-strong);
            border-radius: 4px;
            padding: var(--space-xs);
          }
          .error-logs-table tbody th {
            position: sticky;
            inset-block-start: 0;
            z-index: 2;
            background: var(--bg-secondary);
          }
          .error-logs-table {
            --label-2: "Origem";
            --label-3: "Rota / Tarefa";
            --label-4: "Severidade";
            --label-5: "Status";
            --label-6: "Data";
            --label-7: "Ações";
          }
          .error-logs-table td:nth-child(2)::before { content: var(--label-2) ": "; font-weight: 600; color: var(--text-muted); }
          .error-logs-table td:nth-child(3)::before { content: var(--label-3) ": "; font-weight: 600; color: var(--text-muted); }
          .error-logs-table td:nth-child(4)::before { content: var(--label-4) ": "; font-weight: 600; color: var(--text-muted); }
          .error-logs-table td:nth-child(5)::before { content: var(--label-5) ": "; font-weight: 600; color: var(--text-muted); }
          .error-logs-table td:nth-child(6)::before { content: var(--label-6) ": "; font-weight: 600; color: var(--text-muted); }
          .error-logs-table td:nth-child(7)::before { content: var(--label-7) ": "; font-weight: 600; color: var(--text-muted); }
        }
        #error-details-dialog {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border-strong);
          border-radius: 6px;
          padding: var(--space-lg);
          max-width: 680px;
          width: 92vw;
          max-height: 85vh;
          overflow-y: auto;
        }
        #error-details-dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(2px);
        }
      </style>

      <div style="font-family: var(--font-ui); display: grid; gap: var(--space-md);">
        <!-- Header e Ações em Lote -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md); margin-bottom: var(--space-xs);">
          <div>
            <h3 style="font-family: var(--font-display); font-size: 1.5rem; font-weight: 400; margin: 0 0 4px 0; color: var(--text-primary);">Observabilidade de Erros</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">Monitore falhas do front-end e back-end para atuar em melhorias e ajustes futuros.</p>
          </div>
          <button id="clear-resolved-errors-btn" type="button" class="btn-secondary" style="padding: 0.55rem 1rem; border: 1px solid var(--border-strong); background: var(--bg-elevated); color: var(--text-secondary); font-size: 0.85rem; border-radius: 4px; cursor: pointer;">
            Limpar resolvidos / ignorados
          </button>
        </div>

        <!-- KPIs Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xs);">
          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Erros em Aberto</div>
            <div id="kpi-open-errors" style="font-size: 2.2rem; font-family: var(--font-display); color: ${f.openCount>0?`var(--error)`:`var(--success)`}; line-height: 1.2;">${f.openCount}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Pendentes de análise ou correção</div>
          </div>

          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Últimas 24 Horas</div>
            <div id="kpi-recent-24h" style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${f.last24hCount}</div>
            <div id="kpi-recent-7d" style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${f.last7dCount} nos últimos 7 dias</div>
          </div>

          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Front-end vs. Back-end</div>
            <div id="kpi-source-split" style="font-size: 1.5rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.3;">${f.frontendCount} Front · ${f.backendCount} Back</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Distribuição por camada</div>
          </div>

          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Resolvidos / Ignorados</div>
            <div id="kpi-resolved-errors" style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${f.resolvedOrIgnoredCount}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Histórico já tratado</div>
          </div>
        </div>

        <!-- Barra de Filtros -->
        <div style="display: flex; gap: var(--space-xs); align-items: center; flex-wrap: wrap; background: var(--bg-elevated); padding: var(--space-sm); border-radius: 6px; border: 1px solid var(--border-subtle);">
          <input type="text" id="error-search" placeholder="Buscar por mensagem, rota, fingerprint ou stack..." aria-label="Buscar erros" style="flex-grow: 1; padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; min-width: 220px; font-size: 0.85rem;">

          <select id="error-filter-source" aria-label="Filtrar por origem" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
            <option value="all">Todas as Origens</option>
            <option value="frontend">Front-end</option>
            <option value="backend:functions">Back-end (Functions)</option>
            <option value="backend:scripts">Back-end (Scripts/CI)</option>
          </select>

          <select id="error-filter-category" aria-label="Filtrar por categoria" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
            <option value="all">Todas as Categorias</option>
            <option value="runtime">Runtime</option>
            <option value="promise">Promise</option>
            <option value="router">Router</option>
            <option value="chunk">Chunk / Módulo</option>
            <option value="firestore">Firestore</option>
            <option value="network">Rede</option>
            <option value="smtp">SMTP / E-mail</option>
            <option value="script">Script</option>
            <option value="sw">Service Worker</option>
          </select>

          <select id="error-filter-severity" aria-label="Filtrar por severidade" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
            <option value="all">Todas as Severidades</option>
            <option value="critical">Crítico</option>
            <option value="error">Erro</option>
            <option value="warning">Aviso</option>
          </select>

          <select id="error-filter-status" aria-label="Filtrar por status" style="padding: 0.5rem var(--space-sm); border: 1px solid var(--border-strong); background: var(--bg-primary); color: var(--text-primary); border-radius: 4px; font-size: 0.85rem; cursor: pointer;">
            <option value="all">Todos os Status</option>
            <option value="open">Em aberto</option>
            <option value="resolved">Resolvidos</option>
            <option value="ignored">Ignorados</option>
          </select>
        </div>

        <!-- Contador de Resultados -->
        <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; justify-content: space-between; align-items: center; padding: 0 4px;">
          <div>
            Mostrando <strong id="error-results-count" style="color: var(--text-primary);">0</strong> de <strong id="error-total-count">${u.length}</strong> registros
          </div>
          <span id="copy-feedback-toast" style="color: var(--success); font-size: 0.8rem; display: none;">✔ Diagnóstico copiado para a área de transferência!</span>
        </div>

        <!-- Tabela Responsiva (modern-web-guidance: responsive-table) -->
        <div tabindex="0" role="region" aria-labelledby="error-logs-table-caption" class="table-wrapper error-table-wrapper">
          <table class="error-logs-table">
            <caption id="error-logs-table-caption" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0,0,0,0);">Registros de observabilidade de erros do sistema</caption>
            <thead>
              <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.8px;">
                <th scope="col" style="padding: var(--space-sm); font-weight: 500;">Erro / Fingerprint</th>
                <th scope="col" style="padding: var(--space-sm); font-weight: 500;">Origem</th>
                <th scope="col" style="padding: var(--space-sm); font-weight: 500;">Rota / Tarefa</th>
                <th scope="col" style="padding: var(--space-sm); font-weight: 500;">Severidade</th>
                <th scope="col" style="padding: var(--space-sm); font-weight: 500;">Status</th>
                <th scope="col" style="padding: var(--space-sm); font-weight: 500;">Data</th>
                <th scope="col" style="padding: var(--space-sm); text-align: right; font-weight: 500;">Ações</th>
              </tr>
            </thead>
            <tbody id="error-logs-tbody"></tbody>
          </table>
        </div>
      </div>

      <!-- Dialog nativo com Light-Dismiss (modern-web-guidance: light-dismiss-a-dialog) -->
      <dialog id="error-details-dialog" closedby="any" aria-labelledby="error-dialog-title">
        <div style="display: flex; flex-direction: column; gap: var(--space-md);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-sm); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-xs);">
            <h3 id="error-dialog-title" style="font-family: var(--font-display); font-size: 1.4rem; color: var(--text-primary); margin: 0;">Diagnóstico do Erro</h3>
            <button type="button" id="copy-diagnostic-btn" class="btn-secondary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border: 1px solid var(--border-strong); background: var(--bg-secondary); color: var(--text-primary); border-radius: 4px; cursor: pointer;">
              Copiar diagnóstico
            </button>
          </div>

          <div style="display: grid; gap: var(--space-xs); font-size: 0.88rem;">
            <div><strong style="color: var(--text-muted);">Mensagem:</strong> <span id="detail-error-message" style="color: var(--text-primary); word-break: break-word;">-</span></div>
            <div style="display: flex; flex-wrap: wrap; gap: var(--space-md);">
              <div><strong style="color: var(--text-muted);">Origem:</strong> <span id="detail-error-source">-</span></div>
              <div><strong style="color: var(--text-muted);">Categoria:</strong> <span id="detail-error-category">-</span></div>
              <div><strong style="color: var(--text-muted);">Severidade:</strong> <span id="detail-error-severity">-</span></div>
              <div><strong style="color: var(--text-muted);">Status:</strong> <span id="detail-error-status">-</span></div>
            </div>
            <div><strong style="color: var(--text-muted);">Rota / Tarefa:</strong> <code id="detail-error-route" style="color: var(--accent-subtle);">-</code></div>
            <div><strong style="color: var(--text-muted);">Fingerprint:</strong> <code id="detail-error-fingerprint" style="font-size: 0.8rem; color: var(--text-secondary);">-</code></div>
            <div><strong style="color: var(--text-muted);">Data/Hora:</strong> <span id="detail-error-date" style="color: var(--text-secondary);">-</span></div>
            <div><strong style="color: var(--text-muted);">User-Agent:</strong> <span id="detail-error-ua" style="font-size: 0.8rem; color: var(--text-secondary); word-break: break-all;">-</span></div>

            <div style="margin-top: var(--space-xs);">
              <div style="color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Contexto Adicional</div>
              <pre id="detail-error-context" style="margin: 0; padding: var(--space-sm); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: var(--text-primary); overflow-x: auto; white-space: pre-wrap; word-break: break-word; max-height: 140px; overflow-y: auto;"></pre>
            </div>

            <div style="margin-top: var(--space-xs);">
              <div style="color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Stack Trace</div>
              <pre id="detail-error-stack" style="margin: 0; padding: var(--space-sm); background: var(--bg-secondary); border: 1px solid var(--border-strong); border-radius: 4px; font-family: monospace; font-size: 0.8rem; color: var(--text-primary); overflow-x: auto; white-space: pre-wrap; word-break: break-word; max-height: 220px; overflow-y: auto;"></pre>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-xs); border-top: 1px solid var(--border-subtle); padding-top: var(--space-sm);">
            <div style="display: flex; gap: var(--space-xs);">
              <button type="button" id="modal-resolve-btn" class="btn-primary" style="padding: 0.45rem 0.9rem; background: var(--success); color: white; border: none; border-radius: 4px; font-size: 0.82rem; cursor: pointer;">Marcar como resolvido</button>
              <button type="button" id="modal-ignore-btn" class="btn-secondary" style="padding: 0.45rem 0.9rem; border: 1px solid var(--border-strong); background: transparent; color: var(--text-secondary); border-radius: 4px; font-size: 0.82rem; cursor: pointer;">Ignorar</button>
              <button type="button" id="modal-delete-btn" class="btn-secondary" style="padding: 0.45rem 0.9rem; border: 1px solid var(--error); background: transparent; color: var(--error); border-radius: 4px; font-size: 0.82rem; cursor: pointer;">Excluir</button>
            </div>
            <button type="button" id="close-error-dialog-btn" class="btn-secondary" style="padding: 0.45rem 0.9rem; border: none; background: transparent; color: var(--text-secondary); font-size: 0.85rem; cursor: pointer;">Fechar</button>
          </div>
        </div>
      </dialog>
    `);let p=c.querySelector(`#error-logs-tbody`),m=c.querySelector(`#error-results-count`),h=c.querySelector(`#error-total-count`),g=c.querySelector(`#error-search`),_=c.querySelector(`#error-filter-source`),v=c.querySelector(`#error-filter-category`),y=c.querySelector(`#error-filter-severity`),b=c.querySelector(`#error-filter-status`),x=c.querySelector(`#clear-resolved-errors-btn`),S=c.querySelector(`#error-details-dialog`),C=c.querySelector(`#copy-feedback-toast`),w=null;S&&(typeof HTMLDialogElement>`u`||!(`closedBy`in HTMLDialogElement.prototype))&&S.addEventListener(`click`,e=>{if(e.target!==S)return;let t=S.getBoundingClientRect();t.top<=e.clientY&&e.clientY<=t.top+t.height&&t.left<=e.clientX&&e.clientX<=t.left+t.width||(typeof S.close==`function`?S.close():S.removeAttribute(`open`))});let T=()=>{if(S){if(typeof S.showModal==`function`)try{S.showModal()}catch{S.setAttribute(`open`,``)}else S.setAttribute(`open`,``)}},E=()=>{S&&(typeof S.close==`function`&&S.open?S.close():S.removeAttribute(`open`))};c.querySelector(`#close-error-dialog-btn`)?.addEventListener(`click`,E);let D=()=>{let e=d(u),t=c.querySelector(`#kpi-open-errors`),n=c.querySelector(`#kpi-recent-24h`),r=c.querySelector(`#kpi-recent-7d`),i=c.querySelector(`#kpi-source-split`),a=c.querySelector(`#kpi-resolved-errors`);t&&(t.textContent=String(e.openCount),t.style.color=e.openCount>0?`var(--error)`:`var(--success)`),n&&(n.textContent=String(e.last24hCount)),r&&(r.textContent=`${e.last7dCount} nos últimos 7 dias`),i&&(i.textContent=`${e.frontendCount} Front · ${e.backendCount} Back`),a&&(a.textContent=String(e.resolvedOrIgnoredCount)),h&&(h.textContent=String(u.length))},O=e=>e===`resolved`?`<span class="error-status-badge status-resolved" style="padding: 0.18rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 600; color: var(--success); border: 1px solid var(--success); text-transform: uppercase;">Resolvido</span>`:e===`ignored`?`<span class="error-status-badge status-ignored" style="padding: 0.18rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 600; color: var(--text-muted); border: 1px solid var(--border-strong); text-transform: uppercase;">Ignorado</span>`:`<span class="error-status-badge status-open" style="padding: 0.18rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 600; color: var(--error); border: 1px solid var(--error); text-transform: uppercase;">Aberto</span>`,k=e=>{let t=e===`critical`?`var(--error)`:e===`warning`?`var(--accent-subtle)`:`var(--text-primary)`;return`<span style="padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; color: ${t}; border: 1px solid ${t}; text-transform: uppercase;">${e===`critical`?`Crítico`:e===`warning`?`Aviso`:`Erro`}</span>`},A=e=>{w=e,c.querySelector(`#detail-error-message`).textContent=e.message||`-`,c.querySelector(`#detail-error-source`).textContent=e.source||`-`,c.querySelector(`#detail-error-category`).textContent=e.category||`-`,c.querySelector(`#detail-error-severity`).textContent=e.severity||`-`,c.querySelector(`#detail-error-status`).textContent=e.status||`-`,c.querySelector(`#detail-error-route`).textContent=e.route_or_task||`-`,c.querySelector(`#detail-error-fingerprint`).textContent=e.fingerprint||`-`,c.querySelector(`#detail-error-date`).textContent=e.created_at?new Date(e.created_at).toLocaleString(`pt-BR`):`-`,c.querySelector(`#detail-error-ua`).textContent=e.user_agent||`-`;let t=e.context||`{}`;try{let n=typeof e.context==`string`?JSON.parse(e.context):e.context;t=JSON.stringify(n,null,2)}catch{t=String(e.context||`{}`)}c.querySelector(`#detail-error-context`).textContent=t,c.querySelector(`#detail-error-stack`).textContent=e.stack||`Sem stack trace registrado.`;let n=c.querySelector(`#modal-resolve-btn`);n&&(n.textContent=e.status===`resolved`?`Reabrir erro`:`Marcar como resolvido`)},j=async(e,t)=>{let{error:n}=await i(`error_logs`,e,{status:t});if(n){alert(`Erro ao atualizar status: ${n.message||n}`);return}let r=u.find(t=>t.id===e);r&&(r.status=t),w&&w.id===e&&A(r),D(),P()},M=async e=>{let{error:t}=await n(`error_logs`,e);t?alert(`Erro ao excluir registro: ${t.message||t}`):(u=u.filter(t=>t.id!==e),w&&w.id===e&&(w=null,E()),D(),P())},N=n=>{m.textContent=String(n.length),n.length===0?p.innerHTML=e(`
          <tr>
            <td colspan="7" style="padding: var(--space-xl); text-align: center; color: var(--text-muted); font-style: italic;">
              Nenhum registro de erro encontrado para os filtros selecionados.
            </td>
          </tr>
        `):(p.innerHTML=e(n.map(e=>{let n=e.message&&e.message.length>80?`${t(e.message.slice(0,77))}...`:t(e.message||`Erro sem mensagem`),r=t(e.fingerprint||`-`),i=e.source===`frontend`?`Front-end`:e.source===`backend:functions`?`Functions`:`Scripts/CI`,a=e.created_at?new Date(e.created_at).toLocaleString(`pt-BR`,{dateStyle:`short`,timeStyle:`short`}):`N/A`,o=e.status===`resolved`?`Reabrir`:`Resolver`,s=e.status===`resolved`?`open`:`resolved`;return`
          <tr data-error-id="${t(e.id)}" style="border-bottom: 1px solid var(--border-subtle);">
            <th scope="row" style="padding: var(--space-sm); max-width: 300px;">
              <div style="color: var(--text-primary); font-size: 0.9rem; word-break: break-word;">${n}</div>
              <div style="color: var(--text-muted); font-family: monospace; font-size: 0.72rem; margin-top: 2px;">${r}</div>
            </th>
            <td style="padding: var(--space-sm); font-size: 0.82rem; color: var(--text-secondary);">
              <div>${t(i)}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">${t(e.category)}</div>
            </td>
            <td style="padding: var(--space-sm); font-family: monospace; font-size: 0.8rem; color: var(--accent-subtle); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${t(e.route_or_task)}">
              ${t(e.route_or_task)}
            </td>
            <td style="padding: var(--space-sm);">${k(e.severity)}</td>
            <td style="padding: var(--space-sm);">${O(e.status)}</td>
            <td style="padding: var(--space-sm); font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">${a}</td>
            <td style="padding: var(--space-sm); text-align: right; white-space: nowrap;">
              <button type="button" class="view-error-btn" data-id="${t(e.id)}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; text-decoration: underline; margin-right: 8px; padding: 0;">Detalhes</button>
              <button type="button" class="resolve-error-btn" data-id="${t(e.id)}" data-next-status="${s}" style="color: var(--success); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; font-weight: 500; margin-right: 8px; padding: 0;">${o}</button>
              ${e.status===`open`?`<button type="button" class="ignore-error-btn" data-id="${t(e.id)}" style="color: var(--text-muted); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; margin-right: 8px; padding: 0;">Ignorar</button>`:``}
              <button type="button" class="delete-error-btn" data-id="${t(e.id)}" style="color: var(--error); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; padding: 0;">Excluir</button>
            </td>
          </tr>
        `}).join(``)),p.querySelectorAll(`.view-error-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let t=u.find(t=>t.id===e.dataset.id);t&&(A(t),T())})}),p.querySelectorAll(`.resolve-error-btn`).forEach(e=>{e.addEventListener(`click`,()=>{j(e.dataset.id,e.dataset.nextStatus||`resolved`)})}),p.querySelectorAll(`.ignore-error-btn`).forEach(e=>{e.addEventListener(`click`,()=>{j(e.dataset.id,`ignored`)})}),p.querySelectorAll(`.delete-error-btn`).forEach(e=>{e.addEventListener(`click`,()=>{M(e.dataset.id)})}))},P=()=>{let e=(g?.value||``).trim().toLowerCase(),t=_?.value||`all`,n=v?.value||`all`,r=y?.value||`all`,i=b?.value||`all`,a=u.filter(a=>!(t!==`all`&&a.source!==t||n!==`all`&&a.category!==n||r!==`all`&&a.severity!==r||i!==`all`&&a.status!==i||e&&![a.message,a.route_or_task,a.fingerprint,a.stack,a.context,a.category,a.source].map(e=>String(e||``).toLowerCase()).join(` `).includes(e)));N(a)};g?.addEventListener(`input`,a(P,150)),_?.addEventListener(`change`,P),v?.addEventListener(`change`,P),y?.addEventListener(`change`,P),b?.addEventListener(`change`,P),c.querySelector(`#modal-resolve-btn`)?.addEventListener(`click`,()=>{if(!w)return;let e=w.status===`resolved`?`open`:`resolved`;j(w.id,e)}),c.querySelector(`#modal-ignore-btn`)?.addEventListener(`click`,()=>{w&&j(w.id,`ignored`)}),c.querySelector(`#modal-delete-btn`)?.addEventListener(`click`,()=>{w&&M(w.id)}),c.querySelector(`#copy-diagnostic-btn`)?.addEventListener(`click`,async()=>{if(!w)return;let e=o(w);try{navigator.clipboard&&typeof navigator.clipboard.writeText==`function`&&await navigator.clipboard.writeText(e),C&&(C.style.display=`inline`,setTimeout(()=>{C.style.display=`none`},2500))}catch{}}),x?.addEventListener(`click`,async()=>{let e=u.filter(e=>e.status===`resolved`||e.status===`ignored`);if(e.length===0)return;await Promise.all(e.map(e=>n(`error_logs`,e.id)));let t=new Set(e.map(e=>e.id));u=u.filter(e=>!t.has(e.id)),D(),P()}),P()}catch(n){console.error(n),c.innerHTML=e(`<div class="error">Erro ao carregar registros de observabilidade: ${t(n?.message||String(n))}</div>`)}}export{c as renderErrorLogs};