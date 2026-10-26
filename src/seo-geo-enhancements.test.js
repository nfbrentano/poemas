import { describe, it, expect, beforeEach } from 'vitest';
import { updateSEO, setNotFoundSEO } from './utils/seo.js';
import { poemSchema, personSchema, SITE_URL } from './utils/structured-data.js';
import { renderPoemMarkup, buildAbntCitation } from './utils/poem-template.js';
import fs from 'fs';
import path from 'path';

describe('{SEO} e {GEO} Melhorias Avançadas — SDD: 2026-10-22_melhorias-seo-e-geo', () => {

  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('RF01, CA01 & CA02: Meta tags acadêmicas de citação (Highwire / Google Scholar / GEO)', () => {
    it('CT01: updateSEO injeta tags citation_* corretas para artigos de poemas', () => {
      const poem = {
        title: 'Sonho Efêmero',
        slug: 'sonho-efemero',
        published_at: '2026-05-10T12:00:00.000Z',
        tags: ['sonho', 'tempo']
      };

      updateSEO({
        title: poem.title,
        poemTitle: poem.title,
        description: 'Um poema sobre o tempo.',
        url: `${SITE_URL}/poema/${poem.slug}/`,
        type: 'article',
        publishedTime: poem.published_at,
        tags: poem.tags
      });

      expect(document.querySelector('meta[name="citation_title"]')?.getAttribute('content')).toBe('Sonho Efêmero');
      expect(document.querySelector('meta[name="citation_author"]')?.getAttribute('content')).toBe('Brentano, Natanael Fernando Gatti');
      expect(document.querySelector('meta[name="citation_publication_date"]')?.getAttribute('content')).toBe('2026/05/10');
      expect(document.querySelector('meta[name="citation_fulltext_html_url"]')?.getAttribute('content')).toBe(`${SITE_URL}/poema/sonho-efemero/`);
      expect(document.querySelector('meta[name="citation_language"]')?.getAttribute('content')).toBe('pt');
      expect(document.querySelector('meta[name="citation_online_date"]')).toBeNull();
    });

    it('CA02: updateSEO injeta citation_online_date e article:modified_time quando modifiedTime é fornecido', () => {
      updateSEO({
        title: 'Sonho Efêmero',
        poemTitle: 'Sonho Efêmero',
        url: `${SITE_URL}/poema/sonho-efemero/`,
        type: 'article',
        publishedTime: '2026-05-10T12:00:00.000Z',
        modifiedTime: '2026-10-22T15:30:00.000Z'
      });

      expect(document.querySelector('meta[name="citation_online_date"]')?.getAttribute('content')).toBe('2026/10/22');
      expect(document.querySelector('meta[property="article:modified_time"]')?.getAttribute('content')).toBe('2026-10-22T15:30:00.000Z');
    });

    it('setNotFoundSEO limpa todas as tags de citação e artigos', () => {
      updateSEO({
        title: 'Poema Teste',
        type: 'article',
        publishedTime: '2026-05-10T12:00:00.000Z',
        modifiedTime: '2026-10-22T15:30:00.000Z'
      });

      expect(document.querySelector('meta[name="citation_title"]')).not.toBeNull();
      expect(document.querySelector('meta[property="article:modified_time"]')).not.toBeNull();

      setNotFoundSEO();

      expect(document.querySelector('meta[name="citation_title"]')).toBeNull();
      expect(document.querySelector('meta[name="citation_author"]')).toBeNull();
      expect(document.querySelector('meta[name="citation_publication_date"]')).toBeNull();
      expect(document.querySelector('meta[name="citation_online_date"]')).toBeNull();
      expect(document.querySelector('meta[property="article:modified_time"]')).toBeNull();
      expect(document.querySelector('meta[property="article:published_time"]')).toBeNull();
    });
  });

  describe('RF02, CA03 & CA04: Seção "Como citar esta obra" (ABNT) e helper buildAbntCitation', () => {
    it('CT03: buildAbntCitation gera texto no padrão ABNT com título, ano e URL', () => {
      const poem = {
        title: 'Amor Desnudo',
        slug: 'amor-desnudo',
        published_at: '2026-10-20T01:56:55.740Z'
      };

      const citation = buildAbntCitation(poem, new Date('2026-10-22T12:00:00Z'));
      expect(citation).toContain('BRENTANO, Natanael Fernando Gatti.');
      expect(citation).toContain('Amor Desnudo.');
      expect(citation).toContain('In: Poemas Brasileiros, 2026.');
      expect(citation).toContain('Disponível em: <https://nfgbrentano.art.br/poema/amor-desnudo/>.');
      expect(citation).toContain('Acesso em:');
    });

    it('renderPoemMarkup inclui container .poem-citation-box com botão e texto da citação', () => {
      const poem = {
        title: 'Amor Desnudo',
        slug: 'amor-desnudo',
        content: 'versos de teste',
        published_at: '2026-10-20T01:56:55.740Z'
      };

      const html = renderPoemMarkup({ poem });
      expect(html).toContain('poem-citation-box');
      expect(html).toContain('Como citar esta obra (ABNT)');
      expect(html).toContain('id="copy-citation-btn"');
      expect(html).toContain('data-citation=');
      expect(html).toContain('citation-text');
      expect(html).toContain('BRENTANO, Natanael Fernando Gatti. Amor Desnudo.');
    });
  });

  describe('RF03, CA05 & CA06: Schema JSON-LD com AudioObject, SpeakableSpecification, isAccessibleForFree e copyrightNotice', () => {
    it('CT04: poemSchema gera AudioObject quando houver audio_url', () => {
      const poem = {
        title: 'Poema com Voz',
        slug: 'poema-com-voz',
        published_at: '2026-08-01T10:00:00.000Z',
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/poemas-natanael.appspot.com/o/audios%2Fpoema.mp3?alt=media'
      };

      const schema = poemSchema(poem);
      expect(schema.audio).toBeDefined();
      expect(schema.audio['@type']).toBe('AudioObject');
      expect(schema.audio.name).toBe('Narração de Poema com Voz');
      expect(schema.audio.contentUrl).toBe(poem.audio_url);
      expect(schema.audio.encodingFormat).toBe('audio/mpeg');
      expect(schema.audio.description).toContain('Natanael Fernando Gatti Brentano');
    });

    it('poemSchema omite propriedade audio quando poem não possui audio_url', () => {
      const poem = {
        title: 'Poema Sem Áudio',
        slug: 'poema-sem-audio',
        published_at: '2026-08-01T10:00:00.000Z',
        audio_url: null
      };

      const schema = poemSchema(poem);
      expect(schema.audio).toBeUndefined();
    });

    it('CT05: poemSchema inclui SpeakableSpecification, isAccessibleForFree e copyrightNotice', () => {
      const poem = {
        title: 'Canto Livre',
        slug: 'canto-livre',
        published_at: '2026-08-01T10:00:00.000Z'
      };

      const schema = poemSchema(poem);
      expect(schema['@type']).toEqual(['CreativeWork', 'Poem', 'Article']);
      expect(schema.isAccessibleForFree).toBe(true);
      expect(schema.copyrightNotice).toBe('© Natanael Fernando Gatti Brentano');
      expect(schema.speakable).toEqual({
        '@type': 'SpeakableSpecification',
        'cssSelector': ['#poem-text', '.single-poem header h1']
      });
    });
  });

  describe('RF05, CA08: Link para llms-full.txt no index.html', () => {
    it('CT07: index.html contém link alternate para llms-full.txt', () => {
      const indexHtmlPath = path.resolve(process.cwd(), 'index.html');
      const content = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(content).toContain('<link rel="alternate" type="text/markdown" href="/llms-full.txt" title="llms-full.txt" />');
      expect(content).toContain('<link rel="alternate" type="text/markdown" href="/llms.txt" title="llms.txt" />');
    });
  });

  describe('RF06, CA09: personSchema com perfil do GitHub', () => {
    it('CT08: personSchema contém link do GitHub no array sameAs', () => {
      const person = personSchema();
      expect(Array.isArray(person.sameAs)).toBe(true);
      expect(person.sameAs).toContain('https://instagram.com/nfgbrentano');
      expect(person.sameAs).toContain('https://github.com/nfbrentano');
    });
  });

});
