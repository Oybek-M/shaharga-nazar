import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        upload: resolve(__dirname, 'upload.html'),
        cameras: resolve(__dirname, 'cameras.html'),
        issues: resolve(__dirname, 'issues.html'),
      },
    },
  },
});
