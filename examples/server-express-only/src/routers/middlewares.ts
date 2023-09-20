import { middleware } from '@palmares/server';

export const middleware1 = middleware({
  request: (request) => {
    console.log('Middleware 1 Ok on Request');
    return request;
  },
  response: (response) => {
    console.log('Middleware 1 Ok on Response');
    return response;
  },
});

export const middleware2 = middleware({
  request: (request) => {
    console.log('Middleware 2 Ok on Request');
    return request;
  },
  response: (response) => {
    console.log('Middleware 2 Ok on Response');
    return response;
  },
});
(middleware1 as any).teste = '1';
(middleware2 as any).teste = '2';
