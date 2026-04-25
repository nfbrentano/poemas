import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
// You must run this script with env variables:
// SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/import_wp.js path/to/export.xml

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const xmlPath = process.argv[2];
if (!xmlPath || !fs.existsSync(xmlPath)) {
  console.error("Please provide a valid path to the WordPress XML export file.");
  process.exit(1);
}

async function run() {
  console.log(`Reading ${xmlPath}...`);
  const xmlData = fs.readFileSync(xmlPath, 'utf8');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });
  
  const result = parser.parse(xmlData);
  
  // WXR path: rss.channel.item
  const channel = result?.rss?.channel;
  if (!channel) {
    console.error("Invalid WordPress XML format.");
    process.exit(1);
  }
  
  let items = channel.item;
  if (!Array.isArray(items)) {
    items = [items];
  }
  
  console.log(`Found ${items.length} items. Filtering for posts/poems...`);
  
  const poems = items.filter(item => item['wp:post_type'] === 'post' || item['wp:post_type'] === 'poem');
  
  console.log(`Found ${poems.length} posts to import.`);
  
  for (const poem of poems) {
    const title = poem.title;
    const content = poem['content:encoded'] || poem.description || '';
    const wpStatus = poem['wp:status'];
    const slug = poem['wp:post_name'] || title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const pubDate = poem['wp:post_date_gmt'] || poem.pubDate;
    
    // Convert WordPress status to our status
    let status = 'draft';
    if (wpStatus === 'publish') status = 'published';
    
    // Convert WP HTML content to basic text or keep HTML. Our frontend handles basic newlines, 
    // so we strip some HTML or just keep it since white-space: pre-wrap handles basic text nicely.
    // For poetry, usually we want to keep it simple.
    const cleanContent = content.replace(/<!--[\s\S]*?-->/g, '').trim();
    
    // Tags
    let tags = [];
    const categories = Array.isArray(poem.category) ? poem.category : [poem.category];
    for (const cat of categories) {
      if (cat && cat['@_domain'] === 'post_tag') {
        tags.push(cat['#text']);
      }
    }
    
    const payload = {
      title: title || 'Sem Título',
      slug,
      content: cleanContent,
      status,
      tags,
      published_at: status === 'published' && pubDate && pubDate !== '0000-00-00 00:00:00' ? new Date(pubDate).toISOString() : null
    };
    
    console.log(`Importing: ${title}`);
    
    const { error } = await supabase.from('poems').insert([payload]);
    if (error) {
      // Ignore unique constraint on slug, or handle gracefully
      if (error.code === '23505') {
        console.warn(`Skipping duplicate slug: ${slug}`);
      } else {
        console.error(`Error importing ${title}:`, error.message);
      }
    }
  }
  
  console.log("Import complete.");
}

run();
