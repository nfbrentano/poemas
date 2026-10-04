import { describe, it, expect, vi, afterEach } from 'vitest';
import { scrollBehavior } from './motion.js';
import { backToTop } from '../components/back-to-top.js';

const mockMedia = (matches) => { window.matchMedia = vi.fn(() => ({ matches })); };

describe('scrollBehavior', () => {
  const original = window.matchMedia;
  afterEach(() => { window.matchMedia = original; });

  it('retorna auto com reduzir movimento ativo', () => {
    mockMedia(true);
    expect(scrollBehavior()).toBe('auto');
  });
  it('retorna smooth sem a preferência', () => {
    mockMedia(false);
    expect(scrollBehavior()).toBe('smooth');
  });
  it('retorna smooth sem matchMedia', () => {
    window.matchMedia = undefined;
    expect(scrollBehavior()).toBe('smooth');
  });
});

describe('back-to-top', () => {
  const original = window.matchMedia;
  afterEach(() => { window.matchMedia = original; document.body.innerHTML = ''; });

  it.each([[true, 'auto'], [false, 'smooth']])('reduzido=%s rola com behavior %s', (reduced, expected) => {
    mockMedia(reduced);
    window.scrollTo = vi.fn();
    backToTop.init();
    document.getElementById('back-to-top-btn').click();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: expected });
  });
});
