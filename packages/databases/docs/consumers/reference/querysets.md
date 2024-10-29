# Reference > QuerySets

You probably already know what are models, you know what are [Managers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md), but now you are curious about what the hell are QuerySets. Like, why the hell something that was supposed to be simple has so many concepts?
I usually ask the same thing about Next.js.

Anyway, this was the latest addition to the database library before releasing it. Before we didn't exactly had QuerySets, but after thinking a little about it we thought this would be a nice addition to the library. It allows you to build queries outside of the codebase, reusing them, whatever, without worrying too much weather it will run or not. QuerySets essentially just hold the query data. This data is only accessed when actually fetching the database.

## How to use it

To use it is simple as:

```ts
import { queryset } from '@palmares/databases';

import { MyModel } from './models';

const myCustomQuerySet = queryset(MyModel, 'get');

myCustomQuerySet.where({
  id: 123,
});

// Then you can use it like:
MyModel.default.get(() => myCustomQuerySet);
```

Now you might be asking, **why is that useful??**

The main goal of QuerySets is to give you, through a builder a pattern, a way to _build_ queries. By default it won't run anything, it needs to go through the [Manager](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md) to effectively run the query, there is no way around that.

## Unless

We can actually make queries using just **QuerySets**. You can see it as being a hack, but it doesn't break the rule that every query must go through a [Manager](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md).

```ts
const resultsOfTheQuery = await myQuerySet.['_makeQuery']();
```

This is usually hidden from users, but it's a safe way to abstract logic away from the users. For example: you want to build a custom validation middleware, the return of that middleware can be based of a QuerySet.

**TIP**: For Typescript fans, the cool thing is that QuerySet is an explicit type you can properly type, there is no easy way to type a return of a query since it can be anything. For QuerySets you have a more fine grained control.

## Relations

Relations on Palmares databases exists whenever you use the `.join()` method of the QuerySets, all QuerySet types (more about the various types on the next item) allow you to make joins. You can insert related data on a single query, remove related data on a single query, whatever.

Another usage of relations is to query data based on your relation data. For example, if you want to fetch all Companies that has a User with name "John" you can add a where clause on the QuerySet on the third argument of the `.join` method.

The API of relations looks like the following:

```ts
import { Company, User } from './models';

const company = await Company.default.get((qs) =>
  qs.join(User, 'usersOfCompany', (qs) => qs.select('name', 'uuid', 'age')).where({ id: 1 })
);

company[0].usersOfCompany[0].id; // 1
```

If you understand the difference between `relatedName` and `relationName`, you already understand this query, but lets review it together:

- On the **ForeignKeyField** you need to add two strings: `relatedName` and `relationName`.

- `relationName` refers to the direct relation. _This model has a `relationName`_.
  For example:
  If the **User** model has a field called `companyId` which is related to the **Company** model. The **User** model has a `company`.
  If the **Book** model has a field called `authorId` which is related to the **Author** model. The **Book** model has an `author`.

- `relatedName` refers to the indirect relation. _This model has `relatedName`_.
  For example:
  If the **User** model has a field called `companyId` which is related to the **Company** model. Then **Company** has a list of all of the `usersOfCompany`.
  If the **Book** model has a field called `authorId` which is related to the **Author** model. Then **Author** has a list of all of the `booksOfAuthor`.

Do you see the difference between them? **this model has A....**

Direct relations are related to just one record while indirect relations can be related to just one record or, usually, multiple records.
When Indirect relations are related to just one record? That's right, when they are `.unique()`. When they are `.unique()` you can't have that same `companyId` related to more than one record.

### Understanding the outputs of relations

Based on what we said, the outputs can differ depending on the relation. So we want to make it clear for you so you do not shoot yourself in the foot.
We are going to use the following models as example, so keep them in mind:

```ts
export class Company extends Model<Company>() {
  fields = {
    id: auto(),
    name: char({ maxLen: 255 }),
    slug: char({ maxLen: 255 }),
    isActive: bool().default(true)
  },

  options =  {
    tableName: 'company'
  } satisfies ModelOptionsType<Company> // We use satisfies here so we can still infer and you don't lose intellisense.
}

export const User = define('User', {
  fields: {
    id: auto(),
    firstName: char({ maxLen: 255 }),
    lastName: char({ maxLen: 255 }),
    email: text().allowNull(),
    companyId: foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE
    })
  }
});
```

#### Direct Relations

Direct relations are always to one record only, so we kinda already know what to expect.

```ts
// Getting all users from company with id 1
const users = await User.default.get((qs) =>
  qs.join(Company, 'company', (qs) => qs.where({ id: 1 })
);

users[0].company.id // 1
```

As you can see, `company` will be an object. Why an object? Because we can relate each **User** to a single **Company**, that's how direct relations work!

#### Indirect relations

This is where it can get a little bit confusing, but don't worry, we are here to have you covered.

- If `companyId` is not an `.unique()` field, that's what you should expect

```ts
import { Company, User } from './models';

const company = await Company.default.get((qs) =>
  qs.join(User, 'usersOfCompany', (qs) => qs.select('name', 'uuid', 'age')).where({ id: 1 })
);

// usersOfCompany is an array.
company[0].usersOfCompany[0].id; // 1
```

- If `companyId` is `.unique()`, you should expect the following

```ts
import { Company } from './models';

export const User = define('User', {
  fields: {
    id: auto(),
    firstName: char({ maxLen: 255 }),
    lastName: char({ maxLen: 255 }),
    email: text().allowNull(),
    companyId: foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE,
    }).unique(), // We just added the .unique() flag
  },
});

const company = await Company.default.get((qs) =>
  qs.join(User, 'usersOfCompany', (qs) => qs.select('name', 'uuid', 'age')).where({ id: 1 })
);

// usersOfCompany is an object now since there will be just one user assigned to that company.
company[0].usersOfCompany.id; // 1
```

## Types of QuerySets

We have three main ones that follow the methods on the [Manager](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md):

### GetQuerySet

The most basic one, it offer you basic querying capabilities like filtering, ordering, limiting, selecting the fields on your query, making joins, etc. It is a shrunk down version of a SELECT query on a database.

When you don't explicitly define a _type_ of a **QuerySet**, we will create a GetQuerySet by default.

#### GetQuerySetIfSearchOnJoin

This is a special GetQuerySet but without `limit` and `offset`. This will only exist if you add a `.where()` clause inside of a `.join`.
