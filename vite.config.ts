import { defineConfig } from 'vite';

// base relativa: o resultado de "npm run build" (pasta dist/) funciona em qualquer subpasta.
export default defineConfig({
  base: './',
  server: { open: true },
});
