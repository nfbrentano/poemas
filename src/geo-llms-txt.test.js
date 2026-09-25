import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  buildLlmsTxt,
  buildLlmsFullTxt,
  buildAllLlmsFiles,
  formatPoemForMarkdown,
  extractPoemDescription,
  getPoemCollectionNames,
  getPoemSentiments,
  sortPoemsByDateDesc,
  ATTRIBUTION_NOTICE,
  SITE_URL
} from './utils/llms-builder.js';
import { runGenerateLlms } from '../scripts/generate-llms.js';

describe('{GEO} llms.txt e llms-full.txt (SDD 2026-09-24)', () => {
  const mockPoems = [
    {
      id: 'p1',
      title: 'Aurora Efêmera',
      slug: 'aurora-efemera',
      content: '<p>Primeiro raio de sol<br>na janela aberta.</p><p>O dia desperta<br>sem pressa.</p>',
      excerpt: 'Primeiro raio de sol na janela aberta.',
      status: 'published',
      published_at: '2026-06-01T10:00:00Z',
      tags: ['Amor', 'sentimento:esperanca']
    },
    {
      id: 'p2',
      title: 'Tempo e Memória',
      slug: 'tempo-e-memoria',
      content: 'As horas passam devagar\nquando a saudade aperta.\n\nFica a lembrança.',
      excerpt: '',
      status: 'published',
      published_at: '2026-05-15T12:00:00Z',
      tags: ['Saudade', 'Tempo']
    },
    {
      id: 'p3',
      title: 'Noturno Silêncio',
      slug: 'noturno-silencio',
      content: '<p>A noite cai suave &amp; fria.<br>Silêncio total.</p>',
      status: 'published',
      published_at: '2026-04-10T08:00:00Z',
      tags: ['Solidao']
    },
    {
      id: 'p-draft',
      title: 'Poema Rascunho Secreto',
      slug: 'poema-rascunho-secreto',
      content: '<p>Versos secretos que não devem vazar.</p>',
      status: 'draft',
      published_at: '2026-06-10T10:00:00Z',
      tags: ['Amor']
    },
    {
      id: 'p-archived',
      title: 'Poema Arquivado',
      slug: 'poema-arquivado',
      content: 'Versos esquecidos.',
      status: 'archived',
      published_at: '2026-01-01T00:00:00Z',
      tags: ['Tempo']
    }
  ];

  const mockCollections = [
    {
      id: 'col-1',
      title: 'Sussurros do Tempo',
      slug: 'sussurros-do-tempo',
      description: 'Poemas sobre a passagem do tempo e as memórias da vida.'
    },
    {
      id: 'col-2',
      title: 'Luz & Sombra',
      slug: 'luz-e-sombra',
      description: 'Poemas que contrastam a claridade e o recolhimento.'
    }
  ];

  const mockCollectionPoems = [
    { poem_id: 'p1', collection_id: 'col-2' },
    { poem_id: 'p2', collection_id: 'col-1' }
  ];

  describe('CT01 & CA01: Estrutura do llms.txt', () => {
    it('Gera H1, blockquote com resumo e atribuição, autor, coleções, poemas e optional', () => {
      const llmsTxt = buildLlmsTxt({
        baseUrl: SITE_URL,
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      // H1 e blockquote (RF02, RF04)
      expect(llmsTxt).toContain('# Poemas — Natanael Brentano');
      expect(llmsTxt).toContain('> Poesia brasileira contemporânea em língua portuguesa por Natanael Fernando Gatti Brentano.');
      expect(llmsTxt).toContain(`> ${ATTRIBUTION_NOTICE}`);

      // Parágrafo sobre o autor com link canônico absoluto
      expect(llmsTxt).toContain(`[página sobre o autor](${SITE_URL}sobre/)`);

      // Seção Coleções (RF02)
      expect(llmsTxt).toContain('## Coleções');
      expect(llmsTxt).toContain(`- [Sussurros do Tempo](${SITE_URL}colecao/sussurros-do-tempo/): Poemas sobre a passagem do tempo e as memórias da vida.`);
      expect(llmsTxt).toContain(`- [Luz & Sombra](${SITE_URL}colecao/luz-e-sombra/): Poemas que contrastam a claridade e o recolhimento.`);

      // Seção Poemas (RF02)
      expect(llmsTxt).toContain('## Poemas');
      expect(llmsTxt).toContain(`- [Aurora Efêmera](${SITE_URL}poema/aurora-efemera/): Primeiro raio de sol na janela aberta.`);
      expect(llmsTxt).toContain(`- [Tempo e Memória](${SITE_URL}poema/tempo-e-memoria/): As horas passam devagar`);

      // Seção Optional (RF02)
      expect(llmsTxt).toContain('## Optional');
      expect(llmsTxt).toContain(`- [Acervo Completo (Markdown)](${SITE_URL}llms-full.txt)`);
      expect(llmsTxt).toContain(`- [Feed RSS](${SITE_URL}feed.xml)`);
      expect(llmsTxt).toContain(`- [Mapa do Site (Sitemap)](${SITE_URL}sitemap.xml)`);
    });
  });

  describe('CT02 & CA02: Exclusão de rascunhos e não publicados', () => {
    it('Não inclui poemas com status draft ou archived nem em llms.txt nem em llms-full.txt', () => {
      const llmsTxt = buildLlmsTxt({
        baseUrl: SITE_URL,
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      const llmsFullTxt = buildLlmsFullTxt({
        baseUrl: SITE_URL,
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      // llms.txt
      expect(llmsTxt).not.toContain('Poema Rascunho Secreto');
      expect(llmsTxt).not.toContain('poema-rascunho-secreto');
      expect(llmsTxt).not.toContain('Poema Arquivado');
      expect(llmsTxt).not.toContain('poema-arquivado');

      // llms-full.txt
      expect(llmsFullTxt).not.toContain('Poema Rascunho Secreto');
      expect(llmsFullTxt).not.toContain('poema-rascunho-secreto');
      expect(llmsFullTxt).not.toContain('Poema Arquivado');
      expect(llmsFullTxt).not.toContain('poema-arquivado');
    });
  });

  describe('CT03 & CA03: Preservação de versos e estrofes em Markdown', () => {
    it('Preserva versos em linhas separadas e estrofes separadas por linha em branco, sem tags HTML', () => {
      const htmlContent = '<p>Primeiro raio de sol<br>na janela aberta.</p><p>O dia desperta<br>sem pressa.</p>';
      const md = formatPoemForMarkdown(htmlContent);

      // Não contém tags HTML
      expect(md).not.toContain('<p>');
      expect(md).not.toContain('</p>');
      expect(md).not.toContain('<br>');
      expect(md).not.toContain('</br>');

      // Estrofes separadas por linha em branco (\n\n)
      const stanzas = md.split('\n\n');
      expect(stanzas.length).toBe(2);

      // Versos preservados com quebra de linha
      const linesStanza1 = stanzas[0].split('\n');
      expect(linesStanza1.length).toBe(2);
      expect(linesStanza1[0]).toMatch(/^Primeiro raio de sol {2}$/);
      expect(linesStanza1[1]).toBe('na janela aberta.');

      const linesStanza2 = stanzas[1].split('\n');
      expect(linesStanza2.length).toBe(2);
      expect(linesStanza2[0]).toMatch(/^O dia desperta {2}$/);
      expect(linesStanza2[1]).toBe('sem pressa.');
    });

    it('Decodifica entidades HTML e mantém texto limpo', () => {
      const htmlContent = '<p>Noite suave &amp; fria.<br>Café &nbsp; quente.</p>';
      const md = formatPoemForMarkdown(htmlContent);

      expect(md).toContain('&');
      expect(md).not.toContain('&amp;');
      expect(md).not.toContain('&nbsp;');
    });

    it('No llms-full.txt, cada poema contém metadados completos e separador', () => {
      const llmsFullTxt = buildLlmsFullTxt({
        baseUrl: SITE_URL,
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      expect(llmsFullTxt).toContain('# Poemas — Natanael Brentano (Acervo Completo)');
      expect(llmsFullTxt).toContain('## Aurora Efêmera');
      expect(llmsFullTxt).toContain(`URL: ${SITE_URL}poema/aurora-efemera/ | Publicado em: 2026-06-01 | Coleções: Luz & Sombra | Sentimentos: Amor, Esperança`);
      expect(llmsFullTxt).toContain('Primeiro raio de sol');
      expect(llmsFullTxt).toContain('na janela aberta.');
      expect(llmsFullTxt).toContain('---');
    });
  });

  describe('CT04: URLs canônicas absolutas', () => {
    it('Todas as URLs de páginas no llms.txt terminam com barra final e são absolutas', () => {
      const llmsTxt = buildLlmsTxt({
        baseUrl: SITE_URL,
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      // Extrai todas as URLs do markdown: [texto](url)
      const urlMatches = Array.from(llmsTxt.matchAll(/\]\((https:\/\/[^)]+)\)/g)).map(m => m[1]);
      expect(urlMatches.length).toBeGreaterThan(0);

      urlMatches.forEach(url => {
        expect(url.startsWith('https://nfgbrentano.art.br/')).toBe(true);
        // Arquivos como .xml ou .txt não têm barra; rotas de páginas devem ter barra final
        if (/\.(xml|txt)$/.test(url)) {
          expect(url.endsWith('/')).toBe(false);
        } else {
          expect(url.endsWith('/')).toBe(true);
        }
      });
    });
  });

  describe('CA04: Ordenação por publicação mais recente', () => {
    it('Poemas aparecem ordenados do mais recente para o mais antigo', () => {
      const llmsTxt = buildLlmsTxt({
        baseUrl: SITE_URL,
        poems: mockPoems,
        collections: mockCollections,
        collectionPoems: mockCollectionPoems
      });

      const auroraIndex = llmsTxt.indexOf('Aurora Efêmera'); // 2026-06-01
      const tempoIndex = llmsTxt.indexOf('Tempo e Memória');  // 2026-05-15
      const noturnoIndex = llmsTxt.indexOf('Noturno Silêncio'); // 2026-04-10

      expect(auroraIndex).toBeGreaterThan(-1);
      expect(tempoIndex).toBeGreaterThan(-1);
      expect(noturnoIndex).toBeGreaterThan(-1);

      expect(auroraIndex).toBeLessThan(tempoIndex);
      expect(tempoIndex).toBeLessThan(noturnoIndex);
    });
  });

  describe('CA05: Tag link alternate no index.html', () => {
    it('index.html contém link rel="alternate" type="text/markdown" apontando para /llms.txt', () => {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      const html = fs.readFileSync(indexPath, 'utf-8');

      expect(html).toMatch(/<link\s+rel="alternate"\s+type="text\/markdown"\s+href="\/llms\.txt"\s+title="llms\.txt"\s*\/?>/i);
    });
  });

  describe('CT05 & CA06: Resiliência em caso de falha do Firestore', () => {
    it('runGenerateLlms conclui e gera seções estáticas mesmo se o Firestore falhar', async () => {
      const tempOutDir = path.resolve(process.cwd(), 'dist-test-llms');
      if (fs.existsSync(tempOutDir)) {
        fs.rmSync(tempOutDir, { recursive: true, force: true });
      }

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Salva VITE_FIREBASE_API_KEY e temporariamente remove para forçar fallback estático
      const prevKey = process.env.VITE_FIREBASE_API_KEY;
      delete process.env.VITE_FIREBASE_API_KEY;

      try {
        await runGenerateLlms(tempOutDir);

        expect(fs.existsSync(path.join(tempOutDir, 'llms.txt'))).toBe(true);
        expect(fs.existsSync(path.join(tempOutDir, 'llms-full.txt'))).toBe(true);

        const generatedLlms = fs.readFileSync(path.join(tempOutDir, 'llms.txt'), 'utf-8');
        expect(generatedLlms).toContain('# Poemas — Natanael Brentano');
        expect(generatedLlms).toContain('> Poesia brasileira contemporânea em língua portuguesa por Natanael Fernando Gatti Brentano.');
        expect(generatedLlms).toContain('## Coleções');
        expect(generatedLlms).toContain('## Optional');
      } finally {
        if (prevKey) process.env.VITE_FIREBASE_API_KEY = prevKey;
        warnSpy.mockRestore();
        if (fs.existsSync(tempOutDir)) {
          fs.rmSync(tempOutDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('CT06 & RNF03: Conformidade com llmstxt.org e tamanho do arquivo', () => {
    it('llms.txt segue padrão llmstxt.org e tem tamanho abaixo de 100 KB', () => {
      // Cria 100 poemas para simular acervo grande
      const largePoemList = Array.from({ length: 100 }, (_, i) => ({
        id: `p-${i}`,
        title: `Poema de Teste Número ${i}`,
        slug: `poema-de-teste-${i}`,
        content: `<p>Verso inicial do poema de teste ${i}<br>segundo verso poético.</p>`,
        status: 'published',
        published_at: '2026-05-01T00:00:00Z',
        tags: ['amor']
      }));

      const files = buildAllLlmsFiles({
        baseUrl: SITE_URL,
        poems: largePoemList,
        collections: mockCollections,
        collectionPoems: []
      });

      const llmsTxt = files['llms.txt'];
      const byteLength = Buffer.byteLength(llmsTxt, 'utf-8');

      // RNF03: tamanho do llms.txt bem abaixo de ~100 KB
      expect(byteLength).toBeLessThan(100 * 1024);

      // llmstxt.org: Começa com H1 seguido imediatamente por blockquote
      expect(llmsTxt.startsWith('# Poemas — Natanael Brentano\n\n> ')).toBe(true);

      // Contém H2s válidos
      const h2Matches = llmsTxt.match(/^## .+/gm);
      expect(h2Matches).toContain('## Coleções');
      expect(h2Matches).toContain('## Poemas');
      expect(h2Matches).toContain('## Optional');
    });
  });
});
