import { Serializer, OutSerializerType, CharField, SerializerFieldsType } from '@palmares/serializers';



class NestedSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    phoneNumber: CharField.new()
  }
}

export class ExampleSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    firstName: CharField.new({ defaultValue: 'string', allowNull: false, writeOnly: true, required: false}),
    lastName: CharField.new({ readOnly: true, allowNull: true}),
    nested: NestedSerializer.new({ allowNull: false })
  }
}
