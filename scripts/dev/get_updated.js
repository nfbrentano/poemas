import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: poems, error } = await supabase
    .from('poems')
    .select('title, slug')
    .order('id', { ascending: true }) // Not order by updated_at if we don't know it exists
    .limit(1);

  if (error) console.error(error);
  else {
      // Let's see if we can get all of them and filter or if there's an updated_at column
      const { data: all, error: err2 } = await supabase.from('poems').select('*').limit(1);
      console.log(Object.keys(all[0]));
  }
}
run();
