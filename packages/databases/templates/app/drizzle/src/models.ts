// eslint-disable-next-line ts/ban-ts-comment
// @ts-nocheck
import { Model, ON_DELETE, auto, bool, char, define, foreignKey, text } from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases';

export class Company extends Model<Company>() {
  fields = {
    id: auto(),
    name: char({ maxLen: 255 }),
    slug: char({ maxLen: 255 }),
    isActive: bool().default(true)
  };

  options = {
    tableName: 'company'
  } satisfies ModelOptionsType<Company>; // We use satisfies here so we can still infer and you don't lose intellisense.
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
  }
});
