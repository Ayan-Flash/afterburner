import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, '../../packages/common/src'),
      '@monitoring': path.resolve(__dirname, '../../packages/monitoring/src'),
      '@plugins': path.resolve(__dirname, '../../packages/plugins/src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 1420,
    strictPort: true,
  },
});
