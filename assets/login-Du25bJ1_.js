import{t as e}from"./index-5Z0EvPl5.js";import{t}from"./index.esm-C-viHdGu.js";import{getFirebaseAuth as n}from"./firebase-DbnQPwBn.js";var r={meta:{title:`Login Admin`},async render(r){let i=await n();if(i.currentUser){e(`/admin`);return}r.innerHTML=`
      <div class="login-container fade-in" style="max-width: 400px; margin: 4rem auto; padding: 2rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-color-light);">
        <h2 style="text-align: center; margin-bottom: 2rem; font-family: var(--font-sans);">Acesso Admin</h2>
        <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">E-mail</label>
            <input type="email" id="login-email" required>
          </div>
          <div>
            <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">Senha</label>
            <input type="password" id="login-password" required>
          </div>
          <button type="submit" class="btn-primary" style="margin-top: 1rem;">Entrar</button>
        </form>
        <div id="login-error" style="color: var(--error-color); margin-top: 1rem; text-align: center; font-size: 0.9rem;"></div>
      </div>
    `,document.getElementById(`login-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`login-email`).value,a=document.getElementById(`login-password`).value,o=document.getElementById(`login-error`);o.textContent=`Autenticando...`;try{await t(i,r,a),o.textContent=``,e(`/admin`)}catch{o.textContent=`E-mail ou senha incorretos.`}})}};export{r as default};