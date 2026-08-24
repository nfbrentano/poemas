import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function cleanHtml(content) {
  if (!content) return content;
  
  // Replace <br> tags with newlines
  let cleaned = content.replace(/<br\s*\/?>/gi, '\n');
  
  // Replace </p> with double newlines
  cleaned = cleaned.replace(/<\/p>/gi, '\n\n');
  
  // Remove all other HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Decode basic HTML entities
  cleaned = cleaned.replace(/&nbsp;/g, ' ')
                   .replace(/&amp;/g, '&')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#039;/g, "'");

  // Collapse 3 or more newlines into 2
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  return cleaned.trim();
}

async function run() {
  console.log('Fetching poems...');
  const { data: poems, error } = await supabase
    .from('poems')
    .select('id, title, content');

  if (error) {
    console.error('Error fetching poems:', error);
    return;
  }
  
  console.log(`Found ${poems.length} poems.`);
  
  let updatedCount = 0;

  for (const poem of poems) {
    if (poem.content && poem.content.includes('<')) {
      const cleanedContent = cleanHtml(poem.content);
      
      if (cleanedContent !== poem.content) {
        // console.log(`Updating ${poem.title}...`);
        const { error: updateError } = await supabase
          .from('poems')
          .update({ content: cleanedContent })
          .eq('id', poem.id);
          
        if (updateError) {
          console.error(`Error updating ${poem.title}:`, updateError);
        } else {
          updatedCount++;
        }
      }
    }
  }
  
  console.log(`Finished updating ${updatedCount} poems.`);
}

run();
