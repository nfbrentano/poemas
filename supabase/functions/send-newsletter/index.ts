// @ts-ignore: Deno URL import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore: Deno URL import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6.9.13';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let supabaseClient: any = null;
  let currentPoemId: string | null = null;

  try {
    const { poemId, targetEmail } = await req.json();

    if (!poemId) throw new Error('poemId is required');
    currentPoemId = poemId;

    // Secrets
    const GMAIL_USER = Deno.env.get('GMAIL_USER');
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');
    const SENDER_NAME = Deno.env.get('SENDER_NAME') || 'Natanael Brentano';

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error('Configuração ausente (GMAIL_USER ou GMAIL_APP_PASSWORD)');
    }

    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized: missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const serviceRoleKey = (Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();

    // Allow service role key to bypass user auth check
    if (token !== serviceRoleKey) {
      const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

      if (userError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized: invalid token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fetch Poem
    const { data: poem } = await supabaseClient
      .from('poems')
      .select('title, content, excerpt, slug')
      .eq('id', poemId)
      .single();

    if (!poem) throw new Error('Poem not found');

    // Fetch Subscribers or use targetEmail
    let subscribers = [];
    if (targetEmail) {
      subscribers = [{ email: targetEmail, unsubscribe_token: 'daily-test-token' }];
    } else {
      const { data: fetchedSubscribers } = await supabaseClient
        .from('subscribers')
        .select('email, unsubscribe_token')
        .eq('active', true);
        
      if (fetchedSubscribers) {
        subscribers = fetchedSubscribers;
      }
    }

    if (subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscribers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const siteUrl = 'https://nfbrentano.github.io/poemas';
    const poemUrl = `${siteUrl}/poema/${poem.slug}`;

    const poemContentHtml = poem.content
      .replace(/\n\n/g, '</p><p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">')
      .replace(/\n/g, '<br>');

    const getHtmlEmail = (unsubscribeToken: string) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: Georgia, serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="text-align: center; padding-bottom: 40px; border-bottom: 1px solid #1a1a1a;">
              <p style="margin: 0; font-family: sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666666;">Novo poema publicado</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 60px 20px 20px;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #e2e2e2; line-height: 1.2;">${poem.title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">${poemContentHtml}</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 60px 20px 40px;">
              <a href="${poemUrl}" style="display: inline-block; padding: 14px 32px; font-family: sans-serif; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #050505; background-color: #e2e2e2; text-decoration: none; border-radius: 2px;">Ler no site</a>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 40px 20px; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 8px; font-size: 16px; font-style: italic; color: #666666;">Natanael Brentano</p>
              <p style="margin: 20px 0 0; font-size: 12px; color: #444444;">
                <a href="${siteUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #666666; text-decoration: underline;">Não quer mais receber estes e-mails? Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    console.log(`Iniciando envio via Gmail SMTP para ${subscribers.length} assinantes...`);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    let successCount = 0;
    let failCount = 0;

    try {
      for (const sub of subscribers) {
        const mailOptions = {
          from: `"${SENDER_NAME}" <${GMAIL_USER}>`,
          to: sub.email,
          subject: `${poem.title} — novo poema`,
          html: getHtmlEmail(sub.unsubscribe_token),
          text: `${poem.title}\n\n${poem.content}\n\n---\nLeia no site: ${poemUrl}\nCancelar inscrição: ${siteUrl}/unsubscribe?token=${sub.unsubscribe_token}`
        };

        try {
          await transporter.sendMail(mailOptions);
          successCount++;
        } catch (err: any) {
          console.error(`Falha ao enviar para ${sub.email}:`, err);
          failCount++;
          
          // Desativar assinante em caso de falha no envio
          try {
            await supabaseClient
              .from('subscribers')
              .update({ active: false })
              .eq('email', sub.email);
            console.log(`Assinante desativado automaticamente devido à falha de envio: ${sub.email}`);
          } catch (dbErr: any) {
            console.error(`Falha ao tentar desativar o assinante ${sub.email}:`, dbErr);
          }
        }
      }

      console.log(`Envio via Gmail SMTP concluído. Sucesso: ${successCount}, Falha: ${failCount}`);

      if (successCount === 0 && failCount > 0) {
        throw new Error('Todos os envios falharam via Gmail SMTP.');
      }

    } catch (smtpError: any) {
      console.error('Erro geral SMTP:', smtpError);
      throw new Error(`Erro ao disparar envios via Gmail SMTP: ${smtpError.message || String(smtpError)}`);
    }

    // Log success
    const { error: logError } = await supabaseClient.from('email_campaign_logs').insert([{
      poem_id: poemId,
      status: successCount > 0 ? 'success' : 'failed',
      details: `Enviado via Gmail SMTP. Sucesso: ${successCount}, Falhas: ${failCount}.`
    }]);

    if (logError) {
      console.error('Erro ao salvar no histórico (email_campaign_logs):', logError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: subscribers.length,
      logError: logError || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função:', error);
    
    // Tentativa de logar a falha se já tivermos o poemId e o client
    if (supabaseClient && currentPoemId) {
      await supabaseClient.from('email_campaign_logs').insert([{
        poem_id: currentPoemId,
        status: 'failed',
        details: `Erro geral na execução: ${error.message || String(error)}`
      }]);
    }

    return new Response(JSON.stringify({ 
      error: error.message || String(error),
      details: error.stack || 'No stack trace'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
