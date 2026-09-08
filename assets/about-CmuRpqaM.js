const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-B4I_iTbc.css"])))=>i.map(i=>d[i]);
import{_ as e,c as t,g as n,l as r,m as i,p as a,u as o,v as s}from"./vendor-firebase-BaoyJsfj.js";import{r as c}from"./index-Bzky9zOq.js";import{db as l}from"./firebase-DvthlrAF.js";var u={isSupported(){return`serviceWorker`in navigator&&`PushManager`in window},async getSubscription(){if(!this.isSupported())return null;try{let e=await navigator.serviceWorker.ready;return e.pushManager?await e.pushManager.getSubscription():null}catch(e){return console.warn(`Erro ao obter assinatura de push:`,e),null}},async subscribe(){throw this.isSupported()?Error(`Chave pública VAPID não está configurada no ambiente.`):Error(`Notificações Push não são suportadas neste navegador.`)},async unsubscribe(){if(!this.isSupported())return;let r=await this.getSubscription();if(r){await r.unsubscribe();let i=r.toJSON().endpoint,c=a(e(l,`push_subscriptions`),n(`subscription.endpoint`,`==`,i));(await o(c)).forEach(async e=>{await t(s(l,`push_subscriptions`,e.id))})}},urlBase64ToUint8Array(e){if(!e)return new Uint8Array;let t=(e+`=`.repeat((4-e.length%4)%4)).replace(/-/g,`+`).replace(/_/g,`/`),n=window.atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;++e)r[e]=n.charCodeAt(e);return r}},d={render(){return`
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
    `},async init(e){let t=e.querySelector(`#push-toggle-btn`),n=e.querySelector(`#push-message`);if(!t)return;let r=async()=>{await u.getSubscription()?(t.classList.add(`subscribed`),t.querySelector(`.push-status-text`).textContent=`Notificações Ativas`,t.querySelector(`.push-status-icon`).textContent=`🔕`):(t.classList.remove(`subscribed`),t.querySelector(`.push-status-text`).textContent=`Ativar Notificações`,t.querySelector(`.push-status-icon`).textContent=`🔔`)};await r(),t.addEventListener(`click`,async()=>{try{t.disabled=!0,await u.getSubscription()?(await u.unsubscribe(),n.textContent=`Notificações desativadas.`):(await u.subscribe(),n.textContent=`Você receberá avisos sobre novos poemas!`),await r()}catch(e){console.error(e),n.textContent=`Erro ao configurar notificações. Verifique as permissões do navegador.`}finally{t.disabled=!1,setTimeout(()=>{n.textContent=``},5e3)}})}},f={meta:{title:`Sobre Natanael Brentano`},async render(t){t.innerHTML=`
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
            ${d.render()}
          </div>
        </div>

        <div id="admin-modal-container"></div>
      </section>
    `;let u=t.querySelector(`#profile-img`),f=t.querySelector(`#bio-content`);(async()=>{try{let t=e(l,`site_settings`),n=(await o(t)).docs.map(e=>({key:e.id,value:e.data().value}));if(n.length>0){let e=n.find(e=>e.key===`avatar_url`),t=n.find(e=>e.key===`author_bio`);if(e&&u){u.src=e.value;try{localStorage.setItem(`profilePhotoURL`,e.value)}catch{}}t&&f&&(f.innerHTML=t.value.replace(/\n/g,`<br>`))}}catch(e){console.error(`Erro ao buscar configurações:`,e)}try{let i=e(l,`poems`),o=a(i,n(`status`,`==`,`published`)),s=(await r(o)).data().count;if(s!==null){let e=t.querySelector(`#total-poems-count`);e&&(e.textContent=`${s}`)}}catch(e){console.error(`Erro ao buscar contagem de poemas:`,e)}})(),(async()=>{if(localStorage.getItem(`has_admin_session`)===`1`)try{let{getFirebaseAuth:e,getFirebaseStorage:n}=await c(async()=>{let{getFirebaseAuth:e,getFirebaseStorage:t}=await import(`./firebase-DvthlrAF.js`);return{getFirebaseAuth:e,getFirebaseStorage:t}},__vite__mapDeps([0])),r=await e(),a=()=>{if(!r.currentUser){localStorage.removeItem(`has_admin_session`);return}let e=t.querySelector(`#admin-avatar-controls`);if(e){e.innerHTML=`
              <label class="upload-label" for="avatar-upload" style="cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem; display: inline-block;">
                Alterar foto
              </label>
              <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
            `;let t=e.querySelector(`#avatar-upload`),r=e.querySelector(`.upload-label`);t&&r&&(t.addEventListener(`change`,async e=>{let a=e.target.files[0];if(a){r.textContent=`Enviando…`,t.disabled=!0;try{let e=a.name.split(`.`).pop().toLowerCase(),t=`avatar_${Date.now()}.${e}`,[{ref:o,uploadBytes:d,getDownloadURL:f},p]=await Promise.all([c(()=>import(`./vendor-firebase-BaoyJsfj.js`).then(e=>e.t),[]),n()]),m=o(p,`avatars/${t}`);await d(m,a);let h=await f(m);await i(s(l,`site_settings`,`avatar_url`),{value:h}),u&&(u.src=h),r.textContent=`Foto atualizada!`}catch(e){console.error(`Erro ao upload avatar:`,e),r.textContent=`Erro ao enviar`}finally{setTimeout(()=>{r.textContent=`Alterar foto`,t.disabled=!1},1500)}}}),r.addEventListener(`click`,e=>{e.preventDefault(),t.click()}))}let a=t.querySelector(`#admin-bio-controls`),o=t.querySelector(`#admin-modal-container`);if(a&&o){a.innerHTML=`<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>`,o.innerHTML=`
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
            `;let e=a.querySelector(`#edit-bio-btn`),t=o.querySelector(`#bio-modal`),n=o.querySelector(`#bio-textarea`),r=o.querySelector(`#save-bio-btn`),c=o.querySelector(`#cancel-bio-btn`);e.addEventListener(`click`,()=>{n.value=f.innerHTML.replace(/<br>/g,`
`),t.style.display=`flex`}),c.addEventListener(`click`,()=>{t.style.display=`none`}),r.addEventListener(`click`,async()=>{r.innerText=`Salvando...`;let e=n.value;try{await i(s(l,`site_settings`,`author_bio`),{value:e}),f.innerHTML=e.replace(/\n/g,`<br>`),t.style.display=`none`}catch{alert(`Erro ao salvar bio`)}r.innerText=`Salvar`})}};r.currentUser?a():r.authStateReady().then(()=>a()).catch(()=>{})}catch{}})(),d.init(t)}};export{f as default};