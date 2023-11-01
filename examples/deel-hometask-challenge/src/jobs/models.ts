import {
  Model,
  fields,
  AutoField,
  TextField,
  ModelOptionsType,
  DecimalField,
  BooleanField,
  DateField,
  ForeignKeyField,
} from '@palmares/databases';
import { Contract } from '../contracts/models';

export class Jobs extends Model<Jobs>() {
  fields = {
    id: AutoField.new(),
    description: TextField.new(),
    price: DecimalField.new({ decimalPlaces: 2, maxDigits: 12 }),
    paid: BooleanField.new({ defaultValue: false }),
    paymentDate: DateField.new({ autoNow: true, autoNowAdd: true }),
    contractId: ForeignKeyField.new({
      relatedTo: Contract,
      onDelete: fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'jobContracts',
      relationName: 'contract',
    }),
  };

  options: ModelOptionsType<Jobs> = {
    tableName: 'jobs',
  };
}
