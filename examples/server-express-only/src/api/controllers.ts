import { Response, pathNested } from '@palmares/server';

import type { baseRouter, errorRouter } from './routes';

export const paramsController = pathNested<typeof baseRouter>()('').get(async (request) => {
  console.log('paramsController', request.params.heloo, request.query.test);
  return Response.json({
    hello: 'world',
  });
});

export const errorController = pathNested<typeof errorRouter>()('').get(async () => {
  throw new Error('Error');
});
