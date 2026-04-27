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
            <h1>Sobre Natanael Brentano</h1>
          </div>

          <div class="about-content">
            <div class="about-avatar">
              <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
              ${isAdmin ? `
                <label class="upload-label" for="avatar-upload">
                  Alterar foto
                </label>
                <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
              ` : ''}
            </div>

            <div class="about-bio">
              <p class="about-tagline">
                A poética do silêncio<br />
                Obras contemporâneas de Natanael Brentano. Textos curtos sobre a imensidão do efêmero.
              </p>
            </div>
          </div>
        </div>
      </section>
    `;

    const imgEl = container.querySelector('#profile-img');
    const fileInput = container.querySelector('#avatar-upload');
    const uploadLabel = container.querySelector('.upload-label');

    // 1) Carregar foto salva (Supabase primeiro, fallback localStorage)
    const loadAvatar = async () => {
      // Fallback imediato do cache
      const cachedURL = localStorage.getItem('profilePhotoURL');
      if (cachedURL) imgEl.src = cachedURL;

      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'avatar_url')
          .maybeSingle();

        if (data && data.value) {
          imgEl.src = data.value;
          localStorage.setItem('profilePhotoURL', data.value);
        }
      } catch (err) {
        console.error('Erro ao buscar avatar no Supabase:', err);
      }
    };
    loadAvatar();

    // 2) Ao escolher arquivo, fazer upload para Supabase Storage (somente se admin)
    if (isAdmin && fileInput && uploadLabel) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        uploadLabel.textContent = 'Enviando…';
        uploadLabel.style.cursor = 'default';
        fileInput.disabled = true;

        try {
          const fileExt = file.name.split('.').pop().toLowerCase();
          const fileName = `avatar_${Date.now()}.${fileExt}`;

          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          const publicURL = urlData.publicUrl;

          // Salvar na tabela site_settings
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
            uploadLabel.style.cursor = 'pointer';
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
