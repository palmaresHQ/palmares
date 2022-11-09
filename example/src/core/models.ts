import { models } from '@palmares/databases';

export class Photo extends models.Model<Photo>() {
  fields = {
    id: new models.fields.AutoField(),
    name: new models.fields.CharField(),
    postId: new models.fields.ForeignKeyField({
      relatedTo: Post,
      onDelete: models.fields.ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'postPhotos',
      relationName: 'post',
    }),
  };

  options = {
    tableName: 'photo',
  };
}

export class Post extends models.Model<Post>() {
  fields = {
    id: new models.fields.AutoField(),
    number: new models.fields.IntegerField({
      allowNull: true,
      defaultValue: 1,
    }),
    userUuid: new models.fields.ForeignKeyField({
      relatedTo: User,
      onDelete: models.fields.ON_DELETE.CASCADE,
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
    id: new models.fields.AutoField(),
    firstName: new models.fields.CharField({
      maxLength: 255,
      dbIndex: true,
      allowNull: true,
    }),
    lastName: new models.fields.CharField({ maxLength: 255, allowNull: true }),
    uuid: new models.fields.UUIDField({ autoGenerate: true, unique: true }),
  };

  options = {
    tableName: 'user',
  };
}

const main = async () => {
  const values = await User.default.get();
  console.log(values);
};
main();
