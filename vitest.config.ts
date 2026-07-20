import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    'process.env.URL_API': JSON.stringify('https://api.test.invalid/api/'),
    'process.env.LOGIN_URL': JSON.stringify('/#/login'),
  },
  plugins: [vue()],
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    restoreMocks: true,
  },
});
