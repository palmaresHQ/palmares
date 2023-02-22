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
//import { getEventsServer } from '@palmares/events';

import { User, Post as PostModel, Photo, Pokemon } from './models';

export class ExampleController extends Controller {
  path = '';
  constructor() {
    super();
    //console.log(dependencyInjection);
  }

  @Get('/test')
  async testDecorator() {
    const value = await User.default.get({
      fields: ['id', 'firstName'],
      includes: [
        {
          model: Pokemon,
        },
      ],
    });

    return Response.new(HTTP_200_OK, { body: value });
  }

  @Post('/test')
  async testPostDecorator({ body }: ExpressRequest<{ D: any }>) {
    /*const instance = (
      await User.default.get({
        search: { id: 1 },
      })
    )[0];
    const serializer = UserSerializer.new({
      many: false,
      data: body,
      instance,
    });
    //const data = await serializer.data;
    //data. // Check why id is optional here
    const isValid = await serializer.isValid();
    if (isValid) {
      const savedInstance = await serializer.save();
    }*/
    return Response.new(HTTP_201_CREATED);
  }

  // Ou com objetos diretamente
  edit: ClassHandler<this> = {
    path: '/<id: number>',
    async POST({ params: { id } }: ExpressRequest<{ P: { id: number } }>) {
      const user = await User.default.get({ search: { id } });
      return Response.new(HTTP_200_OK, { body: user });
    },
  };
}

type array = readonly string[];
type Teste = '10' extends array[number] ? true : false;
