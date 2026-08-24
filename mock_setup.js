import fs from 'fs';
import path from 'path';

// Mock import.meta
const collectionsSrc = fs.readFileSync(path.join(process.cwd(), 'src/pages/collections.js'), 'utf8');
const mockedSrc = collectionsSrc.replace(/import\.meta\.env/g, '({ BASE_URL: "/" })');

fs.writeFileSync(path.join(process.cwd(), 'scratch_collections.js'), mockedSrc);
