/* eslint-disable @typescript-eslint/no-unused-vars */
import { adapterQuery } from '@palmares/databases';
import SequelizeEngineGetQuery from './get';
import SequelizeEngineSetQuery from './set';
import SequelizeEngineRemoveQuery from './remove';
import SequelizeEngineSearchQuery from './search';
import SequelizeEngineQueryOrdering from './ordering';

export default adapterQuery({
  get: new SequelizeEngineGetQuery(),
  set: new SequelizeEngineSetQuery(),
  remove: new SequelizeEngineRemoveQuery(),
  search: new SequelizeEngineSearchQuery(),
  ordering: new SequelizeEngineQueryOrdering(),
});
