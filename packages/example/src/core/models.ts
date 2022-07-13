import { ModelFields, ModelFieldsType, ModelOptionsType, models } from '@palmares/databases';

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
      toField: 'id'
    })
  }

  options: ModelOptionsType<this> = {
    ordering: ['id'],
    indexes: [{
      unique: true,
      fields: ['id']
    }]
  }
}


export class User extends models.Model {
  fields = {
    id: new models.fields.AutoField(),
    firstName: new models.fields.CharField({ maxLength: 255 }),
    uuid: new models.fields.UUIDField({ autoGenerate: true, maxLength: 36 })
  }

  options = {
    tableName: 'user'
  }
}
