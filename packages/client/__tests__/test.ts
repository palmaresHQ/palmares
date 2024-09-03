import { defineSettings, domain } from '@palmares/core';
import ExpressServerAdapter from '@palmares/express-adapter';
import ServerDomain, { Response, middleware, path, serverDomainModifier } from '@palmares/server';
import { dirname, resolve } from 'path';

import type { MethodsRouter } from '@palmares/server';

type ExtractRoutesAndHandlerFromRouter<
  TRouter extends MethodsRouter<any, any, any, any, any, any> | Omit<MethodsRouter<any, any, any, any, any, any>, any>
> = TRouter extends MethodsRouter<any, any, any, any, any, infer TRootPath> ? TRootPath : TRouter;



export const settings = defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __dirname,
  std: undefined as any,
  installedDomains: [
    // Server Domain, required for the server
    [
      ServerDomain,
      {
        servers: {
          default: {
            server: ExpressServerAdapter as any,
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
    // We have just created this custom domain, and it defines our routes.
    coreDomain
  ]
});
