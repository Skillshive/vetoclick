import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: true,
        }),
        react({
            jsxRuntime: 'automatic',
        }),
        svgr(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': resolve(__dirname, 'resources/js'),
            '@/components': resolve(__dirname, 'resources/js/components'),
            '@/layouts': resolve(__dirname, 'resources/js/layouts'),
            '@/pages': resolve(__dirname, 'resources/js/pages'),
            '@/contexts': resolve(__dirname, 'resources/js/contexts'),
            '@/hooks': resolve(__dirname, 'resources/js/hooks'),
            '@/styles': resolve(__dirname, 'resources/js/styles'),
            '@/configs': resolve(__dirname, 'resources/js/configs'),
            '@/constants': resolve(__dirname, 'resources/js/constants'),
            '@/css': resolve(__dirname, 'resources/js/css'),
        },
    },
    build: {
        sourcemap: 'inline',
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    inertia: ['@inertiajs/react'],
                },
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', '@inertiajs/react'],
        exclude: [],
    },
    server: {
        hmr: true,
        watch: {
            usePolling: false,
            ignored: ['**/node_modules/**', '**/vendor/**', '**/public/**', '**/storage/**', '**/bootstrap/cache/**'],
        },
    },
});
