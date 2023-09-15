import { path, Response } from '@palmares/server';

export const routes = path('/hello/<test:number>/hey/<heloo:number>?test=string').post(async (request) => {
  console.log(await request.json());
  return Response.json({
    hello: 'world',
  });
});
