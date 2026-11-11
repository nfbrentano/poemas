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
    setPoemsCacheEnabled,
    savePersistentPoems,
    getPersistentPoems,
    clearPersistentPoems,
    getPoemBySlug
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

    it('CT09 & CA09: savePersistentPoems armazena APENAS status published, ignorando drafts e agendados', async () => {
        await clearPersistentPoems();
        const mixedPoems = [
            { id: '1', title: 'Publicado 1', status: 'published', slug: 'pub-1' },
            { id: '2', title: 'Rascunho Secreto', status: 'draft', slug: 'draft-1' },
            { id: '3', title: 'Agendado Futuro', status: 'scheduled', slug: 'sched-1' },
            { id: '4', title: 'Publicado 2', status: 'published', slug: 'pub-2' }
        ];

        const saved = await savePersistentPoems(mixedPoems);
        expect(saved).toBe(true);

        const loaded = await getPersistentPoems();
        expect(loaded).toHaveLength(2);
        expect(loaded.map(p => p.id)).toEqual(['1', '4']);
        expect(loaded.every(p => p.status === 'published')).toBe(true);
        expect(loaded.some(p => p.status === 'draft')).toBe(false);
        expect(loaded.some(p => p.status === 'scheduled')).toBe(false);
    });

    it('CT01 & CA01: getPublishedPoems recorre ao acervo persistente quando o Firestore falha ou está offline', async () => {
        await clearPersistentPoems();
        await savePersistentPoems([
            { id: 'local-1', title: 'Poema Offline', status: 'published', slug: 'poema-offline', published_at: '2026-05-01T00:00:00Z' }
        ]);

        // Simula falha total do Firestore (ex: offline, sem conexão)
        mockGetDocs.mockRejectedValue(new Error('Network error: failed to fetch (offline)'));

        invalidatePoemsCache();
        const result = await getPublishedPoems();
        expect(result).toHaveLength(1);
        expect(result[0].slug).toBe('poema-offline');

        // getPoemBySlug também localiza no acervo offline
        const found = await getPoemBySlug('poema-offline');
        expect(found).not.toBeNull();
        expect(found.title).toBe('Poema Offline');
    });

    it('CT05 & CA05: quando a conexão responde, o storage local é atualizado e poemas despublicados deixam de existir', async () => {
        await clearPersistentPoems();
        await savePersistentPoems([
            { id: 'removido', title: 'Poema Antigo Despublicado', status: 'published', slug: 'removido' }
        ]);

        // Nova resposta do Firestore sem o poema despublicado
        mockGetDocs.mockResolvedValue({
            docs: [
                {
                    id: 'novo-1',
                    data: () => ({
                        title: 'Poema Atual',
                        status: 'published',
                        published_at: '2026-06-01T00:00:00Z',
                        slug: 'poema-atual'
                    })
                }
            ]
        });

        invalidatePoemsCache();
        const fresh = await getPublishedPoems({ forceRefresh: true });
        expect(fresh).toHaveLength(1);
        expect(fresh[0].id).toBe('novo-1');

        // Persiste explicitamente a nova lista
        await savePersistentPoems(fresh);
        const persistent = await getPersistentPoems();
        expect(persistent).toHaveLength(1);
        expect(persistent[0].id).toBe('novo-1');
        expect(persistent.some(p => p.id === 'removido')).toBe(false);
    });

    it('CT10 & CA10: falha no storage local não impede o funcionamento da consulta online', async () => {
        // Simula localStorage quebrado / quota excedida
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = vi.fn(() => {
            throw new Error('QuotaExceededError: storage is full');
        });

        mockGetDocs.mockResolvedValue({
            docs: [
                {
                    id: 'safe-1',
                    data: () => ({
                        title: 'Poema Seguro',
                        status: 'published',
                        published_at: '2026-07-01T00:00:00Z',
                        slug: 'poema-seguro'
                    })
                }
            ]
        });

        invalidatePoemsCache();
        // Não deve estourar erro para o chamador
        const result = await getPublishedPoems();
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('Poema Seguro');

        // Restaura
        localStorage.setItem = originalSetItem;
    });
});
