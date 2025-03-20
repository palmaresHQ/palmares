// @ts-nocheck
import { path, Response, middleware } from '@palmares/server';

import { User } from './database';
import { userSchema } from './schemas';

// You already know how to create express middlewares, so just use it.
const expressMiddleware = (req, res, next) => {
  req.user = 'admin';
  next();
};

// You can assign the middleware as customOption
// Remember, this middleware is for express
const adminOnlyMiddleware = middleware({
  customOptions: [expressMiddleware()]
});

export const usersRoute = path('/users')
  .middlewares([adminOnlyMiddleware])
  .get(async (request) => {
    // You can access the request data from Express.js from the request object
    const { req, res } = request.serverData();
    if (req.user !== 'admin') {
      return Response.json({ message: 'You are not admin' }, { status: 403 });
    }

    // You can respond with the `res` object from Express.js
    return res.json({ message: 'You are admin' });
  });
