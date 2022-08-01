import { BaseRoutesType, Server, ServerRoutes } from "@palmares/server";
import ExpressServer from "./server";
import { HTTPMethodTypes } from "./types";

export default class ExpressRoutes extends ServerRoutes {
  server!: ExpressServer;

  async initialize(routes: BaseRoutesType[]): Promise<void> {
    for (const [path, handlers] of routes) {
      for (const { methodType, handler} of handlers) {
        const loweredMethodType = methodType.toLowerCase() as HTTPMethodTypes;
        this.server.serverInstance[loweredMethodType](path, async (req, res) => {
          console.log(req);
          await handler();
          console.log(res);
          res.send('passou');
        });
      }
    }
  }
}
