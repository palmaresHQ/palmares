import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tsConfigPaths from 'vite-tsconfig-paths';
import monacoWorkerPlugin from './plugins/vite-worker-plugin';

export default defineConfig({
  server: {
    port: 3000
    // headers: {
    //   'Cross-Origin-Embedder-Policy': 'require-corp',
    //   'Cross-Origin-Opener-Policy': 'same-origin'
    // }
  },
  plugins: [
    // monacoWorkerPlugin() as any,
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json']
    }),
    viteReact(),
    tanstackStart()
  ],
  worker: {
    format: 'es'
  },
  css: {
    transformer: 'postcss'
  }
});
