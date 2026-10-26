import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Microsoft Clarity Tracking Integration', () => {
  const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
  const mainJsPath = path.resolve(process.cwd(), 'src/main.js');

  it('CA01: index.html must contain the official Microsoft Clarity snippet with ID z29eha5a1g', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf-8');
    expect(html).toContain('https://www.clarity.ms/tag/');
    expect(html).toContain('z29eha5a1g');
    expect(html).toContain('clarity');
  });

  it('CA02: src/main.js must not contain the legacy Clarity project ID y5mmw0thvu', () => {
    const js = fs.readFileSync(mainJsPath, 'utf-8');
    expect(js).not.toContain('y5mmw0thvu');
  });

  it('CA03: index.html CSP must allow script-src, img-src and connect-src for Clarity', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf-8');
    const cspMatch = html.match(/http-equiv="Content-Security-Policy"\s+content="([^"]+)"/);
    expect(cspMatch).not.toBeNull();
    const csp = cspMatch[1];

    expect(csp).toContain('https://www.clarity.ms');
    expect(csp).toContain('https://scripts.clarity.ms');
    expect(csp).toContain('https://*.clarity.ms');
    expect(csp).toContain('https://c.clarity.ms');
  });
});
