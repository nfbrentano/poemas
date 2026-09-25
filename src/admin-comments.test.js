import { describe, it, expect } from 'vitest';
import { attachPoemsToComments, formatCommentPoemHtml } from './pages/admin.js';

describe('Admin Comments - Resolução de Título e Link do Poema (SDD 2026-09-24)', () => {
  const mockPoems = [
    { id: 'poem-123', title: 'Amor em Chamas', slug: 'amor-em-chamas' },
    { id: 'poem-456', title: 'Canto Noturno & Silêncio', slug: 'canto-noturno' },
    { id: 'poem-789', title: 'Poema Sem Slug', slug: '' }
  ];

  it('CA01: deve associar o poema correto pelo poem_id e formatar com link para /poema/{slug}', () => {
    const rawComments = [
      {
        id: 'comm-1',
        poem_id: 'poem-123',
        author_name: 'Natanael',
        content: 'Excelente reflexão!',
        approved: true,
        created_at: '2026-09-24T12:00:00.000Z'
      }
    ];

    const comments = attachPoemsToComments(rawComments, mockPoems);
    expect(comments).toHaveLength(1);
    expect(comments[0].poems).toEqual({
      id: 'poem-123',
      title: 'Amor em Chamas',
      slug: 'amor-em-chamas'
    });

    const html = formatCommentPoemHtml(comments[0], '/');
    expect(html).toContain('Em: <a href="/poema/amor-em-chamas"');
    expect(html).toContain('Amor em Chamas</a>');
  });

  it('CA02: deve exibir "Obra removida" quando o poem_id não existe na lista de poemas', () => {
    const rawComments = [
      {
        id: 'comm-2',
        poem_id: 'poem-deleted',
        author_name: 'Dani',
        content: 'Adorei!',
        approved: true,
        created_at: '2026-09-24T12:00:00.000Z'
      }
    ];

    const comments = attachPoemsToComments(rawComments, mockPoems);
    expect(comments[0].poems).toBeNull();

    const html = formatCommentPoemHtml(comments[0]);
    expect(html).toBe('Em: <span style="font-style: italic; color: var(--text-muted);">Obra removida</span>');
  });

  it('deve associar poema quando identificado pelo slug como fallback', () => {
    const rawComments = [
      {
        id: 'comm-3',
        poem_id: 'canto-noturno',
        author_name: 'Pablo',
        content: 'Muito bom!',
        approved: false,
        created_at: '2026-09-24T12:00:00.000Z'
      }
    ];

    const comments = attachPoemsToComments(rawComments, mockPoems);
    expect(comments[0].poems).toEqual({
      id: 'poem-456',
      title: 'Canto Noturno & Silêncio',
      slug: 'canto-noturno'
    });
  });

  it('deve escapar caracteres especiais no título para prevenir XSS', () => {
    const rawComments = [
      {
        id: 'comm-4',
        poem_id: 'poem-456',
        author_name: 'Tester',
        content: 'Teste',
        approved: true
      }
    ];

    const comments = attachPoemsToComments(rawComments, mockPoems);
    const html = formatCommentPoemHtml(comments[0], '/');
    expect(html).toContain('Canto Noturno &amp; Silêncio');
    expect(html).not.toContain('Canto Noturno & Silêncio</a>');
  });

  it('deve exibir apenas o título sem link se o poema não possuir slug', () => {
    const rawComments = [
      {
        id: 'comm-5',
        poem_id: 'poem-789',
        author_name: 'Autor',
        content: 'Conteúdo'
      }
    ];

    const comments = attachPoemsToComments(rawComments, mockPoems);
    const html = formatCommentPoemHtml(comments[0]);
    expect(html).toBe('Em: Poema Sem Slug');
  });

  it('deve normalizar timestamps do Firestore (objeto com toDate ou seconds)', () => {
    const rawComments = [
      {
        id: 'comm-6',
        poem_id: 'poem-123',
        author_name: 'User',
        content: 'Comentário com Firestore Timestamp',
        created_at: {
          toDate: () => new Date('2026-09-24T15:30:00.000Z')
        }
      },
      {
        id: 'comm-7',
        poem_id: 'poem-123',
        author_name: 'User 2',
        content: 'Comentário com seconds',
        created_at: {
          seconds: 1790263800 // timestamp
        }
      }
    ];

    const comments = attachPoemsToComments(rawComments, mockPoems);
    expect(comments[0].created_at).toBe('2026-09-24T15:30:00.000Z');
    expect(typeof comments[1].created_at).toBe('string');
    expect(new Date(comments[1].created_at).toString()).not.toBe('Invalid Date');
  });

  it('deve lidar graciosamente com arrays vazios ou nulos', () => {
    expect(attachPoemsToComments([], [])).toEqual([]);
    expect(attachPoemsToComments(null, null)).toEqual([]);
    expect(formatCommentPoemHtml(null)).toBe('Em: <span style="font-style: italic; color: var(--text-muted);">Obra removida</span>');
  });
});
