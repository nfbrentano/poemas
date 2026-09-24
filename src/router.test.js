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

  it('CT04: redirects legacy /tag/<slug> and /?tag=<slug> to /sentimento/<slug>/', async () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');

    window.history.pushState(null, null, '/tag/saudade');
    await router();
    expect(pushStateSpy).toHaveBeenCalledWith(null, null, '/sentimento/saudade/');

    pushStateSpy.mockClear();
    window.history.pushState(null, null, '/?tag=amor');
    await router();
    expect(pushStateSpy).toHaveBeenCalledWith(null, null, '/sentimento/amor/');

    pushStateSpy.mockRestore();
  });
});


describe('initRouter Click Interception', () => {
  beforeEach(() => {
    // We only need to test the event handler, but to avoid calling the full initRouter logic repeatedly,
    // we can just import initRouter and call it once or mock navigateTo
    document.body.innerHTML = `
      <div id="main-content"></div>
      <a href="/interno" data-link id="internal-link">
        <svg id="svg-child"></svg>
      </a>
      <a href="https://external.com" data-link id="external-link">External</a>
      <a href="/blank" data-link target="_blank" id="blank-link">Blank</a>
      <p id="not-a-link">Text</p>
    `;
    // We already have a router setup from earlier, let's just trigger the global click handler directly
    // since initRouter attaches it to window.__routerClickHandler
    // First, ensure initRouter is imported
  });

  it('intercepts click on child element of [data-link]', async () => {
    const { initRouter } = await import('./router.js');
    initRouter();
    
    // We need to spy on pushState or intercept it since navigateTo calls history.pushState
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    const svgChild = document.getElementById('svg-child');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    svgChild.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(pushStateSpy).toHaveBeenCalledWith(null, null, '/interno');
    
    pushStateSpy.mockRestore();
  });

  it('does not intercept click with modifier keys', async () => {
    const { initRouter } = await import('./router.js');
    initRouter();
    
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    const link = document.getElementById('internal-link');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true });
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    link.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    
    pushStateSpy.mockRestore();
  });

  it('does not intercept external links even with [data-link]', async () => {
    const { initRouter } = await import('./router.js');
    initRouter();
    
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    const link = document.getElementById('external-link');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    link.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    
    pushStateSpy.mockRestore();
  });

  it('does not intercept clicks outside of links', async () => {
    const { initRouter } = await import('./router.js');
    initRouter();
    
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    
    const p = document.getElementById('not-a-link');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    p.dispatchEvent(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    
    pushStateSpy.mockRestore();
  });
});
