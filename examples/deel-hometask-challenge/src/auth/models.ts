import { models, AutoField, TextField, ModelOptionsType, DecimalField, EnumField } from '@palmares/databases';

export class Profile extends models.Model<Profile>() {
  fields = {
    id: AutoField.new(),
    firstName: TextField.new(),
    lastName: TextField.new(),
    profession: TextField.new(),
    balance: DecimalField.new({ allowNull: true, maxDigits: 12, decimalPlaces: 2 }),
    type: EnumField.new({ isAuto: true, choices: ['client', 'contractor'] }),
  };

  options: ModelOptionsType<Profile> = {
    tableName: 'profile',
  };
}
