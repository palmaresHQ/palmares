// @ts-nocheck
import { path, Response, middleware } from '@palmares/server';

import { User } from './database';
import { userSchema } from './schemas';

const companyMiddleware = middleware({
  request: async (request) => {
    return request.clone({
      context: {
        company: {
          id: 1
        }
      }
    });
  }
});

export const usersRoute = path('/users')
  .middlewares([companyMiddleware])
  .get(async (request) => {
    const users = await User.default.get((qs) =>
      qs.where({
        companyId: request.context.company.id
      })
    );
    return Response.json({ users });
  })
  .post(async (request) => {
    const validationResp = await userSchema.validate((await request.json()) as any, {});
    if (!validationResp.isValid) {
      return Response.json(
        {
          success: false,
          errors: validationResp.errors
        },
        { status: 400 }
      );
    }
    return Response.json({ success: true, data: await validationResp.save() });
  })
  .nested((path) => [
    path('/<id: number>').get(async (request) => {
      const user = await User.default.get((qs) => qs.where({ id: request.params.id }));
      return Response.json({ user: user[0] });
    })
  ]);
