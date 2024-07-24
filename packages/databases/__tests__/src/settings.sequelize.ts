import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import DatabasesDomain from '@palmares/databases';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import TestsDomain from '@palmares/tests';
import { dirname, resolve } from 'path';
import SequelizeEngine from '@palmares/sequelize-engine';
import SequelizeDomain from './sequelize';

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
            engine: SequelizeEngine.new({
              dialect: 'sqlite',
              storage: './sequelize.sqlite3'
            })
          }
        }
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    SequelizeDomain,
  ],
});
