import { AbstractUser } from '@examples/with-code-share-shared';
import { define } from '@palmares/databases';

import { User as DUser } from '../../drizzle/schema';

export const User = define('User', {
  fields: {},
  abstracts: [AbstractUser],
  options: {
    tableName: 'user'
    //instance: DUser
  }
});
