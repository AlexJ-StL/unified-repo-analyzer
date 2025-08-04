import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Enable React Fast Refresh
            fastRefresh: true,
            // Optimize JSX runtime
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
        // Enable code splitting and optimization
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Vendor chunks
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('react-router')) {
                            return 'router';
                        }
                        if (id.includes('@headlessui') || id.includes('@heroicons')) {
                            return 'ui';
                        }
                        if (id.includes('axios')) {
                            return 'http';
                        }
                        if (id.includes('zustand')) {
                            return 'state';
                        }
                        if (id.includes('d3')) {
                            return 'visualization';
                        }
                        if (id.includes('react-markdown')) {
                            return 'markdown';
                        }
                        if (id.includes('socket.io')) {
                            return 'websocket';
                        }
                        return 'vendor';
                    }
                    // App chunks
                    if (id.includes('/pages/')) {
                        return 'pages';
                    }
                    if (id.includes('/components/')) {
                        return 'components';
                    }
                    if (id.includes('/hooks/')) {
                        return 'hooks';
                    }
                    if (id.includes('/services/')) {
                        return 'services';
                    }
                    if (id.includes('/utils/')) {
                        return 'utils';
                    }
                },
            },
        },
        // Optimize chunk size
        chunkSizeWarningLimit: 500,
        // Enable minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true,
                pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.debug'] : [],
            },
            mangle: {
                safari10: true,
            },
        },
        // Enable source maps for debugging
        sourcemap: process.env.NODE_ENV === 'development',
        // Target modern browsers for better optimization
        target: 'es2020',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Optimize assets
        assetsInlineLimit: 4096,
    },
    // Optimize dependencies
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
        // Force pre-bundling of these dependencies
        force: true,
    },
    // Enable esbuild optimizations
    esbuild: {
        target: 'es2020',
        // Remove unused imports
        treeShaking: true,
        // Optimize for size
        minifyIdentifiers: process.env.NODE_ENV === 'production',
        minifySyntax: process.env.NODE_ENV === 'production',
        minifyWhitespace: process.env.NODE_ENV === 'production',
    },
    // Performance optimizations
    define: {
        // Replace process.env.NODE_ENV for better tree shaking
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
});
//# sourceMappingURL=vite.config.js.map