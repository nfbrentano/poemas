import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const html = fs.readFileSync(path.join(process.cwd(), 'src/utils/html.js'), 'utf8');
const tags = fs.readFileSync(path.join(process.cwd(), 'src/utils/tags.js'), 'utf8');
const seo = fs.readFileSync(path.join(process.cwd(), 'src/utils/seo.js'), 'utf8');
const collections = fs.readFileSync(path.join(process.cwd(), 'src/pages/collections.js'), 'utf8');

console.log("Files loaded.");
