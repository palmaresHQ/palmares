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
    const startOfInternal = performance.now();
    const value = await Photo.default.get({
      search: {
        post: {
          number: 3,
        },
      },
      includes: [
        {
          model: User,
          fields: ['lastName'],
        },
        {
          model: PostModel,
        },
      ] as const,
    });
    //console.log(JSON.stringify(value, null, 2));
    const endOfInternal = performance.now();
    console.log('Raw Performance', endOfInternal - startOfInternal, value);

    //console.log(JSON.stringify(value, null, 2));

    const UserInstance: SequelizeModel<User> = await User.default.getInstance();
    const PostInstance: SequelizeModel<PostModel> =
      await PostModel.default.getInstance();
    const PhotoInstance: SequelizeModel<Photo> =
      await Photo.default.getInstance();
    const startOfNative = performance.now();
    await PhotoInstance.findAll({
      include: [
        {
          model: PostInstance,
          as: 'post',
          where: {
            number: 3,
          },
        },
        {
          model: UserInstance,
          as: 'user',
        },
      ],
      raw: true,
      nest: true,
    });
    const endOfNative = performance.now();
    console.log('native Performance', endOfNative - startOfNative);

    /*await PostModel.default.get({
      includes: [
        {
          model: User,
        },
      ],
    });*/
    /*const serializer = UserSerializer.new({
      instance: instance,
    });
    const data = await serializer.data;*/
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
