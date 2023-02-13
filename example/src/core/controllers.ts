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
import { getEventsServer } from '@palmares/events';

import { User, Post as PostModel, Photo } from './models';
import { SequelizeModel } from '@palmares/sequelize-engine';

export class ExampleController extends Controller {
  path = '';
  constructor() {
    super();
    //console.log(dependencyInjection);
  }

  // Escreve uma rota com decorators
  @Get('/test')
  async testDecorator() {
    const data = [
      {
        firstName: 'Teste',
        lastName: 'teste',
        uuid: '12fe1fe1-7186-4196-9b07-50fb73cb26f0',
        userPosts: [
          {
            number: 1,
            postPhotos: [
              {
                name: 'teste',
                userId: 1,
              },
              {
                name: 'teste2',
                userId: 2,
              },
              {
                name: 'hey3',
                userId: 2,
              },
            ],
          },
          {
            number: 20,
            postPhotos: [
              {
                name: 'hey',
                userId: 1,
              },
            ],
          },
        ],
      },
    ];

    const value = await User.default.get({
      search: {
        id: {
          in: [1, 2],
        },
      },
      includes: [
        {
          model: PostModel,
        },
      ],
    });

    console.log(JSON.stringify(value, null, 2));

    return Response.new(HTTP_200_OK);
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
