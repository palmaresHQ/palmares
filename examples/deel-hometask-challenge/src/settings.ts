import PalmaresCoreDomain, { defineSettings } from '@palmares/core';
import { ExpressServerAdapter } from '@palmares/express-adapter';
import NodeStd from '@palmares/node-std';
import LoggingDomain from '@palmares/logging';
import ConsoleLogging from '@palmares/console-logging';
import DatabasesDomain from '@palmares/databases';
import SequelizeEngine from '@palmares/sequelize-engine';
import ServerDomain, { Response } from '@palmares/server';

import CoreDomain from './core';
import AuthDomain from './auth';
import ContractsDomain from './contracts';
import JobsDomain from './jobs';
import AdminDomain from './admin';

import { dirname, resolve } from 'path';


export default defineSettings({
  basePath: dirname(resolve(__dirname)),
  settingsLocation: __dirname,
  std: NodeStd,
  installedDomains: [
    [
      LoggingDomain,
      {
        logger: ConsoleLogging,
      },
    ],
    // Domain Core, required for palmares to work
    [
      PalmaresCoreDomain,
      {
        appName: 'hometask-be-challenge',
        useTs: true,
      },
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
              },
            },
            handler404: () =>
              Response.json({
                status: 404,
                body: {
                  message: 'Not found',
                },
              }),
            handler500: async (response: any) => {
              return response;
            },
          },
        },
      },
    ],
    [
      DatabasesDomain,
      {
        databases: {
          default: {
            engine: SequelizeEngine.new({
              dialect: 'sqlite',
              storage: './database.sqlite3',
            }),
          },
        },
      },
    ],
    // We have just created this custom domain, and it defines our routes.
    CoreDomain,
    AuthDomain,
    ContractsDomain,
    JobsDomain,
    AdminDomain,
  ],
});
