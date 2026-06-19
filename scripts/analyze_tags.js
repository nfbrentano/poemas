import fs from 'fs';

const poems = JSON.parse(fs.readFileSync('scripts/poems_dump.json', 'utf8'));

const tagCounts = {};

poems.forEach(poem => {
  if (poem.tags && Array.isArray(poem.tags)) {
    poem.tags.forEach(tag => {
      const lowerTag = tag.trim().toLowerCase();
      tagCounts[lowerTag] = (tagCounts[lowerTag] || 0) + 1;
    });
  }
});

const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
console.log('Total unique tags:', sortedTags.length);
console.log('Top tags:');
console.log(sortedTags.slice(0, 50).map(t => `${t[0]}: ${t[1]}`).join(', '));
