import { BaseRoutesType, ServerRoutes, PathParamsTypes } from "@palmares/server";
import ExpressServer from "./server";
import { HTTPMethodTypes } from "./types";

export default class ExpressRoutes extends ServerRoutes {
  server!: ExpressServer;

  async translatePathParameter(name: string, type: PathParamsTypes): Promise<string> {
    const isTypeOfNumberOrString = type === 'string' || type === 'number';
    if (isTypeOfNumberOrString) {
      return `:${name}`;
    } else {
      return `:${name}(${type.toString()})`;
    }
  }

  async initialize(routes: BaseRoutesType[]): Promise<void> {
    for (const [path, handlers] of routes) {
      for (const { methodType, handler} of handlers) {
        const loweredMethodType = methodType.toLowerCase() as HTTPMethodTypes;
        const translatedPath = await this.getPath(path);
        this.server.serverInstance[loweredMethodType](
          translatedPath,
          async (req, res) => {
            console.log(req.path);
            await handler();
            res.send('passou');
          }
        );
      }
    }
  }
}
