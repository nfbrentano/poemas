import { describe, it, expect } from 'vitest';
import { getPoemOfDay, hashString } from './poemOfDay.js';

describe('poemOfDay', () => {
  const mockPoems = Array.from({ length: 150 }, (_, i) => ({
    id: `id-${i}`,
    slug: `poema-${i}`,
    title: `Poema ${i}`
  }));

  it('CT01: Virada de fuso - deve retornar o mesmo poema às 23:30 e às 10:00 no horário de Brasília', () => {
    // 23:30 in Brasília is 02:30 next day in UTC
    const date1 = new Date('2026-09-24T02:30:00Z'); // 2026-09-23T23:30:00-03:00
    // 10:00 in Brasília is 13:00 same day in UTC
    const date2 = new Date('2026-09-23T13:00:00Z'); // 2026-09-23T10:00:00-03:00

    const poem1 = getPoemOfDay(mockPoems, date1);
    const poem2 = getPoemOfDay(mockPoems, date2);

    expect(poem1).toEqual(poem2);
  });

  it('CT02: Determinismo - chamar 2x com os mesmos dados deve retornar o mesmo resultado', () => {
    const date = new Date('2026-09-23T12:00:00Z');
    const poem1 = getPoemOfDay(mockPoems, date);
    const poem2 = getPoemOfDay(mockPoems, date);

    expect(poem1).toEqual(poem2);
  });

  it('CT03: Estabilidade - adicionar um poema novo à lista deve retornar o mesmo resultado', () => {
    const date = new Date('2026-09-23T12:00:00Z');
    const poem1 = getPoemOfDay(mockPoems, date);

    const newPoems = [...mockPoems, { id: 'id-new', slug: 'poema-novo', title: 'Poema Novo' }];
    const poem2 = getPoemOfDay(newPoems, date);

    expect(poem1).toEqual(poem2);
  });

  it('CT04: Distribuição - 365 datas, 150 poemas, cada poema aparece <= 7 vezes', () => {
    const counts = {};
    let dateStr = '2026-01-01T12:00:00Z';
    let currentDate = new Date(dateStr);
    
    for (let i = 0; i < 365; i++) {
      const poem = getPoemOfDay(mockPoems, currentDate);
      counts[poem.slug] = (counts[poem.slug] || 0) + 1;
      
      // Add 1 day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const maxCount = Math.max(...Object.values(counts));
    expect(maxCount).toBeLessThanOrEqual(7);
  });

  it('CT05: Lista vazia - getPoemOfDay([], date) deve retornar null, sem exceção', () => {
    const date = new Date('2026-09-23T12:00:00Z');
    expect(getPoemOfDay([], date)).toBeNull();
    expect(getPoemOfDay(null, date)).toBeNull();
  });
});
