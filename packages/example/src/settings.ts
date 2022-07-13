import path from 'path';

export const ENV = ![null, undefined, ''].includes(process.env.NODE_ENV) ?
  process.env.NODE_ENV :
  'development'
export const DEBUG = ENV === 'development';
export const PORT = 4000;
export const SECRET_KEY = 'example-secret';
export const APP_NAME = 'example';

export const BASE_PATH = path.dirname(path.resolve(__dirname));
export const ROOT_URLCONF = path.join(BASE_PATH, 'src', 'routes');
export const USE_TS = true;

export const INSTALLED_DOMAINS = [
  import('@palmares/databases'),
  import('./core'),
]

export const DATABASES = {
  default: {
    engine: '@palmares/sequelize-engine',
    dialect: 'postgres',
    databaseName: 'postgres',
    username: 'postgres',
    password: '',
    host: 'localhost',
    port: 5435,
    extraOptions: {
      logging: false,
      query: {
        raw: true
      }
    }
  }
}
export const DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;
