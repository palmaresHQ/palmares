import { Model, fields, ModelOptionsType, auto, text, choice, foreignKey, define } from '@palmares/databases';
import { Profile } from '../auth/models';

/*
const Contract = define('Contract', {
  fields: {
    id: auto(),
    terms: text(),
    status: choice({ allowNull: true, choices: ['new', 'in_progress', 'terminated'] }),
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
  managers: {
    custom: {
      getById(id: number) {
        return this.get({ search: {
          id:
        })
      }
    }
  }
});*/
export class Contract extends Model<Contract>() {
  fields = {
    id: auto(),
    terms: text(),
    status: choice({ allowNull: true, choices: ['new', 'in_progress', 'terminated'] }),
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
