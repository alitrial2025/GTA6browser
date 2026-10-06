import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.VICE_BASE_PATH || '/',
  build: { rollupOptions: { output: { manualChunks: {
    'three': ['three'],
    'physics': ['cannon-es'],
  } } } },
});
