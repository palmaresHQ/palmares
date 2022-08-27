import { Serializer } from './src/serializers';
import { CharField, Field } from './src/fields';
import ValidationError from './src/exceptions';
import v8 from 'node:v8'
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
    firstName: CharField.new({ defaultValue: 'string', allowNull: false, required: false, writeOnly: true}),
    lastName: CharField.new({ readOnly: true, allowNull: true}),
    nested: NestedSerializer.new({ allowNull: true })
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
  if (await serializer.isValid()) {
    serializer.validatedData.firstName
  } else {
    console.log(serializer.errors);
  }
}

main();

