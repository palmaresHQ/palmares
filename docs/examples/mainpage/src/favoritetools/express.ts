// @ts-nocheck
import { path, Response, middleware } from '@palmares/server';
import type { Request, Response as EResponse, NextFunction } from 'express';
import { ExpressServerAdapter } from '@palmares/express-adapter';

type ExpressRequestWithUserType = Request & { user?: string };

declare global {
  namespace Palmares {
    interface PServerAdapter extends InstanceType<typeof ExpressServerAdapter> {}
  }
}
// You already know how to create express middlewares, so just use it.
const expressMiddleware = () => {
  return (req: ExpressRequestWithUserType, _: EResponse, next: NextFunction) => {
    req.user = 'admin';

    next();
  };
};

// You can assign the middleware as customOption
// Remember, this middleware is for express
const adminOnlyMiddleware = middleware({
  options: {
    customOptions: [expressMiddleware()]
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
