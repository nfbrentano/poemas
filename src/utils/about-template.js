import { escapeHtml } from './html.js';
import { renderBreadcrumbsHtml, SITE_URL } from './structured-data.js';

export function renderPushToggleHtml() {
  return `
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
  `;
}

export const DEFAULT_AVATAR_URL = 'https://firebasestorage.googleapis.com/v0/b/poemas-natanael.firebasestorage.app/o/avatars%2Favatar_1788017538021.jpeg?alt=media&token=e54e38e7-5950-4c47-97a1-9ac1f8bcef15';
export const DEFAULT_AUTHOR_BIO = 'Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.';

export function renderAboutMarkup({
  avatarUrl = DEFAULT_AVATAR_URL,
  bioText = DEFAULT_AUTHOR_BIO,
  poemsCount = 222,
  baseUrl = '/'
} = {}) {
  const canonicalAboutUrl = `${SITE_URL}/sobre/`;
  const breadcrumbItems = [
    { name: 'Início', url: baseUrl },
    { name: 'Sobre', url: canonicalAboutUrl }
  ];

  const formattedBio = bioText.replace(/\n/g, '<br>');

  return `
      <section class="about-page fade-in">
        <div class="about-container">
          ${renderBreadcrumbsHtml(breadcrumbItems)}
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Natanael Brentano, poeta" src="${escapeHtml(avatarUrl)}" width="140" height="140" />
                <div id="admin-avatar-controls"></div>
              </div>
            </div>
            <div class="about-intro">
              <h1>Natanael Brentano</h1>
              <p class="about-tagline">Poeta e observador do cotidiano</p>
              <div class="social-links">
                <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener" style="display: flex; align-items: center; gap: 6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  Instagram
                </a>
                <a href="mailto:nfgbrentano@gmail.com" style="display: flex; align-items: center; gap: 6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  Contato
                </a>
              </div>
            </div>
          </div>

          <div class="about-content">
            <div class="about-section bio-section" id="autor">
              <h2 class="section-title">Sobre o autor</h2>
              <div id="bio-content" class="bio-text">
                ${formattedBio}
              </div>
              <div id="admin-bio-controls"></div>
            </div>

            <div class="about-grid">
              <div class="about-section">
                <h2 class="section-title">Influências</h2>
                <ul class="influences-list">
                  <li>Manoel de Barros (a poesia das miudezas)</li>
                  <li>Fernando Pessoa (o labirinto da alma)</li>
                  <li>Hilda Hilst (o sagrado e o profano)</li>
                  <li>Clarice Lispector (o silêncio entre as palavras)</li>
                </ul>
              </div>

              <div class="about-section">
                <h2 class="section-title">Marcos Literários</h2>
                <div class="timeline">
                  <div class="timeline-item">
                    <span class="year">2015</span>
                    <span class="event">Início das publicações e primeiros versos (dezembro de 2015, com obras como <em>Como falar</em> e <em>Carinho</em>).</span>
                  </div>
                  <div class="timeline-item">
                    <span class="year">2016 – 2024</span>
                    <span class="event">Fase de maturação poética e escrita contínua sobre o tempo, os afetos e a efemeridade cotidiana.</span>
                  </div>
                  <div class="timeline-item">
                    <span class="year">2025</span>
                    <span class="event">Intensa produção criativa (100 poemas no ano) e alcance do marco de 100 poemas catalogados em setembro com <em>Melodia do Coração</em>.</span>
                  </div>
                  <div class="timeline-item">
                    <span class="year">2026</span>
                    <span class="event">Consolidação do acervo digital e superação da marca de 200 poemas em julho com <em>Trilha Sonora do Agora</em>, reunindo atualmente <strong id="total-poems-count">${poemsCount}</strong> poemas publicados.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="about-settings">
            ${renderPushToggleHtml()}
          </div>
        </div>

        <div id="admin-modal-container"></div>
      </section>
  `;
}
