import { models, ModelFields, AllOptionalModelFields } from '@palmares/databases';
import { BaseModel } from '@palmares/databases/src/models';

export class Post extends models.Model<Post>() {
  fields = {
    id: new models.fields.AutoField(),
    number: new models.fields.IntegerField({
      allowNull: true,
      defaultValue: 1,
    }),
    userUuid: new models.fields.ForeignKeyField({
      relatedTo: User,
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'uuid',
      relatedName: 'userPosts',
      relationName: 'user',
    }),
  };

  options = {
    tableName: 'post',
  };
}

export class User extends models.Model<User>() {
  fields = {
    id: new models.fields.AutoField(),
    firstName: new models.fields.CharField({ maxLength: 255, dbIndex: true }),
    lastName: new models.fields.CharField({ maxLength: 255, allowNull: true }),
    dependsOn: new models.fields.ForeignKeyField<string>({
      allowNull: true,
      relatedTo: 'User',
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'uuid',
      relatedName: 'dependents',
      relationName: 'user',
    }),
    uuid: new models.fields.UUIDField({ autoGenerate: true, unique: true }),
  };

  options = {
    tableName: 'user',
  };
}

type RelatedFieldOfModel<M extends BaseModel> = {
  [K in keyof M['fields'] as M['fields'][K] extends models.fields.ForeignKeyField<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    infer RNN
  >
    ? RNN
    : never]: M['fields'][K] extends models.fields.ForeignKeyField<
    any,
    infer RMIFF,
    any,
    any,
    any,
    any,
    any
  >
    ? ModelFields<RMIFF>
    : never;
};

type RelatedFieldToModel<
  M extends BaseModel,
  RM extends ReturnType<typeof models.Model>[]
> = RM extends [infer RMI, ...infer RMR extends (ReturnType<typeof models.Model>)[]]
  ? RMI extends ReturnType<typeof models.Model>
    ? {
        [K in keyof InstanceType<RMI>['fields'] as InstanceType<RMI>['fields'][K] extends models.fields.ForeignKeyField<
          any,
          infer RMIFF,
          any,
          any,
          any,
          any,
          infer RN
        >
          ? RMIFF extends M
            ? RN
            : never
          : never]: InstanceType<RMI>['fields'][K]['unique'] extends true
          ? ModelFields<InstanceType<RMI>>
          : ModelFields<InstanceType<RMI>>[];
      } & RelatedFieldToModel<M, RMR>
    : unknown
  : unknown;

type Teste = RelatedFieldToModel<User, [typeof Post]>;
const teste: Teste = {
  userPosts: [
    {
      id: 1,
      number: 1,
      userUuid: '12312313',
    },
  ],
};
