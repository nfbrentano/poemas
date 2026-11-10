import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getFavorites,
  isFavorite,
  toggleFavorite,
  removeFavorite
} from './favorites.js';

describe('Gerenciamento de Favoritos (SDD 2026-11-10)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('CT01 & CA01 & CA03: deve alternar favorito e persistir localmente sem rede', () => {
    const poem = { slug: 'meu-poema', id: 'poem-123', title: 'Meu Poema' };

    expect(isFavorite('meu-poema')).toBe(false);
    expect(isFavorite('poem-123')).toBe(false);

    // 1. Favoritar
    const resAdd = toggleFavorite(poem);
    expect(resAdd.success).toBe(true);
    expect(resAdd.isFavorite).toBe(true);
    expect(isFavorite('meu-poema')).toBe(true);
    expect(isFavorite('poem-123')).toBe(true);

    const stored = getFavorites();
    expect(stored.length).toBe(1);
    expect(stored[0].slug).toBe('meu-poema');
    expect(stored[0].id).toBe('poem-123');
    expect(stored[0].added_at).toBeDefined();

    // 2. Desfavoritar
    const resRemove = toggleFavorite(poem);
    expect(resRemove.success).toBe(true);
    expect(resRemove.isFavorite).toBe(false);
    expect(isFavorite('meu-poema')).toBe(false);
    expect(getFavorites().length).toBe(0);
  });

  it('CT03 & CA04: deve listar os favoritos ordenados do mais recente para o mais antigo', async () => {
    // Simula adições em timestamps distintos
    const p1 = { slug: 'poema-antigo', id: 'id-1' };
    const p2 = { slug: 'poema-medio', id: 'id-2' };
    const p3 = { slug: 'poema-recente', id: 'id-3' };

    toggleFavorite(p1);
    // Aguarda pequena diferença de tempo
    await new Promise(r => setTimeout(r, 10));
    toggleFavorite(p2);
    await new Promise(r => setTimeout(r, 10));
    toggleFavorite(p3);

    const favs = getFavorites();
    expect(favs.length).toBe(3);
    // Mais recente no topo
    expect(favs[0].slug).toBe('poema-recente');
    expect(favs[1].slug).toBe('poema-medio');
    expect(favs[2].slug).toBe('poema-antigo');
  });

  it('CT07 & CA08: deve enviar eventos personalizados ao Microsoft Clarity ao favoritar e desfavoritar', () => {
    window.clarity = vi.fn();

    const poem = { slug: 'versos-clarity', id: 'id-c1' };

    // Adiciona -> favorite_add
    toggleFavorite(poem);
    expect(window.clarity).toHaveBeenCalledTimes(1);
    expect(window.clarity).toHaveBeenCalledWith('event', 'favorite_add');

    // Remove -> favorite_remove
    toggleFavorite(poem);
    expect(window.clarity).toHaveBeenCalledTimes(2);
    expect(window.clarity).toHaveBeenCalledWith('event', 'favorite_remove');

    delete window.clarity;
  });

  it('CT09 & CA10: falha no localStorage não deve lançar exceção e deve retornar sucesso falso', () => {
    // Simula erro de cota ou bloqueio em modo privado
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    const poem = { slug: 'poema-com-erro', id: 'id-err' };

    let res;
    expect(() => {
      res = toggleFavorite(poem);
    }).not.toThrow();

    expect(res.success).toBe(false);
    expect(res.isFavorite).toBe(false);
    expect(isFavorite('poema-com-erro')).toBe(false);

    setItemSpy.mockRestore();
  });

  it('removeFavorite deve remover poema diretamente por slug ou id', () => {
    toggleFavorite({ slug: 'poema-remover', id: 'id-rem' });
    expect(isFavorite('poema-remover')).toBe(true);

    const res = removeFavorite('poema-remover');
    expect(res.success).toBe(true);
    expect(res.isFavorite).toBe(false);
    expect(isFavorite('poema-remover')).toBe(false);
  });
});
