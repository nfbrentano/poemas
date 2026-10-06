import { listDocs, callFunction } from './data.js';
import { escapeHtml } from '../../utils/html.js';
import { debounce } from './debounce.js';

export async function renderEmailHistory(container) {
    container.innerHTML = '<div class="loading">Carregando histórico e dados...</div>';
    
    try {
      const [logsRes, poemsRes] = await Promise.all([
        listDocs('email_campaign_logs', { orderBy: ['created_at', 'desc'] }),
        listDocs('poems', { where: [['status', '==', 'published']] })
      ]);
      
      if (logsRes.error) throw logsRes.error;
      if (poemsRes.error) throw poemsRes.error;
      
      const logs = logsRes.data || [];
      const publishedPoems = poemsRes.data || [];
      publishedPoems.sort((a, b) => a.title.localeCompare(b.title));
      
      // Normalize logs data (handle Firestore Timestamps and missing joined tables)
      logs.forEach(log => {
        const matchedPoem = publishedPoems.find(p => p.id === log.poem_id);
        if (matchedPoem && !log.poems) log.poems = { title: matchedPoem.title };
        if (log.created_at && typeof log.created_at.toDate === 'function') log.created_at = log.created_at.toDate().toISOString();
        else if (log.created_at && log.created_at.seconds) log.created_at = new Date(log.created_at.seconds * 1000).toISOString();
        if (log.sent_at && typeof log.sent_at.toDate === 'function') log.sent_at = log.sent_at.toDate().toISOString();
        else if (log.sent_at && log.sent_at.seconds) log.sent_at = new Date(log.sent_at.seconds * 1000).toISOString();
      });
      
      // Calculate KPIs
      const totalCount = logs.length;
      const successCount = logs.filter(l => l.status === 'success').length;
      const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '100.0';
      const lastLog = logs[0] || null;
      
      const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 1) return 'Agora mesmo';
        if (diffMins < 60) return `Há ${diffMins} min`;
        if (diffHours < 24) return `Há ${diffHours} h`;
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 30) return `Há ${diffDays} dias`;
        return date.toLocaleDateString('pt-BR');
      };
      
      container.innerHTML = `
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
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--text-primary); line-height: 1.2;">${totalCount}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">Registros de disparos de newsletter</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Taxa de Sucesso</div>
              <div style="font-size: 2.2rem; font-family: var(--font-display); color: var(--success); line-height: 1.2;">${successRate}%</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: var(--space-3xs);">${successCount} envios bem-sucedidos</div>
            </div>
            
            <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 6px; border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: var(--space-2xs);">Último Envio</div>
              <div style="font-size: 1.1rem; font-family: var(--font-ui); color: var(--accent-subtle); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 500;" title="${lastLog?.poems?.title || '-'}">
                ${lastLog?.poems?.title || 'Nenhum envio registrado'}
              </div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: var(--space-3xs);">
                ${lastLog ? formatRelativeTime(lastLog.created_at || lastLog.sent_at) : 'Nenhum dado'}
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
              Mostrando <strong id="results-count" style="color: var(--text-primary);">0</strong> de <strong>${logs.length}</strong> envios
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
                  ${publishedPoems.map(p => `<option value="${p.id}">${escapeHtml(p.title)}</option>`).join('')}
                </select>
                ${publishedPoems.length === 0 ? '<p style="color: var(--error); font-size: 0.8rem; margin: 4px 0 0 0;">Nenhuma obra publicada disponível.</p>' : ''}
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
                <button type="submit" id="submit-dispatch-btn" class="btn-primary" ${publishedPoems.length === 0 ? 'disabled' : ''} style="padding: 0.5rem 1.2rem; background: var(--success); color: white; border-radius: 4px; font-size: 0.85rem; font-weight: 500; border: none; cursor: pointer; transition: opacity var(--transition-fast);">
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
      `;

      const tbody = container.querySelector('#email-tbody');
      const resultsCountEl = container.querySelector('#results-count');
      
      // Set up modal elements references
      const dispatchModal = container.querySelector('#manual-dispatch-modal');
      const detailsModal = container.querySelector('#log-details-modal');
      
      // Open Dispatch Modal
      container.querySelector('#open-dispatch-modal-btn').addEventListener('click', () => {
        dispatchModal.style.display = 'flex';
        container.querySelector('#manual-dispatch-form').reset();
      });
      
      // Close Dispatch Modal
      container.querySelector('#close-dispatch-modal-btn').addEventListener('click', () => {
        dispatchModal.style.display = 'none';
      });
      
      // Close Details Modal
      container.querySelector('#close-details-modal-btn').addEventListener('click', () => {
        detailsModal.style.display = 'none';
      });
      
      // Close modals when clicking outside content
      [dispatchModal, detailsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            modal.style.display = 'none';
          }
        });
      });

      // State representing current detail log being shown
      let selectedLogForResend = null;
      
      // Set up Reenviar actions
      const handleResendAction = async (poemId, poemTitle, buttonEl) => {
        if (!poemId) {
          alert('Não é possível reenviar: id da obra indisponível.');
          return;
        }
        if (!confirm(`Deseja reenviar a newsletter da obra "${poemTitle}" para todos os assinantes ativos?`)) {
          return;
        }
        
        const originalText = buttonEl.innerText;
        buttonEl.disabled = true;
        buttonEl.innerText = 'Enviando...';
        buttonEl.style.opacity = '0.5';
        
        try {
          const { data, error: fnError } = await callFunction('sendNewsletter', { poemId });
          
          if (fnError) throw fnError;
          
          alert(`Newsletter para "${poemTitle}" reenviada com sucesso para ${data?.count || 0} assinantes!`);
          // Close details modal if open
          detailsModal.style.display = 'none';
          // Reload the view
          renderEmailHistory(container);
        } catch (err) {
          console.error('Erro ao reenviar:', err);
          let detailedMsg = '';
          if (err.context && typeof err.context.json === 'function') {
            try {
              const errBody = await err.context.json();
              detailedMsg = errBody.error || errBody.message || '';
            } catch (e) {}
          }
          alert(`Erro ao enviar newsletter:\n${detailedMsg || err.message || 'Erro na Edge Function'}`);
          buttonEl.disabled = false;
          buttonEl.innerText = originalText;
          buttonEl.style.opacity = '1';
        }
      };

      // Register action on details modal button (once)
      container.querySelector('#resend-from-modal-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        if (selectedLogForResend && selectedLogForResend.poem_id) {
          await handleResendAction(
            selectedLogForResend.poem_id,
            selectedLogForResend.poems?.title || 'Desconhecido',
            e.currentTarget
          );
        }
      });
      
      const renderRows = (filteredLogs) => {
        resultsCountEl.innerText = filteredLogs.length;
        if (filteredLogs.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="5" style="padding: var(--space-xl) 0; text-align: center; color: var(--text-muted); font-style: italic;">
                Nenhum registro de envio encontrado com os filtros aplicados.
              </td>
            </tr>
          `;
          return;
        }
        
        tbody.innerHTML = filteredLogs.map(log => {
          const title = log.poems?.title || 'Desconhecido';
          const timeVal = log.created_at || log.sent_at;
          const formattedDate = timeVal ? new Date(timeVal).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'N/A';
          const isSuccess = log.status === 'success';
          
          const statusBadge = isSuccess 
            ? `
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--success); box-shadow: 0 0 6px var(--success);"></span>
                Sucesso
              </span>
            ` 
            : `
              <span style="display: inline-flex; align-items: center; gap: 6px; padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase; letter-spacing: 0.5px;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--error); box-shadow: 0 0 6px var(--error);"></span>
                Falha
              </span>
            `;
            
          const typeLabel = log.type === 'individual' ? 'Individual' : (log.type === 'newsletter' ? 'Newsletter' : 'Desconhecido');
          const typeBadge = `<span style="padding: 0.2rem 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">${typeLabel}</span>`;
            
          const detailsPreview = log.details 
            ? (log.details.length > 50 ? `${escapeHtml(log.details.slice(0, 48))}...` : escapeHtml(log.details))
            : '-';
            
          return `
            <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
              <td style="padding: var(--space-md) 0; font-family: var(--font-display); font-size: 1.15rem; color: var(--text-primary); font-weight: 400;">${escapeHtml(title)}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui);">${typeBadge}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-secondary); font-size: 0.85rem;">${formattedDate}</td>
              <td style="padding: var(--space-md) 0;">${statusBadge}</td>
              <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${detailsPreview}</td>
              <td style="padding: var(--space-md) 0; text-align: right; font-family: var(--font-ui);">
                <button class="view-details-btn" data-id="${log.id}" style="color: var(--text-primary); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; margin-right: var(--space-sm); transition: color var(--transition-fast); text-decoration: underline; padding: 0;">Detalhes</button>
                <button class="resend-log-btn" data-poem-id="${log.poem_id || ''}" data-title="${escapeHtml(title)}" style="color: var(--accent-subtle); background: transparent; border: none; cursor: pointer; font-size: 0.85rem; transition: opacity var(--transition-fast); text-decoration: none; padding: 0; font-weight: 500;">Reenviar</button>
              </td>
            </tr>
          `;
        }).join('');
        
        // Add listeners for row hover micro-animations
        tbody.querySelectorAll('tr').forEach(row => {
          row.style.transition = 'background-color var(--transition-fast)';
          row.addEventListener('mouseenter', () => {
            row.style.backgroundColor = 'var(--bg-secondary)';
          });
          row.addEventListener('mouseleave', () => {
            row.style.backgroundColor = 'transparent';
          });
        });

        // Set up View Details Action
        tbody.querySelectorAll('.view-details-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const logId = btn.dataset.id;
            const log = filteredLogs.find(l => l.id === logId);
            if (!log) return;
            
            selectedLogForResend = log;
            
            container.querySelector('#detail-poem-title').innerText = log.poems?.title || 'Desconhecido';
            
            const typeText = log.type === 'individual' ? `Individual${log.target_email ? ` (${log.target_email})` : ''}` : (log.type === 'newsletter' ? 'Newsletter' : 'Desconhecido');
            container.querySelector('#detail-type').innerText = typeText;
            
            const timeVal = log.created_at || log.sent_at;
            container.querySelector('#detail-date').innerText = timeVal ? new Date(timeVal).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'medium' }) : 'Desconhecida';
            
            const isSuccess = log.status === 'success';
            container.querySelector('#detail-status-badge').innerHTML = isSuccess 
              ? `<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(58, 140, 84, 0.3); background: rgba(58, 140, 84, 0.08); color: var(--success); text-transform: uppercase;">Sucesso</span>`
              : `<span style="padding: 0.2rem 0.6rem; border-radius: 20px; font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600; border: 1px solid rgba(204, 74, 74, 0.3); background: rgba(204, 74, 74, 0.08); color: var(--error); text-transform: uppercase;">Falha</span>`;
            
            container.querySelector('#detail-description').innerText = log.details || 'Nenhum detalhe adicional disponível.';
            
            // Re-configure the modal Resend button depending on if we have a poem_id
            const resendModalBtn = container.querySelector('#resend-from-modal-btn');
            if (log.poem_id) {
              resendModalBtn.style.display = 'inline-block';
              resendModalBtn.innerText = isSuccess ? 'Disparar Novamente' : 'Tentar Reenviar';
            } else {
              resendModalBtn.style.display = 'none';
            }
            
            detailsModal.style.display = 'flex';
          });
        });

        // Set up Reenviar actions
        tbody.querySelectorAll('.resend-log-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const poemId = btn.dataset.poemId;
            const title = btn.dataset.title;
            handleResendAction(poemId, title, btn);
          });
        });
      };

      const searchInput = container.querySelector('#email-search');
      const statusSelect = container.querySelector('#email-filter-status');
      const sortSelect = container.querySelector('#email-sort');
      
      const filterList = () => {
        const query = searchInput.value.toLowerCase().trim();
        const status = statusSelect.value;
        const sort = sortSelect.value;
        
        let filtered = [...logs];
        
        if (query) {
          filtered = filtered.filter(log => {
            const title = (log.poems?.title || '').toLowerCase();
            const details = (log.details || '').toLowerCase();
            return title.includes(query) || details.includes(query);
          });
        }
        
        if (status !== 'all') {
          if (status === 'success') {
            filtered = filtered.filter(log => log.status === 'success');
          } else {
            filtered = filtered.filter(log => log.status !== 'success');
          }
        }
        
        if (sort === 'newest') {
          filtered.sort((a, b) => new Date(b.created_at || b.sent_at) - new Date(a.created_at || a.sent_at));
        } else if (sort === 'oldest') {
          filtered.sort((a, b) => new Date(a.created_at || a.sent_at) - new Date(b.created_at || b.sent_at));
        } else if (sort === 'title-az') {
          filtered.sort((a, b) => {
            const titleA = a.poems?.title || '';
            const titleB = b.poems?.title || '';
            return titleA.localeCompare(titleB);
          });
        } else if (sort === 'title-za') {
          filtered.sort((a, b) => {
            const titleA = a.poems?.title || '';
            const titleB = b.poems?.title || '';
            return titleB.localeCompare(titleA);
          });
        }
        
        renderRows(filtered);
      };
      
      searchInput.addEventListener('input', debounce(filterList, 150));
      statusSelect.addEventListener('change', filterList);
      sortSelect.addEventListener('change', filterList);
      
      // Execute initial filter
      filterList();

      // Set up Dispatch Form submission handler
      const dispatchForm = container.querySelector('#manual-dispatch-form');
      dispatchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const poemSelect = container.querySelector('#dispatch-poem-select');
        const poemId = poemSelect.value;
        const poemTitle = poemSelect.options[poemSelect.selectedIndex].text;
        const targetEmailInput = container.querySelector('#dispatch-target-email');
        const targetEmail = targetEmailInput ? targetEmailInput.value.trim() : '';
        const confirmChk = container.querySelector('#dispatch-confirm-chk');
        
        if (!targetEmail && !confirmChk.checked) {
          alert('Você precisa confirmar o envio para todos os assinantes caso não preencha um e-mail de destino.');
          return;
        }
        
        const submitBtn = container.querySelector('#submit-dispatch-btn');
        const cancelBtn = container.querySelector('#close-dispatch-modal-btn');
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Enviando...';
        poemSelect.disabled = true;
        if (targetEmailInput) targetEmailInput.disabled = true;
        confirmChk.disabled = true;
        cancelBtn.style.display = 'none';
        
        try {
          const bodyPayload = { poemId };
          if (targetEmail) {
            bodyPayload.targetEmail = targetEmail;
          }
          
          const { data, error: fnError } = await callFunction('sendNewsletter', bodyPayload);
          
          if (fnError) throw fnError;
          
          if (targetEmail) {
            alert(`Newsletter para "${poemTitle}" enviada com sucesso para o e-mail: ${targetEmail}!`);
          } else {
            alert(`Newsletter para "${poemTitle}" enviada com sucesso para ${data?.count || 0} assinantes!`);
          }

          if (data?.logError) {
            console.error('Log error:', data.logError);
            alert(`ATENÇÃO: Os emails foram enviados, mas houve um erro ao salvar o histórico no banco de dados.\nErro: ${data.logError.message || JSON.stringify(data.logError)}`);
          }

          dispatchModal.style.display = 'none';
          
          // Refresh page details
          renderEmailHistory(container);
        } catch (err) {
          console.error('Erro na Edge Function:', err);
          let detailedMsg = '';
          if (err.context && typeof err.context.json === 'function') {
            try {
              const errBody = await err.context.json();
              detailedMsg = errBody.error || errBody.message || '';
            } catch (e) {}
          }
          alert(`Erro ao disparar newsletter:\n${detailedMsg || err.message || 'Erro inesperado'}`);
          
          submitBtn.disabled = false;
          submitBtn.innerText = 'Disparar Newsletter';
          poemSelect.disabled = false;
          if (targetEmailInput) targetEmailInput.disabled = false;
          confirmChk.disabled = false;
          cancelBtn.style.display = 'inline-block';
        }
      });
      
    } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="error">Erro ao carregar dados do histórico: ${err.message}</div>`;
    }
}
