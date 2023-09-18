import { Response, pathNested } from '@palmares/server';
import { ExpressServerRequestAdapter as esra } from '@palmares/express-adapter';

import type { baseRouter, errorRouter, jsonRouter, formDataRouter } from './routes';

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
  console.log(
    'formData',
    await request.formData(esra.customToFormDataOptions?.({ type: 'single', options: ['file'] }))
  );
  return Response.json({
    hello: 'world',
  });
});
