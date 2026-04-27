import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Note: Run this with node --env-file=.env.local scripts/generate-sitemap.js
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const baseUrl = 'https://nfbrentano.github.io/poemas/'; 

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generateSitemap() {
  try {
    console.log('Fetching published poems from Supabase...');
    
    const { data: poems, error } = await supabase
      .from('poems')
      .select('slug, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      throw error;
    }

    console.log(`Found ${poems.length} poems. Generating XML...`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home Page -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Poems -->
${poems.map(poem => `  <url>
    <loc>${baseUrl}poema/${poem.slug}</loc>
    <lastmod>${new Date(poem.published_at || new Date()).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    const publicDir = path.resolve(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const outputPath = path.join(publicDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap);
    
    console.log(`Successfully generated sitemap with ${poems.length + 1} URLs at: ${outputPath}`);
  } catch (err) {
    console.error('Failed to generate sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
