import { adapterQuery } from '@palmares/databases';

import SequelizeEngineGetQuery from './get';
import SequelizeEngineQueryOrdering from './ordering';
import SequelizeEngineRemoveQuery from './remove';
import SequelizeEngineSearchQuery from './search';
import SequelizeEngineSetQuery from './set';

export default adapterQuery({
  get: new SequelizeEngineGetQuery(),
  set: new SequelizeEngineSetQuery(),
  remove: new SequelizeEngineRemoveQuery(),
  search: new SequelizeEngineSearchQuery(),
  ordering: new SequelizeEngineQueryOrdering(),
});
