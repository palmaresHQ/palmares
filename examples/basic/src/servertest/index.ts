import { domain } from '@palmares/core';
import { serverDomainModifier, path, Response, middleware, Request } from '@palmares/server';
import { MethodsRouter } from 'packages/server/dist/cjs/types/router/routers';
import { routes } from './routes';

const authenticateRequest = middleware({
  request: (
    request: Request<
      string,
      {
        headers: { Authorization: string };
      }
    >
  ) => {
    //if (request.headers.Authorization) return new Response<{ Status: 404 }>();
    const modifiedRequest = request.clone<{
      body: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
      };
    }>();
    return modifiedRequest;
  },
});
const route = path('/hello/<test:number>/hey/<heloo:number>?test=string').get((request) => {
  console.log(request.json());
  return Response.json({
    hello: 'world',
  });
});
type Test<TMethodsRouter> = TMethodsRouter extends Omit<infer T, any> ? T : never;
type Test1 = Test<typeof route>;
export default domain('servertest', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: async () => routes,
});
