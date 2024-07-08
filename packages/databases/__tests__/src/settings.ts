import CoreDomain, { defineSettings } from '@palmares/core';
import TestsDomain from '@palmares/tests';
import JestTestAdapter from '@palmares/jest-tests';
import DrizzleEngine from '@palmares/drizzle-engine';

import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';
import DatabasesDomain from '@palmares/databases';

import TestDomain from './test';
import { dirname, resolve } from 'path';
import Database from 'better-sqlite3';

const database = new Database('sqlite.db');

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
  std: NodeStd,
  installedDomains: [
    [
      LoggingDomain,
      {
        logger: ConsoleLogging,
      },
    ],
    // Domain Core, required for palmares to work
    [
      CoreDomain,
      {
        appName: 'example',
      },
    ],
    [
      TestsDomain,
      {
        testAdapter: JestTestAdapter,
      }
    ],
    [
      DatabasesDomain,
      {
        databases: {
          default: {
            engine: DrizzleEngine.new({
              type: 'better-sqlite3',
              options: [database]
            })
          }
        }
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    TestDomain,
  ],
});
