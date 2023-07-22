import ServerRoutes from './routes';
import Server from '.';
import Response from '../response';
import { NotImplementedServerException } from './exceptions';

/**
 * Use this to translate the Palmares response to something that the framework of choice is able
 * to handle.
 *
 * Different from the other implementations, you need to call `this.translateCookies` and
 * `this.translateHandlers` during the translation process.
 *
 * Besides that, this must be really simple to setup and covers most flows of the response lifecycle.
 */
export default class ServerResponses {
  server: Server;
  routes: ServerRoutes;

  constructor(server: Server, routes: ServerRoutes) {
    this.server = server;
    this.routes = routes;
  }

  async translateCookies(response: Response, args: unknown) {
    throw new NotImplementedServerException(
      this.server.constructor.name,
      'translateCookies'
    );
  }

  async translateHeaders(response: Response, args: unknown) {
    throw new NotImplementedServerException(
      this.server.constructor.name,
      'translateHeaders'
    );
  }

  async translateResponse(
    response: Response,
    options?: unknown
  ): Promise<unknown> {
    throw new NotImplementedServerException(
      this.server.constructor.name,
      'translateResponse'
    );
  }

  async sendResponse(response: Response, args?: unknown): Promise<void> {
    throw new NotImplementedServerException(
      this.server.constructor.name,
      'sendResponse'
    );
  }

  async initialize(response: Response, options?: unknown) {
    const data = await this.translateResponse(response, options);
    await Promise.all([
      this.translateHeaders(response, data),
      this.translateCookies(response, data),
    ]);
    await this.sendResponse(response, data);
  }
}
