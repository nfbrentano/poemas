import { listDocs, updateDocById, deleteDocById } from './data.js';
import { escapeHtml, unwrapSafeHTML } from '../../utils/html.js';
import { debounce } from './debounce.js';

/**
 * Formata um resumo estruturado em Markdown de um registro de erro para cópia rápida (RF09 / CA12).
 * @param {Object} log
 * @returns {string}
 */
export function formatErrorDiagnosticMarkdown(log = {}) {
  const createdAt = log.created_at || 'N/A';
  const source = log.source || 'frontend';
  const category = log.category || 'runtime';
  const severity = log.severity || 'error';
  const status = log.status || 'open';
  const routeOrTask = log.route_or_task || '/';
  const fingerprint = log.fingerprint || 'N/A';
  const userAgent = log.user_agent || 'N/A';
  const message = log.message || 'Sem mensagem';
  const stack = log.stack || 'Sem stack trace disponível';
  const context = typeof log.context === 'string' ? log.context : JSON.stringify(log.context || {}, null, 2);

  return [
    `### Diagnóstico de Erro (${severity.toUpperCase()})`,
    `- **ID:** \`${log.id || 'N/A'}\``,
    `- **Mensagem:** ${message}`,
    `- **Origem:** \`${source}\` · **Categoria:** \`${category}\` · **Status:** \`${status}\``,
    `- **Rota / Tarefa:** \`${routeOrTask}\``,
    `- **Fingerprint:** \`${fingerprint}\``,
    `- **Data/Hora:** ${createdAt}`,
    `- **User-Agent:** \`${userAgent}\``,
    '',
    '#### Contexto',
    '```json',
    context,
    '```',
    '',
    '#### Stack Trace',
    '```text',
    stack,
    '```'
  ].join('\n');
}

function normalizeTimestamp(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val.toDate === 'function') return val.toDate().toISOString();
  if (typeof val.seconds === 'number') return new Date(val.seconds * 1000).toISOString();
  return String(val);
}

/**
 * Renderiza a tela de Observabilidade de Erros (`/admin?view=errors`) (RF06, RF07, RF09).
 * @param {HTMLElement} container
 */
