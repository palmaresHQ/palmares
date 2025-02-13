import { defineConfig } from '@tanstack/start/config';
import monacoWorkerPlugin from './plugins/vite-worker-plugin';

export default defineConfig({
  server: {
    preset: 'vercel',
    plugins: ['./plugins/nitro-worker.plugin.ts']
    // routeRules: {
    //   '/assets/**': {
    //     headers: {
    //       'Cross-Origin-Embedder-Policy': 'require-corp',
    //       'Cross-Origin-Opener-Policy': 'same-origin'
    //     }
    //   },
    //   '/_build/assets/**': {
    //     headers: {
    //       'Cross-Origin-Embedder-Policy': 'require-corp',
    //       'Cross-Origin-Opener-Policy': 'same-origin'
    //     }
    //   }
    // }
  },
  vite: {
    plugins: [monacoWorkerPlugin() as any],
    worker: {
      format: 'es'
    }
  }
});
