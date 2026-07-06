import{o as e}from"./index-sT4hFm2Y.js";var t={meta:{title:`Cancelar Inscrição`},async render(t){t.innerHTML=`
      <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
        <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Cancelando inscrição...</h2>
        <p style="color: var(--text-muted, #888);">Aguarde um instante.</p>
      </div>
    `;let n=new URLSearchParams(window.location.search).get(`token`);if(!n){t.innerHTML=`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Link inválido</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 2rem;">Não encontramos o token de cancelamento na URL.</p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
        </div>
      `;return}try{let{data:r,error:i}=await e.functions.invoke(`unsubscribe`,{body:{token:n}});if(i)throw i;t.innerHTML=`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Inscrição cancelada</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 3rem; line-height: 1.6; font-size: 16px;">
            Seu e-mail foi removido da newsletter com sucesso.<br>
            Você não receberá mais notificações de novos poemas.
          </p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px; transition: background-color 0.2s;">Voltar para o início</a>
        </div>
      `}catch(e){console.error(e),t.innerHTML=`
        <div class="unsubscribe-page fade-in" style="max-width: 600px; margin: 6rem auto; text-align: center; padding: 0 2rem;">
          <h2 style="font-size: 24px; font-weight: 400; margin-bottom: 1rem; color: var(--text-color, #e2e2e2);">Ocorreu um erro</h2>
          <p style="color: var(--text-muted, #888); margin-bottom: 3rem;">Não foi possível processar o cancelamento. Tente novamente mais tarde.</p>
          <a href="/" data-link style="display: inline-block; padding: 12px 24px; border: 1px solid var(--border-color, #333); text-decoration: none; color: var(--text-color, #e2e2e2); text-transform: uppercase; font-size: 11px; letter-spacing: 2px;">Voltar ao site</a>
        </div>
      `}}};export{t as default};