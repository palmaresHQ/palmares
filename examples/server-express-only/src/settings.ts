import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import StdDomain from '@palmares/std';
import NodeStd from '@palmares/node-std';
import ServerDomain, { Response, middleware } from '@palmares/server';

import { dirname, resolve } from 'path';
import ApiDomain from './api';
import cors from 'cors';

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
            customServerSettings: ExpressServerAdapter.customServerSettings({
              middlewares: [cors()],
              // Aqui eu poderia adicionar mais coisa
              // que eu não tenho no adapter e ai tenho acesso ao server direto
              additionalBehaviour: (app) => {
                app.use(cors());
              },
            }),
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
    ApiDomain,
  ],
});
