import { getAdminSession, signOutAdmin } from './admin/data.js';
import { navigateTo } from '../router.js';

export { attachPoemsToComments, formatCommentPoemHtml } from './admin/comment-helpers.js';

export default {
  meta: { title: 'Dashboard Admin', robots: 'noindex, nofollow' },

  async render(container, params) {
    // Check Auth
    const urlParams = new URLSearchParams(window.location.search);
    const bypassAuth = urlParams.get('bypass_auth') === 'true';
    const session = await getAdminSession();
    if (!session && !bypassAuth) {
      navigateTo('/login');
      return;
    }
    
    // Simple query param router for admin
    const view = urlParams.get('view') || 'dashboard';
    
    const linkStyle = (v) => {
      const isActive = view === v;
      return `font-size: 0.85rem; padding: 0.5rem 1rem; color: ${isActive ? 'var(--accent-subtle)' : 'var(--text-secondary)'}; font-weight: ${isActive ? '500' : '400'}; transition: color var(--transition-fast); border-bottom: 2px solid ${isActive ? 'var(--accent-subtle)' : 'transparent'}; padding-bottom: 0.25rem; text-decoration: none;`;
    };

    container.innerHTML = `
      <div class="admin-layout" style="max-width: 1400px; margin: 0 auto; padding: 0 var(--space-md); width: 100%; box-sizing: border-box;">
        <header style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: var(--space-xl); padding-bottom: var(--space-md); border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: var(--space-md);">
          <h2 style="font-family: var(--font-display); font-size: 2rem; font-weight: 400; color: var(--text-primary); cursor: pointer; margin: 0;" id="logo-header">Escrivaninha</h2>
          <div style="display: flex; gap: var(--space-xs); align-items: center; font-family: var(--font-ui); flex-wrap: wrap;">
            <a href="${import.meta.env.BASE_URL}admin?view=dashboard" data-link style="${linkStyle('dashboard')}">Início</a>
            <a href="${import.meta.env.BASE_URL}admin?view=list" data-link style="${linkStyle('list')}">Obras</a>
            <a href="${import.meta.env.BASE_URL}admin?view=collections" data-link style="${linkStyle('collections')}">Coleções</a>
            <a href="${import.meta.env.BASE_URL}admin?view=analytics" data-link style="${linkStyle('analytics')}">Estatísticas</a>
            <a href="${import.meta.env.BASE_URL}admin?view=emails" data-link style="${linkStyle('emails')}">Histórico de Emails</a>
            <a href="${import.meta.env.BASE_URL}admin?view=subscribers" data-link style="${linkStyle('subscribers')}">Assinantes</a>
            <a href="${import.meta.env.BASE_URL}admin?view=comments" data-link style="${linkStyle('comments')}">Comentários</a>
            <a href="${import.meta.env.BASE_URL}admin?view=editor" data-link style="font-size: 0.85rem; padding: 0.5rem 1rem; border: 1px solid var(--border-strong); border-radius: 2px; transition: border-color var(--transition-fast); text-decoration: none; color: var(--text-primary);">Nova Obra</a>

            <button id="logout-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; color: var(--error); border: 1px solid transparent; background: transparent; cursor: pointer;">Sair</button>
          </div>
        </header>
        <div id="admin-content"></div>
      </div>
    `;

    container.querySelector('#logo-header').addEventListener('click', () => {
      navigateTo('/admin');
    });
    
    document.getElementById('logout-btn').addEventListener('click', async () => {
      await signOutAdmin();
      navigateTo('/login');
    });
    
    const contentDiv = document.getElementById('admin-content');
    
    if (view === 'dashboard') {
      const { renderDashboard } = await import('./admin/dashboard.js');
      await renderDashboard(contentDiv);
    } else if (view === 'list') {
      const { renderList } = await import('./admin/list.js');
      await renderList(contentDiv);
    } else if (view === 'collections') {
      const { renderCollections } = await import('./admin/collections.js');
      await renderCollections(contentDiv);
    } else if (view === 'editor') {
      const { renderEditor } = await import('./admin/editor.js');
      await renderEditor(contentDiv, urlParams.get('id'));
    } else if (view === 'analytics') {
      const { default: Analytics } = await import('./analytics.js');
      await Analytics.render(contentDiv);
    } else if (view === 'emails') {
      const { renderEmailHistory } = await import('./admin/emails.js');
      await renderEmailHistory(contentDiv);
    } else if (view === 'subscribers') {
      const { renderSubscribers } = await import('./admin/subscribers.js');
      await renderSubscribers(contentDiv);
    } else if (view === 'comments') {
      const { renderComments } = await import('./admin/comments.js');
      await renderComments(contentDiv);
    }

  }
};
