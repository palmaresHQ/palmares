import { BaseRoutesType, ServerRoutes, PathParamsTypes } from "@palmares/server";

import ExpressServer from "./server";
import { HTTPMethodTypes } from "./types";

export default class ExpressRoutes extends ServerRoutes {
  server!: ExpressServer;

  async translatePathParameter(name: string, type: PathParamsTypes): Promise<string> {
    const isTypeOfString = type === 'string';
    const isTypeOfNumber = type === 'number';
    if (isTypeOfString) {
      return `:${name}`;
    } else if (isTypeOfNumber) {
      return `:${name}(\\d+)`;
    } else {
      return `:${name}(${type.toString()})`;
    }
  }

  async initialize(routes: BaseRoutesType[]): Promise<void> {
    for (const [path, handlers] of routes) {
      for (const { methodType, ...handler } of handlers) {
        const loweredMethodType = methodType.toLowerCase() as HTTPMethodTypes;
        const {
          path: translatedPath,
          handler: translatedHandler,
          middlewares: translatedMiddlewares
        } = await this.getPathHandlerAndMiddlewares(
          path,
          handler,
        );

        if (translatedMiddlewares.length > 0)
          this.server.serverInstance.use(translatedPath, ...translatedMiddlewares);
        this.server.serverInstance[loweredMethodType](
          translatedPath,
          async (req, res) => {
            await translatedHandler(req);
            res.type
            res.send('hello world');
          }
        );
      }
    }
  }
}
