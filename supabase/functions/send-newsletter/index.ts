// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // We need service role to read subscribers bypassing RLS if needed, or just admin token
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
    
    // Connect to SMTP (Gmail)
    const client = new SmtpClient();
    
    // @ts-ignore
    await client.connectTLS({
      hostname: 'smtp.gmail.com',
      port: 465,
      // @ts-ignore
      username: Deno.env.get('SMTP_USERNAME') ?? '',
      // @ts-ignore
      password: Deno.env.get('SMTP_PASSWORD') ?? '', // App Password
    });

    const emailContent = `
Novo poema publicado: ${poem.title}

${poem.excerpt || 'Leia o poema completo no site.'}

Para ler, acesse:
https://SEUDOMINIO.com/poema/${poem.slug}

---
Enviado por Poemas de Natanael.
    `.trim();

    await client.send({
      // @ts-ignore
      from: Deno.env.get('SMTP_USERNAME') ?? '',
      // @ts-ignore
      to: Deno.env.get('SMTP_USERNAME') ?? '', // To self
      bcc: bccList.join(','),
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
