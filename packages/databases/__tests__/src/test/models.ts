import { AutoField, BooleanField, CharField, DateField, DecimalField, EnumField, ForeignKeyField, IntegerField, Model, ON_DELETE, UuidField } from '@palmares/databases';

import { Company as DCompany, User as DUser } from '../../.drizzle/schema';

import type { ModelOptionsType} from '@palmares/databases';

export class User extends Model<User>() {
  fields = {
    id: AutoField.new(),
    uuid: UuidField.new({
      autoGenerate: true
    }),
    name: CharField.new({ maxLength: 255, dbIndex: true, allowNull: true }),
    age: IntegerField.new({ dbIndex: true }),
    userType: EnumField.new({ choices: ['admin', 'user'], defaultValue: 'admin' }),
    price: DecimalField.new({ maxDigits: 5, decimalPlaces: 2, allowNull: true }),
    isActive: BooleanField.new({ defaultValue: true }),
    companyId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfCompany',
      relationName: 'company',
      toField: 'id',
      relatedTo: Company
    }),
    updatedAt: DateField.new({ autoNow: true }),
    createdAt: DateField.new({ autoNowAdd: true }),
  }

  options: ModelOptionsType<User> = {
    tableName: 'users',
    instance: DUser
  }
}

export class Company extends Model<Company>() {
  fields = {
    id: AutoField.new(),
    name: CharField.new({ maxLength: 255 }),
    address: CharField.new({ maxLength: 255, allowNull: true }),
  }

  options: ModelOptionsType<Company> = {
    tableName: 'companies',
    instance: DCompany
  }
}
