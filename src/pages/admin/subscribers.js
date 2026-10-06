import { supabase } from './compat-client.js';

export async function renderSubscribers(container) {
    container.innerHTML = '<div class="loading">Carregando assinantes...</div>';
    
    const { data: subs, error } = await supabase
      .from('subscribers')
      .select('id, email, active, created_at, unsubscribed_at')
      .order('created_at', { ascending: false });
      
    if (error) {
      container.innerHTML = `<div class="error">Erro ao carregar: ${error.message}</div>`;
      return;
    }
    
    if (!subs || subs.length === 0) {
      container.innerHTML = '<p>Nenhum assinante encontrado.</p>';
      return;
    }

    // KPIs Logic
    const activeCount = subs.filter(s => s.active).length;
    const totalCount = subs.length;
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    const newLast30 = subs.filter(s => new Date(s.created_at) > last30Days).length;
    const churnCount = subs.filter(s => !s.active && s.unsubscribed_at && new Date(s.unsubscribed_at) > last30Days).length;
    const churnRate = ((churnCount / (activeCount || 1)) * 100).toFixed(1);
    
    const rows = subs.map(s => `
      <tr style="border-bottom: 1px solid var(--border-subtle); transition: background-color var(--transition-fast);">
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui);">${s.email}</td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); color: var(--text-muted); font-size: 0.85rem;">
          ${new Date(s.created_at).toLocaleDateString('pt-BR')}
        </td>
        <td style="padding: var(--space-md) 0;">
          <span style="padding: 0.2rem 0.6rem; border-radius: 2px; font-family: var(--font-ui); font-size: 0.75rem; border: 1px solid ${s.active ? 'var(--success)' : 'var(--error)'}; color: ${s.active ? 'var(--success)' : 'var(--error)'}; text-transform: uppercase; letter-spacing: 1px;">
            ${s.active ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td style="padding: var(--space-md) 0; font-family: var(--font-ui); font-size: 0.85rem; color: var(--text-muted);">
          ${s.unsubscribed_at ? new Date(s.unsubscribed_at).toLocaleDateString('pt-BR') : '-'}
        </td>
        <td style="padding: var(--space-md) 0; text-align: right;">
          <button class="toggle-subscriber-btn" data-id="${s.id}" data-active="${s.active}" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: transparent; border: 1px solid var(--border-strong); color: var(--text-primary); border-radius: 2px; cursor: pointer; transition: background var(--transition-fast);">
            ${s.active ? 'Inativar' : 'Ativar'}
          </button>
        </td>
      </tr>
    `).join('');
    
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Total de Assinantes</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${totalCount}</div>
          <div style="font-size: 0.8rem; color: var(--success);">${activeCount} ativos</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Novos (30 dias)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">+${newLast30}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Crescimento constante</div>
        </div>
        <div class="kpi-card" style="background: var(--bg-elevated); padding: var(--space-lg); border-radius: 4px; border: 1px solid var(--border-subtle);">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Taxa de Evasão (Churn)</div>
          <div style="font-size: 2rem; font-family: var(--font-display);">${churnRate}%</div>
          <div style="font-size: 0.8rem; color: var(--error);">${churnCount} saídas no mês</div>
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
          ${rows}
        </tbody>
      </table>
    `;

    container.querySelector('#export-csv-btn')?.addEventListener('click', () => {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Email,Ativo,Data Inscrição,Data Saída\n"
        + subs.map(s => `${s.email},${s.active},${s.created_at},${s.unsubscribed_at || ''}`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `assinantes_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    container.querySelector('#add-subscriber-btn')?.addEventListener('click', async () => {
      const email = prompt("Digite o e-mail do assinante para cadastrar:");
      if (!email || !email.includes('@')) {
        if (email !== null) alert("E-mail inválido.");
        return;
      }
      const existing = subs.find(s => s.email === email);
      if (existing) {
        alert("Este e-mail já está cadastrado.");
        return;
      }
      
      const payload = {
        email: email,
        active: true,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabase.from('subscribers').insert(payload);
      if (error) {
        alert("Erro ao cadastrar assinante: " + error.message);
      } else {
        renderSubscribers(container);
      }
    });

    container.querySelectorAll('.toggle-subscriber-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const currentActive = btn.dataset.active === 'true';
        const newActive = !currentActive;
        
        btn.disabled = true;
        btn.innerText = 'Processando...';
        
        const payload = {
          active: newActive
        };
        
        if (!newActive) {
          payload.unsubscribed_at = new Date().toISOString();
        } else {
          payload.unsubscribed_at = null; // Clear unsubscription date if reactivated
        }
        
        const { error } = await supabase.from('subscribers').update(payload).eq('id', id);
        if (error) {
          alert('Erro ao atualizar status: ' + error.message);
          btn.disabled = false;
          btn.innerText = currentActive ? 'Inativar' : 'Ativar';
        } else {
          renderSubscribers(container);
        }
      });
    });
}
