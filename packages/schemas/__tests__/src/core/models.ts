import {
  AutoField,
  CharField,
  DateField,
  ForeignKeyField,
  IntegerField,
  Model,
  ON_DELETE,
  define
} from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases';

export const Company = define('Company', {
  fields: {
    id: AutoField.new(),
    name: CharField.new({ maxLen: 255 }),
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
    name: CharField.new({ maxLen: 255 }).dbIndex().allowNull(),
    age: IntegerField.new().dbIndex(),
    updatedAt: DateField.new().dbIndex(),
    createdAt: DateField.new().autoNowAdd()
  };

  options: ModelOptionsType<User> = {
    tableName: 'users'
  };
}
