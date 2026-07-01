import{o as e}from"./index-DM3vFeyv.js";var t={isSupported(){return`serviceWorker`in navigator&&`PushManager`in window},async getSubscription(){if(!this.isSupported())return null;try{let e=await navigator.serviceWorker.ready;return e.pushManager?await e.pushManager.getSubscription():null}catch(e){return console.warn(`Erro ao obter assinatura de push:`,e),null}},async subscribe(){throw this.isSupported()?Error(`Chave pública VAPID não está configurada no ambiente.`):Error(`Notificações Push não são suportadas neste navegador.`)},async unsubscribe(){if(!this.isSupported())return;let t=await this.getSubscription();if(t){await t.unsubscribe();let n=t.toJSON();await e.from(`push_subscriptions`).delete().match({"subscription->endpoint":n.endpoint})}},urlBase64ToUint8Array(e){if(!e)return new Uint8Array;let t=(e+`=`.repeat((4-e.length%4)%4)).replace(/-/g,`+`).replace(/_/g,`/`),n=window.atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;++e)r[e]=n.charCodeAt(e);return r}},n={render(){return`
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
    `},async init(e){let n=e.querySelector(`#push-toggle-btn`),r=e.querySelector(`#push-message`);if(!n)return;let i=async()=>{await t.getSubscription()?(n.classList.add(`subscribed`),n.querySelector(`.push-status-text`).textContent=`Notificações Ativas`,n.querySelector(`.push-status-icon`).textContent=`🔕`):(n.classList.remove(`subscribed`),n.querySelector(`.push-status-text`).textContent=`Ativar Notificações`,n.querySelector(`.push-status-icon`).textContent=`🔔`)};await i(),n.addEventListener(`click`,async()=>{try{n.disabled=!0,await t.getSubscription()?(await t.unsubscribe(),r.textContent=`Notificações desativadas.`):(await t.subscribe(),r.textContent=`Você receberá avisos sobre novos poemas!`),await i()}catch(e){console.error(e),r.textContent=`Erro ao configurar notificações. Verifique as permissões do navegador.`}finally{n.disabled=!1,setTimeout(()=>{r.textContent=``},5e3)}})}},r={meta:{title:`Sobre Natanael Brentano`},async render(t){let{data:{session:r}}=await e.auth.getSession(),i=!!r;t.innerHTML=`
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                ${i?`
                  <label class="upload-label" for="avatar-upload">
                    Alterar foto
                  </label>
                  <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
                `:``}
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
              ${i?`<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>`:``}
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
          
          <div class="about-settings">
            ${n.render()}
          </div>
        </div>

        ${i?`
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
        `:``}
      </section>
    `;let a=t.querySelector(`#profile-img`),o=t.querySelector(`#bio-content`);if((async()=>{try{let{data:t}=await e.from(`site_settings`).select(`key, value`);if(t){let e=t.find(e=>e.key===`avatar_url`),n=t.find(e=>e.key===`author_bio`);e&&(a.src=e.value,localStorage.setItem(`profilePhotoURL`,e.value)),n?o.innerHTML=n.value.replace(/\n/g,`<br>`):o.innerText=`Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.`}}catch(e){console.error(`Erro ao buscar configurações:`,e)}})(),i){let n=t.querySelector(`#edit-bio-btn`),r=t.querySelector(`#bio-modal`),i=t.querySelector(`#bio-textarea`),a=t.querySelector(`#save-bio-btn`),s=t.querySelector(`#cancel-bio-btn`);n.addEventListener(`click`,()=>{i.value=o.innerHTML.replace(/<br>/g,`
`),r.style.display=`flex`}),s.addEventListener(`click`,()=>r.style.display=`none`),a.addEventListener(`click`,async()=>{a.innerText=`Salvando...`;let t=i.value,{error:n}=await e.from(`site_settings`).upsert({key:`author_bio`,value:t});n?alert(`Erro ao salvar bio`):(o.innerHTML=t.replace(/\n/g,`<br>`),r.style.display=`none`),a.innerText=`Salvar`})}let s=t.querySelector(`#avatar-upload`),c=t.querySelector(`.upload-label`);i&&s&&c&&(s.addEventListener(`change`,async t=>{let n=t.target.files[0];if(n){c.textContent=`Enviando…`,s.disabled=!0;try{let t=n.name.split(`.`).pop().toLowerCase(),r=`avatar_${Date.now()}.${t}`,{data:i,error:o}=await e.storage.from(`avatars`).upload(r,n);if(o)throw o;let{data:s}=e.storage.from(`avatars`).getPublicUrl(r),l=s.publicUrl;await e.from(`site_settings`).upsert({key:`avatar_url`,value:l}),a.src=l,localStorage.setItem(`profilePhotoURL`,l),c.textContent=`Foto atualizada!`}catch(e){console.error(`Erro ao upload avatar:`,e),c.textContent=`Erro ao enviar`}finally{setTimeout(()=>{c.textContent=`Alterar foto`,s.disabled=!1},1500)}}}),c.addEventListener(`click`,e=>{e.preventDefault(),s.click()})),n.init(t)}};export{r as default};