import { Controller, ClassHandler, Response, Get, HTTP_200_OK } from "@palmares/server";
import { ExpressRequest } from "@palmares/express-adapter";

import { User } from "./models";
import { ExampleSerializer, UserSerializer } from "./serializers";

export class ExampleController extends Controller {
  path = "/example";

  // Aqui estou injetando uma dependência no controller
  constructor(dependencyInjection: number) {
    super();
  }

  // Escreve uma rota com decorators
  @Get('/test')
  async testDecorator(request: ExpressRequest) {
    const serializer = UserSerializer.new();
    const data = await serializer.data;

    /*const serializer = ExampleSerializer.new({
      data: {
        firstName: 'launchcode',
        nested: {
          phoneNumber: '+55 11 99999-9999',
        }
      }
    });*/
    return Response.new(HTTP_200_OK, { body: serializer.data });
  }

  // Ou com objetos diretamente
  edit: ClassHandler<this> = {
    path: '/<id: number>',
    async POST({ params: { id }}: ExpressRequest<{P: { id: number }}>) {
      const user = await User.default.get({ id });
      return Response.new(HTTP_200_OK, { body: user });
    }
  }
}
