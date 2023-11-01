import { nestedMiddleware, Response } from '@palmares/server';

import type { baseRouter, baseRouterWithController } from './routes';

export const testTypeResponsesOptionsRequestMiddleware1 = nestedMiddleware<typeof baseRouter>()({
  options: {
    responses: {
      '200': (hello: string) => Response.json({ message: 'hello' }, { status: 200 }),
    },
  },
});

export const testTypeResponsesOptionsRequestMiddleware2 = nestedMiddleware<typeof baseRouter>()({
  request: (request) => {
    if (request.query) return request;
    return request.responses['400']();
  },
  options: {
    responses: {
      '404': (teste: number) => Response.json({ message: 'hello' }, { status: 404 }),
      '400': () => Response.json({ user: 'notFound' }, { status: 400 }),
    },
  },
  response: (response) => {
    response.status === 400 ? response.body.user : response.status === 404 ? response.body.user : response;
    //response.status === 404 ?
    return response;
    //response.status === 204 ? response.body : response.status === 400 ? response.body.user : response.body.message;
  },
});

export const testTypeOfResponseWithHandlerResponseMiddleware2 = nestedMiddleware<typeof baseRouterWithController>()({
  response: (response) => {
    const value = response.status === 200 ? response.body : response;
    return response;
  },
});
