import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabaseClient
      .from('subscribers')
      .update({ active: false, unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)
      .select('email')
      .single();

    if (error || !data) {
      // Idempotent: return success even if not found or already updated
      return new Response(JSON.stringify({ success: true, message: 'Operação concluída.' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try to remove from Loops.so if configured (best-effort)
    const LOOPS_API_KEY = Deno.env.get('LOOPS_API_KEY');
    if (LOOPS_API_KEY && data.email) {
      try {
        await fetch('https://app.loops.so/api/v1/contacts/delete', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOOPS_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: data.email })
        });
      } catch (err) {
        console.error('Error removing from Loops:', err);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
