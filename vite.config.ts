// FIX: Imported defineConfig from 'vitest/config' to include test configuration types and fix type resolution.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // By setting manifest to false, we instruct the plugin to not generate a manifest.
      // This allows our custom `public/manifest.webmanifest` to be used without conflicts.
      manifest: false,
      workbox: {
        // Ensure PNGs are included for PWA offline caching.
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
