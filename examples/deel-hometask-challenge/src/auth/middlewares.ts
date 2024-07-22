import { Response, middleware } from '@palmares/server';

import { Profile } from './models';

import type { Request} from '@palmares/server';

export const getProfileMiddleware = middleware({
  request: async (request) => {
    const requestWithHeaders = request as Request<string, { headers: { profile_id: string } }>;

    const profiles = await Profile.default.get({
      search: { id: parseInt(requestWithHeaders.headers['profile_id']) || 0 },
    });
    if (!profiles || profiles.length == 0) return Response.text('', { status: 401 });
    // from the middleware definition!!!
    const clonedRequest = requestWithHeaders.clone({
      context: { profile: profiles[0],  user: {id: 1, name: 'João'}, dataFromMiddleware: 'admin@admin.com' },
    });
    return clonedRequest;
  },
});
