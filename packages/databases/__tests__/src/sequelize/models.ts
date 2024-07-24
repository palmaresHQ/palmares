import {
  AutoField, BooleanField, CharField, DateField, DecimalField, EnumField,
  ForeignKeyField, IntegerField, Manager, Model, ON_DELETE, TranslatableField, UuidField, define
} from '@palmares/databases';
import { DataTypes } from 'sequelize'; // Import the built-in data types

//import { Company as DCompany, User as DUser } from '../../.drizzle/schema';

import type { ModelOptionsType} from '@palmares/databases';

class Authentication extends Manager<CompanyAbstract> {
  test() {
    return 'test'
  }
}
export class CompanyAbstract extends Model<CompanyAbstract>() {
  fields = {
    address: CharField.new({ maxLength: 255, allowNull: true }),
    translatable: TranslatableField.new({
      translate: async () => {
        return {
          type: DataTypes.STRING,
        }
      },
      customToString: async () => {
        return {
          imports: [
            `const { DataTypes } = require('sequelize');`
          ],
          translateBody: `return { type: DataTypes.STRING }`
        }
      }
    })
  }
  options = {
    tableName: 'companies',
    abstract: true
  }

  static auth = new Authentication()
}

export const Company = define('Company', {
  fields:  {
    id: AutoField.new(),
    name: CharField.new({ maxLength: 255 }),
  },
  options: {
    tableName: 'companies',
    //instance: DCompany
  },
  abstracts: [CompanyAbstract],
  managers: {
    test: {
      async test(name: string) {
        return this.get({ search: { name }})
      }
    }
  }
});

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
    //instance: DUser
  }
}

