// @ts-ignore: Deno URL import
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore: Deno URL import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Declare Deno global for standard TypeScript compiler
declare const Deno: any;

// Polyfills for Deno APIs (deprecated/removed in newer Deno versions used by Supabase)
// @ts-ignore
if (typeof Deno.writeAll !== 'function') {
  // @ts-ignore
  Deno.writeAll = async function(w: any, data: Uint8Array) {
    let nwritten = 0;
    while (nwritten < data.length) {
      nwritten += await w.write(data.subarray(nwritten));
    }
  };
}
// @ts-ignore
if (typeof Deno.readAll !== 'function') {
  // @ts-ignore
  Deno.readAll = async function(r: any) {
    const buf = new Uint8Array(1024);
    let nread = 0;
    const chunks = [];
    while (true) {
      const n = await r.read(buf);
      if (n === null) break;
      chunks.push(buf.slice(0, n));
      nread += n;
    }
    const result = new Uint8Array(nread);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  };
}

// @ts-ignore: Deno URL import
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: any) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { poemId, targetEmail } = await req.json();

    if (!poemId) throw new Error('poemId is required');

    // Secrets
    const SMTP_USER = Deno.env.get('SMTP_USER');
    const SMTP_PASS = Deno.env.get('SMTP_PASS');

    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('Configuração de SMTP ausente (SMTP_USER ou SMTP_PASS)');
    }

    const supabaseClient = createClient(
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

    const token = authHeader.replace('Bearer ', '');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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

    console.log(`Iniciando envio SMTP para ${subscribers.length} assinantes...`);

    const client = new SmtpClient();
    
    try {
      await client.connectTLS({
        hostname: 'smtp.gmail.com',
        port: 465,
        username: SMTP_USER,
        password: SMTP_PASS,
      });

      for (const sub of subscribers) {
        await client.send({
          from: SMTP_USER,
          to: sub.email,
          subject: `${poem.title} — novo poema`,
          content: `${poem.title}\n\n${poem.content}\n\n---\nLeia no site: ${poemUrl}\nCancelar inscrição: ${siteUrl}/unsubscribe?token=${sub.unsubscribe_token}`,
          html: getHtmlEmail(sub.unsubscribe_token),
        });
      }

      await client.close();
      console.log('Envio SMTP concluído com sucesso.');

    } catch (smtpError: any) {
      console.error('Erro no SMTP:', smtpError);
      throw new Error(`Erro ao enviar e-mails via SMTP: ${smtpError.message || String(smtpError)}`);
    }

    // Log success
    await supabaseClient.from('email_campaign_logs').insert([{
      poem_id: poemId,
      status: 'success',
      details: `Enviado para ${subscribers.length} assinantes via SMTP (Gmail).`
    }]);

    return new Response(JSON.stringify({ success: true, count: subscribers.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ 
      error: error.message || String(error),
      details: error.stack || 'No stack trace'
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
