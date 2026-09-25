import { describe, it, expect } from 'vitest';
import { renderAboutMarkup, getAboutFaq } from './utils/about-template.js';
import { renderCollectionMarkup } from './utils/collection-template.js';
import { renderPoemMarkup } from './utils/poem-template.js';
import { faqPageSchema, serializeJsonLd, SITE_URL } from './utils/structured-data.js';

describe('GEO Conteúdo Citável — SDD: 2026-09-24_geo-conteudo-citavel-sobre-e-colecoes', () => {

  describe('Página Sobre — FAQ e Fatos (RF01, RF02, RF03, CA01, CA02, CT01, CT02)', () => {
    it('CA01 & CT01: renderAboutMarkup gera seção "Perguntas frequentes" com pelo menos 4 pares pergunta/resposta', () => {
      const html = renderAboutMarkup({
        poemsCount: 222,
        collectionsCount: 5,
        baseUrl: '/'
      });

      expect(html).toContain('Perguntas frequentes');
      expect(html).toContain('faq-section');
      expect(html).toContain('faq-list');

      const questionMatches = html.match(/<h3 class="faq-question">/g) || [];
      const answerMatches = html.match(/<p class="faq-answer">/g) || [];

      expect(questionMatches.length).toBeGreaterThanOrEqual(4);
      expect(answerMatches.length).toBe(questionMatches.length);
    });

    it('RF01 & RF02: Cada pergunta é relevante e respostas começam com frases declarativas autocontidas sob ~60 palavras', () => {
      const faqs = getAboutFaq({ poemsCount: 250, collectionsCount: 6 });
      expect(faqs.length).toBeGreaterThanOrEqual(4);

      const requiredQuestions = [
        'Quem é Natanael Brentano?',
        'Sobre quais temas ele escreve?',
        'Quantos poemas estão publicados no site?',
        'Como os poemas estão organizados?',
        'Posso compartilhar ou citar os poemas?',
        'Como receber novos poemas?'
      ];

      requiredQuestions.forEach(q => {
        const found = faqs.find(item => item.question === q);
        expect(found, `Deveria conter a pergunta: "${q}"`).toBeDefined();
        
        // RF02: até ~60 palavras
        const wordCount = found.answer.trim().split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(60);

        // RF02: começa com frase declarativa autocontida
        expect(found.answer).toMatch(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/);
      });
    });

    it('CA02 & CT02: Número dinâmico no FAQ e nos marcos reflete a contagem passada', () => {
      const customPoemsCount = 287;
      const customColsCount = 9;

      const html = renderAboutMarkup({
        poemsCount: customPoemsCount,
        collectionsCount: customColsCount,
        baseUrl: '/'
      });

      expect(html).toContain(`${customPoemsCount} poemas`);
      expect(html).toContain(`${customColsCount} coleções`);

      const faqs = getAboutFaq({ poemsCount: customPoemsCount, collectionsCount: customColsCount });
      const countFaq = faqs.find(f => f.question.includes('Quantos poemas'));
      expect(countFaq.answer).toContain(`${customPoemsCount} poemas`);
      expect(countFaq.answer).toContain(`${customColsCount} coleções`);
    });
  });

  describe('Página Sobre — Schema FAQPage JSON-LD (RF04, CA03, CT03)', () => {
    it('CA03 & CT03: faqPageSchema gera estrutura válida e texto estritamente idêntico ao visível', () => {
      const poemsCount = 230;
      const collectionsCount = 7;
      const faqs = getAboutFaq({ poemsCount, collectionsCount });
      const schema = faqPageSchema(faqs);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema['@id']).toBe(`${SITE_URL}/sobre/#faq`);
      expect(Array.isArray(schema.mainEntity)).toBe(true);
      expect(schema.mainEntity.length).toBe(faqs.length);

      const html = renderAboutMarkup({ poemsCount, collectionsCount, baseUrl: '/' });

      schema.mainEntity.forEach((item, idx) => {
        expect(item['@type']).toBe('Question');
        expect(item.name).toBe(faqs[idx].question);
        expect(item.acceptedAnswer['@type']).toBe('Answer');
        expect(item.acceptedAnswer.text).toBe(faqs[idx].answer);

        // Texto visível no HTML é idêntico
        expect(html).toContain(item.name);
        expect(html).toContain(item.acceptedAnswer.text);
      });

      // Validação de serialização
      const serialized = serializeJsonLd(schema);
      expect(serialized).not.toContain('<script');
      expect(JSON.parse(serialized.replace(/\\u003c/g, '<'))).toEqual(schema);
    });
  });

  describe('Página de Coleção — Parágrafo Introdutório e Prerender (RF05, CA04, CT04, CT05)', () => {
    it('CA04 & CT04: Coleção com description exibe parágrafo introdutório antes da lista de poemas', () => {
      const col = {
        id: 'col-1',
        name: 'Reflexões e Tempo',
        slug: 'reflexoes-e-tempo',
        description: 'Uma série poética dedicada aos mistérios da memória, à fugacidade do presente e à sabedoria do silêncio.'
      };
      const poemsList = [
        { id: 'p1', title: 'O Tempo ao Seu Lado', slug: 'o-tempo-ao-seu-lado', published_at: '2023-01-01' }
      ];

      const html = renderCollectionMarkup({ col, poemsList, baseUrl: '/' });

      expect(html).toContain('Reflexões e Tempo');
      expect(html).toContain('collection-desc-large');
      expect(html).toContain(col.description);
      expect(html).toContain('href="/poema/o-tempo-ao-seu-lado/"');

      // O parágrafo deve aparecer antes de .poems-list
      const descIndex = html.indexOf(col.description);
      const listIndex = html.indexOf('class="poems-list"');
      expect(descIndex).toBeLessThan(listIndex);
    });

    it('CT05: Coleção sem description renderiza sem parágrafo vazio nem erro', () => {
      const colWithoutDesc = {
        id: 'col-2',
        name: 'Avulsos',
        slug: 'avulsos'
        // description ausente
      };
      const poemsList = [];

      const html = renderCollectionMarkup({ col: colWithoutDesc, poemsList, baseUrl: '/' });

      expect(html).toContain('Avulsos');
      expect(html).not.toContain('collection-desc-large');
      expect(html).not.toMatch(/<p[^>]*>\s*<\/p>/);
    });
  });

  describe('Ficha do Poema — Metadados Semânticos em <dl> (RF06, CA05, CT06)', () => {
    it('CA05 & CT06: renderPoemMarkup gera <dl> com Autor, <time>, Coleção, Sentimentos e Tempo de leitura', () => {
      const poem = {
        id: 'poem-123',
        title: 'Manhã de Névoa',
        slug: 'manha-de-nevoa',
        content: 'Caminho entre a bruma\ne as pedras da memória.\nO silêncio me acolhe.',
        published_at: '2024-05-15T10:00:00Z',
        tags: ['Saudade', 'Tempo']
      };
      const collectionsData = [
        { id: 'col-1', name: 'Reflexões e Tempo', slug: 'reflexoes-e-tempo' }
      ];

      const html = renderPoemMarkup({
        poem,
        collectionsData,
        baseUrl: '/'
      });

      // Seção semântica com aria-label
      expect(html).toContain('poem-metadata-section');
      expect(html).toContain('aria-label="Ficha técnica da obra"');

      // Presença da tag <dl>
      expect(html).toContain('<dl class="poem-metadata-list">');

      // Autor com rel="author" e link para /sobre/
      expect(html).toMatch(/<dt>\s*Autor\s*<\/dt>/);
      expect(html).toMatch(/<a\s+href="\/sobre\/"\s+rel="author"[^>]*>Natanael Brentano<\/a>/);

      // Data de publicação com <time datetime="AAAA-MM-DD">
      expect(html).toMatch(/<dt>\s*Publicado em\s*<\/dt>/);
      expect(html).toMatch(/<time datetime="2024-05-15">15\/05\/2024<\/time>/);

      // Coleção com link rastreável
      expect(html).toMatch(/<dt>\s*Coleção\s*<\/dt>/);
      expect(html).toMatch(/<a href="\/colecao\/reflexoes-e-tempo\/" data-link>Reflexões e Tempo<\/a>/);

      // Sentimentos com links rastreáveis
      expect(html).toMatch(/<dt>\s*Sentimentos\s*<\/dt>/);
      expect(html).toMatch(/<a href="\/sentimento\/saudade\/" data-link>#Saudade<\/a>/);
      expect(html).toMatch(/<a href="\/sentimento\/tempo\/" data-link>#Tempo<\/a>/);

      // Tempo de leitura
      expect(html).toMatch(/<dt>\s*Tempo de leitura\s*<\/dt>/);
      expect(html).toContain('1 min de leitura');
    });

    it('Ficha do poema com obra avulsa e sem sentimentos renderiza fallbacks sem erros', () => {
      const isolatedPoem = {
        id: 'poem-isolated',
        title: 'Verso Solitário',
        slug: 'verso-solitario',
        content: 'Um único instante.',
        published_at: '2025-08-20T12:00:00Z',
        tags: []
      };

      const html = renderPoemMarkup({
        poem: isolatedPoem,
        collectionsData: [],
        baseUrl: '/'
      });

      expect(html).toContain('<dl class="poem-metadata-list">');
      expect(html).toContain('Obra avulsa');
      expect(html).toContain('—');
      expect(html).toMatch(/<time datetime="2025-08-20">20\/08\/2025<\/time>/);
    });
  });

  describe('Home Page — Parágrafo Factual com contagem de obras (RF07)', () => {
    it('RF07: Mantém introdução poética e acrescenta frase factual sobre o acervo', async () => {
      const homeModule = await import('./pages/home.js');
      expect(homeModule.default).toBeDefined();

      const container = document.createElement('div');
      container.setAttribute('data-prerendered', '/');
      await homeModule.default.render(container);

      // Verifica no texto do container ou na estrutura do componente
      const fs = await import('fs');
      const homeCode = fs.readFileSync('src/pages/home.js', 'utf-8');
      const prerenderCode = fs.readFileSync('scripts/prerender.js', 'utf-8');

      // Frase factual presente
      expect(homeCode).toMatch(/O acervo reúne mais de \d+ poemas publicados em coleções temáticas/);
      expect(prerenderCode).toMatch(/O acervo reúne atualmente \$\{poems\.length\} poemas publicados em \$\{allCollections\.length\} coleções temáticas/);
    });
  });

  describe('Admin — Campo de Descrição de Coleção (RF05, CA06)', () => {
    it('CA06: Tela de edição de coleções no admin possui campo de descrição e o persiste', async () => {
      const fs = await import('fs');
      const adminCode = fs.readFileSync('src/pages/admin.js', 'utf-8');

      // Verifica campo de descrição no formulário da coleção
      expect(adminCode).toContain('id="col-description"');
      expect(adminCode).toMatch(/description:\s*container\.querySelector\('#col-description'\)\.value\.trim\(\)/);
    });
  });
});
