import { arrayUserSchema } from '@examples/with-code-share-shared';
import { and, desc, like, lt } from 'drizzle-orm';

import { User as DUser } from '../../drizzle/schema';
import { db } from '../settings';

export async function getUsersByCursorAndSearch(cursor?: number, search?: string) {
  const queryForCursor = lt(DUser.id, cursor as number);
  const splittedSearch = (search || '').split(' ');

  const queryForSearch =
    splittedSearch.length > 1
      ? and(
          like(DUser.firstName, `%${splittedSearch[0]}%`),
          like(DUser.lastName, `%${splittedSearch.slice(1).join(' ')}%`)
        )
      : like(DUser.firstName, `%${search}%`);
  const searchQuery =
    typeof cursor === 'number' && search
      ? and(queryForCursor, queryForSearch)
      : typeof cursor === 'number'
        ? queryForCursor
        : search
          ? queryForSearch
          : undefined;

  const users = await db.select().from(DUser).where(searchQuery).limit(30).orderBy(desc(DUser.id));
  const data = await arrayUserSchema.data(users);
  const nextCursor = users.length > 0 ? users[users.length - 1].id : null;

  return {
    data,
    nextCursor
  };
}
