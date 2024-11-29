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
  define,
  getDatabasesWithDefaultAdapter
} from '@palmares/databases';
import * as drzl from '@palmares/drizzle-engine/drizzle';
import { profile } from 'node:console';
import { createServer } from 'node:http2';

import type * as d /*{ Company as DCompany, User as DUser }*/ from '../../.drizzle/schema';
import type { ModelOptionsType } from '@palmares/databases';
import type { DrizzleDatabaseAdapter } from '@palmares/drizzle-engine';

const pd = getDatabasesWithDefaultAdapter<typeof DrizzleDatabaseAdapter>();
/*
class Authentication extends Manager<CompanyAbstract> {
  authenticate(username: string, password: string) {
    return 'test';
  }
}*/

export const CompanyAbstract = pd.define('CompanyAbstract', {
  fields: {
    address: pd.fields.char({ maxLen: 255 }).allowNull()
  },
  options: {
    tableName: 'companies',
    abstract: true
  },
  managers: {
    auth: {
      authenticate: async () => {
        return CompanyAbstract.default.get((qs) => qs.where({ address: 'test' }));
      }
    }
  }
});

/*
export class CompanyAbstract extends Model<CompanyAbstract>() {
  fields = {
    address: CharField.new({ maxLen: 255 }).allowNull()
  };
  options = {
    tableName: 'companies',
    abstract: true
  };

  static auth = new Authentication();
}*/

export const Company = pd.define('Company', {
  fields: {
    id: pd.fields.auto(),
    uuid: pd.fields.uuid().auto(),
    name: pd.fields.char({ maxLen: 255 })
  },
  options: {
    tableName: 'companies'
    //instance: DCompany
  },
  abstracts: [CompanyAbstract],
  managers: {
    test: {
      async test2(name: string) {
        return Company.default.get((qs) => qs.where({ name }));
      }
    }
  }
});

export const ProfileType = pd.define('ProfileType', {
  fields: {
    id: pd.fields.auto(),
    name: pd.fields.char({ maxLen: 255 })
  },
  options: {
    tableName: 'profile_type'
  }
});

//*********************************/
//**      Modelos Palmares       **/
//*********************************/

export const User = define('User', {
  fields: {
    id: AutoField.new().databaseName('user_id'),
    uuid: UuidField.new(),
    name: CharField.new({ maxLen: 280 }).allowNull().dbIndex(),
    age: IntegerField.new().dbIndex(),
    userType: EnumField.new({ choices: ['admin', 'user'] }),
    price: DecimalField.new({ maxDigits: 5, decimalPlaces: 2 }).allowNull(),
    isActive: BooleanField.new().default(true),
    companyId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfCompany',
      relationName: 'company2',
      toField: 'id',
      relatedTo: () => Company
    }),
    profileTypeId: pd.fields
      .foreignKey({
        onDelete: ON_DELETE.CASCADE,
        relatedName: 'usersOfProfileType',
        relationName: 'profileType',
        toField: 'id',
        relatedTo: () => ProfileType
      })
      .setCustomAttributes({
        options: {
          $default: ['() => drzl.sql`uuid_generate_v4()`']
        }
      }),
    updatedAt: DateField.new().autoNow(),
    createdAt: DateField.new().autoNowAdd()
  },
  options: {
    tableName: 'users'
    // instance: DUser
  }
});
