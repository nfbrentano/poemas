import { describe, it, expect, beforeEach, vi } from 'vitest';
import { router, navigateTo, routes } from './router.js';

describe('Router', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="main-content"></div>
      <div id="route-announcer"></div>
      <input id="overlay-search-input" />
    `;
    window.scrollTo = vi.fn();
  });

  it('matches route with and without trailing slash', async () => {
    const mockComponent = {
      render: vi.fn().mockResolvedValue(undefined),
      meta: { title: 'Poema' }
    };
    routes['/poema/:slug'] = vi.fn().mockResolvedValue(mockComponent);

    // Test with trailing slash: /poema/o-amor-ainda-e-tudo/
    window.history.pushState(null, null, '/poema/o-amor-ainda-e-tudo/');
    await router();

    expect(mockComponent.render).toHaveBeenCalledWith(
      document.getElementById('main-content'),
      expect.objectContaining({ slug: 'o-amor-ainda-e-tudo' })
    );

    // Test without trailing slash: /poema/o-amor-ainda-e-tudo
    mockComponent.render.mockClear();
    window.history.pushState(null, null, '/poema/o-amor-ainda-e-tudo');
    await router();

    expect(mockComponent.render).toHaveBeenCalledWith(
      document.getElementById('main-content'),
      expect.objectContaining({ slug: 'o-amor-ainda-e-tudo' })
    );
  });

  it('matches static routes with trailing slash', async () => {
    const mockAboutComponent = {
      render: vi.fn().mockResolvedValue(undefined),
      meta: { title: 'Sobre' }
    };
    routes['/sobre'] = vi.fn().mockResolvedValue(mockAboutComponent);

    window.history.pushState(null, null, '/sobre/');
    await router();

    expect(mockAboutComponent.render).toHaveBeenCalled();
  });
});
