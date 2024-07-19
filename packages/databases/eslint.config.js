import config from '../../eslint.config.js';

/** @type {import('eslint').Linter.RulesRecord} */
const configs = [{
  ...config[0],
  name: 'palmares/databases',
  files: [
    'src/**/*.ts',
  ],
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
  ],
  languageOptions: {
    parserOptions: {
      ...config[0].languageOptions.parserOptions,
      ecmaVersion: 2020,
      project: ["tsconfig.json"],
    },
  },
}];

console.log(configs);
export default configs;
