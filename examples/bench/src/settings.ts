import PalmaresCoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import StdDomain from '@palmares/std';
import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';
import ServerDomain, { Response } from '@palmares/server';

import CoreDomain from './core';
import { dirname, resolve } from 'path';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  installedDomains: [
    [
      LoggingDomain,
      {
        logger: ConsoleLogging,
      },
    ],
    [
      StdDomain,
      {
        STD: NodeStd,
      },
    ],
    // Domain Core, required for palmares to work
    [
      PalmaresCoreDomain,
      {
        appName: 'bench',
        useTs: true,
      },
    ],
    // Server Domain, required for the server
    [
      ServerDomain,
      {
        servers: {
          default: {
            server: ExpressServerAdapter,
            port: 3000,
            validation: {
              handler: () => {
                return Response.json({ message: 'query params invalid' });
              },
            },
            handler404: () =>
              Response.json({
                status: 404,
                body: {
                  message: 'Not found',
                },
              }),
            handler500: async (response) => {
              return response;
            },
          },
        },
      },
    ],
    // We have just created this custom domain, and it defines our routes.
    CoreDomain,
  ],
});
