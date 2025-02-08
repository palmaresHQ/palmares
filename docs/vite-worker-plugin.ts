// Reference: https://claude.ai/chat/f25964d1-f9b5-4e2b-bfe6-52b15dae5e3b
import type { Plugin } from 'vite';

export function monacoWorkerPlugin(): Plugin {
  return {
    name: 'monaco-worker-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('.worker.js')) {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('.worker.js')) {
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        }
        next();
      });
    }
  };
}
