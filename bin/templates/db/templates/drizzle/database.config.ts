// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { setDatabaseConfig } from '@palmares/databases';
import { DrizzleDatabaseAdapter } from '@palmares/drizzle-engine';
import { drizzle as drizzleBetterSqlite3 } from '@palmares/drizzle-engine/better-sqlite3';
import { NodeStd } from '@palmares/node-std';
import Database from 'better-sqlite3';

import { Company, User } from './src/models';

const database = new Database('sqlite.db');

const newEngine = DrizzleDatabaseAdapter.new({
  output: './.drizzle/schema.ts',
  type: 'better-sqlite3',
  drizzle: drizzleBetterSqlite3(database)
});

export const db = newEngine[1]().instance.instance;

export default setDatabaseConfig({
  databases: {
    default: {
      engine: newEngine
    }
  },
  locations: [
    {
      name: 'default',
      path: import.meta.dirname,
      getMigrations: () => [],
      getModels: () => [Company, User]
    }
  ],
  std: new NodeStd()
});
