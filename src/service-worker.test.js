import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Service Worker (public/sw.js)', () => {
  const swPath = path.resolve(process.cwd(), 'public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf-8');

  it('deve usar uma versão de cache atualizada', () => {
    expect(swContent).toMatch(/const CACHE_NAME = 'poemas-cache-v\d+';/);
  });

  it('deve identificar requisições de páginas HTML e rotas SPA sem extensão', () => {
    expect(swContent).toContain('isHtmlPage');
    expect(swContent).toContain("text/html");
  });

  it('não deve lançar exceção não tratada (throw err) no handler de outros recursos', () => {
    // Garantir que não há throw err no bloco de catch do fetch em sw.js
    expect(swContent).not.toMatch(/\.catch\s*\(\s*\(err\)\s*=>\s*\{[^}]*throw\s+err/);
  });

  it('deve ter fallback offline seguro no handler de páginas', () => {
    expect(swContent).toContain('/offline.html');
    expect(swContent).toContain('/index.html');
  });
});
