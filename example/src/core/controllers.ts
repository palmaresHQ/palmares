import { Controller, ClassHandler, Response, Get, Middlewares, Options } from "@palmares/server";
import { ExpressRequest } from "@palmares/express-adapter";
import { User } from "./models";
import CorsMiddleware from "./middlewares";

export class ExampleController extends Controller {
  path = "/example";

  @Get()
  @Middlewares(CorsMiddleware)
  @Options({
    teste: 1
  })
  async testDecorator(request: ExpressRequest<{O: { teste: number }}>) {
    
    return Response.new(200, { body: 'functiona' });
  }

  edit: ClassHandler<this> = {
    path: '/index',
    POST: (request: ExpressRequest) => {
      return Response.new(200, { body: "new one"});
    }
  }
}
