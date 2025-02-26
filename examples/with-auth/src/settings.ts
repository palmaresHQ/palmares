import ConsoleLogging from '@palmares/console-logging';
import PalmaresCoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import ServerDomain, { Response } from '@palmares/server';
import { dirname, resolve } from 'path';

import PasswordAuthAdapter, { passwordAdapter } from '@palmares/password-auth';
import CoreDomain from './core';
import defineAuthDomain, { Auth, AuthAdapter } from '@palmares/auth';

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
            handler500: async (response: any) => {
              return response;
            }
          }
        }
      }
    ],
    defineAuthDomain({
      adapters: [passwordAdapter.new({
        prefix: 'my-prefix',
        suffix: 'my-suffix'
      })]
    }),
    CoreDomain
  ]
});

declare global {
  namespace Palmares {
    interface PAuth {
      adapters: [ReturnType<typeof PasswordAuthAdapter.new>]
    }
  }
}

const auth = Auth

type test2 = Palmares.PAuth['adapters'][number]

type test3 = ReturnType<typeof PasswordAuthAdapter.new>
