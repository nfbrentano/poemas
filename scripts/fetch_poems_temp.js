import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data: poems, error } = await supabase
    .from('poems')
    .select('id, title, content, tags');

  if (error) {
    console.error('Error fetching poems:', error);
    return;
  }
  
  import('fs').then(fs => {
    fs.writeFileSync('scripts/poems_dump.json', JSON.stringify(poems, null, 2));
    console.log('Saved ' + poems.length + ' poems to scripts/poems_dump.json');
  });
}

run();
