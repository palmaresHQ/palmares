import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import DatabasesDomain from '@palmares/databases';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import SequelizeEngine from '@palmares/sequelize-engine';
import TestsDomain from '@palmares/tests';
import { dirname, join, resolve } from 'path';

import SequelizeDomain from './sequelize';

export default defineSettings({
  basePath: dirname(resolve(import.meta.dirname)),
  settingsLocation: import.meta.filename,
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
        testAdapter: JestTestAdapter.new({
          config: {
            extensionsToTreatAsEsm: ['.ts'],
            transform: {
              // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
              // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
              '^.+\\.ts?$': [
                'ts-jest',
                {
                  tsconfig: join(dirname(resolve(import.meta.dirname)), 'tsconfig.json'),
                  useESM: true,
                  diagnostics: {
                    ignoreCodes: [1343]
                  },
                  astTransformers: {
                    before: [
                      {
                        path: 'node_modules/ts-jest-mock-import-meta',
                        options: {
                          metaObjectReplacement: {
                            filename: import.meta.filename,
                            dirname: import.meta.dirname
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        })
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
    SequelizeDomain
  ]
});
