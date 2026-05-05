import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Note: Run this with node --env-file=.env.local scripts/generate-rss.js
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const baseUrl = 'https://nfbrentano.github.io/poemas/'; 

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateRss() {
  try {
    console.log('Fetching published poems for RSS feed...');
    
    const { data: poems, error } = await supabase
      .from('poems')
      .select('slug, title, excerpt, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`Found ${poems.length} poems. Generating RSS XML...`);

    const lastBuildDate = poems.length > 0 ? new Date(poems[0].published_at).toUTCString() : new Date().toUTCString();

    const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Poemas Brasileiros - Natanael Brentano</title>
    <link>${baseUrl}</link>
    <description>Coleção de poemas originais em português por Natanael Fernando Gatti Brentano.</description>
    <language>pt-br</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}feed.xml" rel="self" type="application/rss+xml" />
    
${poems.map(poem => `    <item>
      <title>${escapeXml(poem.title || '')}</title>
      <link>${baseUrl}poema/${poem.slug}</link>
      <guid>${baseUrl}poema/${poem.slug}</guid>
      <description>${escapeXml(poem.excerpt || '')}</description>
      <pubDate>${new Date(poem.published_at).toUTCString()}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'feed.xml');
    fs.writeFileSync(outputPath, rss);
    
    console.log(`Successfully generated RSS feed with ${poems.length} items at: ${outputPath}`);
  } catch (err) {
    console.error('Failed to generate RSS feed:', err.message);
    process.exit(1);
  }
}

generateRss();
