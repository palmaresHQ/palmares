import {
  Controller,
  ClassHandler,
  Response,
  Get,
  Post,
  HTTP_200_OK,
  HTTP_201_CREATED,
} from '@palmares/server';
import { ExpressRequest } from '@palmares/express-adapter';

import { User } from './models';
import { UserSerializer, PostSerializer } from './serializers';
import { ModelSerializerInType } from '@palmares/serializers/src/serializers/types';
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
    return Response.new(HTTP_200_OK, { body: data });
  }

  @Post('/test')
  async testPostDecorator({
    body,
  }: ExpressRequest<{ D: ModelSerializerInType<UserSerializer> }>) {
    const serializer = UserSerializer.new({
      data: body,
    });
    const isValid = await serializer.isValid();
    console.log(isValid);
    console.log(serializer.errors);
    if (isValid) {
      console.log(isValid, serializer.validatedData);
    }
    return Response.new(HTTP_201_CREATED);
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
