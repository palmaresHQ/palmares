# @palmares/serializers
This is used for serializing and deserializing json data. Actually what this will do is mostly
validating the data, but it will also be used to do conversion of the data so we guarantee that the
data that is being sent and the data that is being received is known.

## Usage
```typescript
import {
  Serializer,
  OutSerializerType,
  StringField,
  ModelSerializer,
} from '@palmares/serializers';
import { Post, User } from './models';

export class UserSerializer extends ModelSerializer {
  fields = {
    userPosts: PostSerializer.new({
      isDynamicRepresentation: true,
      many: true,
    }),
  };

  options = {
    model: User,
    excludes: ['password'] as const,
  };

  async save() {
    const data = this.validatedData;
    const modelInstance = User.default.getInstance<SequelizeEngine<User>>();

    if (data) return modelInstance.create(data);
  }
}

export class PostSerializer extends ModelSerializer {
  options = {
    model: Post,
    excludes: ['id', 'userUuid'] as const,
  };
}
```

Some nice things that we offer is that we are able to create a schema directly from the models without needing to create anything new. We just pass
the models and the fields we want to exclude or include. With that we will automatically detect the types and everything else.

With this you are also able to define `isDynamicRepresentation` of data. The idea is that by defining isDynamicRepresentation we will be able to
just pass the instance and the framework takes care of retrieving the relation data. It will obviously be less efficient than if you didn't use
this. But it's handy for most use cases.

Also you don't need to create a `save` method, the framework can take care of this for you.

If you want you can convert this serializer data to your favorite schema library like `yup`, `joi` or `zod` so you can use it in other environments
like on the front-end, or just to gain some improvements in performance.

```typescript
const serializer = UserSerializer.new();
const schema = await serializer.schema()
```

### TODO
- [ ] Add support for multipletypes fields, (fields that can be either a string or a number)
- [ ] Translatable model fields on serializers (need to create a function in the ModelSerializer that will be called when we can't find a match for this particular field type)
- [ ] Array field type (not serializers with `many = true`)
- [ ] Add support for lazy relations, so one field that is related to itself.
- [ ] Schemas for ALL field types.
- [ ] 80% test coverage.
- [ ] Better typescript support for schemas (will need to do directly on schemas like)
```typescript
const zodSchema = new ZodSchema();

const schema = await zodSchema.getObject(serializer);
```
