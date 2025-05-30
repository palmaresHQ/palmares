// @ts-nocheck
import { ConsoleLogging } from '@palmares/console-logging';
import { CoreDomain, defineSettings } from '@palmares/core';
import { DatabasesDomain } from '@palmares/databases';
import DrizzleEngine from '@palmares/drizzle-engine';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import { loggingDomain as LoggingDomain } from '@palmares/logging';
import { NodeStd } from '@palmares/node-std';
import { SchemaDomain } from '@palmares/schemas';
import { Response, ServerDomain } from '@palmares/server';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import TestsDomain from '@palmares/tests';
import JestTestAdapter from '@palmares/jest-tests';

import Database from 'better-sqlite3';
import { drizzle as drizzleBetterSqlite3 } from 'drizzle-orm/better-sqlite3';
import { fileURLToPath, pathToFileURL } from 'url';
import { join, dirname, resolve } from 'path';

import favoriteToolsDomain from './favoritetools-domain';

import * as schema from './.drizzle.schema';

declare global {
  namespace Palmares {
    interface PDatabaseAdapter extends InstanceType<typeof DrizzleEngine> {}
    interface PSchemaAdapter extends InstanceType<typeof ZodSchemaAdapter> {}
    interface PServerAdapter extends InstanceType<typeof ExpressServerAdapter> {}
    interface PTestAdapter extends JestTestAdapter {}
  }
}

const database = new Database('sqlite.db');
export const db = drizzleBetterSqlite3(database, { schema });

const engine = DrizzleEngine.new({
  output: './.drizzle.schema.ts',
  type: 'better-sqlite3',
  drizzle: db
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
  std: NodeStd,
  installedDomains: [
    favoriteToolsDomain,
    [
      LoggingDomain,
      {
        logger: ConsoleLogging
      }
    ],
    [
      CoreDomain,
      {
        appName: 'server'
      }
    ],
    // Domain Core, required for palmares to work
    [
      ServerDomain,
      {
        servers: {
          default: {
            server: ExpressServerAdapter,
            debug: true,
            port: 3000,
            validation: {
              handler: () => {
                return Response.json({
                  message: 'query params or url params invalid'
                });
              }
            },
            handler404: () =>
              Response.json({
                status: 404,
                body: {
                  message: 'Not found'
                }
              }),
            handler500: async (response: any) => {
              return response;
            }
          }
        }
      }
    ],
    [
      SchemaDomain,
      {
        schemaAdapter: ZodSchemaAdapter
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
                  tsconfig: join(dirname(resolve(__dirname)), 'tsconfig.json'),
                  useESM: true,
                  diagnostics: {
                    ignoreCodes: [1343]
                  },
                  astTransformers: {
                    before: [
                      {
                        path: '../../node_modules/ts-jest-mock-import-meta',
                        options: {
                          metaObjectReplacement: {
                            filename: __filename,
                            dirname: __dirname,
                            url: pathToFileURL(__filename)
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
            engine
          }
        }
      }
    ]
  ]
});
