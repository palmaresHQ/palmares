// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { Model, ON_DELETE, auto, char, define, fields, foreignKey, text } from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases';

export class Company extends Model<Company>() {
  fields = {
    id: fields.auto(),
    name: fields.char({ maxLen: 255 }),
    slug: fields.char({ maxLen: 255 }),
    isActive: fields.bool().default(true)
  };

  options = {
    tableName: 'company'
    // We use satisfies here so we can still infer and you don't lose intellisense.
  } satisfies ModelOptionsType<Company>;
}

export const User = define('User', {
  fields: {
    id: auto(),
    firstName: char({ maxLen: 255 }),
    lastName: char({ maxLen: 255 }),
    email: text().allowNull(),
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
