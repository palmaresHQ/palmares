import {
  AutoField,
  CharField,
  DateField,
  ForeignKeyField,
  IntegerField,
  Model,
  ON_DELETE,
  TranslatableField,
  define
} from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases';

export const Company = define('Company', {
  fields: {
    id: AutoField.new(),
    name: CharField.new({ maxLength: 255 }),
    translatable: TranslatableField.new({
      // eslint-disable-next-line ts/require-await
      translate: async () => {
        return `d.real('translatable')`;
      }
    })
  },
  options: {
    tableName: 'companies'
  }
});

export class User extends Model<User>() {
  fields = {
    id: AutoField.new(),
    companyId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfCompany',
      relationName: 'company',
      toField: 'id',
      relatedTo: Company
    }),
    name: CharField.new({ maxLength: 255, dbIndex: true, allowNull: true }),
    age: IntegerField.new({ dbIndex: true }),
    updatedAt: DateField.new({ autoNow: true }),
    createdAt: DateField.new({ autoNowAdd: true })
  };

  options: ModelOptionsType<User> = {
    tableName: 'users'
  };
}
