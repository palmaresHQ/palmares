import SequelizeEngine from '@palmares/sequelize-engine';
import {
  Serializer,
  OutSerializerType,
  StringField,
  ModelSerializer,
} from '@palmares/serializers';
import { Photo, Post, User } from './models';

export class UserSerializer extends ModelSerializer {
  fields = {
    userPosts: PostSerializer.new({
      many: true,
    }),
  };

  options = {
    model: User,
    excludes: ['password'] as const,
  };

  async save() {
    const data = this.validatedData;
    const modelInstance = await User.default.getInstance<
      SequelizeEngine<User>
    >();

    if (data) return modelInstance.create(data) as any;
  }
}
export class PhotoSerializer extends ModelSerializer {
  options = {
    model: Photo,
    excludes: ['id'] as const,
  };
}
export class PostSerializer extends ModelSerializer {
  options = {
    model: Post,
    excludes: ['id'] as const,
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
