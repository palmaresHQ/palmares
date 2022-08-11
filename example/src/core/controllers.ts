import { Controller, ClassHandler, Request, Response } from "@palmares/server";
import { ExpressRequest } from "@palmares/express-adapter";

export class ExampleController extends Controller {
  path = "/example";

  helloWorld: ClassHandler<{teste: string}> = {
    options: {
      teste: '1'
    },
    GET: async (request: Request, {teste}) => {
      return Response.new({ status: 200, body: "Hello World" });
    }
  }

  edit: ClassHandler = {
    path: '/index',
    GET: {
      handler: (request: ExpressRequest) => {
        return "Edit";
      }
    },
    POST: (request: ExpressRequest) => {
      return 'teste'
    }
  }
}
