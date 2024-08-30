import { Model, auto, choice, define, fields, foreignKey, text } from '@palmares/databases';

import { Profile } from '../auth/models';

import type { ModelOptionsType } from '@palmares/databases';

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
      relationName: 'contractor'
    }),
    clientId: foreignKey({
      relatedTo: Profile,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'clientContracts',
      relationName: 'client'
    })
  };

  options: ModelOptionsType<Contract> = {
    tableName: 'contract'
  };
}
