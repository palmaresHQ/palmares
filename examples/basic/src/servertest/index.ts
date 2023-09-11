import { domain } from '@palmares/core';
import { serverDomainModifier, path, Response, middleware, Request } from '@palmares/server';

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

export default domain('servertest', __dirname, {
  modifiers: [serverDomainModifier] as const,
  getRoutes: async () => {
    return path('/hello')
      .middlewares([authenticateRequest])

      .get(() => new Response());
  },
});
