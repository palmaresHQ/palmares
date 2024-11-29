//@ts-nocheck
import {
  Model,
  define,
  auto,
  char,
  text,
  bool,
  ON_DELETE
} from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases'
import { table } from 'console';

/**
 * You can define your models using classes.
 */
export class Company extends Model<Company>() {
  fields = {
    id: auto(),
    name: char({ maxLen: 255 }),
    slug: char({ maxLen: 255 }),
    isActive: bool().default(true)
  }

  options =  {
    tableName: 'company'
  } satisfies ModelOptionsType<Company> // We use satisfies here so we can still infer and you don't lose intellisense.
}

/**
 * You can define your models using the `define` function.
 *
 * This is just a syntax sugar for the class-based approach.
 */
export const User = define('User', {
  fields: {
    id: auto(),
    firstName: char({ maxLen: 255 }),
    lastName: char({ maxLen: 255 }).allowNull().allowBlank(),
    password: text(),
    email: text(),
    companyId: foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE
    })
  },
  options: {
    tableName: 'user'
  }
});


