// Reference: https://claude.ai/chat/f25964d1-f9b5-4e2b-bfe6-52b15dae5e3b
import type { Plugin } from 'vite';
import { isChromium } from './utils/is-chromium';

export function monacoWorkerPlugin(): Plugin {
  return {
    name: 'monaco-worker-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const isChromiumBrowser = isChromium(req.headers as any);
        if (req.url?.includes('.worker.js')) {
          if (isChromiumBrowser) {
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          } else {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
            res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
          }
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const isChromiumBrowser = isChromium(req.headers as any);
        if (req.url?.includes('.worker.js')) {
          if (isChromiumBrowser) {
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          } else {
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
            res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
          }
        }
        next();
      });
    }
  };
}
