import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  base: '/fontdoom/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'FontDoom',
        short_name: 'FontDoom',
        description: 'An endless open-source font doom scroller',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon.svg', sizes: '192x192 512x512', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } }
});
