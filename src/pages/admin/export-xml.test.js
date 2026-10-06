import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { XMLParser } from 'fast-xml-parser';

const listDocs = vi.fn();
vi.mock('./data.js', () => ({ listDocs: (...a) => listDocs(...a), deleteDocById: vi.fn() }));
vi.mock('../../router.js', () => ({ navigateTo: vi.fn() }));

import { renderList } from './list.js';
import { buildExportFile } from './export-xml.js';

const POEMS = [
  { id: 'a', title: 'Publicado', slug: 'publicado', status: 'published', content: 'um\ndois', tags: ['amor'], published_at: '2025-01-01T10:00:00Z', created_at: '2025-01-01T10:00:00Z' },
  { id: 'b', title: 'Rascunho', slug: 'rascunho', status: 'draft', content: 'três', tags: [], created_at: '2025-02-01T10:00:00Z' },
  { id: 'c', title: 'Agendado', slug: 'agendado', status: 'scheduled', content: 'quatro', tags: ['dor'], scheduled_at: '2026-12-01T10:00:00Z', created_at: '2025-03-01T10:00:00Z' },
];

let container, downloads, revoke;
const readBlob = (blob) => new Promise((resolve) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.readAsText(blob); });
const items = (xml) => { const i = new XMLParser({ ignoreAttributes: false, cdataPropName: '__cdata', trimValues: false }).parse(xml).rss.channel.item; return Array.isArray(i) ? i : [i]; };
const val = (x) => (x && x.__cdata !== undefined ? x.__cdata : x);

async function mount(poems = POEMS) {
  listDocs.mockReset();
  listDocs.mockImplementation(async (name) => (name === 'poems' ? { data: poems, error: null } : { data: [], error: null }));
  container = document.createElement('div');
  document.body.appendChild(container);
  await renderList(container);
}

beforeEach(() => {
  downloads = [];
  revoke = vi.fn();
  URL.createObjectURL = vi.fn((blob) => { downloads.push(blob); return 'blob:teste'; });
  URL.revokeObjectURL = revoke;
  // evita a navegação real do jsdom ao clicar no link de download
  HTMLAnchorElement.prototype.click = vi.fn(function () { downloads.push({ filename: this.download, href: this.href }); });
});
afterEach(() => { container?.remove(); vi.useRealTimers(); });

describe('botão Exportar XML na lista de obras', () => {
  it('aparece na tela (CA01)', async () => {
    await mount();
    const btn = container.querySelector('#export-xml-btn');
    expect(btn).not.toBeNull();
    expect(btn.textContent.trim()).toBe('Exportar XML');
    expect(btn.disabled).toBe(false);
  });

  it('baixa poemas-AAAA-MM-DD.xml, libera a URL e não faz nova consulta (CA02, CA06)', async () => {
    await mount();
    const callsBefore = listDocs.mock.calls.length;
    container.querySelector('#export-xml-btn').click();
    const blob = downloads.find(d => d instanceof Blob);
    const link = downloads.find(d => d.filename);
    expect(link.filename).toMatch(/^poemas-\d{4}-\d{2}-\d{2}\.xml$/);
    expect(blob.type).toContain('application/xml');
    expect(revoke).toHaveBeenCalledWith('blob:teste');
    expect(listDocs.mock.calls.length).toBe(callsBefore);
  });

  it('o arquivo traz todas as obras, com status publish/draft/future (CA03)', async () => {
    await mount();
    container.querySelector('#export-xml-btn').click();
    const xml = await readBlob(downloads.find(d => d instanceof Blob));
    const its = items(xml);
    expect(its).toHaveLength(3);
    expect(Object.fromEntries(its.map(i => [val(i['wp:post_name']), val(i['wp:status'])]))).toEqual({ publicado: 'publish', rascunho: 'draft', agendado: 'future' });
  });

  it('exporta tudo mesmo com filtro ativo na lista (CA07)', async () => {
    await mount();
    const select = container.querySelector('#list-filter-status');
    select.value = 'draft';
    select.dispatchEvent(new Event('change'));
    container.querySelector('#export-xml-btn').click();
    const xml = await readBlob(downloads.find(d => d instanceof Blob));
    expect(items(xml)).toHaveLength(3);
  });

  it('mostra confirmação e volta ao texto original (CA04)', async () => {
    await mount();
    vi.useFakeTimers();
    const btn = container.querySelector('#export-xml-btn');
    btn.click();
    expect(btn.textContent.trim()).toBe('Baixado: 3 obras');
    vi.advanceTimersByTime(3100);
    expect(btn.textContent.trim()).toBe('Exportar XML');
  });

  it('fica desabilitado sem obras (CA05)', async () => {
    await mount([]);
    expect(container.querySelector('#export-xml-btn').disabled).toBe(true);
  });
});

describe('buildExportFile', () => {
  it('usa a data do dia no nome do arquivo', () => {
    expect(buildExportFile([], new Date('2026-10-06T15:00:00Z')).filename).toBe('poemas-2026-10-06.xml');
  });
});
