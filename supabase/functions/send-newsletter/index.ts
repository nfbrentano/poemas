// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// @ts-ignore
serve(async (req: any) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { poemId } = await req.json();

    if (!poemId) {
      throw new Error('poemId is required');
    }

    // Verify Auth (Only Admin)
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch Poem (including full content for the email body)
    const { data: poem } = await supabaseClient
      .from('poems')
      .select('title, content, excerpt, slug')
      .eq('id', poemId)
      .single();

    if (!poem) throw new Error('Poem not found');

    // Fetch Subscribers
    const { data: subscribers } = await supabaseClient
      .from('subscribers')
      .select('email')
      .eq('active', true);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscribers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // @ts-ignore
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
    // @ts-ignore
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'onboarding@resend.dev';

    const siteUrl = 'https://nfbrentano.github.io/poemas';
    const poemUrl = `${siteUrl}/poema/${poem.slug}`;

    // Convert plain-text line breaks to HTML for the poem body
    const poemContentHtml = poem.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n\n/g, '</p><p style="margin: 1.5em 0; line-height: 2;">')
      .replace(/\n/g, '<br>');

    // Build editorial HTML email
    const htmlEmail = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${poem.title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: Georgia, 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 40px; border-bottom: 1px solid #1a1a1a;">
              <p style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666666;">
                Novo poema publicado
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="text-align: center; padding: 60px 20px 20px;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #e2e2e2; letter-spacing: -0.5px; line-height: 1.2;">
                ${poem.title}
              </h1>
            </td>
          </tr>

          <!-- Decorative divider -->
          <tr>
            <td align="center" style="padding: 20px 0 50px;">
              <table role="presentation" width="40" cellspacing="0" cellpadding="0">
                <tr><td style="border-bottom: 1px solid #333333;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Poem Content -->
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2; font-weight: 400;">
                ${poemContentHtml}
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="text-align: center; padding: 60px 20px 40px;">
              <a href="${poemUrl}" style="display: inline-block; padding: 14px 32px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #050505; background-color: #e2e2e2; text-decoration: none; border-radius: 2px;">
                Ler no site
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 40px 20px; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 8px; font-family: Georgia, serif; font-size: 16px; font-style: italic; color: #666666;">
                Natanael Brentano
              </p>
              <p style="margin: 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #444444; letter-spacing: 1px;">
                Você recebeu este e-mail por assinar a newsletter.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    // @ts-ignore
    const bccEmails = subscribers.map((s: any) => s.email);

    // Send via Resend API (HTTP-based, works perfectly on Deno Deploy / Supabase Edge Functions)
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        bcc: bccEmails,
        subject: `${poem.title} — novo poema`,
        html: htmlEmail,
        text: `${poem.title}\n\n${poem.content}\n\n---\nLeia no site: ${poemUrl}\n\nEnviado por Natanael Brentano.`,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      throw new Error(resendData.message || JSON.stringify(resendData));
    }

    // Log success
    await supabaseClient.from('email_campaign_logs').insert([{
      poem_id: poemId,
      status: 'success',
      details: `Sent to ${bccEmails.length} subscribers via Resend. ID: ${resendData.id}`
    }]);

    return new Response(JSON.stringify({ success: true, count: bccEmails.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
