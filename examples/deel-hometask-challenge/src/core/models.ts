import { models, AutoField, CharField, TextField, ModelOptionsType } from '@palmares/databases';

export class User extends models.Model<User>() {
  fields = {
    id: AutoField.new(),
    firstName: TextField.new({
      allowNull: true,
      defaultValue: '',
    }),
    lastName: CharField.new({ allowNull: true }),
  };

  options: ModelOptionsType<User> = {
    tableName: 'user',
    ordering: ['firstName'],
  };
}
