import { schemaHandler } from '@palmares/schemas';
import { Response, pathNested } from '@palmares/server';

import { InventoryItem } from './models';
import { serverInventorySchema } from './schemas';
import { getItemByCursor } from './services';

import type { editInventoryPath, inventoryPath } from './routes';

export const inventoryController = pathNested<typeof inventoryPath>()('?cursor=number?')
  .post(schemaHandler(serverInventorySchema))
  .get(async (request) => {
    const { data, nextCursor } = await getItemByCursor(request.query.cursor as number | undefined);
    return Response.json({
      data,
      nextCursor
    });
  });

export const editInventoryController = pathNested<typeof editInventoryPath>()()
  .put(schemaHandler(serverInventorySchema))
  .delete(async (request) => {
    await InventoryItem.default.remove({ search: { uuid: request.params.uuid } });
    return Response.json({ message: 'deleted' });
  });
