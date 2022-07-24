import { ModelOptionsType, models, ModelFields } from '@palmares/databases';

export class Post extends models.Model {
  fields = {
    id: new models.fields.AutoField(),
    number: new models.fields.IntegerField({
      allowNull: true,
      defaultValue: 1
    }),
    userUuid: new models.fields.ForeignKeyField({
      relatedTo: User,
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'uuid'
    })
  }

  options: ModelOptionsType<this> = {
    tableName: 'post',
  }
}

export class User extends models.Model {
  fields = {
    id: new models.fields.AutoField(),
    firstName: new models.fields.CharField({ maxLength: 255 }),
    dependsOn: new models.fields.ForeignKeyField({
      relatedTo: 'User',
      toField: 'id',
      onDelete: models.fields.ON_DELETE.CASCADE,
      allowNull: true
    }),
    lastName: new models.fields.CharField({ maxLength: 255, allowNull: true }),
    uuid: new models.fields.UUIDField({ autoGenerate: true })
  }

  options = {
    tableName: 'user',
  }
}

