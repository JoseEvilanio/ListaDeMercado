import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: '.', // Define a raiz do projeto
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'react-app': path.resolve(__dirname, './react-app'),
    },
  },
  server: {
    port: 5174, // Usar porta 5174 já que a 5173 parece estar em uso
    open: true, // Abrir navegador automaticamente
  },
});