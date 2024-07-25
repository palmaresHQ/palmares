import ConsoleLogging from '@palmares/console-logging';
import PalmaresCoreDomain, { defineSettings } from '@palmares/core';
import DatabasesDomain from '@palmares/databases';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import SequelizeEngine from '@palmares/sequelize-engine';
import ServerDomain, { Response } from '@palmares/server';
import { dirname, resolve } from 'path';

import CoreDomain from './core';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __dirname,
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
      PalmaresCoreDomain,
      {
        appName: 'My App'
      }
    ],
    // Server Domain, required for the server
    [
      ServerDomain,
      {
        servers: {
          default: {
            server: ExpressServerAdapter,
            debug: true,
            port: 3001,
            validation: {
              handler: () => {
                return Response.json({ message: 'query params invalid' });
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
      DatabasesDomain,
      {
        databases: {
          default: {
            engine: SequelizeEngine.new({
              dialect: 'sqlite',
              storage: './database.sqlite3'
            })
          }
        }
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    CoreDomain
  ]
});
