import ConsoleLogging from '@palmares/console-logging';
import PalmaresCoreDomain, { defineSettings, domain } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import ServerDomain, { Response } from '@palmares/server';
import { dirname, resolve } from 'path';

import { coreDomain } from './core';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __dirname,
  std: NodeStd,
  installedDomains: [
    // Domain Core, required for palmares to work
    [
      PalmaresCoreDomain,
      {
        appName: 'My App'
      }
    ],
    [
      LoggingDomain,
      {
        logger: ConsoleLogging
      }
    ],
    // Server Domain, required for the server
    [
      ServerDomain,
      {
        servers: {
          default: {
            server: ExpressServerAdapter as any,
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
    // We have just created this custom domain, and it defines our routes.
    coreDomain
  ]
});
