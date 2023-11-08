import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import StdDomain from '@palmares/std';
import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';
import ServerDomain, { Response } from '@palmares/server';
import { dirname, resolve } from 'path';

import core from './core';
import cache from './cache';

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
      CoreDomain,
      {
        appName: 'example',
      },
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
    core,
    cache
  ],
});
