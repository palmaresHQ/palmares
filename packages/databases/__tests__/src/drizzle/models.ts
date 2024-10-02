import {
  AutoField,
  BooleanField,
  CharField,
  DateField,
  DecimalField,
  EnumField,
  ForeignKeyField,
  IntegerField,
  Manager,
  Model,
  ON_DELETE,
  UuidField,
  define
} from '@palmares/databases';

import { Company as DCompany, User as DUser } from '../../.drizzle/schema';

import type { ModelOptionsType } from '@palmares/databases';

class Authentication extends Manager<CompanyAbstract> {
  test() {
    return 'test';
  }
}
export class CompanyAbstract extends Model<CompanyAbstract>() {
  fields = {
    address: CharField.new({ maxLen: 255 }).allowNull()
  };
  options = {
    tableName: 'companies',
    abstract: true
  };

  static auth = new Authentication();
}

export const Company = define('Company', {
  fields: {
    id: AutoField.new(),
    uuid: UuidField.new().autoGenerate(),
    name: CharField.new({ maxLen: 255 })
  },
  options: {
    tableName: 'companies'
    //instance: DCompany
  },
  abstracts: [CompanyAbstract],
  managers: {
    test: {
      async test(name: string) {
        return this.get((qs) => qs.where({ name }));
      }
    }
  }
});

//*********************************/
//**      Modelos Palmares       **/
//*********************************/
export class User extends Model<User>() {
  fields = {
    id: AutoField.new(),
    uuid: UuidField.new(),
    name: CharField.new({ maxLen: 280 }).allowNull().dbIndex(),
    age: IntegerField.new().dbIndex(),
    userType: EnumField.new({ choices: ['admin', 'user'] }),
    price: DecimalField.new({ maxDigits: 5, decimalPlaces: 2 }).allowNull(),
    isActive: BooleanField.new().default(true),
    companyId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfCompany',
      relationName: 'company',
      toField: 'id',
      relatedTo: 'Company'
    }),
    company2Id: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfCompany2',
      relationName: 'company',
      toField: 'id',
      relatedTo: 'Company'
    }),
    updatedAt: DateField.new().autoNow(),
    createdAt: DateField.new().autoNowAdd()
  };

  options: ModelOptionsType<User> = {
    tableName: 'users'
    // instance: DUser
  };
}
