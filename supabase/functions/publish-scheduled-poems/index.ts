// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

Deno.serve(async (req: Request) => {
  try {
    // Initialize Supabase client with service role key (from env)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch poems that are scheduled and the time has passed
    const now = new Date().toISOString();
    
    const { data: poems, error: fetchError } = await supabase
      .from("poems")
      .select("id, title")
      .eq("status", "scheduled")
      .lte("scheduled_at", now);

    if (fetchError) throw fetchError;

    if (!poems || poems.length === 0) {
      return new Response(JSON.stringify({ message: "No poems to publish", published: 0 }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${poems.length} poems to publish.`);

    // 2. Update status and published_at
    const { error: updateError } = await supabase
      .from("poems")
      .update({ 
        status: "published", 
        published_at: now 
      })
      .in("id", poems.map((p: any) => p.id));

    if (updateError) throw updateError;

    // Optional: You could trigger notifications here if needed

    return new Response(JSON.stringify({ 
      message: `Successfully published ${poems.length} poems`, 
      published: poems.length,
      titles: poems.map((p: any) => p.title)
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
