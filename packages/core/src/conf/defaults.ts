import { InstalledDomainsType } from './types';

const defaultInstalledDomains: InstalledDomainsType = [];

export default {
  BASE_PATH: '.',
  ADAPTER: '@palmares/express-adapter',
  ROOT_URLCONF: '',
  USE_TS: true,
  PORT: 4000,
  SECRET_KEY: 'secret',
  ENV: ![null, undefined, ''].includes(process?.env?.NODE_ENV) ? process.env.NODE_ENV : 'development',
  DEBUG: true,
  APP_NAME: 'palmares',
  INSTALLED_DOMAINS: defaultInstalledDomains,
  LOGGING: {},
};
