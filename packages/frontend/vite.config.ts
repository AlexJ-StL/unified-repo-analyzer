import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Normalize env for Bun test runner that shells out to `bun build`
const NODE_ENV = (process.env.NODE_ENV || 'development').toLowerCase();
const isDev = NODE_ENV === 'development';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Use automatic JSX runtime; keep plugin options minimal for Bun build
      jsxRuntime: 'automatic',
    }),
  ],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Minimal, Bun-friendly build options to ensure bun build succeeds in tests
    minify: false,
    sourcemap: isDev,
    target: 'es2020',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      '@heroicons/react',
      'axios',
      'zustand',
      'd3',
      'react-markdown',
      'socket.io-client',
    ],
    force: true,
  },
  esbuild: {
    target: 'es2020',
    treeShaking: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
  },
});
