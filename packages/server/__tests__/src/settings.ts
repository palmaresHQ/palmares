import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import TestsDomain from '@palmares/tests';
import ServerDomain, {Response } from '@palmares/server';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import { dirname, resolve } from 'path';

import CustomCoreDomain from './core';
//import * as schema from '../.drizzle/schema';

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
    [
      TestsDomain,
      {
        testAdapter: JestTestAdapter
      }
    ],
    [ServerDomain, {
      servers: {
        default: {
          port: 4000,
          server: ExpressServerAdapter as any,
          debug: true,
          handler404: () => {
            return Response.json({
              success: false,
              message: 'Could not find the route requested'
            })
          }
        }
      }
    }],
    // We have just created this custom domain, and it defines our routes.
    CustomCoreDomain
  ]
});
