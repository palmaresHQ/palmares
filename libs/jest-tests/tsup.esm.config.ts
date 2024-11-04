import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src'],
  format: 'esm',
  target: 'esnext',
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
  }
});
