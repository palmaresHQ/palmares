import { defineSettings, domain } from '@palmares/core';
import ServerDomain, { Response, middleware, path, serverDomainModifier } from '@palmares/server';
import { request } from 'http';
import { dirname, resolve } from 'path';

import type { MethodsRouter, Request } from '@palmares/server';

const seiLa = path('/here')
  .get(async (request) => {
    return Response.json({
      success: true,
      message: 'Hello World'
    });
  })
  .nested((path) => [
    path('/sync').nested((path) => [
      path('/sync2').get(async (req) => {
        req.params;
      })
    ])
  ]);

type ExtractRoutesAndHandlerFromRouter<
  TRouter extends MethodsRouter<any, any, any, any, any, any> | Omit<MethodsRouter<any, any, any, any, any, any>, any>
> = TRouter extends MethodsRouter<any, any, any, any, any, infer TRootPath> ? TRootPath : TRouter;

const validationMiddleware = middleware({
  request: async (request) => {
    const requestWithBodyAs = request.clone<{
      body: {
        name: string;
        age: number;
      };
      headers: {
        'content-type': 'application/json';
      };
    }>();
    return requestWithBodyAs;
  }
});
export const coreDomain = domain('core', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () =>
    path('/here').nested((path) => [
      // eslint-disable-next-line ts/require-await
      path('/hello')
        .get(async (request) => {
          return Response.json(
            {
              message: 'Hello World'
            },
            { status: 422 }
          );
        })
        .post(
          async (request) => {
            return Response.json(
              {
                message: 'Hello World'
              },
              { status: 200 }
            );
          },
          {
            middlewares: [validationMiddleware]
          }
        )
        .nested((path) => [path('/world').get(async () => Response.json({ message: 'Hello World' }))]),
      // eslint-disable-next-line ts/require-await
      path('/test').get(async () => {
        return Response.json({
          success: true,
          data: {
            age: 20,
            name: 'John Doe'
          }
        });
      })
    ])
});

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
            server: undefined as any,
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
