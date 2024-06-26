import { Model, AutoField, TextField, ModelOptionsType, DecimalField, EnumField, BooleanField } from '@palmares/databases';

export class Profile extends Model<Profile>() {
  fields = {
    id: AutoField.new(),
    firstName: TextField.new({ allowNull: true }),
    lastName: TextField.new(),
    profession: TextField.new(),
    boolean: BooleanField.new(),
    balance: DecimalField.new({ allowNull: true, maxDigits: 12, decimalPlaces: 2 }),
    type: EnumField.new({ choices: ['client', 'contractor'] }),
  };

  options: ModelOptionsType<Profile> = {
    tableName: 'profile',
  };
}
