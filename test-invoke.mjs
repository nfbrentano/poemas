import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ejorjxvjglkkxnusdrzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqb3JqeHZqZ2xra3hudXNkcnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwODU3NTcsImV4cCI6MjA5MjY2MTc1N30.4Y3xJlQblq4ZDCkkhaSgttuYvovMbctv1duzPG7frTI';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.functions.invoke('send-newsletter', {
    body: { poemId: '00000000-0000-0000-0000-000000000000', targetEmail: 'test@example.com' }
  });
  console.log('Data:', data);
  console.log('Error:', error);
}
test();
