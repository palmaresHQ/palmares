/*import {
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
} from '@palmares/databases';*/

import { define, fields, Model, ON_DELETE, InferModel } from '@palmares/databases';
//import { Company as DCompany, User as DUser } from '../../.drizzle/schema';

import type { ModelOptionsType } from '@palmares/databases';

/*class Authentication extends Manager<CompanyAbstract> {
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
    uuid: UuidField.new().auto(),
    name: CharField.new({ maxLen: 255 })
  },
  abstracts: [CompanyAbstract],
  options: {
    tableName: 'companies'
    //instance: DCompany
  },
  managers: {
    test: {
      async test(name: string) {
        return this.get((qs) => qs.where({ name }));
      }
    }
  }
});

export const ProfileType = define('ProfileType', {
  fields: {
    id: AutoField.new(),
    name: CharField.new({ maxLen: 255 })
  },
  options: {
    tableName: 'profile_type'
  }
});

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
      relatedTo: () => Company
    }),
    profileTypeId: ForeignKeyField.new({
      relatedName: 'usersByProfileType',
      relationName: 'profileType',
      relatedTo: () => ProfileType,
      toField: 'id',
      onDelete: ON_DELETE.CASCADE
    })
      .allowNull()
      .default(null),
    updatedAt: DateField.new().autoNow(),
    createdAt: DateField.new().autoNowAdd()
  };

  options = {
    tableName: 'users'
    // instance: DUser
  } satisfies ModelOptionsType<User>;
}*/

export class Company extends Model<Company>() {
  fields = {
    id: fields.auto(),
    name: fields.char({ maxLen: 255 }),
    isActive: fields.bool().default(true)
  };
}

export const User = define('User', {
  fields: {
    id: fields.auto(),
    firstName: fields.char({ maxLen: 255 }),
    email: fields.text().allowNull(),
    companyId: fields.foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE
    })
  }
});
