import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { html } from 'satori-html';

const distOgDir = path.resolve(process.cwd(), 'dist/og/poema');
const distColDir = path.resolve(process.cwd(), 'dist/og/colecao');
const cachePath = path.resolve(process.cwd(), '.og-cache.json');

// We will fetch TTF fonts from Google Fonts for Satori
let cormorantFontBuffer;
let merriweatherFontBuffer;

async function loadFonts() {
  console.log('Loading fonts for OG images...');
  // Cormorant Garamond Regular WOFF
  const cormorantRes = await fetch('https://fonts.gstatic.com/s/cormorantgaramond/v21/co3umX5slCNuHLi8bLeY9MK7whWMhyjypVO7abI26QOD_v86KnTOjA.woff');
  cormorantFontBuffer = await cormorantRes.arrayBuffer();

  // Merriweather Italic WOFF
  const merriweatherRes = await fetch('https://fonts.gstatic.com/s/merriweather/v33/u-4B0qyriQwlOrhSvowK_l5-eTxCVx0ZbwLvKH2Gk9hLmp0v5yA-xXPqCzLvPee1XYk_XSf-FmTCUG33Avc.woff');
  merriweatherFontBuffer = await merriweatherRes.arrayBuffer();
}

function getCache() {
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2), 'utf8');
}

function hashContent(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

export async function generatePoemOgImage(poem) {
  if (!fs.existsSync(distOgDir)) {
    fs.mkdirSync(distOgDir, { recursive: true });
  }

  const outputPath = path.join(distOgDir, `${poem.slug}.png`);
  
  // Truncate excerpt and split to lines
  let text = poem.excerpt || poem.content || '';
  text = text.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  const maxChars = 200;
  if (text.length > maxChars) {
    text = text.substring(0, maxChars) + '...';
  }

  const hash = hashContent(poem.title + text);
  const cache = getCache();

  if (cache[poem.slug] === hash && fs.existsSync(outputPath)) {
    return `/og/poema/${poem.slug}.png`;
  }

  const markup = html`
    <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #050505; color: #e2e2e2; padding: 60px 80px; justify-content: center; align-items: center; border: 16px solid #1a1a1a;">
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; align-items: center; text-align: center;">
        <h1 style="font-family: 'Cormorant Garamond'; font-size: 64px; font-weight: 400; color: #c5a880; margin: 0 0 40px 0; line-height: 1.1;">
          ${poem.title}
        </h1>
        <p style="font-family: 'Merriweather'; font-size: 32px; font-style: italic; color: #a3a3a3; line-height: 1.6; max-width: 900px; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; margin: 0;">
          "${text}"
        </p>
        <div style="display: flex; margin-top: 60px; font-family: 'Cormorant Garamond'; font-size: 32px; color: #8a8a8a; letter-spacing: 2px;">
          NATANAEL BRENTANO
        </div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Cormorant Garamond',
        data: cormorantFontBuffer,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Merriweather',
        data: merriweatherFontBuffer,
        weight: 400,
        style: 'italic',
      }
    ],
  });

  const resvg = new Resvg(svg, {
    background: '#050505',
    fitTo: { mode: 'width', value: 1200 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(outputPath, pngBuffer);

  cache[poem.slug] = hash;
  saveCache(cache);

  return `/og/poema/${poem.slug}.png`;
}

export async function generateCollectionOgImage(collection) {
  if (!fs.existsSync(distColDir)) {
    fs.mkdirSync(distColDir, { recursive: true });
  }

  const outputPath = path.join(distColDir, `${collection.slug}.png`);
  
  if (collection.image_url) {
    // If it has an image_url, we just return it. Prerender should use it.
    return collection.image_url;
  }

  const hash = hashContent(collection.name);
  const cache = getCache();

  if (cache[`col_${collection.slug}`] === hash && fs.existsSync(outputPath)) {
    return `/og/colecao/${collection.slug}.png`;
  }

  const markup = html`
    <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #050505; color: #e2e2e2; padding: 60px 80px; justify-content: center; align-items: center; border: 16px solid #1a1a1a;">
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; align-items: center; text-align: center;">
        <p style="font-family: 'Cormorant Garamond'; font-size: 32px; color: #8a8a8a; letter-spacing: 4px; margin: 0 0 20px 0; text-transform: uppercase;">
          Coleção
        </p>
        <h1 style="font-family: 'Cormorant Garamond'; font-size: 80px; font-weight: 400; color: #c5a880; margin: 0 0 40px 0; line-height: 1.1;">
          ${collection.name}
        </h1>
        <div style="display: flex; margin-top: 60px; font-family: 'Cormorant Garamond'; font-size: 32px; color: #8a8a8a; letter-spacing: 2px;">
          NATANAEL BRENTANO
        </div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Cormorant Garamond',
        data: cormorantFontBuffer,
        weight: 400,
        style: 'normal',
      }
    ],
  });

  const resvg = new Resvg(svg, {
    background: '#050505',
    fitTo: { mode: 'width', value: 1200 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(outputPath, pngBuffer);

  cache[`col_${collection.slug}`] = hash;
  saveCache(cache);

  return `/og/colecao/${collection.slug}.png`;
}

export async function generateDefaultOgImage() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'og-default.jpg');
  
  if (fs.existsSync(outputPath)) {
    return '/og-default.jpg';
  }

  const markup = html`
    <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: #050505; color: #e2e2e2; padding: 60px 80px; justify-content: center; align-items: center; border: 16px solid #1a1a1a;">
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: center; align-items: center; text-align: center;">
        <h1 style="font-family: 'Cormorant Garamond'; font-size: 80px; font-weight: 400; color: #c5a880; margin: 0 0 20px 0; line-height: 1.1;">
          Poemas Brasileiros
        </h1>
        <p style="font-family: 'Merriweather'; font-size: 32px; font-style: italic; color: #a3a3a3; line-height: 1.6; max-width: 800px; margin: 0;">
          Poesia contemporânea sobre amor, tempo, efêmero e o cotidiano.
        </p>
        <div style="display: flex; margin-top: 60px; font-family: 'Cormorant Garamond'; font-size: 32px; color: #8a8a8a; letter-spacing: 2px;">
          NATANAEL BRENTANO
        </div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Cormorant Garamond',
        data: cormorantFontBuffer,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Merriweather',
        data: merriweatherFontBuffer,
        weight: 400,
        style: 'italic',
      }
    ],
  });

  const resvg = new Resvg(svg, {
    background: '#050505',
    fitTo: { mode: 'width', value: 1200 }
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.writeFileSync(outputPath, pngBuffer);

  return '/og-default.jpg';
}

export { loadFonts };
