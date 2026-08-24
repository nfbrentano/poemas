import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Read files
const htmlJs = fs.readFileSync(path.join(process.cwd(), 'src/utils/html.js'), 'utf8');
const tagsJs = fs.readFileSync(path.join(process.cwd(), 'src/utils/tags.js'), 'utf8');
const seoJs = fs.readFileSync(path.join(process.cwd(), 'src/utils/seo.js'), 'utf8');
const filterChipsJs = fs.readFileSync(path.join(process.cwd(), 'src/components/filter-chips.js'), 'utf8');
const collectionsJs = fs.readFileSync(path.join(process.cwd(), 'src/pages/collections.js'), 'utf8');

console.log("Files read successfully.");
