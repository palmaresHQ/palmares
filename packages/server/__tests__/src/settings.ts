import ConsoleLogging from '@palmares/console-logging';
import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import JestTestAdapter from '@palmares/jest-tests';
import LoggingDomain from '@palmares/logging';
import NodeStd from '@palmares/node-std';
import ServerDomain, { Response, path } from '@palmares/server';
import TestsDomain from '@palmares/tests';
import { dirname, join, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import CustomCoreDomain from './core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace Palmares {
    interface PServerAdapter extends InstanceType<typeof ExpressServerAdapter> {}
  }
}
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
        testAdapter: JestTestAdapter.new({
          config: {
            extensionsToTreatAsEsm: ['.ts'],
            transform: {
              // '^.+\\.[tj]sx?$' to process ts,js,tsx,jsx with `ts-jest`
              // '^.+\\.m?[tj]sx?$' to process ts,js,tsx,jsx,mts,mjs,mtsx,mjsx with `ts-jest`
              '^.+\\.ts?$': [
                'ts-jest',
                {
                  tsconfig: join(dirname(resolve(__dirname)), 'tsconfig.json'),
                  useESM: true,
                  diagnostics: {
                    ignoreCodes: [1343]
                  },
                  astTransformers: {
                    before: [
                      {
                        path: 'node_modules/ts-jest-mock-import-meta',
                        options: {
                          metaObjectReplacement: {
                            filename: __filename,
                            dirname: __dirname,
                            url: pathToFileURL(__filename)
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        })
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
