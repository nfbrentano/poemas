import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: poems, error } = await supabase
    .from('poems')
    .select('id, title, content')
    .like('content', '%<%')
    .limit(3);

  if (error) console.error(error);
  else console.log(JSON.stringify(poems, null, 2));
}
run();
