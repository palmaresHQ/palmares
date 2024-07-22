import { adapterOrderingQuery } from '@palmares/databases';

import type { Order } from 'sequelize';

export default adapterOrderingQuery({
  // eslint-disable-next-line ts/require-await
  parseOrdering: async (_, ordering): Promise<Order> => {
    return ordering.map((order) => {
      const isDescending = order.startsWith('-');
      return [isDescending ? order.slice(1) : order, isDescending ? 'DESC' : 'ASC'];
    });
  },
});
