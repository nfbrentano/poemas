import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Security & Public Query Constraints', () => {
  it('ensures firestore.rules restricts public read of poems to status == published', () => {
    const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
    const content = fs.readFileSync(rulesPath, 'utf-8');

    // Ensure unrestricted read is not present for poems
    const poemsMatchBlock = content.match(/match\s+\/poems\/\{document=\*\*\}\s*\{([\s\S]*?)\}/);
    expect(poemsMatchBlock).not.toBeNull();

    const block = poemsMatchBlock[1];
    expect(block).not.toMatch(/allow\s+read\s*:\s*if\s+true\s*;/);
    expect(block).toMatch(/allow\s+read\s*:\s*if\s+resource\.data\.status\s*==\s*['"]published['"]\s*\|\|\s*request\.auth\s*!=\s*null\s*;/);
    expect(block).toMatch(/allow\s+write\s*:\s*if\s+request\.auth\s*!=\s*null\s*;/);
  });

  it('ensures all public queries to poems in src/ include status == published filter', () => {
    const srcDir = path.resolve(process.cwd(), 'src');

    function getFiles(dir) {
      let results = [];
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(getFiles(filePath));
        } else if (file.endsWith('.js') && !file.endsWith('.test.js')) {
          results.push(filePath);
        }
      });
      return results;
    }

    const files = getFiles(srcDir).filter(f => !f.endsWith('admin.js')); // Admin is authenticated

    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf-8');
      if (code.includes("'poems'") || code.includes('"poems"')) {
        // Find every query block mentioning poems
        const lines = code.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes("collection(db, 'poems')") || line.includes("firestoreCollection(db, 'poems')") || line.includes("collection(db, \"poems\")")) {
            // Check context (+/- 10 lines) for status == published
            const start = Math.max(0, idx - 5);
            const end = Math.min(lines.length, idx + 10);
            const context = lines.slice(start, end).join('\n');
            const hasPublishedStatus = context.includes("'status', '==', 'published'") || context.includes('"status", "==", "published"');
            expect(hasPublishedStatus, `Query in ${path.relative(process.cwd(), file)}:${idx + 1} must filter by status == published`).toBe(true);
          }
        });
      }
    });
  });
});
