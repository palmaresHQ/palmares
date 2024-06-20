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
    const clonedRequest = requestWithHeaders.clone({
      context: { profile: profiles[0], helloWorld: 1234, olaBruno: 'string', dataFromMiddleware: 'admin@admin.com' },
    });
    return clonedRequest;
  },
});
