import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import StdDomain from '@palmares/std';
import NodeStd from '@palmares/node-std';
import ServerDomain, { Middleware, Response, middleware } from '@palmares/server';

import { dirname, resolve } from 'path';
import RequestsDomain from './requests';
import RoutersDomain from './routers';
import MiddlewaresDomain from './middlewares';
import ResponsesDomain from './responses';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  installedDomains: [
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
    RequestsDomain,
    RoutersDomain,
    MiddlewaresDomain,
    ResponsesDomain,
  ],
});
