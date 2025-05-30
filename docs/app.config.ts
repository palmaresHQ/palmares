import { defineConfig } from '@tanstack/react-start/config';
import monacoWorkerPlugin from './plugins/vite-worker-plugin';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

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
    plugins: [
      monacoWorkerPlugin() as any,
      tailwindcss(),
      tsConfigPaths({
        projects: ['./tsconfig.json']
      })
    ],
    worker: {
      format: 'es'
    }
  }
});
