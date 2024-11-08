// @ts-nocheck
import { middleware, Request } from '@palmares/server';

export const setUserIdMiddleware = middleware({
  /** If we type the Request that will now be required for the client. */
  request: async (request: Request<
    any,
    {
      headers: unknown & {
        'x-user-id': string;
      };
    }
  >) => {
    /** With a clone we will create a new Request in-place properly typed. */
    return request.clone({ context: { userId: request.headers['x-user-id'] } });
  },
});
