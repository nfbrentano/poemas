import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderPoemMarkup } from './utils/poem-template.js';
import { poemSchema } from './utils/structured-data.js';
import { buildLlmsFullTxt } from './utils/llms-builder.js';
import { buildWxr } from './utils/wxr-builder.js';

vi.mock('./pages/admin/data.js', () => ({
  listDocs: vi.fn().mockResolvedValue({ data: [], error: null }),
  getDocById: vi.fn(),
  insertDocs: vi.fn(),
  updateDocById: vi.fn(),
  deleteDocById: vi.fn().mockResolvedValue({ error: null }),
  uploadFile: vi.fn(),
  getPublicFileUrl: vi.fn(),
  callFunction: vi.fn()
}));

vi.mock('./router.js', () => ({
  navigateTo: vi.fn()
}));

import { renderEditor } from './pages/admin/editor.js';
import { insertDocs, updateDocById, getDocById } from './pages/admin/data.js';

describe('Notas do autor, dedicatória e contexto de criação (SDD 2026-11-13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('CT01 & CA02 & CA03: Renderização no poema com e sem nota', () => {
    it('renderiza dedicatória e nota do autor colapsada quando campos estão preenchidos', () => {
      const poem = {
        title: 'Noite de Outono',
        slug: 'noite-de-outono',
        content: 'As folhas caem secas\nNa calçada fria.',
        published_at: '2026-05-12T14:00:00Z',
        dedication: 'Para Maria, com amor e saudade.',
        author_note: 'Escrevi este poema enquanto caminhava pelo bairro Menino Deus numa noite fria de vento sul.',
        written_at: '2018-04-10',
        written_location: 'Porto Alegre, RS'
      };

      const html = renderPoemMarkup({ poem, baseUrl: '/' });
      const container = document.createElement('div');
      container.innerHTML = html;

      // Dedicatória antes dos versos
      const dedicationEl = container.querySelector('.poem-dedication');
      expect(dedicationEl).not.toBeNull();
      expect(dedicationEl.textContent).toContain('Para Maria, com amor e saudade.');

      // Nota do autor colapsada após os versos
      const authorNoteEl = container.querySelector('.poem-author-note');
      expect(authorNoteEl).not.toBeNull();
      expect(authorNoteEl.hasAttribute('open')).toBe(false);

      const summaryEl = container.querySelector('.poem-author-note-summary');
      expect(summaryEl).not.toBeNull();
      expect(summaryEl.textContent).toContain('Sobre este poema / Nota do autor');

      const bodyTextEl = container.querySelector('.poem-author-note-text');
      expect(bodyTextEl.textContent).toContain('Escrevi este poema enquanto caminhava');

      const writtenMetaEl = container.querySelector('.poem-written-meta');
      expect(writtenMetaEl).not.toBeNull();
      expect(writtenMetaEl.textContent).toContain('Porto Alegre, RS');
      expect(writtenMetaEl.textContent).toContain('10 de abril de 2018');
    });

    it('omite .poem-dedication e .poem-author-note quando campos não estão preenchidos (legado)', () => {
      const legacyPoem = {
        title: 'Poema Sem Notas',
        slug: 'poema-sem-notas',
        content: 'Verso simples\nOutro verso.',
        published_at: '2026-01-01T12:00:00Z'
      };

      const html = renderPoemMarkup({ poem: legacyPoem, baseUrl: '/' });
      const container = document.createElement('div');
      container.innerHTML = html;

      expect(container.querySelector('.poem-dedication')).toBeNull();
      expect(container.querySelector('.poem-author-note')).toBeNull();
      expect(html).not.toContain('undefined');
      expect(html).not.toContain('null');
    });
  });

  describe('CT02 & CA04: Metadados Schema.org e llms-full.txt', () => {
    it('adiciona dateCreated e locationCreated no Schema.org quando preenchidos', () => {
      const poem = {
        title: 'Poema com Metadados',
        slug: 'poema-com-metadados',
        content: 'Um verso.',
        published_at: '2026-11-13T10:00:00Z',
        written_at: '2018-04-10',
        written_location: 'Porto Alegre'
      };

      const schema = poemSchema(poem);
      expect(schema.dateCreated).toBe('2018-04-10');
      expect(schema.locationCreated).toEqual({
        '@type': 'Place',
        name: 'Porto Alegre'
      });
    });

    it('omite dateCreated e locationCreated no Schema.org se não preenchidos', () => {
      const legacyPoem = {
        title: 'Poema Legado',
        slug: 'poema-legado',
        content: 'Um verso.',
        published_at: '2026-11-13T10:00:00Z'
      };

      const schema = poemSchema(legacyPoem);
      expect(schema.dateCreated).toBeUndefined();
      expect(schema.locationCreated).toBeUndefined();
    });

    it('enriquece llms-full.txt com dedicatória, nota e criação quando presentes', () => {
      const poems = [
        {
          title: 'Poema com Contexto',
          slug: 'poema-com-contexto',
          status: 'published',
          published_at: '2026-06-01T12:00:00Z',
          content: 'Verso do poema.\nSegundo verso.',
          dedication: 'Para quem lê.',
          written_at: '2019-10-15',
          written_location: 'Florianópolis, SC',
          author_note: 'Criado durante um pôr do sol na praia da Joaquina.'
        },
        {
          title: 'Poema Puro',
          slug: 'poema-puro',
          status: 'published',
          published_at: '2026-05-01T12:00:00Z',
          content: 'Verso puro.'
        }
      ];

      const fullTxt = buildLlmsFullTxt({ poems });

      // Poema com contexto
      expect(fullTxt).toContain('> Dedicatória: Para quem lê.');
      expect(fullTxt).toContain('> Criação: Local: Florianópolis, SC | Escrito em: 2019-10-15');
      expect(fullTxt).toContain('> Nota do autor: Criado durante um pôr do sol na praia da Joaquina.');

      // Poema puro não deve ter blocos fantasmas
      const puroSection = fullTxt.slice(fullTxt.indexOf('## Poema Puro'));
      expect(puroSection).not.toContain('> Dedicatória:');
      expect(puroSection).not.toContain('> Criação:');
      expect(puroSection).not.toContain('> Nota do autor:');
    });
  });

  describe('CT03 & CA06: Prevenção de XSS', () => {
    it('escapa tags maliciosas em dedication, author_note e written_location', () => {
      const maliciousPoem = {
        title: 'Poema XSS Test',
        slug: 'poema-xss-test',
        content: 'Versos normais.',
        published_at: '2026-11-13T10:00:00Z',
        dedication: '<script>alert("xss")</script>',
        author_note: '<img src=x onerror=alert(1)>Texto seguro.',
        written_at: '2020<script>',
        written_location: '<b>Cidade</b>'
      };

      const html = renderPoemMarkup({ poem: maliciousPoem, baseUrl: '/' });

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img src=x onerror=alert(1)>');
      expect(html).not.toContain('<b>Cidade</b>');
      expect(html).toContain('&lt;&#x2F;script&gt;');
      expect(html).toContain('&lt;b&gt;Cidade&lt;&#x2F;b&gt;');
    });
  });

  describe('CT04 & CA01: Persistência no editor admin', () => {
    it('carrega campos existentes e os persiste ao submeter o formulário de edição', async () => {
      getDocById.mockResolvedValueOnce({
        data: {
          id: 'poem-123',
          title: 'Poema Existente',
          slug: 'poema-existente',
          content: 'Verso do poema.',
          status: 'published',
          dedication: 'Dedicatória antiga',
          author_note: 'Nota antiga',
          written_at: '2017-05-01',
          written_location: 'Pelotas, RS'
        }
      });
      updateDocById.mockResolvedValueOnce({ error: null });

      const container = document.createElement('div');
      document.body.appendChild(container);
      await renderEditor(container, 'poem-123');

      // Verifica preenchimento dos campos no DOM
      const dedicationInput = container.querySelector('#poem-dedication');
      const authorNoteInput = container.querySelector('#poem-author-note');
      const writtenAtInput = container.querySelector('#poem-written-at');
      const writtenLocationInput = container.querySelector('#poem-written-location');

      expect(dedicationInput.value).toBe('Dedicatória antiga');
      expect(authorNoteInput.value).toBe('Nota antiga');
      expect(writtenAtInput.value).toBe('2017-05-01');
      expect(writtenLocationInput.value).toBe('Pelotas, RS');

      // Altera valores
      dedicationInput.value = 'Nova dedicatória';
      authorNoteInput.value = 'Nova nota ampliada';
      writtenAtInput.value = '2018-01-01';
      writtenLocationInput.value = 'Caxias do Sul, RS';

      // Dispara submit
      const form = container.querySelector('#editor-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await new Promise(r => setTimeout(r, 20));

      expect(updateDocById).toHaveBeenCalledWith(
        'poems',
        'poem-123',
        expect.objectContaining({
          dedication: 'Nova dedicatória',
          author_note: 'Nova nota ampliada',
          written_at: '2018-01-01',
          written_location: 'Caxias do Sul, RS'
        })
      );
    });

    it('grava null quando os campos opcionais são esvaziados em novo poema', async () => {
      insertDocs.mockResolvedValueOnce({ error: null });

      const container = document.createElement('div');
      document.body.appendChild(container);
      await renderEditor(container, null);

      container.querySelector('#poem-title').value = 'Novo Poema';
      container.querySelector('#poem-slug').value = 'novo-poema';
      container.querySelector('#poem-content-input').value = 'Conteúdo novo.';

      // Submete sem preencher campos opcionais
      const form = container.querySelector('#editor-form');
      form.dispatchEvent(new Event('submit', { cancelable: true }));
      await new Promise(r => setTimeout(r, 20));

      expect(insertDocs).toHaveBeenCalledWith(
        'poems',
        expect.objectContaining({
          title: 'Novo Poema',
          slug: 'novo-poema',
          dedication: null,
          author_note: null,
          written_at: null,
          written_location: null
        })
      );
    });
  });

  describe('CT05 & CA05: Exportação WXR e Prerender estático', () => {
    it('buildWxr inclui wp:postmeta para dedication, author_note, written_at e written_location quando presentes', () => {
      const poems = [
        {
          title: 'Poema com Postmeta',
          slug: 'poema-postmeta',
          content: 'Verso.',
          status: 'published',
          published_at: '2026-03-01T12:00:00Z',
          dedication: 'Dedicatória Especial',
          author_note: 'Contexto de escrita',
          written_at: '2015-11-20',
          written_location: 'Santa Maria, RS'
        }
      ];

      const xml = buildWxr({ poems });

      expect(xml).toContain('<wp:meta_key><![CDATA[dedication]]></wp:meta_key>');
      expect(xml).toContain('<wp:meta_value><![CDATA[Dedicatória Especial]]></wp:meta_value>');

      expect(xml).toContain('<wp:meta_key><![CDATA[author_note]]></wp:meta_key>');
      expect(xml).toContain('<wp:meta_value><![CDATA[Contexto de escrita]]></wp:meta_value>');

      expect(xml).toContain('<wp:meta_key><![CDATA[written_at]]></wp:meta_key>');
      expect(xml).toContain('<wp:meta_value><![CDATA[2015-11-20]]></wp:meta_value>');

      expect(xml).toContain('<wp:meta_key><![CDATA[written_location]]></wp:meta_key>');
      expect(xml).toContain('<wp:meta_value><![CDATA[Santa Maria, RS]]></wp:meta_value>');
    });
  });
});
