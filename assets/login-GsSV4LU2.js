import{i as e,t}from"./index-C-Khbs-6.js";var n={meta:{title:`Login Admin`},async render(n){let{data:{session:r}}=await e.auth.getSession();if(r){t(`/admin`);return}n.innerHTML=`
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
    `,document.getElementById(`login-form`).addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`login-email`).value,i=document.getElementById(`login-password`).value,a=document.getElementById(`login-error`);a.textContent=`Autenticando...`;let{error:o}=await e.auth.signInWithPassword({email:r,password:i});o?a.textContent=`E-mail ou senha incorretos.`:(a.textContent=``,t(`/admin`))})}};export{n as default};