import { models } from '@palmares/databases';
import SequelizeModel from '@palmares/sequelize-engine';

export class Post extends models.Model {
  fields = {
    number: new models.fields.IntegerField(),
    userUuid: new models.fields.ForeignKeyField({
      relatedTo: 'User',
      toField: 'uuid',
      onDelete: models.fields.ON_DELETE.CASCADE
    }),
  }

  options = {
    tableName: 'post'
  }
}

export class User extends models.Model {
  fields = {
    firstName: new models.fields.CharField({ maxLength: 255 }),
    uuid: new models.fields.UUIDField({ autoGenerate: true, maxLength: 36 })
  }

  options = {
    tableName: 'user'
  }
}
