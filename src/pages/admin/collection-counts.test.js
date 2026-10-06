import { describe, it, expect } from 'vitest';
import { countPoemsByCollection, formatPoemCount } from './collection-counts.js';

describe('countPoemsByCollection', () => {
  it('conta as relações de cada coleção', () => {
    const rels = [
      { collection_id: 'A', poem_id: '1' }, { collection_id: 'A', poem_id: '2' },
      { collection_id: 'B', poem_id: '1' }, { collection_id: 'A', poem_id: '3' },
    ];
    expect(countPoemsByCollection(rels)).toEqual({ A: 3, B: 1 });
  });
  it('tolera entradas inválidas sem lançar erro', () => {
    expect(countPoemsByCollection(null)).toEqual({});
    expect(countPoemsByCollection(undefined)).toEqual({});
    expect(countPoemsByCollection([])).toEqual({});
    expect(countPoemsByCollection([null, {}, { poem_id: 'x' }, { collection_id: '' }])).toEqual({});
  });
});

describe('formatPoemCount', () => {
  const counts = { A: 3, B: 1 };
  it('usa singular e plural', () => {
    expect(formatPoemCount(counts, 'B')).toBe('1 obra');
    expect(formatPoemCount(counts, 'A')).toBe('3 obras');
    expect(formatPoemCount(counts, 'Z')).toBe('0 obras');
  });
  it('mostra "—" quando as relações não puderam ser lidas', () => {
    expect(formatPoemCount(null, 'A')).toBe('—');
  });
});
