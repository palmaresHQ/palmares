import { Serializer } from './src/serializers';
import { CharField, Field } from './src/fields';
import ValidationError from './src/exceptions';
import v8 from 'node:v8'

// Exemplo de um serializer
class ExampleSerializer extends Serializer {
  fields = {
    firstName: CharField.new({ defaultValue: 'teste', allowNull: true }),
    lastName: CharField.new({ readOnly: true, allowNull: true}),
  }
}



// uso
const main = async () => {
  const data = {
    firstName: 'launchcode',
    lastName: 'hey',
  }
  const serializer = ExampleSerializer.new({
    data,
    many: false
  });

  if (await serializer.isValid()) {
    serializer.validatedData
  } else {
    console.log(serializer.errors);
  }
}

main();

