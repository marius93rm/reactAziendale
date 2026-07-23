import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 550 },
  test: {
    environment: 'jsdom',
    globals: true,
    fileParallelism: false,
    setupFiles: './src/test/setup.ts',
    css: true,
    testTimeout: 15_000,
  },
});
