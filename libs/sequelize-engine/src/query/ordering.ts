import { adapterOrderingQuery } from '@palmares/databases';
import { Order } from 'sequelize';

export default adapterOrderingQuery({
  parseOrdering: async (ordering): Promise<Order> => {
    return ordering.map((order) => {
      const isDescending = order.startsWith('-');
      return [isDescending ? order.slice(1) : order, isDescending ? 'DESC' : 'ASC'];
    });
  },
});
