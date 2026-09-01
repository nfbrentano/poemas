import{a as e,c as t,d as n,f as r,n as i}from"./index.esm-C77q4Vsq.js";import{db as a}from"./firebase-DbnQPwBn.js";var o={render(){return`
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
    `},init(){let o=document.getElementById(`subscribe-form`);o&&o.addEventListener(`submit`,async s=>{s.preventDefault();let c=document.getElementById(`subscriber-email`).value,l=document.getElementById(`subscribe-message`);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)){l.innerHTML=`Por favor, insira um e-mail válido.`,l.style.color=`var(--error)`;return}l.innerHTML=`Enviando...`,l.style.color=`var(--text-secondary)`;try{let s=t(r(a,`subscribers`),n(`email`,`==`,c));(await e(s)).empty?(await i(r(a,`subscribers`),{email:c,created_at:new Date().toISOString()}),l.innerHTML=`Obrigado por assinar.`,l.style.color=`var(--success)`,o.reset()):(l.innerHTML=`Este e-mail já está inscrito.`,l.style.color=`var(--text-secondary)`)}catch{l.innerHTML=`Erro ao inscrever. Tente novamente.`,l.style.color=`var(--error)`}})}};export{o as t};