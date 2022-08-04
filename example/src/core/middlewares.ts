import { Response, Request as ExpressRequest, NextFunction} from "express"
import cors from 'cors';
import { Middleware, Request } from "@palmares/server";
import ExpressServer, { ExpressMiddleware, ExpressMiddlewareHandlerType } from "@palmares/express-adapter";

export class CorsMiddleware extends Middleware {
  async run(request: Request) {
    // Código antes de receber a o response do seu controller.

    const response = await this.getResponse(request);

    // Código que modifica a resposta que será enviada para o cliente.

    return response;
  }
}

export class ExpressCorsMiddleware extends ExpressMiddleware {
  static async load(server: ExpressServer): Promise<ExpressMiddlewareHandlerType> {
    return cors();
  }
}
