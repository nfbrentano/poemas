import{t as e}from"./supabase-C7rZ412s.js";var t={meta:{title:`Sobre Natanael Brentano`},async render(t){let{data:{session:n}}=await e.auth.getSession(),r=!!n;t.innerHTML=`
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <div class="about-avatar-container">
              <div class="about-avatar">
                <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
                ${r?`
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
              ${r?`<button id="edit-bio-btn" class="btn-secondary" style="margin-top: 1rem;">Editar Bio</button>`:``}
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

        ${r?`
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
    `;let i=t.querySelector(`#profile-img`),a=t.querySelector(`#bio-content`);if((async()=>{try{let{data:t}=await e.from(`site_settings`).select(`key, value`);if(t){let e=t.find(e=>e.key===`avatar_url`),n=t.find(e=>e.key===`author_bio`);e&&(i.src=e.value,localStorage.setItem(`profilePhotoURL`,e.value)),n?a.innerHTML=n.value.replace(/\n/g,`<br>`):a.innerText=`Natanael Brentano escreve sobre o que sobra do dia. Seus versos buscam capturar a efemeridade do instante e a profundidade das coisas simples.`}}catch(e){console.error(`Erro ao buscar configurações:`,e)}})(),r){let n=t.querySelector(`#edit-bio-btn`),r=t.querySelector(`#bio-modal`),i=t.querySelector(`#bio-textarea`),o=t.querySelector(`#save-bio-btn`),s=t.querySelector(`#cancel-bio-btn`);n.addEventListener(`click`,()=>{i.value=a.innerHTML.replace(/<br>/g,`
`),r.style.display=`flex`}),s.addEventListener(`click`,()=>r.style.display=`none`),o.addEventListener(`click`,async()=>{o.innerText=`Salvando...`;let t=i.value,{error:n}=await e.from(`site_settings`).upsert({key:`author_bio`,value:t});n?alert(`Erro ao salvar bio`):(a.innerHTML=t.replace(/\n/g,`<br>`),r.style.display=`none`),o.innerText=`Salvar`})}let o=t.querySelector(`#avatar-upload`),s=t.querySelector(`.upload-label`);r&&o&&s&&(o.addEventListener(`change`,async t=>{let n=t.target.files[0];if(n){s.textContent=`Enviando…`,o.disabled=!0;try{let t=n.name.split(`.`).pop().toLowerCase(),r=`avatar_${Date.now()}.${t}`,{data:a,error:o}=await e.storage.from(`avatars`).upload(r,n);if(o)throw o;let{data:c}=e.storage.from(`avatars`).getPublicUrl(r),l=c.publicUrl;await e.from(`site_settings`).upsert({key:`avatar_url`,value:l}),i.src=l,localStorage.setItem(`profilePhotoURL`,l),s.textContent=`Foto atualizada!`}catch(e){console.error(`Erro ao upload avatar:`,e),s.textContent=`Erro ao enviar`}finally{setTimeout(()=>{s.textContent=`Alterar foto`,o.disabled=!1},1500)}}}),s.addEventListener(`click`,e=>{e.preventDefault(),o.click()}))}};export{t as default};