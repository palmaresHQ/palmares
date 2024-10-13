import { Response, path, pathNested } from '@palmares/server';

import { getUsersByCursorAndSearch } from './services';

import type { usersPath } from './routes';

export const getUsersController = pathNested<typeof usersPath>()().get(async (request) => {
  const { data, nextCursor } = await getUsersByCursorAndSearch(
    request.query.cursor as number | undefined,
    request.query.search
  );
  return Response.json({
    data,
    nextCursor
  });
});
