import { Serializer } from './src/serializers';
import { CharField } from './src/fields';
import ValidationError from './src/exceptions';


class ExampleSerializer extends Serializer {
  fields = {
    firstName: new CharField({ defaultValue: 'hey' }),
    lastName: new CharField({ readOnly: true })
  }
}

const main = async () => {
  const data = {
    firstName: 'launchcode',
    lastName: 'hey'
  }
  const serializer = ExampleSerializer.new({
    data,
    many: true
  });


  if (await serializer.isValid()) {
    console.log(serializer.validatedData)
  } else {
    console.log(serializer.errors);
  }
}

main();
