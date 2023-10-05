import EngineGetQuery from './get';
import EngineRemoveQuery from './remove';
import EngineQuerySearch from './search';
import EngineQueryOrdering from './ordering';
import EngineSetQuery from './set';

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
export default class EngineQuery {
  get: EngineGetQuery = new EngineGetQuery();
  set: EngineSetQuery = new EngineSetQuery();
  remove: EngineRemoveQuery = new EngineRemoveQuery();
  search: EngineQuerySearch = new EngineQuerySearch();
  ordering: EngineQueryOrdering = new EngineQueryOrdering();
}

export { EngineGetQuery, EngineQuerySearch, EngineSetQuery, EngineRemoveQuery, EngineQueryOrdering };
