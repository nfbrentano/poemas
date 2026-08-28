import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';

function cleanHtml(content) {
  if (!content) return content;
  let cleaned = content.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<\/p>/gi, '\n\n');
  let prevCleaned;
  do {
    prevCleaned = cleaned;
    cleaned = cleaned.replace(/<[^>]+>/g, '');
  } while (cleaned !== prevCleaned);
  cleaned = cleaned.replace(/&nbsp;/g, ' ')
                   .replace(/&lt;/g, '<')
                   .replace(/&gt;/g, '>')
                   .replace(/&quot;/g, '"')
                   .replace(/&#039;/g, "'")
                   .replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

function removeHtmlComments(input) {
  if (typeof input !== 'string') return '';
  let prev;
  let result = input;
  do {
    prev = result;
    result = result.replace(/<!--[\s\S]*?-->/g, '');
  } while (result !== prev);
  return result.trim();
}

const xmlData = fs.readFileSync('scripts/poemasdenatanael.WordPress.2026-04-25.xml', 'utf8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
const result = parser.parse(xmlData);
const items = result.rss.channel.item;
const poems = items.filter(item => item['wp:post_type'] === 'post' || item['wp:post_type'] === 'poem');

let changed = [];
for (const poem of poems) {
  const content = poem['content:encoded'] || poem.description || '';
  const cleanContent = removeHtmlComments(content);
  
  if (cleanContent && cleanContent.includes('<')) {
    const fullyCleaned = cleanHtml(cleanContent);
    if (fullyCleaned !== cleanContent) {
        const title = poem.title || 'Sem Título';
        const slug = poem['wp:post_name'] || title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        changed.push({ title, slug });
    }
  }
}

fs.writeFileSync('scripts/152_poems.json', JSON.stringify(changed, null, 2));
console.log(`Found ${changed.length} changed poems.`);
