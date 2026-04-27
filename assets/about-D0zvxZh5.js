import{i as e}from"./index-HEwGkHwt.js";var t={meta:{title:`Sobre Natanael Brentano`},async render(t){let{data:{session:n}}=await e.auth.getSession(),r=!!n;t.innerHTML=`
      <section class="about-page fade-in">
        <div class="about-container">
          <div class="about-header">
            <h1>Sobre Natanael Brentano</h1>
          </div>

          <div class="about-content">
            <div class="about-avatar">
              <img id="profile-img" alt="Foto de Natanael Brentano" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
              ${r?`
                <label class="upload-label" for="avatar-upload">
                  Alterar foto
                </label>
                <input type="file" id="avatar-upload" accept="image/*" style="display:none;" />
              `:``}
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
    `;let i=t.querySelector(`#profile-img`),a=t.querySelector(`#avatar-upload`),o=t.querySelector(`.upload-label`),s=localStorage.getItem(`profilePhotoURL`);s&&(i.src=s),r&&a&&o&&(a.addEventListener(`change`,async t=>{let n=t.target.files[0];if(n){o.textContent=`Enviando…`,o.style.cursor=`default`,a.disabled=!0;try{let t=n.name.split(`.`).pop().toLowerCase(),r=`avatar_${Date.now()}.${t}`,{data:s,error:c}=await e.storage.from(`avatars`).upload(r,n,{cacheControl:`3600`,upsert:!1});if(c)throw c;let{data:l}=e.storage.from(`avatars`).getPublicUrl(r),u=l.publicUrl;i.src=u,localStorage.setItem(`profilePhotoURL`,u),o.textContent=`Foto atualizada!`,setTimeout(()=>{o.textContent=`Alterar foto`,o.style.cursor=`pointer`,a.disabled=!1},1500)}catch(e){console.error(`Erro ao upload avatar:`,e),o.textContent=`Erro ao enviar`,setTimeout(()=>{o.textContent=`Alterar foto`,o.style.cursor=`pointer`,a.disabled=!1},1500)}}}),o.addEventListener(`click`,e=>{e.preventDefault(),a.click()}))}};export{t as default};