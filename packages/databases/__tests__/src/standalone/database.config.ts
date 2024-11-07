import { ON_DELETE, auto, bool, date, define, foreignKey, setDatabaseConfig, text } from '@palmares/databases';
import { DrizzleDatabaseAdapter } from '@palmares/drizzle-engine';
import { drizzle as drizzleBetterSqlite3 } from '@palmares/drizzle-engine/better-sqlite3';
import { NodeStd } from '@palmares/node-std';
import Database from 'better-sqlite3';

export const authenticatedUsers = define('AuthenticatedUsers', {
  fields: {
    meliUserId: auto(),
    clerkUserId: text().unique().dbIndex(),
    accessToken: text(),
    refreshToken: text(),
    createdAt: date().autoNowAdd()
  },
  options: {
    tableName: 'authenticated_users'
  }
});

export const questions = define('Questions', {
  fields: {
    id: auto(),
    answeredAt: date().autoNowAdd(),
    answerText: text(),
    isAnswered: bool().default(false),
    itemId: text(),
    meliUserId: foreignKey({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'questions',
      relationName: 'meliuser',
      toField: 'meliUserId',
      relatedTo: () => authenticatedUsers
    }),
    text: text()
  },
  options: {
    tableName: 'questions'
  }
});

const database = new Database('sqlite.db');

const newEngine = DrizzleDatabaseAdapter.new({
  output: './.drizzle/models/schema.ts',
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
      getModels: () => [authenticatedUsers, questions]
    }
  ],
  std: new NodeStd()
});
