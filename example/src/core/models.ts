import {
  models,
  AutoField,
  ForeignKeyField,
  CharField,
  UUIDField,
  IntegerField,
  ON_DELETE,
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
      relationName: 'user',
    }),
  };

  options = {
    tableName: 'photo',
  };
}

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
      allowNull: true,
      defaultValue: '',
    }),
    facebookId: ForeignKeyField.new({
      relatedTo: Facebook,
      onDelete: ON_DELETE.CASCADE,
      toField: 'id',
      relatedName: 'facebookUsers',
      relationName: 'facebook',
      allowNull: true,
    }),
    lastName: CharField.new({ maxLength: 255, allowNull: true }),
    uuid: UUIDField.new({ autoGenerate: true, unique: true }),
  };

  options = {
    tableName: 'user',
  };
}

export class Facebook extends models.Model<Facebook>() {
  fields = {
    id: AutoField.new(),
    campaignName: CharField.new({ maxLength: 255, allowNull: true }),
  };

  options = {
    tableName: 'facebook',
    managed: false,
  };
}
