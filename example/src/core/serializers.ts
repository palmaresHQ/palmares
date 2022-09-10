import {
  Serializer,
  OutSerializerType,
  StringField,
  ModelSerializer,
} from '@palmares/serializers';
import { Post, User } from './models';

class UserSerializer extends ModelSerializer {
  options = {
    model: User,
    excludes: ['password'] as const,
  };
}

export class PostSerializer extends ModelSerializer {
  fields = {
    userPosts: UserSerializer.new({ required: false }),
  };

  options = {
    model: Post,
    excludes: [] as const,
  };
}

class NestedSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    phoneNumber: StringField.new(),
  };
}

export class ExampleSerializer extends Serializer {
  async toRepresentation(data: OutSerializerType<NestedSerializer>[]) {
    return data;
  }

  fields = {
    firstName: StringField.new({
      defaultValue: 'string',
      allowNull: false,
      writeOnly: true,
      required: false,
    }),
    lastName: StringField.new({ readOnly: true, allowNull: true }),
    nested: NestedSerializer.new({ allowNull: false }),
  };
}
