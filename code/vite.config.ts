import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: './',
    build: {
      outDir: '../build',
      emptyOutDir: true,
    },
    plugins: [vue(), vueJsx(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server:
      mode === 'development'
        ? {
            proxy: {
              '/api': {
                target: 'https://localhost:8080',
                changeOrigin: true,
                secure: false, //ssl
                rewrite: (path) => path.replace(/^\/api/, 'https://127.0.0.1:8080/api'),
              },
            },
          }
        : {},
  };
});
