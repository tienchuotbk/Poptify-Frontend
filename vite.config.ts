import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite + Vitest config. Source maps OFF in production (security: tránh lộ source/logic).
// Dev proxy `/api` → VITE_API_BASE_URL để gọi BE local khi không dùng MSW.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    build: {
      sourcemap: !isProd,
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/shared/test/setup.ts',
      // Inject env cho test (import.meta.env) → runtime env.ts không fail khi import gián tiếp.
      env: {
        VITE_SHOPIFY_API_KEY: 'test-api-key',
        VITE_API_BASE_URL: 'http://localhost:3000',
      },
    },
  };
});
