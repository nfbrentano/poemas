import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const resendApiKey = process.env.RESEND_API_KEY;
const targetEmail = 'natanaelfernando@outlook.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

if (!resendApiKey) {
  console.error('Resend API key missing. Make sure RESEND_API_KEY is set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const resend = new Resend(resendApiKey);

async function sendDailyPoem() {
  try {
    const { data: poems, error } = await supabase
      .from('poems')
      .select('title, content, slug')
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
    
    // Format content: convert newlines to <br> for email HTML rendering
    const formattedContent = (randomPoem.content || '').replace(/\n/g, '<br/>');
    
    const htmlContent = `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px;">
        <h2 style="color: #111; text-align: center; margin-bottom: 30px; font-weight: normal; font-size: 24px;">
          ${randomPoem.title}
        </h2>
        <div style="font-size: 16px; line-height: 1.8; margin-top: 20px;">
          ${formattedContent}
        </div>
        <div style="margin-top: 50px; border-top: 1px solid #eaeaea; padding-top: 20px; font-size: 13px; color: #888; text-align: center; font-family: sans-serif;">
          <p>Enviado automaticamente • <a href="https://poemas.zumer.com.br/poem/${randomPoem.slug}" style="color: #666; text-decoration: underline;">Ler no site</a></p>
        </div>
      </div>
    `;
    
    console.log(`Sending poem: "${randomPoem.title}" to ${targetEmail}`);
    
    const { data, error: sendError } = await resend.emails.send({
      from: 'Poemas <onboarding@resend.dev>',
      to: [targetEmail],
      subject: `Poema do Dia: ${randomPoem.title}`,
      html: htmlContent,
    });
    
    if (sendError) {
      throw sendError;
    }
    
    console.log('Email sent successfully. ID:', data?.id);
    
  } catch (err) {
    console.error('Failed to send daily poem:', err);
    process.exit(1);
  }
}

sendDailyPoem();
