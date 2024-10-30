[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/summary.md) >
[reference](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/summary.md) >
[models](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/models.md)

# Reference > Models

You already saw how to create a model during the [Getting Started](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/installation.md). A model maps to a table on your database, or a collection, or whatever (depends on the engine you are using, and if the database is relational or not). A Model represents the structure of your data where it is saved.

It's built from the ground up with relational databases in mind, but it should support non relational databases as well just fine.

## Creating a Model

A model can be created using both Classes with inheritance or function with a factory pattern.

#### Classes

```ts
class User extends Model<User>() {
  fields = {
    id: auto(),
    firstName: char({ maxLen: 255 }),
    lastName: char({ maxLen: 255 }).allowBlank().allowNull(),
    isActive: bool().default(true),
  };

  options = {
    tableName: 'users',
  } satisfies ModelOptionsType<User>;
}
```

#### Functional

```ts
const User = define('User', {
  fields: {
    id: auto(),
    firstName: char({ maxLen: 255 }),
    lastName: char({ maxLen: 255 }).allowBlank().allowNull(),
    isActive: bool().default(true),
  },
  options: {
    tableName: 'users',
  },
});
```

## Reusing a model structure

You can use `abstracts` to reuse the managers and fields. With abstracts you can extract logic on your own custom library. This way users don't need to reimplement everything again, they can just reuse your managers/models.

For example: Imagine you are a company like Clerk, or want to implement a library like Lucia for auth. You can create an AbstractUser model. Then the user can reuse it like:

```ts
import { AbstractUser } from '@lucia/palmares';

const User = define('User', {
  fields: {
    companyId: foreignKey({
      relatedTo: () => Company,
      relationName: 'company',
      relatedName: 'usersOfCompany',
      toField: 'id',
      onDelete: ON_DELETE.CASCADE,
    }),
  },
  options: {
    tableName: 'users',
  },
  abstracts: [AbstractUser],
});

// Now the user has the managers from your abstract available to be used like:
User.lucia.authenticateWithEmail(email, password);
```

This way the user can use the managers from your library without needing to implement themselves. Also, you guarantee that the fields you need on your model will be available since the user extended from your abstract model.

## Fields

Since palmares/databases is intended to work with any database, we tried to abstract the most common used fields on applications. We might remove or add other fields as we feel the necessity.

#### AutoField (auto)

Auto increment field. PrimaryKey as default, cannot set a default, null is not allowed.
