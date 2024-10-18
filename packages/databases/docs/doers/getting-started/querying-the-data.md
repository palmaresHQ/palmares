# Getting Started > Querying the Data

A database does not have much value if you can't access its data so we offer you the ability to query your data.

Because Palmares is intended to work with all major databases we offer you really basic querying:

- `.set` - Let's you **CREATE** or **UPDATE** your data.
- `.get` - Let's you **READ** your data.
- `.remove` - Let's you **DELETE** your data

Let's get started inserting some data on the database:

```ts
import { Company, User } from './models';

await Company.default.set((qs) =>
  qs
    .join(User, 'usersOfCompany', (qs) =>
      qs.data(
        {
          firstName: 'Foo',
          lastName: 'bar',
          email: 'foo@bar.com',
          isActive: true,
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@doe.com',
          isActive: true,
        }
      )
    )
    .data({
      name: 'Evil Foo',
      slug: 'evil-foo',
      isActive: true,
    })
);
```

This will insert one Company on the database called `Evil Foo` and assign two users to it, one has the First Name of **Foo** and the other **John**

Now's let's query it:

```ts
const companies = await Company.default.get((qs) =>
  qs.join(User, 'usersOfCompany', (qs) =>
    qs.where({
      name: 'John',
    })
  )
);
```

This will query all companies that have users with the name John, just the user named 'John' is returned.

## Unraveling the queries

### Managers

Let's look at the first part of the query:

```ts
Company.default;
```

What the hell is `default`? This is a Manager, as the name suggest, the default manager of your table. A manager is what provides all common database operations. All models come with the `default` manager. On other frameworks they can also be referred as repositories.

You can (and should) also create your own managers. [Check the managers reference for more details](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/doers/reference/managers.md)

### QuerySets

Continuing our unravel of the query:

```ts
await Company.default.get((qs) =>
  qs.join(User, 'usersOfCompany', (qs) =>
    qs.where({
      name: 'John',
    })
  )
);
```

The `.get()` operation expects a callback that receives and returns a QuerySet `(qs) => `. A QuerySet is what essentially hold your queries. It holds your queries but never run them. It is expected to be used on `.get()`, `.set()` and `.remove()` operations, so you can use and reuse it however you like. This means you are not tied to the model to make the queries! You can make the queries even outside your models!

Want to reuse a complicated filter? Fine, Want to reuse how you create a data on a table? Also fine!

[Check the QuerySets reference for more details](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/doers/reference/querysets.md)

## The end

From here you are good to go on your own. [Check our reference docs for more in-detail explanation about each part of the database](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/doers/reference/introduction.md).

## Up Next

- [Summary](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/doers/summary.md)
- [Reference](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/doers/reference/introduction.md)
