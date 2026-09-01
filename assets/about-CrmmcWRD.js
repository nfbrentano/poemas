import{a as e,c as t,d as n,f as r,i,l as a,p as o,r as s}from"./index.esm-C77q4Vsq.js";import{getDownloadURL as c,ref as l,uploadBytes as u}from"./index.esm-eEzmRnvE.js";import{db as d,getFirebaseAuth as f,getFirebaseStorage as p}from"./firebase-DbnQPwBn.js";var m={isSupported(){return`serviceWorker`in navigator&&`PushManager`in window},async getSubscription(){if(!this.isSupported())return null;try{let e=await navigator.serviceWorker.ready;return e.pushManager?await e.pushManager.getSubscription():null}catch(e){return console.warn(`Erro ao obter assinatura de push:`,e),null}},async subscribe(){throw this.isSupported()?Error(`Chave pública VAPID não está configurada no ambiente.`):Error(`Notificações Push não são suportadas neste navegador.`)},async unsubscribe(){if(!this.isSupported())return;let i=await this.getSubscription();if(i){await i.unsubscribe();let a=i.toJSON().endpoint,c=t(r(d,`push_subscriptions`),n(`subscription.endpoint`,`==`,a));(await e(c)).forEach(async e=>{await s(o(d,`push_subscriptions`,e.id))})}},urlBase64ToUint8Array(e){if(!e)return new Uint8Array;let t=(e+`=`.repeat((4-e.length%4)%4)).replace(/-/g,`+`).replace(/_/g,`/`),n=window.atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;++e)r[e]=n.charCodeAt(e);return r}},h={render(){return`
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
    `},async init(e){let t=e.querySelector(`#push-toggle-btn`),n=e.querySelector(`#push-message`);if(!t)return;let r=async()=>{await m.getSubscription()?(t.classList.add(`subscribed`),t.querySelector(`.push-status-text`).textContent=`Notificações Ativas`,t.querySelector(`.push-status-icon`).textContent=`🔕`):(t.classList.remove(`subscribed`),t.querySelector(`.push-status-text`).textContent=`Ativar Notificações`,t.querySelector(`.push-status-icon`).textContent=`🔔`)};await r(),t.addEventListener(`click`,async()=>{try{t.disabled=!0,await m.getSubscription()?(await m.unsubscribe(),n.textContent=`Notificações desativadas.`):(await m.subscribe(),n.textContent=`Você receberá avisos sobre novos poemas!`),await r()}catch(e){console.error(e),n.textContent=`Erro ao configurar notificações. Verifique as permissões do navegador.`}finally{t.disabled=!1,setTimeout(()=>{n.textContent=``},5e3)}})}},g={meta:{title:`Sobre Natanael Brentano`},async render(s){let m=await f();await m.authStateReady();let g=!!m.currentUser;s.innerHTML=`
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                ${g?`
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
              ${g?`<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>`:``}
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
            ${h.render()}
          </div>
        </div>

        ${g?`
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
    `;let _=s.querySelector(`#profile-img`),v=s.querySelector(`#bio-content`);if((async()=>{try{let t=r(d,`site_settings`),n=(await e(t)).docs.map(e=>({key:e.id,value:e.data().value}));if(n.length>0){let e=n.find(e=>e.key===`avatar_url`),t=n.find(e=>e.key===`author_bio`);e&&(_.src=e.value,localStorage.setItem(`profilePhotoURL`,e.value)),t?v.innerHTML=t.value.replace(/\n/g,`<br>`):v.innerText=`Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.`}}catch(e){console.error(`Erro ao buscar configurações:`,e)}try{let e=r(d,`poems`),a=t(e,n(`status`,`==`,`published`)),o=(await i(a)).data().count;if(o!==null){let e=s.querySelector(`#total-poems-count`);e&&(e.textContent=`${o}`)}}catch(e){console.error(`Erro ao buscar contagem de poemas:`,e)}})(),g){let e=s.querySelector(`#edit-bio-btn`),t=s.querySelector(`#bio-modal`),n=s.querySelector(`#bio-textarea`),r=s.querySelector(`#save-bio-btn`),i=s.querySelector(`#cancel-bio-btn`);e.addEventListener(`click`,()=>{n.value=v.innerHTML.replace(/<br>/g,`
`),t.style.display=`flex`}),i.addEventListener(`click`,()=>t.style.display=`none`),r.addEventListener(`click`,async()=>{r.innerText=`Salvando...`;let e=n.value,i=null;try{await a(o(d,`site_settings`,`author_bio`),{value:e})}catch(e){i=e}i?alert(`Erro ao salvar bio`):(v.innerHTML=e.replace(/\n/g,`<br>`),t.style.display=`none`),r.innerText=`Salvar`})}let y=s.querySelector(`#avatar-upload`),b=s.querySelector(`.upload-label`);g&&y&&b&&(y.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t){b.textContent=`Enviando…`,y.disabled=!0;try{let e=t.name.split(`.`).pop().toLowerCase(),n=`avatar_${Date.now()}.${e}`,r=await p(),i=l(r,`avatars/${n}`);await u(i,t);let s=await c(i);await a(o(d,`site_settings`,`avatar_url`),{value:s}),_.src=s,localStorage.setItem(`profilePhotoURL`,s),b.textContent=`Foto atualizada!`}catch(e){console.error(`Erro ao upload avatar:`,e),b.textContent=`Erro ao enviar`}finally{setTimeout(()=>{b.textContent=`Alterar foto`,y.disabled=!1},1500)}}}),b.addEventListener(`click`,e=>{e.preventDefault(),y.click()})),h.init(s)}};export{g as default};