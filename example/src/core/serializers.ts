import { Serializer, OutSerializerType, StringField, SerializerFieldsType } from '@palmares/serializers';



class NestedSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    phoneNumber: StringField.new()
  }
}

export class ExampleSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    firstName: StringField.new({ defaultValue: 'string', allowNull: false, writeOnly: true, required: false}),
    lastName: StringField.new({ readOnly: true, allowNull: true}),
    nested: NestedSerializer.new({ allowNull: false })
  }
}
