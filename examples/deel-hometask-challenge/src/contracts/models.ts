import { Model, fields, AutoField, TextField, ModelOptionsType, EnumField, ForeignKeyField } from '@palmares/databases';
import { Profile } from '../auth/models';

export class Contract extends Model<Contract>() {
  fields = {
    id: AutoField.new(),
    terms: TextField.new(),
    newColumn: TextField.new({ defaultValue: 'default'}),
    status: EnumField.new({ allowNull: true, choices: ['new', 'in_progress', 'terminated'] }),
    contractorId: ForeignKeyField.new({
      relatedTo: Profile,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'contractorContracts',
      relationName: 'contractor',
    }),
    clientId: ForeignKeyField.new({
      relatedTo: Profile,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'clientContracts',
      relationName: 'client',
    }),
  };

  options: ModelOptionsType<Contract> = {
    tableName: 'contract',
  };
}
