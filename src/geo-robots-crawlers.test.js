import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { pingIndexNow, getIndexNowKey } from '../scripts/ping-indexnow.js';

/**
 * RFC 9309 compliant rule parser and matcher for testing robots.txt
 */
function parseRobotsTxt(content) {
  const lines = content.split('\n').map(l => l.replace(/#.*$/, '').trim()).filter(Boolean);
  const groups = [];
  let currentGroup = null;

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const field = line.slice(0, colonIdx).trim().toLowerCase();
    const value = line.slice(colonIdx + 1).trim();

    if (field === 'user-agent') {
      if (!currentGroup || currentGroup.rules.length > 0) {
        currentGroup = { userAgents: [], rules: [] };
        groups.push(currentGroup);
      }
      currentGroup.userAgents.push(value.toLowerCase());
    } else if (field === 'allow' || field === 'disallow') {
      if (currentGroup) {
        currentGroup.rules.push({ type: field, path: value });
      }
    }
  }

  return {
    groups,
    isPathAllowed(agent, requestPath) {
      const normalizedAgent = agent.toLowerCase();
      // Match specific user-agent first, fallback to '*'
      let matchedGroup = groups.find(g => g.userAgents.includes(normalizedAgent));
      if (!matchedGroup) {
        matchedGroup = groups.find(g => g.userAgents.includes('*'));
      }
      if (!matchedGroup) return true; // RFC 9309: default is allowed if no group matches

      // Find matching rules (prefix match)
      const matchingRules = matchedGroup.rules.filter(rule => {
        if (!rule.path) return false;
        return requestPath.startsWith(rule.path);
      });

      if (matchingRules.length === 0) return true;

      // RFC 9309 Section 2.2.2: Longest match wins. Ties -> Allow wins.
      matchingRules.sort((a, b) => {
        if (b.path.length !== a.path.length) {
          return b.path.length - a.path.length;
        }
        if (a.type === 'allow') return -1;
        if (b.type === 'allow') return 1;
        return 0;
      });

      return matchingRules[0].type === 'allow';
    }
  };
}

describe('{GEO} Política explícita para crawlers de IA no robots.txt e IndexNow', () => {
  const robotsPath = path.resolve(process.cwd(), 'public/robots.txt');
  let robotsContent = '';
  let parsedRobots = null;

  beforeEach(() => {
    robotsContent = fs.readFileSync(robotsPath, 'utf-8');
    parsedRobots = parseRobotsTxt(robotsContent);
  });

  describe('RF01 & CA01: Robôs de Busca e Citação de IA', () => {
    const searchBots = [
      'OAI-SearchBot',
      'ChatGPT-User',
      'PerplexityBot',
      'Perplexity-User',
      'Claude-SearchBot',
      'Claude-User',
      'DuckAssistBot',
      'Bingbot'
    ];

    it('deve conter blocos explícitos para todos os robôs de busca e citação de IA com Allow: /', () => {
      for (const bot of searchBots) {
        expect(robotsContent).toMatch(new RegExp(`User-agent:\\s*${bot}`, 'i'));
        expect(parsedRobots.isPathAllowed(bot, '/')).toBe(true);
        expect(parsedRobots.isPathAllowed(bot, '/poema/com-voce/')).toBe(true);
      }
    });
  });

  describe('RF02 & CA02: Robôs de Treinamento de Modelos de IA', () => {
    const trainingBots = [
      'GPTBot',
      'ClaudeBot',
      'Google-Extended',
      'Applebot-Extended',
      'CCBot',
      'meta-externalagent',
      'Bytespider'
    ];

    it('deve conter blocos explícitos para os robôs de treinamento com permissão ativa (decisão do autor)', () => {
      for (const bot of trainingBots) {
        expect(robotsContent).toMatch(new RegExp(`User-agent:\\s*${bot}`, 'i'));
        expect(parsedRobots.isPathAllowed(bot, '/')).toBe(true);
        expect(parsedRobots.isPathAllowed(bot, '/sobre/')).toBe(true);
      }
    });
  });

  describe('RF03 & CA03: Bloqueio rigoroso de rotas privadas em todos os grupos', () => {
    const allAgentsToTest = [
      '*',
      'Googlebot',
      'Bingbot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'PerplexityBot',
      'Claude-SearchBot',
      'GPTBot',
      'ClaudeBot',
      'Google-Extended'
    ];

    const privatePaths = [
      '/admin',
      '/admin/',
      '/admin/dashboard',
      '/login',
      '/login/',
      '/analytics',
      '/analytics/reports',
      '/unsubscribe',
      '/unsubscribe?token=123',
      '/cancelar-inscricao'
    ];

    it('deve bloquear todas as rotas privadas para qualquer agente testado (CT02)', () => {
      for (const agent of allAgentsToTest) {
        for (const privPath of privatePaths) {
          const allowed = parsedRobots.isPathAllowed(agent, privPath);
          expect(allowed, `Agente ${agent} não deveria acessar rota privada ${privPath}`).toBe(false);
        }
      }
    });

    it('deve permitir páginas públicas para todos os robôs (CT03)', () => {
      const publicPaths = [
        '/',
        '/sobre/',
        '/colecoes/',
        '/poema/com-voce/',
        '/sentimento/amor/'
      ];

      for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'GPTBot']) {
        for (const pubPath of publicPaths) {
          const allowed = parsedRobots.isPathAllowed(agent, pubPath);
          expect(allowed, `Agente ${agent} deveria acessar rota pública ${pubPath}`).toBe(true);
        }
      }
    });
  });

  describe('RF04: Sitemap e referência ao llms.txt', () => {
    it('deve conter a linha do sitemap apontando para a URL canônica', () => {
      expect(robotsContent).toContain('Sitemap: https://nfgbrentano.art.br/sitemap.xml');
    });

    it('deve conter comentários com referência para /llms.txt', () => {
      expect(robotsContent).toMatch(/#.*https:\/\/nfgbrentano\.art\.br\/llms\.txt/);
      expect(robotsContent).toMatch(/#.*https:\/\/nfgbrentano\.art\.br\/llms-full\.txt/);
    });
  });

  describe('RNF01: Conformidade com a RFC 9309', () => {
    it('todas as diretivas devem ser válidas segundo a RFC 9309', () => {
      const validDirectives = ['user-agent', 'allow', 'disallow', 'sitemap'];
      const rawLines = robotsContent.split('\n');

      for (const line of rawLines) {
        const cleaned = line.replace(/#.*$/, '').trim();
        if (!cleaned) continue;
        const colonIdx = cleaned.indexOf(':');
        expect(colonIdx, `Linha mal formatada sem dois-pontos: ${line}`).toBeGreaterThan(0);
        const field = cleaned.slice(0, colonIdx).trim().toLowerCase();
        expect(validDirectives).toContain(field);
      }
    });
  });

  describe('RF05, CA04 & CT05: IndexNow e Integração no Deploy', () => {
    it('deve existir um arquivo de chave IndexNow em public/ com conteúdo correspondente ao nome', () => {
      const publicDir = path.resolve(process.cwd(), 'public');
      const files = fs.readdirSync(publicDir);
      const keyFile = files.find(f => /^[a-f0-9]{16,64}\.txt$/i.test(f));

      expect(keyFile, 'Arquivo <chave>.txt do IndexNow deve existir em public/').toBeDefined();
      const expectedKey = keyFile.replace(/\.txt$/, '');
      const content = fs.readFileSync(path.join(publicDir, keyFile), 'utf-8').trim();
      expect(content).toBe(expectedKey);
    });

    it('getIndexNowKey deve identificar a chave correta automaticamente', () => {
      const detectedKey = getIndexNowKey();
      expect(detectedKey).toBeTruthy();
      expect(detectedKey).toMatch(/^[a-f0-9]{16,64}$/i);
    });

    it('pingIndexNow deve simular envio com sucesso (status 200/202)', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => 'OK'
      });

      try {
        const res = await pingIndexNow({
          key: 'testkey1234567890abcdef',
          host: 'nfgbrentano.art.br',
          urlList: ['https://nfgbrentano.art.br/poema/teste/']
        });

        expect(res.success).toBe(true);
        expect(res.status).toBe(200);
        expect(global.fetch).toHaveBeenCalledWith(
          'https://api.indexnow.org/indexnow',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"key":"testkey1234567890abcdef"')
          })
        );
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('pingIndexNow deve lidar graciosamente com lista vazia de URLs ou sem chave', async () => {
      const resEmpty = await pingIndexNow({ key: 'teste', urlList: [] });
      expect(resEmpty.skipped).toBe(true);
      expect(resEmpty.reason).toBe('EMPTY_URLS');

      const resNoKey = await pingIndexNow({ key: null, urlList: ['https://nfgbrentano.art.br/'] });
      expect(resNoKey.skipped).toBe(true);
      expect(resNoKey.reason).toBe('NO_KEY');
    });

    it('o workflow de deploy (.github/workflows/deploy.yml) deve conter o step Ping IndexNow', () => {
      const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
      expect(fs.existsSync(workflowPath)).toBe(true);
      const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
      expect(workflowContent).toContain('name: Ping IndexNow');
      expect(workflowContent).toContain('node scripts/ping-indexnow.js --ping');
    });
  });
});
