import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://ejorjxvjglkkxnusdrzl.supabase.co', 'sb_publishable_a8WLIDnn7XxgOWL0X8onTQ_dgJRQc0a');
async function test() {
  const { data, error } = await supabase.from('poems').select('*').limit(1);
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Supabase Success! Poems:", data.length);
  }
}
test();
