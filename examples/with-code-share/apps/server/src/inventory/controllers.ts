import { schemaHandler } from '@palmares/schemas';
import { Response, middleware, pathNested } from '@palmares/server';

import { InventoryItem } from './models';
import { serverInventorySchema } from './schemas';
import { getItemByCursor } from './services';

import type { editInventoryPath, inventoryPath } from './routes';

const authMiddleware = middleware({
  // eslint-disable-next-line ts/require-await
  request: async (request) => {
    const cloned = request.clone<{
      headers: {
        'X-Session': string;
      };
    }>();

    // AQUI EU VALIDO A SESSAO DO USUARIO
    cloned.headers['X-Session'];
    return cloned;
  }
});

const validationMiddleware = middleware({
  // eslint-disable-next-line ts/require-await
  request: async (request) => {
    const cloned = request.clone<{
      headers: {
        Accept: 'application/json';
      };
    }>();

    /// AQUI EU FAÇO UMA VALIDAÇÃO
    cloned.headers['Accept'] = 'application/json';
    return cloned;
  }
});

export const inventoryController = pathNested<typeof inventoryPath>()('?cursor=number?')
  .post(schemaHandler(serverInventorySchema))
  .get(
    async (request) => {
      const { data, nextCursor } = await getItemByCursor(request.query.cursor as number | undefined);
      return Response.json({
        data,
        nextCursor
      });
    },
    {
      middlewares: [authMiddleware, validationMiddleware] as const
    }
  );

export const editInventoryController = pathNested<typeof editInventoryPath>()()
  .put(schemaHandler(serverInventorySchema))
  .delete(async (request) => {
    await InventoryItem.default.remove({ search: { uuid: request.params.uuid } });
    return Response.json({ message: 'deleted' });
  });
