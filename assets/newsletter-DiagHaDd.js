import{_ as e,g as t,p as n,s as r,u as i}from"./vendor-firebase-BaoyJsfj.js";import{db as a}from"./firebase-DvthlrAF.js";var o={render(){return`
      <section class="newsletter-section fade-in">
        <h2 class="newsletter-title">Um pedacinho de mim para você</h2>
        <p class="newsletter-description">
          Receba novos poemas, devaneios e o compilado do mês direto na sua caixa de entrada. Sem spam, apenas palavras sinceras.
        </p>
        <form id="subscribe-form" class="subscribe-form" aria-label="Assinar newsletter">
          <input type="email" id="subscriber-email" class="subscribe-input" placeholder="Endereço de e-mail" required aria-label="Endereço de e-mail para newsletter">
          <button type="submit" class="subscribe-button">Assinar</button>
        </form>
        <div id="subscribe-message" class="subscribe-message" aria-live="polite"></div>
      </section>
    `},init(){let o=document.getElementById(`subscribe-form`);o&&o.addEventListener(`submit`,async s=>{s.preventDefault();let c=document.getElementById(`subscriber-email`).value,l=document.getElementById(`subscribe-message`);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)){l.innerHTML=`Por favor, insira um e-mail válido.`,l.style.color=`var(--error)`;return}l.innerHTML=`Enviando...`,l.style.color=`var(--text-secondary)`;try{let s=n(e(a,`subscribers`),t(`email`,`==`,c));(await i(s)).empty?(await r(e(a,`subscribers`),{email:c,created_at:new Date().toISOString()}),l.innerHTML=`Obrigado por assinar.`,l.style.color=`var(--success)`,o.reset()):(l.innerHTML=`Este e-mail já está inscrito.`,l.style.color=`var(--text-secondary)`)}catch{l.innerHTML=`Erro ao inscrever. Tente novamente.`,l.style.color=`var(--error)`}})}};export{o as t};