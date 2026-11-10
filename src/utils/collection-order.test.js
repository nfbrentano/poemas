import { describe, it, expect } from 'vitest';
import {
  moveItem,
  moveItemUp,
  moveItemDown,
  appendPoemToOrder,
  removePoemFromOrder,
  sortPoemsByCollectionRelations,
  sortPoemsByAutoOrder,
  buildCollectionPoemsPayload,
} from './collection-order.js';

describe('[FEAT] Admin: reordenar manualmente os poemas de uma coleção (SDD 2026-11-10)', () => {
  describe('CT01 & CA01 & CA02: Reordenação de itens (mover posições, subir e descer)', () => {
    it('moveItem move um item da posição 4 (índice 4) para a posição 1 (índice 0)', () => {
      const items = ['A', 'B', 'C', 'D', 'E'];
      const result = moveItem(items, 4, 0);
      expect(result).toEqual(['E', 'A', 'B', 'C', 'D']);
      // Não muta o array original
      expect(items).toEqual(['A', 'B', 'C', 'D', 'E']);
    });

    it('moveItem lida com índices inválidos retornando cópia inalterada', () => {
      const items = ['A', 'B', 'C'];
      expect(moveItem(items, -1, 1)).toEqual(['A', 'B', 'C']);
      expect(moveItem(items, 0, 5)).toEqual(['A', 'B', 'C']);
      expect(moveItem(items, 1, 1)).toEqual(['A', 'B', 'C']);
      expect(moveItem(null, 0, 1)).toEqual([]);
    });

    it('moveItemUp sobe o item uma posição', () => {
      const items = ['A', 'B', 'C', 'D'];
      expect(moveItemUp(items, 2)).toEqual(['A', 'C', 'B', 'D']);
      // Primeiro item não sobe
      expect(moveItemUp(items, 0)).toEqual(['A', 'B', 'C', 'D']);
      expect(moveItemUp(null, 1)).toEqual([]);
    });

    it('moveItemDown desce o item uma posição', () => {
      const items = ['A', 'B', 'C', 'D'];
      expect(moveItemDown(items, 1)).toEqual(['A', 'C', 'B', 'D']);
      // Último item não desce
      expect(moveItemDown(items, 3)).toEqual(['A', 'B', 'C', 'D']);
      expect(moveItemDown(null, 1)).toEqual([]);
    });
  });

  describe('CT06 & CA06: Retrocompatibilidade e ordenação poética', () => {
    const poems = [
      { id: 'p1', title: 'Poema Antigo', published_at: '2023-01-01T10:00:00Z' },
      { id: 'p2', title: 'Poema Novo', published_at: '2025-01-01T10:00:00Z' },
      { id: 'p3', title: 'Poema Médio', published_at: '2024-01-01T10:00:00Z' },
    ];

    it('sortPoemsByAutoOrder ordena cronologicamente por published_at asc', () => {
      const sorted = sortPoemsByAutoOrder(poems);
      expect(sorted.map(p => p.id)).toEqual(['p1', 'p3', 'p2']);
    });

    it('sortPoemsByCollectionRelations sem order numérico mantém a ordem cronológica padrão', () => {
      const relations = [
        { poem_id: 'p1', order: null },
        { poem_id: 'p2' },
        { poem_id: 'p3', order: undefined },
      ];
      const sorted = sortPoemsByCollectionRelations(poems, relations);
      expect(sorted.map(p => p.id)).toEqual(['p1', 'p3', 'p2']);
    });

    it('sortPoemsByCollectionRelations respeita a ordem manual definida', () => {
      // Autor quer p2 em 1º, p1 em 2º, p3 em 3º
      const relations = [
        { poem_id: 'p2', order: 1 },
        { poem_id: 'p1', order: 2 },
        { poem_id: 'p3', order: 3 },
      ];
      const sorted = sortPoemsByCollectionRelations(poems, relations);
      expect(sorted.map(p => p.id)).toEqual(['p2', 'p1', 'p3']);
    });

    it('poema sem order fica no final em relação aos que possuem order', () => {
      const relations = [
        { poem_id: 'p3', order: 1 },
        { poem_id: 'p2', order: 2 },
        // p1 não tem relation com order
      ];
      const sorted = sortPoemsByCollectionRelations(poems, relations);
      expect(sorted.map(p => p.id)).toEqual(['p3', 'p2', 'p1']);
    });
  });

  describe('CT07 & CA07: Inclusão de novo poema ao final', () => {
    it('appendPoemToOrder adiciona novo poema à última posição da lista ordenada', () => {
      const ordered = [{ id: 'p1' }, { id: 'p2' }];
      const next = appendPoemToOrder(ordered, { id: 'p3' });
      expect(next.map(p => p.id)).toEqual(['p1', 'p2', 'p3']);
    });

    it('appendPoemToOrder não duplica poema já existente', () => {
      const ordered = [{ id: 'p1' }, { id: 'p2' }];
      const next = appendPoemToOrder(ordered, { id: 'p1' });
      expect(next.map(p => p.id)).toEqual(['p1', 'p2']);
    });

    it('removePoemFromOrder remove poema da lista', () => {
      const ordered = [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }];
      const next = removePoemFromOrder(ordered, 'p2');
      expect(next.map(p => p.id)).toEqual(['p1', 'p3']);
    });
  });

  describe('CT08 & CA08: Montagem de payload para persistência ou restauração', () => {
    const list = [{ id: 'pA' }, { id: 'pB' }, { id: 'pC' }];

    it('buildCollectionPoemsPayload com ordem manual gera order: 1, 2, 3...', () => {
      const payload = buildCollectionPoemsPayload('col123', list, true);
      expect(payload).toEqual([
        { collection_id: 'col123', poem_id: 'pA', order: 1 },
        { collection_id: 'col123', poem_id: 'pB', order: 2 },
        { collection_id: 'col123', poem_id: 'pC', order: 3 },
      ]);
    });

    it('buildCollectionPoemsPayload com ordem restaurada (automática) define order: null', () => {
      const payload = buildCollectionPoemsPayload('col123', list, false);
      expect(payload).toEqual([
        { collection_id: 'col123', poem_id: 'pA', order: null },
        { collection_id: 'col123', poem_id: 'pB', order: null },
        { collection_id: 'col123', poem_id: 'pC', order: null },
      ]);
    });
  });
});
