import { db, getFirebaseAuth, getFirebaseStorage } from '../utils/firebase.js';
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { pushToggle } from '../components/push-toggle.js';

export default {
  meta: {
    title: 'Sobre Natanael Brentano'
  },
  async render(container) {
    container.innerHTML = `
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                <div id="admin-avatar-controls"></div>
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
                Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.
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
                    <span class="event">Consolidação do acervo digital e superação da marca de 200 poemas em julho com <em>Trilha Sonora do Agora</em>, reunindo atualmente <strong id="total-poems-count">222</strong> poemas publicados.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="about-settings">
            ${pushToggle.render()}
          </div>
        </div>

        <div id="admin-modal-container"></div>
      </section>
    `;

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

    // Verificação de Admin em segundo plano (sem travar a renderização inicial)
    const checkAdmin = async () => {
      try {
        const auth = await getFirebaseAuth();
        const initAdminUI = () => {
          if (!auth.currentUser) return;

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
                  const storage = await getFirebaseStorage();
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
