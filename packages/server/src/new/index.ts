import { path, pathNested } from './router';
import { middleware, nestedMiddleware } from './middleware';
import Request from './request';
import { proxy } from './router/functions';

/**
 * Ambos os middlewares modificam o request
 */
const addDataToRequest = middleware({
  request: (request) => {
    const customRequest = request.extend<{
      Headers: { 'x-custom-header': string };
      Context: { user: number };
    }>();
    return customRequest;
  },
});

const addHeadersAndAuthenticateUser = nestedMiddleware<typeof rootRouter>()({
  request: (request) => {
    const modifiedRequest = request.extend<{
      Data: {
        id: number;
        firstName: string;
        lastName: string;
      };
    }>();

    return modifiedRequest;
  },
});

const controller = pathNested<typeof rootRouter>()('/').get((request) => {
  //request.data
});

export const rootRouter = path(
  '/test/<hello: (/d+):number>/<userId: string>'
).middlewares([addDataToRequest] as const)

type Teste = ReturnType<typeof addHeadersAndAuthenticateUser['request']>;
const withMiddlewares = rootRouter.middlewares([
  addHeadersAndAuthenticateUser,
] as const);

const roooot = path(
  '/test/<hello: (/d+):number>/<userId: string>'
).middlewares([
  addHeadersAndAuthenticateUser,
] as const);

export const router = withMiddlewares.nested(
  (path) =>
    [
      path('/<dateId: number>').get((request) => {
        request.
      }),
      controller,
    ] as const
);

/*
export type router = typeof rootRouter;

// Isso aqui é um router que foi criado de forma aninhada. Ele tem relação com o rootRouter. Dessa maneira,
// se tenho parâmetros no rootRouter, eles também estarão presentes no router2 e no router3.
// Imagina que essas rotas estarão em outro arquivo, só preciso importar o tipo.
const router2 = pathNested<typeof rootRouter>()('/<hello: (/d+):number>');
const router3 = pathNested<typeof rootRouter>()('/test3');

const controller = router2
  .get((request) => {
    request.params.hello;
  })
  .post((request) => {
    request.params.hello;
  });

// Aqui estou incluindo os dois routers criados de forma aninhada no rootRouter. Isso é o que eu export
const router = rootRouter.nested((router) => [
  router.child('/test').get((request) => {
    request.context.user;
  }),
  router2,
  router3,
]);
*/
