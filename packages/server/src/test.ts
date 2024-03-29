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
  request: (request) => {
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

const testRequestMiddleware1 = nestedMiddleware<typeof rootRouter>()({
  options: {
    responses: {
      '200': (hello: string) => Response.json({ message: 'hello' }, { status: 200 }),
    },
  },
});

const testRequestMiddleware = nestedMiddleware<typeof rootRouter>()({
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
});

const testResponseMiddleware2 = nestedMiddleware<typeof testRouterWithController>()({
  response: (response) => {
    const value = response.status === 200 ? response.body : response;
    return response;
  },
});

const testRouter = path('/hey').middlewares([testRequestMiddleware1, testRequestMiddleware]);
const testController = pathNested<typeof testRouter>()('/<userId: string>').get(
  (request) => {
    return request.responses['200']('hello');
  }, //const response = Response.json({ body: 'hey' }, { status: 200 }); // should be error
  // return response;
  {
    responses: {
      '201': () => Response.json({ body: 'hey' }, { status: 201 }),
    },
  }
);

const testRouterWithController = testRouter.nested([testController] as const);
testRouterWithController.middlewares([testResponseMiddleware2]);
const withMiddlewares = pathNested<typeof rootRouter>()('').middlewares([addHeadersAndAuthenticateUser] as const);

const controllers = pathNested<typeof withMiddlewares>()('/users').get(() => {
  const resp = new Response<
    unknown,
    {
      headers: {
        Authorization: string;
      };
    }
  >();
  return resp;
});

export const router = withMiddlewares.nested((path) => [
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
]);
rootRouter.nested([withMiddlewares]); // this should not matter for the output, need to fix this so when you define the handlers for the nested router the parent WILL be updated.

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
