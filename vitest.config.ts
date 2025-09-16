import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environmentMatchGlobs: [
      ['packages/frontend/**', 'jsdom'],
      ['packages/**', 'node'],
    ],
    pool: 'threads',
    setupFiles: ['./tests/setup-minimal.ts'],
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**'],
      exclude: ['**/node_modules/**', '**/test/**'],
    },
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'packages/shared/src'),
    },
  },
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
    },
  },
});
