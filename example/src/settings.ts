import SequelizeEngine from '@palmares/sequelize-engine';
import ExpressServer from '@palmares/express-adapter';
import ZodSchema from '@palmares/zod-schema';
import { ExpressCorsMiddleware } from './core/middlewares';

import { dirname, resolve } from 'path';

export const ENV = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV :
  'development';
export const DEBUG = false;
export const SECRET_KEY = 'example-secret';
export const APP_NAME = 'example';
export const BASE_PATH = dirname(resolve(__dirname));
export const USE_TS = true;

export const SERVER = ExpressServer;
export const ROOT_ROUTER = import('./core/routes');

export const MIDDLEWARES = [
  ExpressCorsMiddleware,
  import('./core/middlewares')
]

export const INSTALLED_DOMAINS = [
  import('@palmares/server'),
  import('@palmares/databases'),
  import('./core'),
]

export const DATABASES = {
  default: {
    engine: SequelizeEngine,
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
  },
};

export const DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;

export const SERIALIZER_SCHEMA = ZodSchema;
