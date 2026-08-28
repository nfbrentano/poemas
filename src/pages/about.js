import { auth, db, storage } from '../utils/firebase.js';
import { collection, getDocs, doc, setDoc, getCountFromServer, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { pushToggle } from '../components/push-toggle.js';

export default {
  meta: {
    title: 'Sobre Natanael Brentano'
  },
  async render(container) {
    await auth.authStateReady();
    const isAdmin = !!auth.currentUser;

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
    
    // Carregar configurações do site e contagem atualizada de poemas
    const loadSettings = async () => {
      try {
        const settingsRef = collection(db, 'site_settings');
        const settingsSnap = await getDocs(settingsRef);
        const settings = settingsSnap.docs.map(doc => ({ key: doc.id, value: doc.data().value }));

        if (settings.length > 0) {
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
        
        let error = null;
        try {
          await setDoc(doc(db, 'site_settings', 'author_bio'), { value: newValue });
        } catch (err) {
          error = err;
        }

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

          const storageRef = ref(storage, `avatars/${fileName}`);
          await uploadBytes(storageRef, file);
          const publicURL = await getDownloadURL(storageRef);

          await setDoc(doc(db, 'site_settings', 'avatar_url'), { value: publicURL });

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

    // Initialize Push Toggle
    pushToggle.init(container);
  }
};
