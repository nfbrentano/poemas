const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BZJzOh7M.css"])))=>i.map(i=>d[i]);
import{T as e,b as t,f as n,i as r,o as i,p as a,s as o,u as s}from"./index-DadoRXS-.js";import{_ as c,c as l,g as u,l as d,m as f,p,u as m,v as h}from"./vendor-firebase-vW9DHoZS.js";import{t as g}from"./firebase-D6obsgpN.js";async function _(e){let t=new TextEncoder().encode(e),n=await crypto.subtle.digest(`SHA-256`,t);return Array.from(new Uint8Array(n),e=>e.toString(16).padStart(2,`0`)).join(``)}var v={isSupported(){return`serviceWorker`in navigator&&`PushManager`in window},async getSubscription(){if(!this.isSupported())return null;try{let e=await navigator.serviceWorker.ready;return e.pushManager?await e.pushManager.getSubscription():null}catch(e){return console.warn(`Erro ao obter assinatura de push:`,e),null}},async subscribe(){throw this.isSupported()?Error(`Chave pública VAPID não está configurada no ambiente.`):Error(`Notificações Push não são suportadas neste navegador.`)},async unsubscribe(){if(!this.isSupported())return;let e=await this.getSubscription();if(e){await e.unsubscribe();let t=e.toJSON().endpoint;await l(h(g,`push_subscriptions`,await _(t)))}},urlBase64ToUint8Array(e){if(!e)return new Uint8Array;let t=(e+`=`.repeat((4-e.length%4)%4)).replace(/-/g,`+`).replace(/_/g,`/`),n=window.atob(t),r=new Uint8Array(n.length);for(let e=0;e<n.length;++e)r[e]=n.charCodeAt(e);return r}},y={render(){return`
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
    `},async init(e){let t=e.querySelector(`#push-toggle-btn`),n=e.querySelector(`#push-message`);if(!t)return;let r=async()=>{await v.getSubscription()?(t.classList.add(`subscribed`),t.querySelector(`.push-status-text`).textContent=`Notificações Ativas`,t.querySelector(`.push-status-icon`).textContent=`🔕`):(t.classList.remove(`subscribed`),t.querySelector(`.push-status-text`).textContent=`Ativar Notificações`,t.querySelector(`.push-status-icon`).textContent=`🔔`)};await r(),t.addEventListener(`click`,async()=>{try{t.disabled=!0,await v.getSubscription()?(await v.unsubscribe(),n.textContent=`Notificações desativadas.`):(await v.subscribe(),n.textContent=`Você receberá avisos sobre novos poemas!`),await r()}catch(e){e.message&&e.message.includes(`VAPID`)?n.textContent=`Recurso de notificações não configurado no servidor.`:(console.error(e),n.textContent=`Erro ao configurar notificações. Verifique as permissões do navegador.`)}finally{t.disabled=!1,setTimeout(()=>{n.textContent=``},5e3)}})}};function b(){return`
      <div class="push-toggle-container fade-in">
        <p class="push-toggle-label">Deseja receber avisos de novos poemas?</p>
        <button id="push-toggle-btn" class="push-toggle-btn">
          <span class="push-status-icon">🔔</span>
          <span class="push-status-text">Ativar Notificações</span>
        </button>
        <p id="push-message" class="push-message"></p>
      </div>
  `}var x=`https://firebasestorage.googleapis.com/v0/b/poemas-natanael.firebasestorage.app/o/avatars%2Favatar_1788017538021.jpeg?alt=media&token=e54e38e7-5950-4c47-97a1-9ac1f8bcef15`,S=`Natanael Fernando Gatti Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.`;function C({poemsCount:e=222,collectionsCount:t=5}={}){return[{question:`Quem é Natanael Fernando Gatti Brentano?`,answer:`Natanael Fernando Gatti Brentano é um poeta e escritor brasileiro contemporâneo, autor de versos em língua portuguesa dedicados a explorar o tempo, os afetos, a efemeridade e as sutilezas do cotidiano.`},{question:`Sobre quais temas ele escreve?`,answer:`Sua produção poética aborda temas como o amor, a finitude, a saudade, a memória e a contemplação do instante presente, dialogando com referências como Manoel de Barros, Fernando Pessoa, Clarice Lispector e Hilda Hilst.`},{question:`Quantos poemas estão publicados no site?`,answer:`Atualmente estão publicados ${e} poemas no site oficial, distribuídos em ${t} coleções temáticas, com produção contínua iniciada em dezembro de 2015 e novos versos adicionados regularmente.`},{question:`Como os poemas estão organizados?`,answer:`Os poemas estão estruturados em coleções temáticas e catalogados por sentimentos e temas, permitindo navegar por temas, explorar o acervo por ordem cronológica ou descobrir obras de maneira aleatória.`},{question:`Posso compartilhar ou citar os poemas?`,answer:`Sim, a citação e o compartilhamento dos poemas são permitidos para fins não comerciais, desde que acompanhados da devida atribuição de autoria a Natanael Fernando Gatti Brentano e com o link para a obra original no site.`},{question:`Como receber novos poemas?`,answer:`Você pode receber novos poemas se inscrevendo gratuitamente na newsletter disponível nas páginas do site ou ativando as notificações push no seu navegador para receber avisos imediatos de publicações.`}]}function w({avatarUrl:e=x,bioText:n=S,poemsCount:r=222,collectionsCount:o=5,baseUrl:s=`/`}={}){let c=`${i}/sobre/`,l=[{name:`Início`,url:s},{name:`Sobre`,url:c}],u=t(n||``).replace(/\n/g,`<br>`),d=C({poemsCount:r,collectionsCount:o});return`
      <section class="about-page fade-in">
        <div class="about-container">
          ${a(l)}
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Natanael Fernando Gatti Brentano, poeta" src="${t(e)}" width="140" height="140" />
                <div id="admin-avatar-controls"></div>
              </div>
            </div>
            <div class="about-intro">
              <h1>Natanael Fernando Gatti Brentano</h1>
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
                ${u}
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
                    <span class="event">Consolidação do acervo digital e superação da marca de 200 poemas em julho com <em>Trilha Sonora do Agora</em>, reunindo atualmente <strong id="total-poems-count">${r}</strong> poemas publicados.</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="about-section faq-section" id="faq">
              <h2 class="section-title">Perguntas frequentes</h2>
              <div class="faq-list">
                ${d.map(e=>`
                  <article class="faq-item">
                    <h3 class="faq-question">${t(e.question)}</h3>
                    <p class="faq-answer">${t(e.answer)}</p>
                  </article>
                `).join(``)}
              </div>
            </div>
          </div>
          
          <div class="about-settings">
            ${b()}
          </div>
        </div>

        <div id="admin-modal-container"></div>
      </section>
  `}var T={meta:{title:`Sobre Natanael Fernando Gatti Brentano — Poeta`,description:`Biografia, influências e trajetória poética de Natanael Fernando Gatti Brentano.`},async render(a){let l=`${i}/sobre/`,_=[{name:`Início`,url:`${i}/`},{name:`Sobre`,url:l}];if(r({title:`Sobre Natanael Fernando Gatti Brentano — Poeta`,description:`Biografia, influências e trajetória poética de Natanael Fernando Gatti Brentano.`,url:l,type:`profile`,structuredData:[n(),o(_),s(C())]}),a.getAttribute(`data-prerendered`)===`/sobre`)a.removeAttribute(`data-prerendered`);else{let e=x;try{e=localStorage.getItem(`profilePhotoURL`)||`https://firebasestorage.googleapis.com/v0/b/poemas-natanael.firebasestorage.app/o/avatars%2Favatar_1788017538021.jpeg?alt=media&token=e54e38e7-5950-4c47-97a1-9ac1f8bcef15`}catch{}a.innerHTML=w({avatarUrl:e,baseUrl:`/`})}let v=a.querySelector(`#profile-img`),b=a.querySelector(`#bio-content`),T=S;(async()=>{try{let e=c(g,`site_settings`),n=(await m(e)).docs.map(e=>({key:e.id,value:e.data().value}));if(n.length>0){let e=n.find(e=>e.key===`avatar_url`),r=n.find(e=>e.key===`author_bio`);if(e&&v){v.src=e.value;try{localStorage.setItem(`profilePhotoURL`,e.value)}catch{}}r&&b&&(T=typeof r.value==`string`?r.value:``,b.innerHTML=t(T).replace(/\n/g,`<br>`))}}catch(e){console.error(`Erro ao buscar configurações:`,e)}try{let e=c(g,`poems`),t=p(e,u(`status`,`==`,`published`)),n=(await d(t)).data().count;if(n!==null){let e=a.querySelector(`#total-poems-count`);e&&(e.textContent=`${n}`)}}catch(e){console.error(`Erro ao buscar contagem de poemas:`,e)}})(),(async()=>{if(localStorage.getItem(`has_admin_session`)===`1`)try{let{getFirebaseAuth:n,getFirebaseStorage:r}=await e(async()=>{let{getFirebaseAuth:e,getFirebaseStorage:t}=await import(`./firebase-D6obsgpN.js`).then(e=>e.n);return{getFirebaseAuth:e,getFirebaseStorage:t}},__vite__mapDeps([0])),i=await n(),o=()=>{if(!i.currentUser){localStorage.removeItem(`has_admin_session`);return}let n=a.querySelector(`#admin-avatar-controls`);if(n){n.innerHTML=`
              <label class="upload-label" for="avatar-upload" style="cursor: pointer; font-size: 0.8rem; margin-top: 0.5rem; display: inline-block;">
                Alterar foto
              </label>
              <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
            `;let t=n.querySelector(`#avatar-upload`),i=n.querySelector(`.upload-label`);t&&i&&(t.addEventListener(`change`,async n=>{let a=n.target.files[0];if(a){i.textContent=`Enviando…`,t.disabled=!0;try{let t=a.name.split(`.`).pop().toLowerCase(),n=`avatar_${Date.now()}.${t}`,[{ref:o,uploadBytes:s,getDownloadURL:c},l]=await Promise.all([e(()=>import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.t),[]),r()]),u=o(l,`avatars/${n}`);await s(u,a);let d=await c(u);await f(h(g,`site_settings`,`avatar_url`),{value:d}),v&&(v.src=d),i.textContent=`Foto atualizada!`}catch(e){console.error(`Erro ao upload avatar:`,e),i.textContent=`Erro ao enviar`}finally{setTimeout(()=>{i.textContent=`Alterar foto`,t.disabled=!1},1500)}}}),i.addEventListener(`click`,e=>{e.preventDefault(),t.click()}))}let o=a.querySelector(`#admin-bio-controls`),s=a.querySelector(`#admin-modal-container`);if(o&&s){o.innerHTML=`<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>`,s.innerHTML=`
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
            `;let e=o.querySelector(`#edit-bio-btn`),n=s.querySelector(`#bio-modal`),r=s.querySelector(`#bio-textarea`),i=s.querySelector(`#save-bio-btn`),a=s.querySelector(`#cancel-bio-btn`);e.addEventListener(`click`,()=>{r.value=T,n.style.display=`flex`}),a.addEventListener(`click`,()=>{n.style.display=`none`}),i.addEventListener(`click`,async()=>{i.innerText=`Salvando...`;let e=r.value;try{await f(h(g,`site_settings`,`author_bio`),{value:e}),T=e,b.innerHTML=t(e).replace(/\n/g,`<br>`),n.style.display=`none`}catch{alert(`Erro ao salvar bio`)}i.innerText=`Salvar`})}};i.currentUser?o():i.authStateReady().then(()=>o()).catch(()=>{})}catch{}})(),y.init(a)}};export{T as default};