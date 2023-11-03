import FieldAdapter from './fields';
import NumberAdapter from './fields/number';
import ObjectFieldAdapter from './fields/object';

export default class SchemaAdapter {
  field!: FieldAdapter;
  number!: NumberAdapter;
  object!: ObjectFieldAdapter;
}
