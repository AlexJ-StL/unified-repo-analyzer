import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    pool: 'threads',
    setupFiles: ['./tests/setup-minimal.ts'],
    include: ['packages/**/*.test.ts', 'packages/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'packages/frontend/**'],
    coverage: {
      enabled: true,
      reporter: ['text', 'json', 'html'],
      include: ['packages/**/src/**'],
      exclude: ['**/node_modules/**', '**/test/**'],
    },
  },
  projects: [
    {
      name: 'frontend',
      test: {
        environment: 'jsdom',
        include: ['packages/frontend/**/*.test.ts', 'packages/frontend/**/*.spec.ts'],
        setupFiles: ['./tests/setup-minimal.ts'],
      },
    },
  ],
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
