import {
  Serializer,
  OutSerializerType,
  StringField,
  SerializerFieldsType,
  ModelSerializer,
  ModelSerializerOptions
} from '@palmares/serializers';
import { Post } from './models';
import { ModelFields } from '@palmares/databases';

export class PostSerializer extends ModelSerializer {
  fields = {
    teste: StringField.new({ readOnly: true, allowNull: true}),
  }

  options = {
    model: Post,
    excludes: [] as const
  }
}

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
