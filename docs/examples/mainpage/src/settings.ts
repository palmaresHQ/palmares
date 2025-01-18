// @ts-nocheck
import { ConsoleLogging } from '@palmares/console-logging';
import { CoreDomain, defineSettings } from '@palmares/core';
import { DatabasesDomain } from '@palmares/databases';
import SequelizeEngine from '@palmares/sequelize-engine';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import { loggingDomain as LoggingDomain } from '@palmares/logging';
import { NodeStd } from '@palmares/node-std';
import { SchemaDomain } from '@palmares/schemas';
import { Response, ServerDomain } from '@palmares/server';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import { dirname, resolve } from 'path';

import mainDomain from './core';

export default defineSettings({
  basePath: dirname(resolve(import.meta.dirname)),
  settingsLocation: import.meta.filename,
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
