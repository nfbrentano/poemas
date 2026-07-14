import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejorjxvjglkkxnusdrzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqb3JqeHZqZ2xra3hudXNkcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwODU3NTcsImV4cCI6MjA5MjY2MTc1N30.4Y3xJlQblq4ZDCkkhaSgttuYvovMbctv1duzPG7frTI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAllLogs() {
  const { data, error } = await supabase
    .from('email_campaign_logs')
    .select('id, sent_at, status, details, poems(title)')
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

checkAllLogs();
