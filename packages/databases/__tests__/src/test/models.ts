import { AutoField, CharField, DateField, EnumField, ForeignKeyField, IntegerField, Model, ModelOptionsType, ON_DELETE, UuidField } from '@palmares/databases';
//import { User as DrizzleUser, Company as DrizzleCompany } from '../../.drizzle/schema'
export class User extends Model<User>() {
  fields = {
    id: AutoField.new(),
    name: CharField.new({ maxLength: 255, dbIndex: true, allowNull: true }),
    age: IntegerField.new({ dbIndex: true }),
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
  }
}

export class Company extends Model<Company>() {
  fields = {
    id: AutoField.new(),
    name: CharField.new({ maxLength: 255 }),
    address: CharField.new({ maxLength: 255 }),
  }

  options: ModelOptionsType<Company> = {
    tableName: 'companies',
  }
}
