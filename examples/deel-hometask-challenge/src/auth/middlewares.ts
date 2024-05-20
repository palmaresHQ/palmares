import { middleware, Request, Response } from '@palmares/server';
import { Profile } from './models';

export const getProfileMiddleware = middleware({
  request: async (request) => {
    const requestWithHeaders = request as Request<string, { headers: { profile_id: string } }>;

    const profiles = await Profile.default.get({
      search: { id: parseInt(requestWithHeaders.headers['profile_id']) || 0 },
    });
    if (!profiles || profiles.length == 0) return Response.text('', { status: 401 });
    // from the middleware definition!!!
    const clonedRequest = request.clone({ context: { profile: profiles[0], anotherValue: 1234 } });
    return clonedRequest;
  },
});
