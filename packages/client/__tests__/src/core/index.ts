import { domain } from '@palmares/core';
import { Response, middleware, path, serverDomainModifier } from '@palmares/server';

const validationMiddleware = middleware({
  // eslint-disable-next-line ts/require-await
  request: async (request) => {
    const requestWithBodyAs = request.clone<{
      body: {
        name: string;
        age: number;
      };
      headers: {
        'content-type': 'application/json';
      };
    }>();
    return requestWithBodyAs;
  }
});

export const inventoryDomain = domain('inventory', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () => path('/aqui').get(async (request) => Response.json({ message: 'aqui' }))
});

export const coreDomain = domain('core', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: () =>
    path('/here').nested((path) => [
      path('/hello/<id: number>?name=string?')
        // eslint-disable-next-line ts/require-await
        .get(async (request) => {
          return Response.json(
            {
              message: 'Hello World'
            },
            { status: 422 }
          );
        })
        .post(
          async (request) => {
            return Response.stream(function* () {
              yield 'aqui';
            });
          },
          {
            middlewares: [validationMiddleware]
          }
        )
        .nested((path) => [
          path('/world').get(async () =>
            Response.json({
              message: 'Hello World',
              data: {
                age: 20,
                name: 'John Doe'
              }
            })
          )
        ]),
      // eslint-disable-next-line ts/require-await
      path('/test').get(async () => {
        return Response.json({
          success: true,
          data: {
            age: 20,
            name: 'John Doe'
          }
        });
      })
    ])
});
