import { path, pathNested } from './router';
import { middleware, nestedMiddleware } from './middleware';
import { ExtractRequestsFromMiddlewaresForClient } from './middleware/types';
import Request from './request';
import Response from './response';

const authenticateRequest = middleware({
  request: (
    request: Request<
      string,
      {
        Headers: { Authorization: string };
      }
    >
  ) => {
    //if (request.headers.Authorization) return new Response<{ Status: 404 }>();
    const modifiedRequest = request.clone<{
      Body: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
      };
    }>();
    return modifiedRequest;
  },
});

const addHeadersAndAuthenticateUser = nestedMiddleware<typeof rootRouter>()({
  request: (request) => {
    const customRequest = request.clone<{
      Headers: { 'x-custom-header': string };
      Context: { user: number };
    }>();
    return customRequest;
  },
  response: (response) => {
    const modifiedResponse = response.clone();
    return modifiedResponse;
  },
});

const testMiddleware = nestedMiddleware<typeof rootRouter>()({
  request: () => {
    const response = new Response<{
      Status: 200;
      Body: {
        id: number;
        firstName: string;
        lastName: string;
        username: string;
      };
    }>();
    return response;
  },
});

export const rootRouter = path(
  '/test/<hello: {\\d+}:number>/<userId: string>?hello={[\\d\\w]+}:number&world=string[]?'
).middlewares([authenticateRequest]);

const withMiddlewares = pathNested<typeof rootRouter>()('').middlewares([
  addHeadersAndAuthenticateUser,
]);

const controllers = pathNested<typeof withMiddlewares>()('/users').get(() => {
  return new Response<{
    Headers: {
      Authorization: string;
    };
  }>();
});

export const router = withMiddlewares.nested(
  (path) =>
    [
      path('/<dateId: {\\d+}:number>?teste=(string | number)[]')
        .get(async (request) => {
          if (request.query.teste)
            return new Response<{
              Status: 200;
              Headers: {
                'x-header': string;
              };
            }>();
          return new Response<{
            Status: 404;
          }>();
        })
        .post((request) => {
          return new Response<{
            Body: {
              id: number;
              firstName: string;
              lastName: string;
              username: string;
            };
          }>();
        }),
      path('/').get((request) => {
        return new Response<{
          Body: {
            id: number;
            firstName: string;
            lastName: string;
            username: string;
          };
        }>();
      }),
      controllers,
    ] as const
);
rootRouter.nested([withMiddlewares] as const); // this should not matter for the output, need to fix this so when you define the handlers for the nested router the parent WILL be updated.

const testResponseMiddleware = nestedMiddleware<typeof router>()({
  response: (response) => {
    if (response.status === 200) {
      return response.headers['x-header'];
    }
  },
});

// Esse exemplo é como o Request do Client deve ser definido, pensa em algo tipo um TRPC, aqui eu garanto que você ta passando
// os dados corretos para o request na hora de fazer o fetch.
type ClientRequest = ExtractRequestsFromMiddlewaresForClient<
  string,
  readonly [typeof authenticateRequest, typeof addHeadersAndAuthenticateUser]
>;
