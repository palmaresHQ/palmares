import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import ServerDomain, { Response, path } from '@palmares/server';
import TestsDomain from '@palmares/tests';
import cors from 'cors';
import { dirname, resolve } from 'path';

import CustomCoreDomain from './core';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Palmares {
    interface PServerAdapter extends InstanceType<typeof ExpressServerAdapter> {}
  }
}
//import * as schema from '../.drizzle/schema';

path('/test').get(
  (request) => {
    return Response.json({ message: 'test' });
  },
  {
    customOptions: [cors()]
  }
);

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
    [
      ServerDomain,
      {
        servers: {
          default: {
            port: 4000,
            server: ExpressServerAdapter as any,
            debug: true,
            handler404: () => {
              return Response.json({
                success: false,
                message: 'Could not find the route requested'
              });
            }
          }
        }
      }
    ],
    // We have just created this custom domain, and it defines our routes.
    CustomCoreDomain
  ]
});
