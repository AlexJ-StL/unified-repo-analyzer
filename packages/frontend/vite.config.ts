import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@unified-repo-analyzer/shared': '@unified-repo-analyzer/shared/dist/browser.js',
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,  // Enable WebSocket proxying
      },
    },
  },
  build: {
    // Optimized build options for faster builds
    minify: isDev ? false : 'esbuild',
    sourcemap: isDev,
    target: 'es2020',
    cssCodeSplit: false, // Faster builds
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: undefined, // Disable manual chunking for faster builds
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to avoid warnings
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
