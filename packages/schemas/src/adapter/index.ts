import FieldAdapter from './fields';
import NumberAdapter from './fields/number';

export default class SchemaAdapter {
  field!: FieldAdapter;
  number!: NumberAdapter;
}
