import config from '../../../eslint.config.js';

/** @type {import('eslint').Linter.RulesRecord} */
const configs = [{
  ...config[0],
  name: '@palmares/databases/tests',
  files: ['src/**/*.ts', 'src/**/*.postgres.ts', 'manage.ts', 'drizzle.config.ts', '.drizzle/schema.ts'],
}];

export default configs;
