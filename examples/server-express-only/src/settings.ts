import CoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import ServerDomain, { Response, middleware } from '@palmares/server';
import { dirname, resolve } from 'path';
import ApiDomain from './api';
import cors from 'cors';

export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  installedDomains: [
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
            port: 4001,
            customServerSettings: ExpressServerAdapter.customServerSettings({
              middlewares: [cors()],
              // Aqui eu poderia adicionar mais coisa
              // que eu não tenho no adapter e ai tenho acesso ao server direto
              additionalBehaviour: (app) => {
                app.use(cors());
                app.all('*', (req, res) => {
                  // Custom 404 page
                  res.status(404).send('Not found');
                });
              },
            }),
            handler500: middleware({ response: () => new Response() }),
          },
        },
      },
    ],
    // We have just created this custom domain, and it defines our routes.
    ApiDomain,
  ],
});
