import { EngineQueryOrdering } from '@palmares/databases';
import { Order } from 'sequelize';

export default class SequelizeEngineQueryOrdering extends EngineQueryOrdering {
  async parseOrdering(ordering: (`${string}` | `-${string}`)[]): Promise<Order> {
    return ordering.map((order) => {
      const isDescending = order.startsWith('-');
      return [isDescending ? order.slice(1) : order, isDescending ? 'DESC' : 'ASC'];
    });
  }
}
