import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';
import ServerDomain, { Response } from '@palmares/server';

import { dirname, resolve } from 'path';
import RequestsDomain from './requests';
import RoutersDomain from './routers';
import MiddlewaresDomain from './middlewares';
import ResponsesDomain from './responses';

declare global {
  namespace Palmares {
    interface PServerAdapter extends InstanceType<typeof ExpressServerAdapter> {}
  }
}

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
    // Server Domain, required for the server
    [
      ServerDomain,
      {
        servers: {
          default: {
            server: ExpressServerAdapter,
            port: 4000,
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
            handler500: async (response) => {
              return response;
            }
          }
        }
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    RequestsDomain,
    RoutersDomain,
    MiddlewaresDomain,
    ResponsesDomain
  ]
});
