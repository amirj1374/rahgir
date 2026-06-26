/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },

  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },

  build: {
    target: 'esnext',
    minify: 'oxc',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/axios')) return 'vendor-axios';
          if (id.includes('node_modules/@tanstack')) return 'vendor-query';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
          if (id.includes('/modules/BasedataModule') || id.includes('/modules/basedata/')) return 'mod-basedata';
          if (id.includes('/modules/SalesModule'))      return 'mod-sales';
          if (id.includes('/modules/InventoryModule'))  return 'mod-inventory';
          if (id.includes('/modules/CRMModule'))        return 'mod-crm';
          if (id.includes('/modules/AccountingModule')) return 'mod-accounting';
          if (id.includes('/modules/ReportsModule'))    return 'mod-reports';
          if (id.includes('/modules/SuppliersModule'))  return 'mod-suppliers';
          if (id.includes('/components/') || id.includes('/styles/') || id.includes('/hooks/')) return 'ui';
        },
      },
    },
    // Warn at 400KB (default is 500)
    chunkSizeWarningLimit: 400,
  },
});
