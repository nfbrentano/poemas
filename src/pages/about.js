import { db } from '../utils/firebase.js';
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where } from 'firebase/firestore';
import { pushToggle } from '../components/push-toggle.js';
import { updateSEO } from '../utils/seo.js';
import { profilePageSchema, breadcrumbSchema, SITE_URL } from '../utils/structured-data.js';
import { renderAboutMarkup, DEFAULT_AVATAR_URL } from '../utils/about-template.js';

export default {
  meta: {
    title: 'Sobre Natanael Brentano — Poeta',
    description: 'Biografia, influências e trajetória poética de Natanael Fernando Gatti Brentano.'
  },
  async render(container) {
    const canonicalAboutUrl = `${SITE_URL}/sobre/`;
    const breadcrumbItems = [
      { name: 'Início', url: `${SITE_URL}/` },
      { name: 'Sobre', url: canonicalAboutUrl }
    ];

    updateSEO({
      title: 'Sobre Natanael Brentano — Poeta',
      description: 'Biografia, influências e trajetória poética de Natanael Fernando Gatti Brentano.',
      url: canonicalAboutUrl,
      type: 'profile',
      structuredData: [
        profilePageSchema(),
        breadcrumbSchema(breadcrumbItems)
      ]
    });

    const isPrerendered = container.getAttribute('data-prerendered') === '/sobre';
    if (isPrerendered) {
      container.removeAttribute('data-prerendered');
    } else {
      let cachedAvatar = DEFAULT_AVATAR_URL;
      try {
        cachedAvatar = localStorage.getItem('profilePhotoURL') || DEFAULT_AVATAR_URL;
      } catch (_) {}

      container.innerHTML = renderAboutMarkup({
        avatarUrl: cachedAvatar,
        baseUrl: import.meta.env.BASE_URL
      });
    }

    const imgEl = container.querySelector('#profile-img');
    const bioContent = container.querySelector('#bio-content');
    
    // Carregar configurações do site e contagem atualizada de poemas
    const loadSettings = async () => {
      try {
        const settingsRef = collection(db, 'site_settings');
        const settingsSnap = await getDocs(settingsRef);
        const settings = settingsSnap.docs.map(doc => ({ key: doc.id, value: doc.data().value }));

        if (settings.length > 0) {
          const avatar = settings.find(s => s.key === 'avatar_url');
          const bio = settings.find(s => s.key === 'author_bio');

          if (avatar && imgEl) {
            imgEl.src = avatar.value;
            try { localStorage.setItem('profilePhotoURL', avatar.value); } catch (_) {}
          }
          if (bio && bioContent) {
            bioContent.innerHTML = bio.value.replace(/\n/g, '<br>');
          }
        }
      } catch (err) {
        console.error('Erro ao buscar configurações:', err);
      }

      // Buscar total de poemas publicados para manter o marco dinâmico
      try {
        const poemsRef = collection(db, 'poems');
        const q = query(poemsRef, where('status', '==', 'published'));
        const snapshot = await getCountFromServer(q);
        const count = snapshot.data().count;

        if (count !== null) {
          const countEl = container.querySelector('#total-poems-count');
          if (countEl) {
            countEl.textContent = `${count}`;
          }
        }
      } catch (err) {
        console.error('Erro ao buscar contagem de poemas:', err);
      }
    };
    loadSettings();

    // Verificação de Admin em segundo plano (apenas se houver flag de sessão ativa)
    const checkAdmin = async () => {
      if (localStorage.getItem('has_admin_session') !== '1') return;

      try {
        const { getFirebaseAuth, getFirebaseStorage } = await import('../utils/firebase.js');
        const auth = await getFirebaseAuth();
        const initAdminUI = () => {
          if (!auth.currentUser) {
            localStorage.removeItem('has_admin_session');
            return;
          }

          const avatarControls = container.querySelector('#admin-avatar-controls');
          if (avatarControls) {
            avatarControls.innerHTML = `
              <label class="upload-label" for="avatar-upload" style="cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem; display: inline-block;">
                Alterar foto
              </label>
              <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
            `;
            const fileInput = avatarControls.querySelector('#avatar-upload');
            const uploadLabel = avatarControls.querySelector('.upload-label');
            if (fileInput && uploadLabel) {
              fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                uploadLabel.textContent = 'Enviando…';
                fileInput.disabled = true;
                try {
                  const fileExt = file.name.split('.').pop().toLowerCase();
                  const fileName = `avatar_${Date.now()}.${fileExt}`;
                  const [{ ref, uploadBytes, getDownloadURL }, storage] = await Promise.all([
                    import('firebase/storage'),
                    getFirebaseStorage()
                  ]);
                  const storageRef = ref(storage, `avatars/${fileName}`);
                  await uploadBytes(storageRef, file);
                  const publicURL = await getDownloadURL(storageRef);
                  await setDoc(doc(db, 'site_settings', 'avatar_url'), { value: publicURL });
                  if (imgEl) imgEl.src = publicURL;
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

          const bioControls = container.querySelector('#admin-bio-controls');
          const modalContainer = container.querySelector('#admin-modal-container');
          if (bioControls && modalContainer) {
            bioControls.innerHTML = `<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>`;
            modalContainer.innerHTML = `
              <div id="bio-modal" class="modal" style="display: none;">
                <div class="modal-content">
                  <h3>Editar Biografia</h3>
                  <textarea id="bio-textarea" style="width: 100%; min-height: 200px; margin: 1rem 0; padding: 1rem;"></textarea>
                  <div class="modal-actions">
                    <button id="cancel-bio-btn" class="btn-secondary">Cancelar</button>
                    <button id="save-bio-btn" class="btn-primary">Salvar</button>
                  </div>
                </div>
              </div>
            `;
            const editBtn = bioControls.querySelector('#edit-bio-btn');
            const modal = modalContainer.querySelector('#bio-modal');
            const textarea = modalContainer.querySelector('#bio-textarea');
            const saveBtn = modalContainer.querySelector('#save-bio-btn');
            const cancelBtn = modalContainer.querySelector('#cancel-bio-btn');

            editBtn.addEventListener('click', () => {
              textarea.value = bioContent.innerHTML.replace(/<br>/g, '\n');
              modal.style.display = 'flex';
            });
            cancelBtn.addEventListener('click', () => { modal.style.display = 'none'; });
            saveBtn.addEventListener('click', async () => {
              saveBtn.innerText = 'Salvando...';
              const newValue = textarea.value;
              try {
                await setDoc(doc(db, 'site_settings', 'author_bio'), { value: newValue });
                bioContent.innerHTML = newValue.replace(/\n/g, '<br>');
                modal.style.display = 'none';
              } catch (err) {
                alert('Erro ao salvar bio');
              }
              saveBtn.innerText = 'Salvar';
            });
          }
        };

        if (auth.currentUser) {
          initAdminUI();
        } else {
          auth.authStateReady().then(() => initAdminUI()).catch(() => {});
        }
      } catch (_) {}
    };
    checkAdmin();

    // Initialize Push Toggle
    pushToggle.init(container);
  }
};
