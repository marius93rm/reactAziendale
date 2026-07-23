/** Vite integra il server di sviluppo e Vitest nello stesso progetto. */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    // La dashboard usa un solo ingresso MUI. Il bundle gzip resta sotto 160 kB.
    chunkSizeWarningLimit: 550,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 15_000,
  },
});
