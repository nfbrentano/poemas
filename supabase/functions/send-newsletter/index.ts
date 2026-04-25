// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

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

    // Fetch Poem
    const { data: poem } = await supabaseClient
      .from('poems')
      .select('title, excerpt, slug')
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
    const bccList = subscribers.map((s: any) => s.email);
    
    // @ts-ignore
    const smtpUsername = Deno.env.get('SMTP_USERNAME') ?? '';
    // @ts-ignore
    const smtpPassword = Deno.env.get('SMTP_PASSWORD') ?? '';

    // Connect to SMTP (Gmail) using denomailer (modern, Deno-compatible)
    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: smtpUsername,
          password: smtpPassword, // App Password
        },
      },
    });

    const siteUrl = 'https://nfbrentano.github.io/poemas';

    const emailContent = `
Novo poema publicado: ${poem.title}

${poem.excerpt || 'Leia o poema completo no site.'}

Para ler, acesse:
${siteUrl}/poema/${poem.slug}

---
Enviado por Poemas de Natanael.
    `.trim();

    await client.send({
      from: smtpUsername,
      to: smtpUsername, // To self
      bcc: bccList,
      subject: `Novo poema: ${poem.title}`,
      content: emailContent,
    });

    await client.close();

    // Log success
    await supabaseClient.from('email_campaign_logs').insert([{
      poem_id: poemId,
      status: 'success',
      details: `Sent to ${bccList.length} subscribers.`
    }]);

    return new Response(JSON.stringify({ success: true, count: bccList.length }), {
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
