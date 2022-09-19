import {
  Controller,
  ClassHandler,
  Response,
  Get,
  HTTP_200_OK,
} from '@palmares/server';
import { ExpressRequest } from '@palmares/express-adapter';

import { User, Post } from './models';
import { UserSerializer, PostSerializer } from './serializers';
export class ExampleController extends Controller {
  path = '/example';

  constructor(dependencyInjection: number) {
    super();
    console.log(dependencyInjection);
  }

  // Escreve uma rota com decorators
  @Get('/test')
  async testDecorator() {
    const instance = (await User.default.get({ id: 1 }))[0];
    const serializer = UserSerializer.new({
      instance,
    });
    const data = await serializer.data;

    /*const serializer = ExampleSerializer.new({
      data: {
        firstName: 'launchcode',
        nested: {
          phoneNumber: '+55 11 99999-9999',
        }
      }
    });*/
    return Response.new(HTTP_200_OK, { body: data });
  }

  // Ou com objetos diretamente
  edit: ClassHandler<this> = {
    path: '/<id: number>',
    async POST({ params: { id } }: ExpressRequest<{ P: { id: number } }>) {
      const user = await User.default.get({ id });
      return Response.new(HTTP_200_OK, { body: user });
    },
  };
}
