import Server from '.';
import Request from '../request';
import { NotImplementedServerException } from './exceptions';
import ServerRoutes from './routes';

/**
 * The objective with this class is to transform a request object from the framework of choice in a Palmares request object.
 *
 * This means that all request will be standardized so we can work in whichever framework we want. The request will always
 * be the same no matter the framework.
 */
export default class SeverRequests {
  server: Server;
  routes: ServerRoutes;

  constructor(server: Server, routes: ServerRoutes) {
    this.server = server;
    this.routes = routes;
  }

  /**
   * Translates a request in whatever framework we are using (could be express, fastify, hapi and so on.)
   * to a Request object that we can use in the controllers inside of palmares.
   *
   * @param request - The request object from the framework of choice.
   *
   * @returns - The request object that we can use in the controllers inside of palmares.
   */
  async translate(request: any): Promise<Request> {
    throw new NotImplementedServerException(this.constructor.name, 'translate');
  }
}
