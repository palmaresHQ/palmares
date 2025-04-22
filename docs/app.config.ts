import { defineConfig } from '@tanstack/react-start/config';
import monacoWorkerPlugin from './plugins/vite-worker-plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  tsr: {
    appDirectory: 'src'
  },
  server: {
    preset: 'vercel',
    plugins: ['./plugins/nitro-worker.plugin.ts'],
    esbuild: {
      options: {
        treeShaking: true,
        target: 'esnext'
      }
    },
    routeRules: {
      '/assets/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin'
        }
      },
      '/_build/assets/**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin'
        }
      }
    }
  },
  vite: {
    plugins: [monacoWorkerPlugin() as any, react()],
    worker: {
      format: 'es'
    }
  }
});
