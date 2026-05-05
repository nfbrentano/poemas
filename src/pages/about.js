import { supabase } from '../utils/supabase.js';

export default {
  meta: {
    title: 'Sobre Natanael Brentano'
  },
  async render(container) {
    const { data: { session } } = await supabase.auth.getSession();
    const isAdmin = !!session;

    container.innerHTML = `
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                ${isAdmin ? `
                  <label class="upload-label" for="avatar-upload">
                    Alterar foto
                  </label>
                  <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
                ` : ''}
              </div>
            </div>
            <div class="about-intro">
              <h1>Natanael Brentano</h1>
              <p class="about-tagline">Poeta e observador do cotidiano</p>
              <div class="social-links">
                <a href="https://instagram.com/nfgbrentano" target="_blank" rel="noopener">Instagram</a>
                <a href="mailto:nfgbrentano@gmail.com">Contato</a>
              </div>
            </div>
          </div>

          <div class="about-content">
            <div class="about-section bio-section">
              <h2 class="section-title">Sobre o autor</h2>
              <div id="bio-content" class="bio-text">
                Carregando biografia...
              </div>
              ${isAdmin ? `<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>` : ''}
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
                    <span class="year">2024</span>
                    <span class="event">Início da publicação sistemática no site.</span>
                  </div>
                  <div class="timeline-item">
                    <span class="year">2026</span>
                    <span class="event">Marca de 500 poemas catalogados.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        ${isAdmin ? `
          <div id="bio-modal" class="modal">
            <div class="modal-content">
              <h3>Editar Biografia</h3>
              <textarea id="bio-textarea" style="width: 100%; min-height: 200px; margin: 1rem 0; padding: 1rem;"></textarea>
              <div class="modal-actions">
                <button id="cancel-bio-btn" class="btn-secondary">Cancelar</button>
                <button id="save-bio-btn" class="btn-primary">Salvar</button>
              </div>
            </div>
          </div>
        ` : ''}
      </section>
    `;

    const imgEl = container.querySelector('#profile-img');
    const bioContent = container.querySelector('#bio-content');
    
    // Carregar configurações do site
    const loadSettings = async () => {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('key, value');

        if (settings) {
          const avatar = settings.find(s => s.key === 'avatar_url');
          const bio = settings.find(s => s.key === 'author_bio');

          if (avatar) {
            imgEl.src = avatar.value;
            localStorage.setItem('profilePhotoURL', avatar.value);
          }
          if (bio) {
            bioContent.innerHTML = bio.value.replace(/\n/g, '<br>');
          } else {
            bioContent.innerText = 'Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.';
          }
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      }
    };
    loadSettings();

    // Lógica de edição da Bio (Admin)
    if (isAdmin) {
      const editBtn = container.querySelector('#edit-bio-btn');
      const modal = container.querySelector('#bio-modal');
      const textarea = container.querySelector('#bio-textarea');
      const saveBtn = container.querySelector('#save-bio-btn');
      const cancelBtn = container.querySelector('#cancel-bio-btn');

      editBtn.addEventListener('click', () => {
        textarea.value = bioContent.innerHTML.replace(/<br>/g, '\n');
        modal.style.display = 'flex';
      });

      cancelBtn.addEventListener('click', () => modal.style.display = 'none');

      saveBtn.addEventListener('click', async () => {
        saveBtn.innerText = 'Salvando...';
        const newValue = textarea.value;
        
        const { error } = await supabase
          .from('site_settings')
          .upsert({ key: 'author_bio', value: newValue });

        if (error) {
          alert('Erro ao salvar bio');
        } else {
          bioContent.innerHTML = newValue.replace(/\n/g, '<br>');
          modal.style.display = 'none';
        }
        saveBtn.innerText = 'Salvar';
      });
    }

    // Lógica de upload de avatar
    const fileInput = container.querySelector('#avatar-upload');
    const uploadLabel = container.querySelector('.upload-label');

    if (isAdmin && fileInput && uploadLabel) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadLabel.textContent = 'Enviando…';
        fileInput.disabled = true;

        try {
          const fileExt = file.name.split('.').pop().toLowerCase();
          const fileName = `avatar_${Date.now()}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file);

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          const publicURL = urlData.publicUrl;

          await supabase.from('site_settings').upsert({ 
            key: 'avatar_url', 
            value: publicURL 
          });

          imgEl.src = publicURL;
          localStorage.setItem('profilePhotoURL', publicURL);
          uploadLabel.textContent = 'Foto atualizada!';
        } catch (err) {
          console.error('Erro ao upload avatar:', err);
          uploadLabel.textContent = 'Erro ao enviar';
        } finally {
          setTimeout(() => {
            uploadLabel.textContent = 'Alterar foto';
            fileInput.disabled = false;
          }, 1500);
        }
      });

      uploadLabel.addEventListener('click', (e) => {
        e.preventDefault();
        fileInput.click();
      });
    }
  }
};
