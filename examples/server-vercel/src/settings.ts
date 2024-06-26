import CoreDomain, { defineSettings } from '@palmares/core';
import { VercelServerlessAdapter } from '@palmares/vercel-adapter';
import StdDomain from '@palmares/std';
import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';
import ServerDomain, { Response } from '@palmares/server';

import TestDomain from './test';

import { dirname, resolve } from 'path';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __filename,
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
            server: VercelServerlessAdapter,
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
    TestDomain,
  ],
});
