import SequelizeEngine from '@palmares/sequelize-engine';
import ExpressServer from '@palmares/express-adapter';
import ZodSchema from '@palmares/zod-schema';
import { ExpressCorsMiddleware } from './core/middlewares';

import { dirname, resolve } from 'path';
import { EventEmitter } from '@palmares/events';

export const ENV =
  typeof process.env.NODE_ENV === 'string'
    ? process.env.NODE_ENV
    : 'development';
export const DEBUG = false;
export const SECRET_KEY = 'example-secret';
export const APP_NAME = 'example';
export const BASE_PATH = dirname(resolve(__dirname));
export const USE_TS = true;

export const SERVER = ExpressServer;

export const MIDDLEWARES = [
  ExpressCorsMiddleware,
  import('./core/middlewares'),
];

export const EVENTS_EMITTER = import('@palmares/eventemitter2-emitter');
export const EVENTS_OPTIONS = {
  layer: {
    use: EventEmitter.new(import('@palmares/redis-emitter'), {
      emitterParams: [{ url: 'redis://localhost:6379' }],
    }),
    channels: ['all'],
  },
};

export const STD = import('@palmares/node-std');

export const INSTALLED_DOMAINS = [
  import('@palmares/std'),
  import('@palmares/server'),
  import('@palmares/databases'),
  import('@palmares/events'),
  import('./core'),
];

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
    },
  },
};

export const DATABASES_DISMISS_NO_MIGRATIONS_LOG = true;

export const SERIALIZER_SCHEMA = ZodSchema;
