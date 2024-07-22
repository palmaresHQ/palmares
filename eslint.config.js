import path from 'path';
import { fileURLToPath } from 'url';

import importPlugin from 'eslint-plugin-import-x';
import nodePlugin from 'eslint-plugin-n'
import tseslint from 'typescript-eslint'
import globals from 'globals'

import { javascript } from './resources/eslint/javascript.js';
import { typescript } from './resources/eslint/typescript.js';
import { imports } from './resources/eslint/imports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TO_EXCLUDE = [
  '**/node_modules/**',
  '**/dist/**',
  'docs/**',
  'resources/**',
  'eslint.config.js',
];

const TO_INCLUDE = [
  '**/*.ts',
];
/** @type {import('eslint').Linter.RulesRecord} */
const config = tseslint.config(
  {
    name: 'palmares/main',
    files: TO_INCLUDE,
    ignores: TO_EXCLUDE,
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      // @ts-expect-error
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        parser: tseslint.parser,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      ts: tseslint.plugin,
      import: importPlugin,
      node: nodePlugin,
    },
    rules: {
      ...javascript,
      ...typescript,
      ...imports
    }
  },
);

export default config;
