const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-BZJzOh7M.css"])))=>i.map(i=>d[i]);
import{T as e}from"./index-fdOadyoa.js";var t={render(){return`
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
    `},init(){let t=document.getElementById(`subscribe-form`);t&&t.addEventListener(`submit`,async n=>{n.preventDefault();let r=document.getElementById(`subscriber-email`),i=t.querySelector(`button[type="submit"]`),a=r.value.trim().toLowerCase(),o=document.getElementById(`subscribe-message`);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a))o.innerHTML=`Por favor, insira um e-mail válido.`,o.style.color=`var(--error)`;else{o.innerHTML=`Enviando...`,o.style.color=`var(--text-secondary)`,i.disabled=!0;try{let{db:n}=await e(async()=>{let{db:e}=await import(`./firebase-B_dJRC60.js`).then(e=>e.n);return{db:e}},__vite__mapDeps([0])),{doc:r,setDoc:i}=await e(async()=>{let{doc:e,setDoc:t}=await import(`./vendor-firebase-vW9DHoZS.js`).then(e=>e.o);return{doc:e,setDoc:t}},[]);await i(r(n,`subscribers`,a),{email:a,created_at:new Date().toISOString()}),o.innerHTML=`Obrigado por assinar.`,o.style.color=`var(--success)`,t.reset()}catch(e){e.code===`permission-denied`?(o.innerHTML=`Este e-mail já está inscrito.`,o.style.color=`var(--text-secondary)`):(o.innerHTML=`Erro ao inscrever. Tente novamente.`,o.style.color=`var(--error)`)}finally{i.disabled=!1}}})}};export{t};