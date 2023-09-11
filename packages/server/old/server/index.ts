import { logging } from '@palmares/core';

import { NotImplementedServerException } from './exceptions';
import { AllServerSettingsType } from '../types';
import ServerRoutes from './routes';
import ServerResponses from './responses';
import ServerRequests from './requests';
import Middleware from '../middlewares';
import { HandlersType } from './types';
import { LOGGING_APP_START_SERVER } from '../utils';

/**
 * This server class should be overridden in order to work. This class is responsible for handling everything from the server.
 * Requests, responses and how to define routes.
 *
 * We try to extract most of the logic as we can from the package that is trying to override this so most of the work with
 * the package is simplified.
 */
export default class Server {
  serverInstance!: any;
  settings: AllServerSettingsType;
  routes: ServerRoutes;
  requests: ServerRequests;
  responses: ServerResponses;
  #rootMiddlewares: typeof Middleware[] = [];

  constructor(
    settings: AllServerSettingsType,
    routes?: typeof ServerRoutes,
    requests?: typeof ServerRequests,
    responses?: typeof ServerResponses
  ) {
    this.settings = settings;
    this.routes = new (routes as typeof ServerRoutes)(this);
    this.requests = new (requests as typeof ServerRequests)(this, this.routes);
    this.responses = new (responses as typeof ServerResponses)(this, this.routes);
  }
}

export { ServerRoutes, ServerRequests, ServerResponses };
