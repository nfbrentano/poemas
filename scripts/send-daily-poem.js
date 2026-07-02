import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const targetEmail = 'natanaelfernando@outlook.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendDailyPoem() {
  try {
    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, title, slug')
      .eq('status', 'published');
      
    if (error) {
      throw error;
    }
    
    if (!poems || poems.length === 0) {
      console.log('No published poems found.');
      return;
    }
    
    // Pick a random poem
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];
    
    console.log(`Sending poem: "${randomPoem.title}" to ${targetEmail} via send-newsletter function...`);
    
    const { data, error: sendError } = await supabase.functions.invoke('send-newsletter', {
      body: { 
        poemId: randomPoem.id,
        targetEmail: targetEmail
      }
    });
    
    if (sendError) {
      throw sendError;
    }
    
    console.log('Email sent successfully. Response:', data);
    
  } catch (err) {
    console.error('Failed to send daily poem:', err);
    process.exit(1);
  }
}

sendDailyPoem();
