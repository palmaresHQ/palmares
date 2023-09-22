import { Request, Response, middleware, nestedMiddleware, path, pathNested } from '@palmares/server';
import { ExpressServerRequestAdapter as esra } from '@palmares/express-adapter';

import {
  baseRouter,
  errorRouter,
  jsonRouter,
  formDataRouter,
  textRouter,
  blobRouter,
  formUrlEncodedRouter,
} from './routes';

export const paramsController = pathNested<typeof baseRouter>()('').get(async (request) => {
  console.log('paramsController', request.params.heloo, request.query.test);
  return Response.json({
    hello: 'world',
  });
});

export const errorController = pathNested<typeof errorRouter>()('').get(async () => {
  throw new Error('Error');
});

export const jsonController = pathNested<typeof jsonRouter>()('').post(async (request) => {
  console.log('jsonController', await request.json());
  return Response.json({
    hello: 'world',
  });
});

export const formDataController = pathNested<typeof formDataRouter>()('').post(async (request) => {
  const requestModified = request as unknown as Request<
    any,
    {
      body: {
        firstName: string;
        lastName: string;
        file: File[];
      };
    }
  >;
  const formData = await requestModified.formData(esra.customToFormDataOptions?.({ type: 'array', options: ['file'] }));
  console.log(formData?.get('file').name);
  return Response.json({
    hello: 'world',
  });
});

export const formUrlEncodedController = pathNested<typeof formUrlEncodedRouter>()('').post(async (request) => {
  const requestModified = request as unknown as Request<
    any,
    {
      body: {
        firstName: string;
        lastName: string;
      };
    }
  >;
  const formData = await requestModified.formData();
  console.log(formData?.get('firstName'));
  return Response.json({
    hello: 'world',
  });
});

export const textController = pathNested<typeof textRouter>()('').post(async (request) => {
  const text = await request.text();
  console.log(text);
  return Response.json({
    hello: 'world',
  });
});

export const blobController = pathNested<typeof blobRouter>()('').post(async (request) => {
  const blob = await request.blob();
  return Response.json({
    hello: 'world',
  });
});
