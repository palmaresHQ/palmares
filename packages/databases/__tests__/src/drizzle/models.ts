import {
  AutoField,
  BooleanField,
  CharField,
  DateField,
  DecimalField,
  EnumField,
  ForeignKeyField,
  IntegerField,
  ON_DELETE,
  UuidField,
  define,
  getDatabasesWithDefaultAdapter
} from '@palmares/databases';
import { type DrizzleDatabaseAdapter, text } from '@palmares/drizzle-engine';

import * as schemas from '../../.drizzle/schema';

const pd = getDatabasesWithDefaultAdapter<typeof DrizzleDatabaseAdapter>();
/*
class Authentication extends Manager<CompanyAbstract> {
  authenticate(username: string, password: string) {
    return 'test';
  }
}*/

export const CompanyAbstract = pd.define('CompanyAbstract', {
  fields: {
    address: pd.fields.char({ maxLen: 255 })
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
    name: pd.fields.char({ maxLen: 255 }),
    custom: text({ length: 255 }).notNull()
  },
  options: {
    tableName: 'companies',
    instance: schemas.Company
  }
});

export const ProfileType = pd.define('ProfileType', {
  fields: {
    id: pd.fields.auto(),
    name: pd.fields.char({ maxLen: 255 })
  },
  options: {
    tableName: 'profile_type',
    instance: schemas.ProfileType
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
    tableName: 'users',
    instance: schemas.User
  }
});
