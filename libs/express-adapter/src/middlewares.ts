import { Middleware } from '@palmares/server';

import ExpressServer from './server';
import { ExpressMiddlewareHandlerType } from './types';

export class ExpressMiddleware extends Middleware {
  static async load(
    server: ExpressServer
  ): Promise<ExpressMiddlewareHandlerType> {
    throw new Error('load should be implemented');
  }
}
