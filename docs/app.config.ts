import { defineConfig } from '@tanstack/start/config';
import { monacoWorkerPlugin } from './vite-worker-plugin';

export default defineConfig({
  vite: {
    plugins: [monacoWorkerPlugin() as any],
    worker: {
      format: 'es'
    }
  }
});
