import { Response, middleware, path } from '@palmares/server';

import type * as e from 'express';

type ExpressRequestWithUserType = e.Request & { user?: string };

// You already know how to create express middlewares, so just use it.
const expressMiddleware = () => {
  return (req: ExpressRequestWithUserType, _: e.Response, next: e.NextFunction) => {
    req.user = 'admin';

    next();
  };
};

// You can assign the middleware as customOption
// Remember, this middleware is for express
const adminOnlyMiddleware = middleware({
  options: {
    customOptions: [expressMiddleware()],
    responses: {
      403: (body: { message: string }) => Response.json(body, { status: 403 }),
      402: (body: { message: string }) => Response.json(body, { status: 402 })
    }
  }
});

export const usersRoute = path('/users')
  .middlewares([adminOnlyMiddleware])
  .get((request) => {
    // You can access the request data from Express.js from the request object
    const { req, res } = request.serverData();
    if ((req as ExpressRequestWithUserType).user !== 'admin') {
      return Response.json({ message: 'You are not admin' }, { status: 403 });
    }

    // You can respond with the `res` object from Express.js
    res.json({ message: 'You are admin' });
    return;
  });

// import { domain } from '@palmares/core';
// import { Response, middleware, path, serverDomainModifier } from '@palmares/server';
// import { testDomainModifier } from '@palmares/tests';
// import cors from 'cors';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
//
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
//
// const testMiddleware = middleware({
//   options: {
//     customOptions: [
//       (req, res, next) => {
//         req.params.test2 = 'test';
//         next();
//       }
//     ]
//   }
// });
// const route = path('/test')
//   .middlewares([testMiddleware])
//   .get(
//     (req) => {
//       console.log(req.serverData().req.params);
//       return Response.json({ message: 'hello' }, { status: 200 });
//     },
//     {
//       customOptions: [
//         (req, res, next) => {
//           req.params.test = 'test';
//           next();
//         }
//       ]
//     }
//   );
//
// export default domain('testingExpressServer', __dirname, {
//   modifiers: [serverDomainModifier, testDomainModifier] as const,
//   getRoutes: () => route,
//   getTests: () => [__dirname + '/test.test.ts']
// });
