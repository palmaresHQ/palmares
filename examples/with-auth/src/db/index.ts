import DrizzleDatabaseAdapter from '@palmares/drizzle-engine';
import { drizzle as drizzleBetterPostgres } from '@palmares/drizzle-engine/node-postgres';

import * as databaseSchema from './schemas';
import { env } from '../env';

export const db = drizzleBetterPostgres(env.DATABASE_URL, {
  schema: databaseSchema,
  logger: env.APP_ENV !== 'prod'
});

export const databaseEngine = DrizzleDatabaseAdapter.new({
  output: './drizzle',
  type: 'postgres',
  drizzle: db
});
