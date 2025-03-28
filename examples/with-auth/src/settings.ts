import defineAuthConfig from '@palmares/auth';
import ConsoleLogging from '@palmares/console-logging';
import PalmaresCoreDomain, { defineSettings } from '@palmares/core';
import DatabasesDomain from '@palmares/databases';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import { jwtAdapter } from '@palmares/jwt-adapter';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import { passwordAdapter } from '@palmares/password-auth';
import { SchemaDomain } from '@palmares/schemas';
import ServerDomain, { Response } from '@palmares/server';
import { ZodSchemaAdapter } from '@palmares/zod-schema';
import { dirname, resolve } from 'path';

import CoreDomain from './core';
import { databaseEngine } from './db';
import { env } from './env';

import type { AuthAdapters } from '@palmares/auth';
import type { DrizzleDatabaseAdapter } from '@palmares/drizzle-engine';
import type PasswordAuthAdapter from '@palmares/password-auth';

declare global {
  namespace Palmares {
    interface PAuth
      extends AuthAdapters<[ReturnType<typeof PasswordAuthAdapter.new>, ReturnType<typeof jwtAdapter.new>]> {}
    interface PDatabaseAdapter extends InstanceType<typeof DrizzleDatabaseAdapter> {}
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
    [
      SchemaDomain,
      {
        schemaAdapter: ZodSchemaAdapter
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
    [
      DatabasesDomain,
      {
        databases: {
          default: {
            engine: databaseEngine
          }
        }
      }
    ],
    defineAuthConfig({
      adapters: [
        passwordAdapter.new(),
        jwtAdapter.new({
          secret: env.JWT_SECRET,
          algorithm: 'HS256',
          expiresIn: '7d',
          includeIssuedAt: true,
          clockTolerance: 10,
          maxTokenAge: '7d',
          typ: 'JWT'
        })
      ]
    }),
    CoreDomain
  ]
});
