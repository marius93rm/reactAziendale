/**
 * Vite avvia l'applicazione e integra Vitest nello stesso ambiente TypeScript.
 * jsdom fornisce ai test un DOM senza richiedere un browser reale.
 */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
