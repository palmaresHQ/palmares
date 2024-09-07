import { define } from '@palmares/databases';
import { AbstractUser } from 'shared';

import { User as DUser } from '../../drizzle/schema';

export const User = define('User', {
  fields: {},
  abstracts: [AbstractUser],
  options: {
    tableName: 'user',
    instance: DUser
  }
});
