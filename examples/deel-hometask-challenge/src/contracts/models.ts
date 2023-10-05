import { models, AutoField, TextField, ModelOptionsType, EnumField, ForeignKeyField } from '@palmares/databases';
import { Profile } from '../auth/models';

export class Contract extends models.Model<Contract>() {
  fields = {
    id: AutoField.new(),
    terms: TextField.new(),
    status: EnumField.new({ isAuto: true, allowNull: true, choices: ['new', 'in_progress', 'terminated'] }),
    contractorId: ForeignKeyField.new({
      relatedTo: Profile,
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'contractorContracts',
      relationName: 'contractor',
    }),
    clientId: ForeignKeyField.new({
      relatedTo: Profile,
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'clientContracts',
      relationName: 'client',
    }),
  };

  options: ModelOptionsType<Contract> = {
    tableName: 'contract',
  };
}

const teste = ForeignKeyField.new({
  relatedTo: Profile,
  onDelete: models.fields.ON_DELETE.CASCADE,
  toField: 'id',
  relatedName: 'contractorContracts',
  relationName: 'contractor',
});
type Teste = typeof teste['_type'];
