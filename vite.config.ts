import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/youcanstudy/' : '/',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './public/index.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
