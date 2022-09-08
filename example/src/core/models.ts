import { ModelOptionsType, models } from '@palmares/databases';

export class Post extends models.Model<Post>() {
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

  options = {
    tableName: 'post',
  }
}

export class User extends models.Model<User>() {
  fields = {
    id: new models.fields.AutoField(),
    firstName: new models.fields.CharField({ maxLength: 255, dbIndex: true }),
    lastName: new models.fields.CharField({ maxLength: 255, allowNull: true }),
    dependsOn: new models.fields.ForeignKeyField({
      relatedTo: 'User',
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'uuid',
    }),
    uuid: new models.fields.UUIDField({ autoGenerate: true, unique: true })
  }

  options = {
    tableName: 'user',
  }
}

