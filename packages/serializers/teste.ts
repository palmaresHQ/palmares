import { Serializer } from './src/serializers';
import { CharField, Field } from './src/fields';
import ValidationError from './src/exceptions';
import { OutSerializerType, SerializerType } from './src/serializers/types';

// Exemplo de um serializer
class NestedSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    phoneNumber: CharField.new()
  }
}

class ExampleSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    firstName: CharField.new({ defaultValue: 'string', allowNull: false, writeOnly: true, required: false}),
    lastName: CharField.new({ readOnly: true, allowNull: true}),
    nested: NestedSerializer.new({ allowNull: false })
  }
}

// uso
const main = async () => {
  const data = {
    firstName: 'launchcode',
    lastName: 'hey',
  }
  const serializer = ExampleSerializer.new({
    many: false,
  });
  console.log(await serializer.fields.firstName.schema())
}
main();

