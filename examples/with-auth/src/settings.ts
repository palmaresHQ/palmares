import defineAuthConfig, { getAuth } from '@palmares/auth';
import ConsoleLogging from '@palmares/console-logging';
import PalmaresCoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import { passwordAdapter } from '@palmares/password-auth';
import ServerDomain, { Response } from '@palmares/server';
import { dirname, resolve } from 'path';

import CoreDomain from './core';

import type { AuthAdapters } from '@palmares/auth';
import type PasswordAuthAdapter from '@palmares/password-auth';

declare global {
  namespace Palmares {
    interface PAuth extends AuthAdapters<[ReturnType<typeof PasswordAuthAdapter.new>]> {}
  }
}

export default defineSettings({
  basePath: dirname(resolve(import.meta.dirname)),
  settingsLocation: import.meta.dirname,
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
            handler500: (response: any) => {
              return response;
            }
          }
        }
      }
    ],
    defineAuthConfig({
      adapters: [passwordAdapter.new({ prefix: 'my-prefix', suffix: 'my-suffix' })]
    }),
    CoreDomain
  ]
});
