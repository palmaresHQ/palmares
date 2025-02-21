import { Request, Response, middleware, nestedMiddleware, path, pathNested } from '@palmares/server';

import type {
  baseRouter,
  errorRouter,
  jsonRouter,
  formDataRouter,
  textRouter,
  blobRouter,
  formUrlEncodedRouter,
  queryAndUrlParamsRouter,
  arrayBufferRouter,
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
  const formData = await requestModified.formData({ type: 'array', options: ['file'] });
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
  console.log(blob);
  return Response.json({
    hello: 'world',
  });
});

export const arrayBufferController = pathNested<typeof arrayBufferRouter>()('').post(async (request) => {
  const arrayBuffer = await request.arrayBuffer();
  console.log(arrayBuffer);
  return Response.json({
    hello: 'world',
  });
});

export const queryAndUrlParamsController = pathNested<typeof queryAndUrlParamsRouter>()(
  '/<string: string>/<boolean: boolean>/<number: number>?string=string&stringArrayOptional=string[]?&number=number'
).get(async (request) => {
  console.log(
    'queryParamsController',
    request.params.boolean,
    request.params.number,
    request.params.string,
    request.query.string,
    request.query.stringArrayOptional,
    request.query.number
  );
  return Response.json({
    hello: 'world',
  });
});
