import{a as e}from"./html-DUzinkfe.js";function t(){return`https://southamerica-east1-poemas-natanael.cloudfunctions.net/unsubscribeNewsletter`}var n={meta:{title:`Cancelar Inscrição`,robots:`noindex, nofollow`},async render(n){if(typeof navigator<`u`&&navigator.onLine===!1){n.innerHTML=e(`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Você está offline</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 2rem;">Conecte-se à internet para cancelar sua inscrição.</p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
        </div>
      `);return}n.innerHTML=e(`
      <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
        <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Cancelando inscrição...</h2>
        <p style="color: var(--text-muted, #888);">Aguarde um instante.</p>
      </div>
    `);let r=new URLSearchParams(window.location.search).get(`token`);if(!r||!r.trim())n.innerHTML=e(`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Link inválido</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 2rem;">Não encontramos o token de cancelamento na URL.</p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
        </div>
      `);else try{let i=t(),a=await fetch(i,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({token:r.trim()})});if(a.status===404){n.innerHTML=e(`
          <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
            <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Link inválido ou expirado</h2>
            <p style="color: var(--text-muted, #888); margin-bottom: 2rem;">Não encontramos sua inscrição ou este link de cancelamento já não é mais válido.</p>
            <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
          </div>
        `);return}if(!a.ok)throw Error(`Falha ao cancelar inscrição`);n.innerHTML=e(`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Inscrição cancelada</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 3rem; line-height: 1.6; font-size: 16px;">
            Seu e-mail foi removido da newsletter com sucesso.<br>
            Você não receberá mais notificações de novos poemas.
          </p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px; transition: background-color 0.2s;">Voltar para o início</a>
        </div>
      `)}catch(t){if(typeof navigator<`u`&&!navigator.onLine){n.innerHTML=e(`
          <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
            <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Você está offline</h2>
            <p style="color: var(--text-muted, #888); margin-bottom: 3rem;">Conecte-se à internet para cancelar sua inscrição.</p>
            <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
          </div>
        `);return}console.error(t),n.innerHTML=e(`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Ocorreu um erro</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 3rem;">Não foi possível processar o cancelamento. Tente novamente mais tarde.</p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
        </div>
      `)}}};export{n as default};