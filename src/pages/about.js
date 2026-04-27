import { supabase } from '../utils/supabase.js';

export default {
  meta: {
    title: 'Sobre Natanael Brentano'
  },

  async render(container) {
    container.innerHTML = `
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <h1>Sobre Natanael Brentano</h1>
          </div>

          <div class="about-content">
            <div class="about-avatar">
              <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
              <label class="upload-label" for="avatar-upload">
                Alterar foto
              </label>
              <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
            </div>

            <div class="about-bio">
              <p class="about-tagline">
                A poética do silêncio<br />
                Obras contemporâneas de Natanael Brentano. Textos curtos sobre a imensidão do efêmero.
              </p>
              <p class="about-description">
                Desenvolvedor full‑stack baseado em São Paulo, apaixonado por poesia,
                geotecnologia e sistemas de baixa fricção.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;

    const imgEl = container.querySelector('#profile-img');
    const fileInput = container.querySelector('#avatar-upload');
    const uploadLabel = container.querySelector('.upload-label');

    // 1) Carregar foto salva (se houver)
    const savedURL = localStorage.getItem('profilePhotoURL');
    if (savedURL) {
      imgEl.src = savedURL;
    }

    // 2) Ao escolher arquivo, fazer upload para Supabase Storage
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      uploadLabel.textContent = 'Enviando…';
      uploadLabel.style.cursor = 'default';
      fileInput.disabled = true;

      try {
        const fileExt = file.name.split('.').pop().toLowerCase();
        const fileName = `avatar_${Date.now()}.${fileExt}`;

        // NOTA: Certifique-se de que o bucket 'avatars' existe e é PUBLICO no Supabase Dashboard
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        const publicURL = urlData.publicUrl;

        // Atualizar preview e salvar no localStorage
        imgEl.src = publicURL;
        localStorage.setItem('profilePhotoURL', publicURL);

        uploadLabel.textContent = 'Foto atualizada!';
        setTimeout(() => {
          uploadLabel.textContent = 'Alterar foto';
          uploadLabel.style.cursor = 'pointer';
          fileInput.disabled = false;
        }, 1500);
      } catch (err) {
        console.error('Erro ao upload avatar:', err);
        uploadLabel.textContent = 'Erro ao enviar';
        setTimeout(() => {
          uploadLabel.textContent = 'Alterar foto';
          uploadLabel.style.cursor = 'pointer';
          fileInput.disabled = false;
        }, 1500);
      }
    });

    // Permitir clique no label para abrir o file input
    uploadLabel.addEventListener('click', (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }
};
