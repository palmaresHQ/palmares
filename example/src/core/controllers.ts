import { Controller, ClassHandler, Response } from "@palmares/server";
import { ExpressRequest } from "@palmares/express-adapter";
import { User } from "./models";

class TesteSerializer {

}

export class ExampleController extends Controller {
  path = "/example";

  helloWorld: ClassHandler<this> = {
    path: '/<id>',
    async GET({ params }: ExpressRequest<{P: {id: number}}>) {
      const user = await User.default.get({id: params.id});
      return Response.new(200, { body: user});
    }
  }

  edit: ClassHandler<this> = {
    path: '/index',

    GET: {
      handler: (request: ExpressRequest) => {
        return Response.new(200, { body: "teste"});
      }
    },
    POST: (request: ExpressRequest) => {
      return Response.new(200, { body: "new one"})
    }
  }

  teste: ClassHandler<this> = {}
}
