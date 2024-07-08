import { AutoField, CharField, IntegerField, Model, ModelOptionsType } from '@palmares/databases';

export class User extends Model<User>() {
  fields = {
    id: AutoField.new(),
    name: CharField.new({ maxLength: 255 }),
    age: IntegerField.new(),
  }

  options: ModelOptionsType<User> = {
    tableName: 'users',
  }
}
