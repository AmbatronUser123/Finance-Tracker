import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(() => {
    return {
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['pwa-192x192.png', 'pwa-512x512.png', 'manifest.json', 'sw.js'],
          manifest: {
            name: 'Finance Tracker',
            short_name: 'Finance',
            description: 'Track your finances on the go',
            theme_color: '#ffffff',
            display: 'standalone',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: 'pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          devOptions: {
            enabled: false
          }
        })
      ],
      resolve: {
        alias: {
          '@': path.resolve(rootDir, '.'),
        }
      },
      css: {
        postcss: './postcss.config.cjs',
      },
      server: {
        hmr: {
          overlay: false
        }
      },
      build: {
        target: 'esnext',
        outDir: path.resolve(rootDir, 'dist'),
        emptyOutDir: true,
        sourcemap: true,
      }
    };
});
