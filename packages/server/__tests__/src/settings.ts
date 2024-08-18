import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import DatabasesDomain from '@palmares/databases';
import DrizzleEngine from '@palmares/drizzle-engine';
import { drizzle as drizzleBetterSqlite3 } from '@palmares/drizzle-engine/better-sqlite3';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import SchemasDomain from '@palmares/schemas';
import TestsDomain from '@palmares/tests';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import Database from 'better-sqlite3';
import { dirname, resolve } from 'path';

import CustomCoreDomain from './core';
//import * as schema from '../.drizzle/schema';

const database = new Database('sqlite.db');

const args = DrizzleEngine.new({
  output: './.drizzle/schema.ts',
  type: 'better-sqlite3',
  drizzle: drizzleBetterSqlite3(database)
});
export const db = args[1].instance.instance;

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
  std: NodeStd,
  installedDomains: [
    [
      LoggingDomain,
      {
        logger: ConsoleLogging
      }
    ],
    // Domain Core, required for palmares to work
    [
      CoreDomain,
      {
        appName: 'example'
      }
    ],
    [
      TestsDomain,
      {
        testAdapter: JestTestAdapter
      }
    ],
    [
      SchemasDomain,
      {
        schemaAdapter: ZodSchemaAdapter
      }
    ],
    [
      DatabasesDomain,
      {
        databases: {
          default: {
            engine: args
          }
        }
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    CustomCoreDomain
  ]
});
