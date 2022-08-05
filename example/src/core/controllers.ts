import { Controller, ClassHandler, Request } from "@palmares/server";
import { ExpressRequest } from "@palmares/express-adapter";
import { request } from "http";

export class ExampleController extends Controller {
  path = "/example";

  helloWorld: ClassHandler = {
    GET: (request: Request) => {
      return "Hello World";
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
