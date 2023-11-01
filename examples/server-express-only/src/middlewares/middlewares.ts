import { middleware, nestedMiddleware } from '@palmares/server';

import type { baseRouter } from './routes';

export const typingTestHeaderMiddleware = middleware({
  request: (request) => {
    const clonedRequest = request.clone<{ headers: { 'x-authentication': string } }>();
    return clonedRequest;
  },
});

export const typingTestAuthenticateUserMiddleware = nestedMiddleware<typeof baseRouter>()({
  request: (request) => {
    const customRequest = request.clone<{
      context: { user: number };
    }>();
    return customRequest;
  },
  response: (response) => {
    const modifiedResponse = response.clone();
    return modifiedResponse;
  },
});

export const middlewareOrdering1 = middleware({
  request: (request) => {
    console.log('Middleware 1 Ok on Request');
    return request;
  },
  response: (response) => {
    console.log('Middleware 1 Ok on Response');
    return response;
  },
});

export const middlewareOrdering2 = middleware({
  request: (request) => {
    console.log('Middleware 2 Ok on Request');
    return request;
  },
  response: (response) => {
    console.log('Middleware 2 Ok on Response');
    return response;
  },
});

// This is just for debugging purposes on the console so we can see what is happening
(middlewareOrdering1 as any).debug = '1';
(middlewareOrdering2 as any).debug = '2';
