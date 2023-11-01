import AdapterGetQuery from './get';
import AdapterRemoveQuery from './remove';
import AdapterSearchQuery from './search';
import AdapterOrderingQuery from './ordering';
import AdapterSetQuery from './set';

/**
 * Offers >>>>BASIC<<<< querying functionalities, this enables us to create libs that works well on every
 * database engine without needing to specify a database engine. We usually advise AGAINST using this on
 * real projects since this is not really well optimized for many operations like joins, select only a bunch of fields
 * and so on.
 *
 * By default this will query for all of the fields in the database, so they are all non optimized. It's preferred
 * to use the engine directly for querying. Although this not advised this enables us to create functionalities
 * that can work well on every engine. This is also really easy to implement for people that want to create new
 * database engines. Besides that something that it enable us is to create distributed databases, that are
 * in multiple servers
 *
 * The basic methods `get`, `set` and `remove` have the API idea taken of the browser's `localhost` and also
 * from `redis`. This guarantees this can work on most kind of databases without issues.
 */
export function adapterQuery<
  TGet extends AdapterGetQuery,
  TSet extends AdapterSetQuery,
  TRemove extends AdapterRemoveQuery,
  TSearch extends AdapterSearchQuery,
  TOrdering extends AdapterOrderingQuery,
>(args: { get: TGet; set: TSet; remove: TRemove; search: TSearch; ordering: TOrdering }) {
  class CustomAdapterQuery extends AdapterQuery {
    get = args.get;
    set = args.set;
    remove = args.remove;
    search = args.search;
    ordering = args.ordering;
  }

  return CustomAdapterQuery as typeof AdapterQuery & {
    new (): AdapterQuery & { get: TGet; set: TSet; remove: TRemove; search: TSearch; ordering: TOrdering };
  };
}

/**
 * Offers >>>>BASIC<<<< querying functionalities, this enables us to create libs that works well on every
 * database engine without needing to specify a database engine. We usually advise AGAINST using this on
 * real projects since this is not really well optimized for many operations like joins, select only a bunch of fields
 * and so on.
 *
 * By default this will query for all of the fields in the database, so they are all non optimized. It's preferred
 * to use the engine directly for querying. Although this not advised this enables us to create functionalities
 * that can work well on every engine. This is also really easy to implement for people that want to create new
 * database engines. Besides that something that it enable us is to create distributed databases, that are
 * in multiple servers
 *
 * The basic methods `get`, `set` and `remove` have the API idea taken of the browser's `localhost` and also
 * from `redis`. This guarantees this can work on most kind of databases without issues.
 */
export default class AdapterQuery {
  get: AdapterGetQuery = new AdapterGetQuery();
  set: AdapterSetQuery = new AdapterSetQuery();
  remove: AdapterRemoveQuery = new AdapterRemoveQuery();
  search: AdapterSearchQuery = new AdapterSearchQuery();
  ordering: AdapterOrderingQuery = new AdapterOrderingQuery();
}
