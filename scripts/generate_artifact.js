import fs from 'fs';

const poems = JSON.parse(fs.readFileSync('scripts/152_poems.json', 'utf8'));
const artifactPath = '/Users/natanaelfernandogattibrentano/.gemini/antigravity-ide/brain/6ebc99dc-3566-422a-a636-005802b1615a/poemas_atualizados.md';

let md = '# Poemas Atualizados\n\nAqui está a lista dos poemas que tiveram tags HTML removidas, para que você possa verificar:\n\n';

poems.forEach(poem => {
  md += `- [${poem.title}](http://localhost:5173/poema/${poem.slug})\n`;
});

fs.writeFileSync(artifactPath, md);
console.log('Artifact created.');
