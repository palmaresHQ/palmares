import { arrayInventorySchema } from '@examples/with-code-share-shared';

import { InventoryItem } from './models';
import { User } from '../auth/models';

export async function getItemByCursor(cursor?: number | null) {
  const items = await InventoryItem.default.get({
    limit: 20,
    search:
      typeof cursor === 'number'
        ? {
            id: {
              lessThan: cursor
            }
          }
        : undefined,
    ordering: ['-id'],
    includes: [
      {
        model: User,
        fields: ['email', 'firstName', 'lastName']
      }
    ]
  });
  const data = await arrayInventorySchema.data(items);
  const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

  return {
    data,
    nextCursor
  };
}
