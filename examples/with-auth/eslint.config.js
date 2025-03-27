import config from '../../eslint.config.js';

/** @type {import('eslint').Linter.RulesRecord} */
const configs = [{
  ...config[0],
  name: '@palmares/auth',
  files: ['src/**/*.ts',],
}];

export default configs;
