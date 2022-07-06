import { models, Engine } from '@palmares/databases';
import SequelizeEngine from '@palmares/sequelize-engine';
import Manager from 'packages/databases/src/models/manager';

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

User.default.getInstance<SequelizeEngine<User>>().findAll({
  where: {
    id: 1,
    firstName: 'string',
    uuid: 'string'
  }
})


class CustomManager extends Manager {
  getInstance() {
    return super.getInstance<SequelizeEngine<User>>('default')
  }

  async create() {
    return await this.getInstance().create({
      firstName: 'string'
    })
  }
}
