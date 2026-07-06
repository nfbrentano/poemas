import{o as e}from"./index-sT4hFm2Y.js";var t={render(){return`
      <section class="newsletter-section fade-in">
        <h2 class="newsletter-title">O Eco das Palavras</h2>
        <p class="newsletter-description">
          Receba ocasionalmente novos poemas e devaneios direto na sua caixa de entrada. Sem spam, apenas poesia.
        </p>
        <form id="subscribe-form" class="subscribe-form" aria-label="Assinar newsletter">
          <input type="email" id="subscriber-email" class="subscribe-input" placeholder="Endereço de e-mail" required aria-label="Endereço de e-mail para newsletter">
          <button type="submit" class="subscribe-button">Assinar</button>
        </form>
        <div id="subscribe-message" class="subscribe-message" aria-live="polite"></div>
      </section>
    `},init(){let t=document.getElementById(`subscribe-form`);t&&t.addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`subscriber-email`).value,i=document.getElementById(`subscribe-message`);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r)){i.innerHTML=`Por favor, insira um e-mail válido.`,i.style.color=`var(--error)`;return}i.innerHTML=`Enviando...`,i.style.color=`var(--text-secondary)`;let{error:a}=await e.from(`subscribers`).insert([{email:r}]);!a||a.code===`23505`?(i.innerHTML=a?.code===`23505`?`Este e-mail já está inscrito.`:`Obrigado por assinar.`,i.style.color=a?.code===`23505`?`var(--text-secondary)`:`var(--success)`,a||t.reset()):(i.innerHTML=`Erro ao inscrever. Tente novamente.`,i.style.color=`var(--error)`)})}};export{t};