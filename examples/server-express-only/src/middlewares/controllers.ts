import { pathNested, Response } from '@palmares/server';

import type { rootRouter, middlewareOrderingRouter } from './routes';
import { middlewareOrdering2 } from './middlewares';

export const typingTestController = pathNested<typeof rootRouter>()('').get((request) => {
  console.log('testingOfHeaders', request.headers['x-authentication']);
  console.log('testingOfContext', request.context.user);
  console.log('testingOfParams', request.params.filter);
  return Response.json({
    hello: 'world',
  });
});

export const middlewareOrderingController = pathNested<typeof middlewareOrderingRouter>()('')
  .all(() => {
    console.log('received request');
    return Response.json({ message: 'All Ok' });
  })
  .middlewares([middlewareOrdering2] as const);
