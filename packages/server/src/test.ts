import { path, pathNested } from './router';
import { middleware, nestedMiddleware } from './middleware';
import { ExtractRequestsFromMiddlewaresForClient } from './middleware/types';
import Request from './request';
import Response from './response';
import { request } from 'http';
import { HTTP_200_OK } from './response/status';

const addHeadersAndAuthenticateUser = nestedMiddleware<typeof rootRouter>()({
  request: (request) => {
    const customRequest = request.clone<{
      headers: { 'x-custom-header': string };
      context: { user: number };
    }>();
    return customRequest;
  },
  response: (response) => {
    const modifiedResponse = response.clone();
    return modifiedResponse;
  },
});

const authenticateRequest = middleware({
  request: (
    request: Request<
      string,
      {
        headers: { Authorization: string };
        context: {
          user: number;
        };
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

export const rootRouter = path(
  '/test/<hello: {\\d+}:number>/<userId: string>?hello={[\\d\\w]+}:number&world=string[]?'
);

const testRequestMiddleware = nestedMiddleware<typeof rootRouter>()({
  request: (request) => {
    if (request.query) return request;
    if (request.params) return request.responses['404'](1);
    return request.responses['400']();
  },
  options: {
    responses: {
      '404': (teste: number) => Response.json({ message: 'hello' }, { status: 404 }),
      '400': () => Response.json({ user: 'notFound' }, { status: 400 }),
    },
  },
  response: (response) => {
    response.status === 400 ? response.body.user : response.status === 404 ? response.body.message : response;
    //response.status === 404 ?
    return response;
    //response.status === 204 ? response.body : response.status === 400 ? response.body.user : response.body.message;
  },
});

const testResponseMiddleware2 = nestedMiddleware<typeof testRouterWithController>()({
  response: (response) => {
    const value = response.status === 201 ? response.body : response;
    return response;
  },
});

const testRouter = path('/hey').middlewares([testRequestMiddleware]);
const testController = pathNested<typeof testRouter>()('/<userId: string>').get(
  (request) => {
    return request.responses['201']();
  },
  {
    responses: {
      '201': () => Response.json({ message: 'hello' }, { status: 201 }),
    },
  }
);

const testRouterWithController = testRouter.nested([testController] as const);
testRouterWithController.middlewares([testResponseMiddleware2]);

const withMiddlewares = pathNested<typeof rootRouter>()('').middlewares([addHeadersAndAuthenticateUser]);

const controllers = pathNested<typeof withMiddlewares>()('/users').get(() => {
  return new Response<
    unknown,
    {
      headers: {
        Authorization: string;
      };
    }
  >();
});

export const router = withMiddlewares.nested(
  (path) =>
    [
      path('/<dateId: {\\d+}:number>?teste=(string | number)[]')
        .get(async (request) => {
          const response = new Response<
            unknown,
            {
              status: 200;
              headers: {
                'x-header': string;
              };
            }
          >();
          return response;
        })
        .post((request) => {
          return new Response<{
            id: number;
            firstName: string;
            lastName: string;
            username: string;
          }>();
        }),
      path('/').get((request) => {
        return new Response<{
          id: number;
          firstName: string;
          lastName: string;
          username: string;
        }>();
      }),
      controllers,
    ] as const
);
rootRouter.nested([withMiddlewares] as const); // this should not matter for the output, need to fix this so when you define the handlers for the nested router the parent WILL be updated.

const testResponseMiddleware = nestedMiddleware<typeof router>()({
  response: (response) => {
    if (response.status === 200) {
      const test = response.headers['x-header'];
    }
    return response;
  },
});

// Esse exemplo é como o Request do Client deve ser definido, pensa em algo tipo um TRPC, aqui eu garanto que você ta passando
// os dados corretos para o request na hora de fazer o fetch.
type ClientRequest = ExtractRequestsFromMiddlewaresForClient<
  string,
  readonly [typeof authenticateRequest, typeof addHeadersAndAuthenticateUser]
>;
