import { defineConfig } from '@tanstack/start/config';
import { monacoWorkerPlugin } from './plugins/vite-worker-plugin';

export default defineConfig({
  server: {
    preset: 'vercel',
    plugins: ['./plugins/nitro-worker.plugin.ts']
  },
  vite: {
    plugins: [monacoWorkerPlugin() as any],
    worker: {
      format: 'es'
    }
  }
});
