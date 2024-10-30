[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/summary.md) >
[reference](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/introduction.md) >
[querysets](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md) >

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
  } satisfies ModelOptionsType<Company>
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

### Still on relations

The `.join()` has intellisense, the first argument is with what model you want to join, and the second argument is the `relationName` or `relatedName` you want to join with.

You can, for example, have the **User** model related to **Company** on more than one field. So we always need to explicitly define to what relation we are referring to. If you want to relate Company to two distinct fields, you should create two joins. Just like you would need on a normal SQL query.

## Types of QuerySets

We have three main ones that follow the methods on the [Manager](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md):

### GetQuerySet

The most basic one, it offer you basic querying capabilities like filtering, ordering, limiting, selecting the fields on your query, making joins, etc. It is a shrunk down version of a SELECT query on a database.

When you don't explicitly define a _type_ of a **QuerySet**, we will create a GetQuerySet by default.

**Example:**

```ts
import { queryset } from '@palmares/schemas';

import { Company, User } from './models';

queryset(Company, 'get')
  .join(User, 'usersOfCompany', (qs) => qs.select('name', 'uuid', 'age'))
  .where({ id: 1 })
  .limit(10);
```

### SetQuerySet

A `set` QuerySet type includes the `.data()` method. The `.data()` method should always be the last method to call. We differ if it's an UPDATE or a CREATE operation based on the presence of the `.where()` clause anywhere on your QuerySet (even on nested `.join()` operations).

If you have the `.where()` clause anywhere on your QuerySet, even on joins, we will make an UPDATE, since it is an UPDATE operation you can set ONE argument only on the `.data()` method.

If that's not the case, you are making a CREATE operation, a CREATE operation can create multiple items all at once.

**Examples:**

```ts
import { queryset } from '@palmares/schemas';

import { Company, User } from './models';

// A CREATE EXAMPLE.
/** You don't need to assign companyId, to each user it gets assigned automatically for you. **/
queryset(Company, 'set')
  .join(User, 'usersOfCompany', (qs) =>
    qs.data(
      {
        firstName: 'Foo',
        lastName: 'Bar',
        email: 'foo@bar.com',
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'johndoe@example.com',
      }
    )
  )
  .data({
    name: 'Beautiful Dolphins',
    slug: 'beautiful-dolphins',
  });

// AN UPDATE EXAMPLE
/** Yes, it will update just all the users from company 'Beautiful Dolphins' with the firstName "Oof" **/
/** It doesn't make sense to update more than one data, so you can just pass one argument to `.data()` when it's an update **/
queryset(Company, 'set')
  .where({ name: 'Beautiful Dolphins' })
  .join(User, 'usersOfCompany', (qs) =>
    qs.data({
      firstName: 'Oof',
    })
  );
```

### RemoveQuerySet

Kinda the same thing as [SetQuerySet](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md#setqueryset) except you need to explicitly call `.remove()` instead of `.data()`.

The first question you might ask is: **Why the hell i'm wasting my time with this?**

I don't have an answer for that. But I have an answer why it can look redundant to need to explicitly call `.remove()` on a [QuerySet](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md) that will run on the `.remove()` method from the [Manager](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md). We think it is safer since [QuerySets](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md) can be reused and removing something is a sensitive action to do.

Also, it works well with `.join()`, because you can control of it removing just the child elements of a query. You gain more fine grained control over a little inconvenience of it being a little redundant. I would take that.

```ts
// Removes all of the Users from the 'Beautiful Dolphins' Company, but not the Company itself.
queryset(Company, 'remove')
  .where({ name: 'Beautiful Dolphins' })
  .join(User, 'usersOfCompany', (qs) => qs.remove());

// A remove operation without a WHERE? NOT ON OUR WATCH.
// Palmares adds type-safety and validation to guarantee you remove just the wanted data
queryset(Company, 'remove').remove(); // NOT VALID, where is the WHERE?

// wait, WAIT! HOW?
// Yep, we know you defined a `.where()` clause on a nested QuerySet, so `.remove()` is allowed on the parent.
// This is also valid for deeply nested QuerySets.
queryset(Company, 'remove')
  .join(User, 'usersOfCompany', (qs) =>
    qs.where({
      firstName: {
        like: '%John%',
      },
    })
  )
  .remove();
```

## Read More

- [Introduction](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/introduction.md)
- [Engines](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/enginess.md)
- [Models](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/models.md)
- [Managers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md)
- [QuerySets](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md)
- [Testing](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/testing.md)
