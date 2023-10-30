import { NotImplementedAdapterException } from '../exceptions';

/**
 * A simple ordering adapter, this is used to order the query.
 *
 * This is used for handling ordering in your queries, we decided to move it out from the `AdapterGetQuery` in order to handle ordering separately from only the `.get` query.
 * Ordering the query is as simple as passing an array of string, each string contains the name of the field alongside a `-` if it's descending.
 */
export function adapterOrderingQuery<TFunctionParseOrdering extends AdapterOrderingQuery['parseOrdering']>(args: {
  /**
   * Ordering the query is as simple as passing an array of string, each string contains the name of the field alongside a `-` if it's descending.
   *
   * - `['name']` - Order by name ascending.
   * - `['-name']` - Order by name descending.
   *
   * A simple Sequelize example would be:
   * @example
   * ```ts
   * import { Order } from 'sequelize';
   *
   * function async parseOrdering(ordering): Promise<Order> => {
   *   return ordering.map((order) => {
   *     const isDescending = order.startsWith('-');
   *     return [isDescending ? order.slice(1) : order, isDescending ? 'DESC' : 'ASC'];
   *   });
   * }
   * ```
   *
   * @param _ordering - The ordering to parse.
   *
   * @returns - Returns the parsed ordering to be used on your query.
   */
  parseOrdering: TFunctionParseOrdering;
}) {
  class CustomAdapterOrderingQuery extends AdapterOrderingQuery {
    parseOrdering = args.parseOrdering as TFunctionParseOrdering;
  }

  return CustomAdapterOrderingQuery as typeof AdapterOrderingQuery & {
    new (): AdapterOrderingQuery & { parseOrdering: TFunctionParseOrdering };
  };
}

/**
 * This is used for handling ordering in your queries, we decided to move it out from the `AdapterGetQuery` in order to handle ordering separately from only the `.get` query.
 * Ordering the query is as simple as passing an array of string, each string contains the name of the field alongside a `-` if it's descending.
 */
export default class AdapterOrderingQuery {
  /**
   * Ordering the query is as simple as passing an array of string, each string contains the name of the field alongside a `-` if it's descending.
   *
   * - `['name']` - Order by name ascending.
   * - `['-name']` - Order by name descending.
   *
   * A simple Sequelize example would be:
   * @example
   * ```ts
   * import { Order } from 'sequelize';
   *
   * function async parseOrdering(ordering): Promise<Order> => {
   *   return ordering.map((order) => {
   *     const isDescending = order.startsWith('-');
   *     return [isDescending ? order.slice(1) : order, isDescending ? 'DESC' : 'ASC'];
   *   });
   * }
   * ```
   *
   * @param _ordering - The ordering to parse.
   *
   * @returns - Returns the parsed ordering to be used on your query.
   */
  async parseOrdering(_ordering: (`${string}` | `-${string}`)[]): Promise<any> {
    throw new NotImplementedAdapterException('parseOrdering');
  }
}
