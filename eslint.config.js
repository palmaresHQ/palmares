import importPlugin from 'eslint-plugin-import-x';
import nodePlugin from 'eslint-plugin-n';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';

import globals from 'globals';

import { javascript } from './resources/eslint/javascript.js';
import { typescript } from './resources/eslint/typescript.js';
import { imports } from './resources/eslint/imports.js';
import { prettier } from './resources/eslint/prettier.js';

const TO_EXCLUDE = ['**/node_modules/**', '**/dist/**', 'docs/**', 'examples/**', 'resources/**', 'eslint.config.js'];

const TO_INCLUDE = ['**/*.ts', '**/*.test.ts'];

/** @type {import('eslint').Linter.RulesRecord} */
const config = tseslint.config({
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
      parser: tseslint.parser
    },
    globals: {
      ...globals.browser,
      ...globals.node
    }
  },
  plugins: {
    ts: tseslint.plugin,
    prettier: prettierPlugin,
    import: importPlugin,
    node: nodePlugin
  },
  rules: {
    ...prettier,
    ...javascript,
    ...typescript,
    ...imports,
    'ts/no-namespace': 'off'
  }
});

export default config;
