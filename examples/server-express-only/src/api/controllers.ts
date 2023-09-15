import { Response, pathNested } from '@palmares/server';

import type { baseRouter } from './routes';

const apiController = pathNested<typeof baseRouter>()('/api').get(async (request) => {
  return Response.json({
    hello: 'world',
  });
});

export default apiController;
