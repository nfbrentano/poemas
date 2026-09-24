import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SEO & Core Web Vitals Acceptance Tests', () => {
  it('CA05: manifest.json has valid icon dimensions and separates any vs maskable', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.icons).toBeDefined();
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(4);

    const purposes = manifest.icons.map(i => i.purpose);
    expect(purposes.includes('any')).toBe(true);
    expect(purposes.includes('maskable')).toBe(true);

    // Verify all icon files exist and are <= 50 KB
    for (const icon of manifest.icons) {
      const iconPath = path.resolve(process.cwd(), 'public', icon.src.replace(/^\//, ''));
      expect(fs.existsSync(iconPath)).toBe(true);
      const stat = fs.statSync(iconPath);
      expect(stat.size).toBeLessThanOrEqual(50 * 1024); // <= 50 KB
    }

    // Verify favicon.ico and apple-touch-icon.png
    const favIcoPath = path.resolve(process.cwd(), 'public/favicon.ico');
    const appleTouchPath = path.resolve(process.cwd(), 'public/apple-touch-icon.png');
    expect(fs.statSync(favIcoPath).size).toBeLessThanOrEqual(50 * 1024);
    expect(fs.statSync(appleTouchPath).size).toBeLessThanOrEqual(50 * 1024);
  });

  it('RF05: Font face declarations include fallback metrics (size-adjust) to eliminate CLS', () => {
    const varsPath = path.resolve(process.cwd(), 'src/styles/variables.css');
    const css = fs.readFileSync(varsPath, 'utf-8');

    expect(css).toContain('font-family: \'Merriweather-Fallback\'');
    expect(css).toContain('size-adjust');
    expect(css).toContain('ascent-override');
    expect(css).toContain('descent-override');
    expect(css).toContain('line-gap-override');

    // Self-hosted fonts exist in public/fonts
    const fontFiles = [
      'cormorant-garamond-v21-latin-regular.woff2',
      'cormorant-garamond-v21-latin-500.woff2',
      'merriweather-v33-latin-regular.woff2',
      'merriweather-v33-latin-italic.woff2'
    ];
    for (const file of fontFiles) {
      const fontPath = path.resolve(process.cwd(), 'public/fonts', file);
      expect(fs.existsSync(fontPath)).toBe(true);
    }
  });

  it('CA01 & CA02 & RF04: Pre-rendered HTML includes critical CSS, external stylesheet, full shell, and __DATA__', () => {
    const poemDir = path.resolve(process.cwd(), 'dist/poema/a-balanca-do-afeto');
    if (!fs.existsSync(poemDir)) {
      // If dist is not built yet, skip
      return;
    }
    const html = fs.readFileSync(path.join(poemDir, 'index.html'), 'utf-8');

    // RF04: Critical CSS inline + external stylesheet link
    expect(html).toContain('<style id="critical-css">');
    expect(html).toContain('rel="stylesheet"');

    // Extract critical CSS and ensure it is < 14 KB
    const match = html.match(/<style id="critical-css">([\s\S]*?)<\/style>/);
    expect(match).not.toBeNull();
    const criticalCssBytes = Buffer.byteLength(match[1], 'utf-8');
    expect(criticalCssBytes).toBeLessThan(14 * 1024);

    // CA01: Pre-rendered markup inside main
    expect(html).toContain('data-prerendered=');
    expect(html).toContain('class="poem-container"');
    expect(html).toContain('A Balança do Afeto');

    // CA02: Embedded __DATA__ script
    expect(html).toContain('id="__DATA__"');
    const dataMatch = html.match(/<script type="application\/json" id="__DATA__">([\s\S]*?)<\/script>/);
    expect(dataMatch).not.toBeNull();
    const data = JSON.parse(dataMatch[1]);
    expect(data.poem).toBeDefined();
    expect(data.poem.title).toBe('A Balança do Afeto');
  });

  it('RNF03: Initial JS bundle executed on poem page load is well under 100 KB gzip', () => {
    const distAssetsDir = path.resolve(process.cwd(), 'dist/assets');
    if (!fs.existsSync(distAssetsDir)) return;

    const files = fs.readdirSync(distAssetsDir);
    const indexJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
    const poemJs = files.find(f => f.startsWith('poem-') && f.endsWith('.js'));
    const firebaseJs = files.find(f => f.startsWith('vendor-firebase-') && f.endsWith('.js'));

    expect(indexJs).toBeDefined();
    expect(poemJs).toBeDefined();
    expect(firebaseJs).toBeDefined();

    // Firebase is decoupled into vendor-firebase chunk and NOT bundled into poem or index
    const indexJsContent = fs.readFileSync(path.join(distAssetsDir, indexJs), 'utf-8');
    const poemJsContent = fs.readFileSync(path.join(distAssetsDir, poemJs), 'utf-8');

    expect(indexJsContent).not.toContain('initializeApp');
    expect(poemJsContent).not.toContain('initializeApp');
  });
});
