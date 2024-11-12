import { databasesDomain as DatabasesDomain } from './domain';
import { model as Model, Model as ModelBaseClass } from './models';
import * as fields from './models/fields';
import { AutoField, CharField, ForeignKeyField, ON_DELETE, TextField } from './models/fields';
import { Manager } from './models/manager';
import { initialize, model } from './models/model';
import { type ForeignKeyModelsRelatedName, type ForeignKeyModelsRelationName, QuerySet } from './queries/queryset';

import type { DatabaseAdapter } from './engine';

export { Manager };
export { GetQuerySet, QuerySet, RemoveQuerySet, SetQuerySet } from './queries/queryset';
export { ON_DELETE } from './models/fields';
export * from './types';
export { DatabaseAdapter, databaseAdapter } from './engine';
export { AdapterQuery, adapterQuery } from './engine/query';
export { AdapterOrderingQuery, adapterOrderingQuery } from './engine/query/ordering';
export { AdapterSearchQuery, adapterSearchQuery } from './engine/query/search';
export { AdapterGetQuery, adapterGetQuery } from './engine/query/get';
export { AdapterSetQuery, adapterSetQuery } from './engine/query/set';
export { AdapterRemoveQuery, adapterRemoveQuery } from './engine/query/remove';
export { AdapterModels, adapterModels } from './engine/model';
export { AdapterFields, adapterFields } from './engine/fields';
export { AdapterMigrations, adapterMigrations } from './engine/migrations';
export { AdapterAutoFieldParser, adapterAutoFieldParser } from './engine/fields/auto';
export { AdapterBigAutoFieldParser, adapterBigAutoFieldParser } from './engine/fields/big-auto';
export { AdapterBigIntegerFieldParser, adapterBigIntegerFieldParser } from './engine/fields/big-integer';
export { AdapterCharFieldParser, adapterCharFieldParser } from './engine/fields/char';
export { AdapterDateFieldParser, adapterDateFieldParser } from './engine/fields/date';
export { AdapterDecimalFieldParser, adapterDecimalFieldParser } from './engine/fields/decimal';
export { AdapterForeignKeyFieldParser, adapterForeignKeyFieldParser } from './engine/fields/foreign-key';
export { AdapterIntegerFieldParser, adapterIntegerFieldParser } from './engine/fields/integer';
export { AdapterTextFieldParser, adapterTextFieldParser } from './engine/fields/text';
export { AdapterUuidFieldParser, adapterUuidFieldParser } from './engine/fields/uuid';
export { AdapterEnumFieldParser, adapterEnumFieldParser } from './engine/fields/enum';
export { AdapterFieldParser, adapterFieldParser } from './engine/fields/field';
export { AdapterBooleanFieldParser, adapterBooleanFieldParser } from './engine/fields/boolean';
export * from './engine/types';
export {
  model as Model,
  Model as ModelBaseClass,
  initialize as define,
  BaseModel as InternalModelClass_DoNotUse
} from './models';
export * as fields from './models/fields';
export const models = {
  fields,
  Model,
  ModelBaseClass
};
export { AutoField, auto } from './models/fields/auto';
export { BigAutoField, bigAuto } from './models/fields/big-auto';
export { BigIntegerField, bigInt } from './models/fields/big-integer';
export { CharField, char } from './models/fields/char';
export { DateField, date } from './models/fields/date';
export { DecimalField, decimal } from './models/fields/decimal';
export { Field } from './models/fields/field';
export { ForeignKeyField, foreignKey } from './models/fields/foreign-key';
export { IntegerField, int } from './models/fields/integer';
export { TextField, text } from './models/fields/text';
export { UuidField, uuid } from './models/fields/uuid';
export { EnumField, choice } from './models/fields/enum';
export { BooleanField, bool } from './models/fields/boolean';

export * from './models/types';
export * as actions from './migrations/actions';
export { Migration } from './migrations/migrate/migration';
export { Databases } from './databases';
export type { DatabaseDomainInterface } from './interfaces';
export { databaseDomainModifier } from './domain';
export { generateUUID } from './utils/index';
export { queryset } from './queries/utils';
export { databasesBinDomainBuilder } from './bin';

export type { ForeignKeyModelsRelatedName, ForeignKeyModelsRelationName } from './queries/queryset';
export { DatabasesDomain };
export { setDatabaseConfig } from './standalone';
export default DatabasesDomain;
/*
class Test extends Manager {
  createUser(aqui: string) {
    //return this.get({ fields: ['firstName'] });
  }
}

class Profile extends Model<Profile>() {
  fields = {
    id: AutoField.new(),
    type: CharField.new({ maxLen: 12 }),
    userId: ForeignKeyField.new({
      relatedName: 'profilesOfUser',
      relationName: 'user',
      relatedTo: (_: { create: string; read: string; update: string }) => baseUserInstance,
      toField: 'id',
      onDelete: ON_DELETE.CASCADE
    })
  };

  options = {
    tableName: 'profile'
  };
}

const Contract = initialize('Contract', {
  fields: {
    id: AutoField.new(),
    name: CharField.new({ maxLen: 12 })
  },
  options: {
    tableName: 'contract'
  }
});

const User2 = initialize('AbstractUser', {
  fields: {
    firstName: TextField.new()
  },
  options: {
    abstract: true
  },
  managers: {
    test: new Test()
  }
});

const baseUserInstance = initialize('User', {
  fields: {
    lastName: CharField.new({ maxLen: 12 }).allowNull(),
    profileId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfProfile',
      relationName: 'profile',
      relatedTo: () => Profile,
      toField: 'type'
    })
      .allowNull(true)
      .unique(true),
    contractId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfContract',
      relationName: 'contract',
      relatedTo: () => Contract,
      toField: 'id'
    }),
    contractorId: ForeignKeyField.new({
      onDelete: ON_DELETE.CASCADE,
      relatedName: 'usersOfContractor',
      relationName: 'contractor',
      relatedTo: () => Contract,
      toField: 'id'
    })
  },
  options: {
    tableName: 'user'
  },
  abstracts: [User2]
});
*/
//const qs = QuerySet.new<InstanceType<typeof baseUserInstance>, 'set'>('set');
/*
const newQs = QuerySet.new<Profile, 'get'>('get').join(baseUserInstance, 'usersOfProfile', (qs) =>
  qs.where({ firstName: 'a' })
);
newQs['__queryTheData'](Profile, undefined as any);

const qs = QuerySet.new<InstanceType<typeof baseUserInstance>, 'set'>('set').join(Profile, 'profile', (qs) =>
  qs.where({ type: 'admin' })
);
qs['__queryTheData'](baseUserInstance, undefined as any);
*/
/*
const newQs2 = QuerySet.new<Profile, 'set'>('set').join(baseUserInstance, 'usersOfProfile', (qs) =>
  qs.where({ firstName: 'a' })
);
newQs2['__queryTheData'](Profile, undefined as any);
*/
/*
const modelOfDA = await baseUserInstance.default.getInstance<DatabaseAdapter<InstanceType<typeof baseUserInstance>>>();
const test2 = await baseUserInstance.default.get((qs) =>
  qs.where({
    firstName: {
      and: ['a', 'b']
    }
  })
);
test2.firstName;
//test2.profile.type;
/*const test = await Profile.default.get((qs) =>
  qs.join(baseUserInstance, 'usersOfProfile', (qs) => qs.select(['firstName']))
);
*/