export async function renderErrorLogs(container) {
  container.innerHTML = unwrapSafeHTML('<div class="loading">Carregando observabilidade de erros...</div>');

  try {
    const res = await listDocs('error_logs', { orderBy: ['created_at', 'desc'] });
    if (res.error) throw res.error;

    let logs = (res.data || []).map(item => ({
      ...item,
      created_at: normalizeTimestamp(item.created_at),
      status: item.status || 'open',
      source: item.source || 'frontend',
      category: item.category || 'runtime',
      severity: item.severity || 'error'
    }));

    // Garante ordenação decrescente por data (CA08)
    logs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    const computeKpis = (items) => {
      const nowMs = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const weekMs = 7 * dayMs;

      const openCount = items.filter(l => l.status === 'open').length;
      const resolvedOrIgnoredCount = items.filter(l => l.status === 'resolved' || l.status === 'ignored').length;
      const last24hCount = items.filter(l => {
        const t = new Date(l.created_at).getTime();
        return !isNaN(t) && (nowMs - t) <= dayMs;
      }).length;
      const last7dCount = items.filter(l => {
        const t = new Date(l.created_at).getTime();
        return !isNaN(t) && (nowMs - t) <= weekMs;
      }).length;
      const frontendCount = items.filter(l => l.source === 'frontend').length;
      const backendCount = items.filter(l => String(l.source).startsWith('backend')).length;

      return {
        openCount,
        resolvedOrIgnoredCount,
        last24hCount,
        last7dCount,
        frontendCount,
        backendCount
      };
    };

    const kpis = computeKpis(logs);

    container.innerHTML = unwrapSafeHTML(`
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
            <div id="kpi-open-errors" style="font-size: 2.2rem; font-family: var(--font-display); color: ${kpis.openCount > 0 ? 'var(--error)' : 'var(--success)'}; line-height: 1.2;">${kpis.openCount}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Pendentes de análise ou correção</div>
          </div>

          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Últimas 24 Horas</div>
            <div id="kpi-recent-24h" style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${kpis.last24hCount}</div>
            <div id="kpi-recent-7d" style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${kpis.last7dCount} nos últimos 7 dias</div>
          </div>

          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Front-end vs. Back-end</div>
            <div id="kpi-source-split" style="font-size: 1.5rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.3;">${kpis.frontendCount} Front · ${kpis.backendCount} Back</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Distribuição por camada</div>
          </div>

          <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Resolvidos / Ignorados</div>
            <div id="kpi-resolved-errors" style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${kpis.resolvedOrIgnoredCount}</div>
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
            Mostrando <strong id="error-results-count" style="color: var(--text-primary);">0</strong> de <strong id="error-total-count">${logs.length}</strong> registros
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
    `);

    const tbody = container.querySelector('#error-logs-tbody');
    const resultsCountEl = container.querySelector('#error-results-count');
    const totalCountEl = container.querySelector('#error-total-count');
    const searchInput = container.querySelector('#error-search');
    const sourceSelect = container.querySelector('#error-filter-source');
    const categorySelect = container.querySelector('#error-filter-category');
    const severitySelect = container.querySelector('#error-filter-severity');
    const statusSelect = container.querySelector('#error-filter-status');
    const clearResolvedBtn = container.querySelector('#clear-resolved-errors-btn');
    const detailsDialog = container.querySelector('#error-details-dialog');
    const copyFeedbackEl = container.querySelector('#copy-feedback-toast');

    let selectedErrorLog = null;

    // Fallback para navegadores sem suporte nativo a <dialog closedby="any"> (modern-web-guidance)
    if (detailsDialog && (typeof HTMLDialogElement === 'undefined' || !('closedBy' in HTMLDialogElement.prototype))) {
      detailsDialog.addEventListener('click', (event) => {
        if (event.target !== detailsDialog) return;
        const rect = detailsDialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        if (typeof detailsDialog.close === 'function') detailsDialog.close();
        else detailsDialog.removeAttribute('open');
      });
    }

    const openDialog = () => {
      if (!detailsDialog) return;
      if (typeof detailsDialog.showModal === 'function') {
        try {
          detailsDialog.showModal();
        } catch {
          detailsDialog.setAttribute('open', '');
        }
      } else {
        detailsDialog.setAttribute('open', '');
      }
    };

    const closeDialog = () => {
      if (!detailsDialog) return;
      if (typeof detailsDialog.close === 'function' && detailsDialog.open) {
        detailsDialog.close();
      } else {
        detailsDialog.removeAttribute('open');
      }
    };

    container.querySelector('#close-error-dialog-btn')?.addEventListener('click', closeDialog);

    const refreshKpisUI = () => {
      const updated = computeKpis(logs);
      const openEl = container.querySelector('#kpi-open-errors');
      const r24El = container.querySelector('#kpi-recent-24h');
      const r7dEl = container.querySelector('#kpi-recent-7d');
      const splitEl = container.querySelector('#kpi-source-split');
      const resEl = container.querySelector('#kpi-resolved-errors');

      if (openEl) {
        openEl.textContent = String(updated.openCount);
        openEl.style.color = updated.openCount > 0 ? 'var(--error)' : 'var(--success)';
      }
      if (r24El) r24El.textContent = String(updated.last24hCount);
      if (r7dEl) r7dEl.textContent = `${updated.last7dCount} nos últimos 7 dias`;
      if (splitEl) splitEl.textContent = `${updated.frontendCount} Front · ${updated.backendCount} Back`;
      if (resEl) resEl.textContent = String(updated.resolvedOrIgnoredCount);
      if (totalCountEl) totalCountEl.textContent = String(logs.length);
    };

    const formatBadgeStatus = (status) => {
      if (status === 'resolved') {
        return '<span class="error-status-badge status-resolved" style="padding: 0.18rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 600; color: var(--success); border: 1px solid var(--success); text-transform: uppercase;">Resolvido</span>';
      }
      if (status === 'ignored') {
        return '<span class="error-status-badge status-ignored" style="padding: 0.18rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 600; color: var(--text-muted); border: 1px solid var(--border-strong); text-transform: uppercase;">Ignorado</span>';
      }
      return '<span class="error-status-badge status-open" style="padding: 0.18rem 0.55rem; border-radius: 12px; font-size: 0.72rem; font-weight: 600; color: var(--error); border: 1px solid var(--error); text-transform: uppercase;">Aberto</span>';
    };

    const formatBadgeSeverity = (severity) => {
      const color = severity === 'critical' ? 'var(--error)' : (severity === 'warning' ? 'var(--accent-subtle)' : 'var(--text-primary)');
      const label = severity === 'critical' ? 'Crítico' : (severity === 'warning' ? 'Aviso' : 'Erro');
      return `<span style="padding: 0.15rem 0.45rem; border-radius: 4px; font-size: 0.72rem; font-weight: 600; color: ${color}; border: 1px solid ${color}; text-transform: uppercase;">${label}</span>`;
    };

    const populateDialog = (log) => {
      selectedErrorLog = log;
      container.querySelector('#detail-error-message').textContent = log.message || '-';
      container.querySelector('#detail-error-source').textContent = log.source || '-';
      container.querySelector('#detail-error-category').textContent = log.category || '-';
      container.querySelector('#detail-error-severity').textContent = log.severity || '-';
      container.querySelector('#detail-error-status').textContent = log.status || '-';
      container.querySelector('#detail-error-route').textContent = log.route_or_task || '-';
      container.querySelector('#detail-error-fingerprint').textContent = log.fingerprint || '-';
      container.querySelector('#detail-error-date').textContent = log.created_at
        ? new Date(log.created_at).toLocaleString('pt-BR')
        : '-';
      container.querySelector('#detail-error-ua').textContent = log.user_agent || '-';

      let formattedContext = log.context || '{}';
      try {
        const parsed = typeof log.context === 'string' ? JSON.parse(log.context) : log.context;
        formattedContext = JSON.stringify(parsed, null, 2);
      } catch {
        formattedContext = String(log.context || '{}');
      }
      container.querySelector('#detail-error-context').textContent = formattedContext;
      container.querySelector('#detail-error-stack').textContent = log.stack || 'Sem stack trace registrado.';

      const resolveBtn = container.querySelector('#modal-resolve-btn');
      if (resolveBtn) {
        resolveBtn.textContent = log.status === 'resolved' ? 'Reabrir erro' : 'Marcar como resolvido';
      }
    };

    const updateErrorStatus = async (id, newStatus) => {
      const { error } = await updateDocById('error_logs', id, { status: newStatus });
      if (error) {
        alert(`Erro ao atualizar status: ${error.message || error}`);
        return;
      }
      const target = logs.find(l => l.id === id);
      if (target) target.status = newStatus;
      if (selectedErrorLog && selectedErrorLog.id === id) {
        populateDialog(target);
      }
      refreshKpisUI();
      applyFilters();
    };

    const deleteErrorItem = async (id) => {
      const { error } = await deleteDocById('error_logs', id);
      if (error) {
        alert(`Erro ao excluir registro: ${error.message || error}`);
        return;
      }
      logs = logs.filter(l => l.id !== id);
      if (selectedErrorLog && selectedErrorLog.id === id) {
        selectedErrorLog = null;
        closeDialog();
      }
      refreshKpisUI();
      applyFilters();
    };

    const renderRows = (filtered) => {
      resultsCountEl.textContent = String(filtered.length);

      if (filtered.length === 0) {
        tbody.innerHTML = unwrapSafeHTML(`
          <tr>
            <td colspan="7" style="padding: var(--space-xl); text-align: center; color: var(--text-muted); font-style: italic;">
              Nenhum registro de erro encontrado para os filtros selecionados.
            </td>
          </tr>
        `);
        return;
      }

      tbody.innerHTML = unwrapSafeHTML(filtered.map(log => {
        const msgPreview = log.message && log.message.length > 80
          ? `${escapeHtml(log.message.slice(0, 77))}...`
          : escapeHtml(log.message || 'Erro sem mensagem');
        const fpPreview = escapeHtml(log.fingerprint || '-');
        const sourceLabel = log.source === 'frontend'
          ? 'Front-end'
          : (log.source === 'backend:functions' ? 'Functions' : 'Scripts/CI');
        const formattedDate = log.created_at
          ? new Date(log.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
          : 'N/A';
        const nextStatusActionLabel = log.status === 'resolved' ? 'Reabrir' : 'Resolver';
        const nextStatusValue = log.status === 'resolved' ? 'open' : 'resolved';

        return `
          <tr data-error-id="${escapeHtml(log.id)}" style="border-bottom: 1px solid var(--border-subtle);">
            <th scope="row" style="padding: var(--space-sm); max-width: 300px;">
              <div style="color: var(--text-primary); font-size: 0.9rem; word-break: break-word;">${msgPreview}</div>
              <div style="color: var(--text-muted); font-family: monospace; font-size: 0.72rem; margin-top: 2px;">${fpPreview}</div>
            </th>
            <td style="padding: var(--space-sm); font-size: 0.82rem; color: var(--text-secondary);">
              <div>${escapeHtml(sourceLabel)}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">${escapeHtml(log.category)}</div>
            </td>
            <td style="padding: var(--space-sm); font-family: monospace; font-size: 0.8rem; color: var(--accent-subtle); max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(log.route_or_task)}">
              ${escapeHtml(log.route_or_task)}
            </td>
            <td style="padding: var(--space-sm);">${formatBadgeSeverity(log.severity)}</td>
            <td style="padding: var(--space-sm);">${formatBadgeStatus(log.status)}</td>
            <td style="padding: var(--space-sm); font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap;">${formattedDate}</td>
            <td style="padding: var(--space-sm); text-align: right; white-space: nowrap;">
              <button type="button" class="view-error-btn" data-id="${escapeHtml(log.id)}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; text-decoration: underline; margin-right: 8px; padding: 0;">Detalhes</button>
              <button type="button" class="resolve-error-btn" data-id="${escapeHtml(log.id)}" data-next-status="${nextStatusValue}" style="color: var(--success); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; font-weight: 500; margin-right: 8px; padding: 0;">${nextStatusActionLabel}</button>
              ${log.status === 'open' ? `<button type="button" class="ignore-error-btn" data-id="${escapeHtml(log.id)}" style="color: var(--text-muted); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; margin-right: 8px; padding: 0;">Ignorar</button>` : ''}
              <button type="button" class="delete-error-btn" data-id="${escapeHtml(log.id)}" style="color: var(--error); background: transparent; border: none; cursor: pointer; font-size: 0.82rem; padding: 0;">Excluir</button>
            </td>
          </tr>
        `;
      }).join(''));

      tbody.querySelectorAll('.view-error-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = logs.find(l => l.id === btn.dataset.id);
          if (item) {
            populateDialog(item);
            openDialog();
          }
        });
      });

      tbody.querySelectorAll('.resolve-error-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          updateErrorStatus(btn.dataset.id, btn.dataset.nextStatus || 'resolved');
        });
      });

      tbody.querySelectorAll('.ignore-error-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          updateErrorStatus(btn.dataset.id, 'ignored');
        });
      });

      tbody.querySelectorAll('.delete-error-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          deleteErrorItem(btn.dataset.id);
        });
      });
    };

    const applyFilters = () => {
      const q = (searchInput?.value || '').trim().toLowerCase();
      const src = sourceSelect?.value || 'all';
      const cat = categorySelect?.value || 'all';
      const sev = severitySelect?.value || 'all';
      const st = statusSelect?.value || 'all';

      const filtered = logs.filter(log => {
        if (src !== 'all' && log.source !== src) return false;
        if (cat !== 'all' && log.category !== cat) return false;
        if (sev !== 'all' && log.severity !== sev) return false;
        if (st !== 'all' && log.status !== st) return false;

        if (q) {
          const haystack = [
            log.message,
            log.route_or_task,
            log.fingerprint,
            log.stack,
            log.context,
            log.category,
            log.source
          ].map(v => String(v || '').toLowerCase()).join(' ');
          if (!haystack.includes(q)) return false;
        }
        return true;
      });

      renderRows(filtered);
    };

    searchInput?.addEventListener('input', debounce(applyFilters, 150));
    sourceSelect?.addEventListener('change', applyFilters);
    categorySelect?.addEventListener('change', applyFilters);
    severitySelect?.addEventListener('change', applyFilters);
    statusSelect?.addEventListener('change', applyFilters);

    // Ações dentro do Dialog
    container.querySelector('#modal-resolve-btn')?.addEventListener('click', () => {
      if (!selectedErrorLog) return;
      const next = selectedErrorLog.status === 'resolved' ? 'open' : 'resolved';
      updateErrorStatus(selectedErrorLog.id, next);
    });

    container.querySelector('#modal-ignore-btn')?.addEventListener('click', () => {
      if (!selectedErrorLog) return;
      updateErrorStatus(selectedErrorLog.id, 'ignored');
    });

    container.querySelector('#modal-delete-btn')?.addEventListener('click', () => {
      if (!selectedErrorLog) return;
      deleteErrorItem(selectedErrorLog.id);
    });

    container.querySelector('#copy-diagnostic-btn')?.addEventListener('click', async () => {
      if (!selectedErrorLog) return;
      const markdown = formatErrorDiagnosticMarkdown(selectedErrorLog);
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(markdown);
        }
        if (copyFeedbackEl) {
          copyFeedbackEl.style.display = 'inline';
          setTimeout(() => {
            copyFeedbackEl.style.display = 'none';
          }, 2500);
        }
      } catch {
        // fail-safe
      }
    });

    // Limpar todos os resolvidos/ignorados em lote (D02)
    clearResolvedBtn?.addEventListener('click', async () => {
      const toRemove = logs.filter(l => l.status === 'resolved' || l.status === 'ignored');
      if (toRemove.length === 0) return;

      await Promise.all(toRemove.map(item => deleteDocById('error_logs', item.id)));
      const removedIds = new Set(toRemove.map(i => i.id));
      logs = logs.filter(l => !removedIds.has(l.id));
      refreshKpisUI();
      applyFilters();
    });

    applyFilters();
  } catch (err) {
    console.error(err);
    container.innerHTML = unwrapSafeHTML(
      `<div class="error">Erro ao carregar registros de observabilidade: ${escapeHtml(err?.message || String(err))}</div>`
    );
  }
}
