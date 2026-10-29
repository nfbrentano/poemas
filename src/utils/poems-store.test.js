import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

let mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn((_db, name) => ({ name })),
    query: vi.fn((col, ...constraints) => ({ col, constraints })),
    where: vi.fn((field, op, val) => ({ field, op, val })),
    getDocs: (...args) => mockGetDocs(...args)
}));

vi.mock('./firebase.js', () => ({
    db: {}
}));

import {
    getPublishedPoems,
    invalidatePoemsCache,
    setPoemsCacheEnabled
} from './poems-store.js';

describe('poems-store & correções técnicas/layout', () => {
    beforeEach(() => {
        invalidatePoemsCache();
        setPoemsCacheEnabled(true);
        mockGetDocs.mockReset();
    });

    afterEach(() => {
        invalidatePoemsCache();
        setPoemsCacheEnabled(false);
    });

    it('CT01: armazena poemas em cache em memória, deduplica chamadas concorrentes e ordena por published_at desc', async () => {
        mockGetDocs.mockImplementation(
            () =>
                new Promise((res) =>
                    setTimeout(
                        () =>
                            res({
                                docs: [
                                    {
                                        id: 'p1',
                                        data: () => ({
                                            title: 'Antigo',
                                            status: 'published',
                                            published_at: '2025-01-01T00:00:00Z'
                                        })
                                    },
                                    {
                                        id: 'p2',
                                        data: () => ({
                                            title: 'Recente',
                                            status: 'published',
                                            published_at: '2026-06-01T00:00:00Z'
                                        })
                                    }
                                ]
                            }),
                        10
                    )
                )
        );

        const [first, second] = await Promise.all([
            getPublishedPoems(),
            getPublishedPoems()
        ]);

        expect(mockGetDocs).toHaveBeenCalledTimes(1);
        expect(first.map((p) => p.id)).toEqual(['p2', 'p1']);
        expect(second.map((p) => p.id)).toEqual(['p2', 'p1']);

        // Chamada subsequente usa cache sem consultar Firestore novamente
        const third = await getPublishedPoems();
        expect(mockGetDocs).toHaveBeenCalledTimes(1);
        expect(third).toHaveLength(2);
    });

    it('CT02: invalidatePoemsCache limpa o cache e força nova leitura no Firestore', async () => {
        mockGetDocs.mockResolvedValue({
            docs: [
                {
                    id: 'p1',
                    data: () => ({
                        title: 'Poema 1',
                        status: 'published',
                        published_at: '2026-01-01T00:00:00Z'
                    })
                }
            ]
        });

        await getPublishedPoems();
        expect(mockGetDocs).toHaveBeenCalledTimes(1);

        invalidatePoemsCache();

        await getPublishedPoems();
        expect(mockGetDocs).toHaveBeenCalledTimes(2);
    });

    it('CT03: classes de fonte (.font-family-sans e .font-family-hand) usam fontes hospedadas e títulos têm text-wrap: balance', () => {
        const componentsCss = readFileSync(
            resolve(process.cwd(), 'src/styles/components.css'),
            'utf-8'
        );
        const globalCss = readFileSync(
            resolve(process.cwd(), 'src/styles/global.css'),
            'utf-8'
        );

        expect(componentsCss).toContain('font-family: var(--font-ui) !important;');
        expect(componentsCss).toContain("font-family: 'Merriweather', 'Cormorant Garamond', Georgia, serif !important;");
        expect(componentsCss).not.toContain("'Caveat'");
        expect(componentsCss).not.toContain("'Inter'");
        expect(globalCss).toContain('text-wrap: balance;');
    });

    it('CT04: sentiments.js usa classes semânticas e components.css usa var(--accent-subtle)', () => {
        const sentimentsSrc = readFileSync(
            resolve(process.cwd(), 'src/pages/sentiments.js'),
            'utf-8'
        );
        const componentsCss = readFileSync(
            resolve(process.cwd(), 'src/styles/components.css'),
            'utf-8'
        );

        expect(sentimentsSrc).toContain('class="sentiment-card"');
        expect(sentimentsSrc).toContain('class="sentiment-badge"');
        expect(sentimentsSrc).not.toContain('var(--accent)');
        expect(componentsCss).toContain('.sentiment-card:hover');
        expect(componentsCss).toContain('var(--accent-subtle)');
    });

    it('CT05: router.js salva scrollY na navegação e restaura no evento popstate', () => {
        const routerSrc = readFileSync(
            resolve(process.cwd(), 'src/router.js'),
            'utf-8'
        );

        expect(routerSrc).toContain('scrollPositions.set(currentKey, window.scrollY || 0)');
        expect(routerSrc).toContain("eventOrOptions?.type === 'popstate'");
        expect(routerSrc).toContain('window.scrollTo(0, targetScrollY)');
    });
});
