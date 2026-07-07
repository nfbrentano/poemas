import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCols() {
  const { data, error } = await supabase.from('email_campaign_logs').select('*').limit(1);
  if (error) console.error("Error:", error);
  else console.log("Columns present in empty result (if any, though JSON might not show them):", data);
}
checkCols();
