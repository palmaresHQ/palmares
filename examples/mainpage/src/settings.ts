import { ConsoleLogging } from '@palmares/console-logging';
import { CoreDomain, defineSettings } from '@palmares/core';
import { DatabasesDomain } from '@palmares/databases';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import JestTestAdapter from '@palmares/jest-tests';
import { loggingDomain as LoggingDomain } from '@palmares/logging';
import { NodeStd } from '@palmares/node-std';
import { SchemaDomain } from '@palmares/schemas';
import SequelizeEngine from '@palmares/sequelize-engine';
import { Response, ServerDomain } from '@palmares/server';
import TestsDomain from '@palmares/tests';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import mainDomain from './core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
  std: NodeStd,
  installedDomains: [
    mainDomain,
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
                        path: 'node_modules/ts-jest-mock-import-meta',
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
            engine: SequelizeEngine.new({
              dialect: 'sqlite',
              storage: './sequelize.sqlite3'
            })
          }
        }
      }
    ]
  ]
});
