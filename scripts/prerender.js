import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Note: Run this with node --env-file=.env.local scripts/prerender.js
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const baseUrl = 'https://nfbrentano.github.io/poemas/'; 

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/?p>/gi, '')
    .replace(/<[^>]*>/g, '') // remove any other html tags
    .trim();
}

function getExcerpt(poem, limit = 160) {
  if (poem.excerpt && poem.excerpt.trim()) {
    return poem.excerpt.trim();
  }
  const cleanContent = cleanHtml(poem.content);
  if (cleanContent.length <= limit) return cleanContent;
  return cleanContent.slice(0, limit - 3) + '...';
}

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function prerender() {
  try {
    const distDir = path.resolve(process.cwd(), 'dist');
    const templatePath = path.join(distDir, 'index.html');

    if (!fs.existsSync(templatePath)) {
      console.error(`Vite build output template not found at: ${templatePath}`);
      console.error('Please run "npm run build" or "vite build" first.');
      process.exit(1);
    }

    console.log('Fetching published poems for pre-rendering...');
    const { data: poems, error } = await supabase
      .from('poems')
      .select('id, title, slug, content, excerpt, tags, published_at')
      .eq('status', 'published');

    if (error) {
      throw error;
    }

    console.log(`Found ${poems.length} poems to pre-render.`);
    const originalHtml = fs.readFileSync(templatePath, 'utf-8');

    let count = 0;
    for (const poem of poems) {
      const excerpt = getExcerpt(poem);
      const title = `${poem.title} — Natanael Brentano`;
      const url = `${baseUrl}poema/${poem.slug}`;
      const ogImage = `${supabaseUrl}/functions/v1/og-image?slug=${poem.slug}`;
      const publishedIso = new Date(poem.published_at).toISOString();

      // JSON-LD Structured Data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "genre": "Poetry",
        "inLanguage": "pt-BR",
        "headline": poem.title,
        "description": excerpt,
        "author": { 
          "@type": "Person", 
          "name": "Natanael Brentano",
          "sameAs": ["https://instagram.com/nfgbrentano"]
        },
        "datePublished": publishedIso,
        "url": url,
        "image": ogImage
      };

      // Tags meta dinâmicas adicionais
      let articleMeta = `
    <meta property="article:published_time" content="${publishedIso}" />
    <meta property="article:author" content="Natanael Brentano" />
      `;
      if (poem.tags && Array.isArray(poem.tags)) {
        poem.tags.forEach(tag => {
          articleMeta += `\n    <meta property="article:tag" content="${escapeHtml(tag)}" />`;
        });
      }
      
      const jsonLdScript = `\n    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;

      // Modificando as tags meta no HTML original
      let modifiedHtml = originalHtml;

      // 1. Substituir o título
      modifiedHtml = modifiedHtml.replace(
        /<title>[^<]*<\/title>/i,
        `<title>${escapeHtml(title)}</title>`
      );

      // 2. Substituir Canonical URL
      modifiedHtml = modifiedHtml.replace(
        /<link rel="canonical" href="[^"]*"\s*\/?>/i,
        `<link rel="canonical" href="${url}" />`
      );

      // 3. Substituir Descrição Geral
      modifiedHtml = modifiedHtml.replace(
        /<meta name="description" content="[^"]*"\s*\/?>/i,
        `<meta name="description" content="${escapeHtml(excerpt)}" />`
      );

      // 4. Substituir Open Graph Tags
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:title" content="[^"]*"\s*\/?>/i,
        `<meta property="og:title" content="${escapeHtml(title)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:description" content="[^"]*"\s*\/?>/i,
        `<meta property="og:description" content="${escapeHtml(excerpt)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:url" content="[^"]*"\s*\/?>/i,
        `<meta property="og:url" content="${url}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:image" content="[^"]*"\s*\/?>/i,
        `<meta property="og:image" content="${ogImage}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta property="og:type" content="[^"]*"\s*\/?>/i,
        `<meta property="og:type" content="article" />`
      );

      // 5. Substituir Twitter Tags
      modifiedHtml = modifiedHtml.replace(
        /<meta name="twitter:title" content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:title" content="${escapeHtml(title)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:description" content="${escapeHtml(excerpt)}" />`
      );
      modifiedHtml = modifiedHtml.replace(
        /<meta name="twitter:image" content="[^"]*"\s*\/?>/i,
        `<meta name="twitter:image" content="${ogImage}" />`
      );

      // 6. Inserir metadados extras e JSON-LD antes de </head>
      modifiedHtml = modifiedHtml.replace(
        /<\/head>/i,
        `${articleMeta}${jsonLdScript}\n  </head>`
      );

      // Definir caminho de escrita do index.html para o poema correspondente
      const poemDir = path.join(distDir, 'poema', poem.slug);
      if (!fs.existsSync(poemDir)) {
        fs.mkdirSync(poemDir, { recursive: true });
      }

      fs.writeFileSync(path.join(poemDir, 'index.html'), modifiedHtml, 'utf-8');
      count++;
    }

    console.log(`Pre-rendering completed! Successfully generated ${count} static HTML files.`);
  } catch (err) {
    console.error('Failed to pre-render:', err);
    process.exit(1);
  }
}

prerender();
