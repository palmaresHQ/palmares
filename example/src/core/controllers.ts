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

import { User, Post as PostModel, Photo } from './models';
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
    const instance = (
      await User.default.get({
        search: { id: 1 },
        includes: [PostModel, Photo] as const,
      })
    )[0];
    const serializer = UserSerializer.new({
      instance: instance,
    });
    const data = await serializer.data;
    return Response.new(HTTP_200_OK, { body: data });
  }

  @Post('/test')
  async testPostDecorator({
    body,
  }: ExpressRequest<{ D: ModelSerializerInType<UserSerializer> }>) {
    const instance = (
      await User.default.get({
        search: { id: 1 },
        includes: [PostModel] as const,
      })
    )[0];
    const serializer = UserSerializer.new({
      data: body,
      instance,
    });
    const isValid = await serializer.isValid();
    if (isValid) {
      const savedInstance = await serializer.save();
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
