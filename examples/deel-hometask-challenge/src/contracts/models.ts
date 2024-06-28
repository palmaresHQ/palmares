import { Model, fields, ModelOptionsType, auto, text, choice, foreignKey, define } from '@palmares/databases';
import { Profile } from '../auth/models';


/*
export const Contract = define('Contract', {
  fields: {
    id: auto(),
    terms: text({ allowNull: true, defaultValue: 'No terms' }),
    status: choice({ allowNull: true, choices: ['new', 'in_progress', 'terminated', 'test'] }),
    contractorId: foreignKey({
      relatedTo: Profile,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'contractorContracts',
      relationName: 'contractor',
    }),
    clientId: foreignKey({
      relatedTo: Profile,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'clientContracts',
      relationName: 'client',
    }),
  },
  options: {
    tableName: 'contract',
  },
})*/



export class Contract extends Model<Contract>() {
  fields = {
    id: auto(),
    terms: text({ allowNull: true, defaultValue: 'No terms' }),
    terms1: text({ defaultValue: 'sei la'}),
    status: choice({ allowNull: true, choices: ['new', 'in_progress', 'terminated', 'test'] }),
    contractorId: foreignKey({
      relatedTo: Profile,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'contractorContracts',
      relationName: 'contractor',
    }),
    clientId: foreignKey({
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

