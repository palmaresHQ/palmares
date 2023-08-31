import {
  models,
  AutoField,
  ForeignKeyField,
  CharField,
  UUIDField,
  IntegerField,
  ON_DELETE,
  ModelOptionsType,
} from '@palmares/databases';

export class Photo extends models.Model<Photo>() {
  fields = {
    id: AutoField.new(),
    name: CharField.new({ allowNull: true }),
    postId: ForeignKeyField.new({
      relatedTo: Post,
      onDelete: ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'postPhotos',
      relationName: 'post',
    }),
    userId: ForeignKeyField.new({
      relatedTo: User,
      onDelete: ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'userPhotos',
      relationName: 'userPhoto',
    }),
  };
}
/*Photo.default.set(
  {},
  {
    search: {},
  }
);*/
export class Post extends models.Model<Post>() {
  fields = {
    id: AutoField.new(),
    number: IntegerField.new(),
    userUuid: ForeignKeyField.new({
      relatedTo: User,
      onDelete: ON_DELETE.CASCADE,
      toField: 'uuid',
      relatedName: 'userPosts',
      relationName: 'user',
    }),
  };

  options = {
    tableName: 'post',
  };
}

export class User extends models.Model<User>() {
  fields = {
    id: AutoField.new(),
    firstName: CharField.new({
      maxLength: 255,
      dbIndex: true,
      allowNull: false,
      defaultValue: '',
    }),
    pokemonId: ForeignKeyField.new({
      relatedTo: Pokemon,
      onDelete: ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'pokemonUsers',
      relationName: 'pokemon',
      defaultValue: 25,
    }),
    lastName: CharField.new({ maxLength: 255, allowNull: true }),
    uuid: UUIDField.new({ autoGenerate: true, unique: true }),
  };

  options: ModelOptionsType<User> = {
    tableName: 'user',
    onSet: {
      preventCallerToBeTheHandled: false,
      handler: async ({ data }) => {
        await User.default.set(data);
        return [data];
      },
    },
  };
}

export class Pokemon extends models.Model<Pokemon>() {
  fields = {
    id: IntegerField.new({ unique: true }),
    name: CharField.new({ maxLength: 255 }),
    weight: IntegerField.new({ allowNull: true }),
  };

  options: ModelOptionsType<Pokemon> = {
    managed: false,
    onGet: async ({ search }) => {
      const data = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${search.name || search.id}`
      );
      const json = await data.json();
      return [{ id: json.id, name: json.name, weight: json.weight }];
    },
  };
}
