import { AutoField, BooleanField, DecimalField, EnumField, Model, TextField } from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases';

export class Profile extends Model<Profile>() {
  fields = {
    id: AutoField.new(),
    firstName: TextField.new(),
    lastName: TextField.new(),
    profession: TextField.new(),
    balance: DecimalField.new({ allowNull: true, maxDigits: 12, decimalPlaces: 2 }),
    type: EnumField.new({ choices: ['client', 'contractor'] })
  };

  options: ModelOptionsType<Profile> = {
    tableName: 'profile'
  };
}
