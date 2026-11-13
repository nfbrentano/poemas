import globals from 'globals';
import pluginNoUnsanitized from 'eslint-plugin-no-unsanitized';

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'scripts/dev/**',
      'public/**',
      'coverage/**',
      '*.local'
    ]
  },
  // Regras para src/ (código do frontend e testes em ESM)
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    plugins: {
      'no-unsanitized': pluginNoUnsanitized
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': [
        'error',
        {
          variableTracing: true,
          escape: {
            methods: [
              'escapeHtml',
              'stripHtml',
              'sanitizeUrl',
              'unwrapSafeHTML',
              'normalizeForSearch'
            ]
          }
        }
      ]
    }
  },
  // Override para arquivos de teste (Vitest)
  {
    files: ['src/**/*.test.js'],
    rules: {
      'no-unsanitized/property': 'off',
      'no-unsanitized/method': 'off'
    }
  },
  // Regras para scripts/ (Node.js em ESM)
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      'no-unsanitized': pluginNoUnsanitized
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-unsanitized/method': 'error',
      'no-unsanitized/property': [
        'error',
        {
          escape: {
            methods: [
              'escapeHtml',
              'stripHtml',
              'sanitizeUrl'
            ]
          }
        }
      ]
    }
  },
  // Regras para functions/ (Firebase Cloud Functions em CommonJS)
  {
    files: ['functions/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'all', caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'error'
    }
  }
];
