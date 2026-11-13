import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Mock firebase firestore
vi.mock('./utils/firebase.js', () => ({
  db: { mock: 'db' }
}));

const mockAddDoc = vi.fn().mockResolvedValue({ id: 'mock-doc-id' });
const mockCollection = vi.fn().mockReturnValue('page_views_collection');

vi.mock('firebase/firestore', () => ({
  collection: (...args) => mockCollection(...args),
  addDoc: (...args) => mockAddDoc(...args),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  getDocs: vi.fn()
}));

describe('Analytics Privado, WCAG Focus e Trusted Types (SDD 2026-11-13)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('RF01, CA01 & CT01: Remoção de ipapi.co e hashing local de sessão', () => {
    it('trackPageView nunca realiza fetch para ipapi.co e grava payload anônimo no Firestore', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      
      const { trackPageView } = await import('./utils/analytics.js');
      await trackPageView('/poema/noite-estrelada', 'doc-123');

      // Verifica que fetch externo nunca foi chamado
      expect(fetchSpy).not.toHaveBeenCalled();

      // Verifica chamada a addDoc
      expect(mockAddDoc).toHaveBeenCalledTimes(1);
      const [colRef, payload] = mockAddDoc.mock.calls[0];
      expect(colRef).toBe('page_views_collection');
      expect(payload.page).toBe('/poema/noite-estrelada');
      expect(payload.poem_id).toBe('doc-123');
      expect(payload.country).toBeNull();
      expect(typeof payload.ip_hash).toBe('string');
      expect(payload.ip_hash.length).toBeGreaterThan(0);
      expect(payload.created_at).toBeDefined();
    });

    it('CSP em index.html não contém ipapi.co em connect-src', () => {
      const indexPath = path.resolve(process.cwd(), 'index.html');
      const html = fs.readFileSync(indexPath, 'utf-8');
      expect(html).not.toContain('ipapi.co');
    });
  });

  describe('RF01, CA02 & CT02: Analytics admin com país nulo exibe fallback informativo', () => {
    it('src/pages/analytics.js contém fallback para dados geográficos sem quebrar', () => {
      const analyticsPath = path.resolve(process.cwd(), 'src/pages/analytics.js');
      const code = fs.readFileSync(analyticsPath, 'utf-8');
      expect(code).toContain('Sem dados de país locais. Métricas geográficas detalhadas disponíveis no Microsoft Clarity.');
      expect(code).not.toContain('ipapi.co');
    });
  });

  describe('RF02, CA03 & CT03: WCAG AA :focus-visible em componentes e inputs', () => {
    it('components.css define :focus-visible para inputs de busca, selects e sliders', () => {
      const cssPath = path.resolve(process.cwd(), 'src/styles/components.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      expect(css).toContain('.search-sort-controls select:focus-visible');
      expect(css).toContain('#mobile-search-input:focus-visible');
      expect(css).toContain('#overlay-search-input:focus-visible');
      expect(css).toContain('.narration-slider:focus-visible');
      expect(css).toContain('.narration-volume-slider:focus-visible');
    });

    it('global.css define :focus-visible geral para input, textarea e select', () => {
      const cssPath = path.resolve(process.cwd(), 'src/styles/global.css');
      const css = fs.readFileSync(cssPath, 'utf-8');

      expect(css).toContain('input:focus-visible');
      expect(css).toContain('textarea:focus-visible');
      expect(css).toContain('select:focus-visible');
    });
  });

  describe('RF03, CA04 & CT04: Remoção de default passthrough policy de Trusted Types', () => {
    it('public/theme-init.js não registra política default irrestrita', () => {
      const themeInitPath = path.resolve(process.cwd(), 'public/theme-init.js');
      const code = fs.readFileSync(themeInitPath, 'utf-8');
      expect(code).not.toContain("createPolicy('default'");
      expect(code).not.toContain('createPolicy("default"');
    });

    it('unwrapSafeHTML utiliza policy nomeada app-safe-html quando trustedTypes existe', () => {
      const htmlPath = path.resolve(process.cwd(), 'src/utils/html.js');
      const code = fs.readFileSync(htmlPath, 'utf-8');
      expect(code).toContain('app-safe-html');
    });
  });

  describe('RF04, RF05, CA05 & CT05: ESLint estrito sem warnings e scripts atualizados', () => {
    it('package.json configura lint com --max-warnings 0', () => {
      const pkgPath = path.resolve(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.scripts.lint).toContain('--max-warnings 0');
    });

    it('eslint.config.js não possui override permissivo de no-unsanitized para admin/analytics', () => {
      const eslintPath = path.resolve(process.cwd(), 'eslint.config.js');
      const config = fs.readFileSync(eslintPath, 'utf-8');
      expect(config).not.toContain("'src/pages/admin.js'");
      expect(config).not.toContain("'src/pages/analytics.js'");
    });
  });
});
