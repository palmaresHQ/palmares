[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[integrators](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/integrators/summary.md) >
[introduction](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/integrators/getting-started/introduction.md)

# Getting Started > Introduction

We really hope you already read the [Consumer docs](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md). Yeah, I wouldn't have read it either, who got time for reading 2 docs?

This documentation will get you started in Palmares Databases with the idea in mind that you don't even know what it is about.

## What is this s\*\*t?

You already know what Palmares is. Palmares databases is part of it and as the name suggests it deals only with databases. The idea of it is to give users (or we can refer them as **app builders**, or even **consumers**) a single interface to interact with databases. This way we can offer, through the framework, solutions for Auth, Admin pages, Cron Jobs management, etc without needing to know beforehand which ORM the user has chosen to use. Lucia, a popular Auth library had this problem in the past. They offered an interface that maps to common actions, for example, retrieving users. They needed to document how the database tables should be built and offer adapter for most popular ORMs at the time.

As you can see we still kinda need to do that as well, but right now our focus shift for offering support just to the ORMs, with that the community is free to build their own solutions above what palmares offers.

Seems like a lot of work if you think of it being its own thing, a library that exists on its own, but if you think of it as a framework, the hole concept starts making a lot of sense on why we did this abstraction on the first place. As a framework we want to offer the users a solution for auth, a solution for cron jobs, all that. If we don't have all those abstractions in place, we would need to know which server you are using, as well as which ORM, all that. With that abstraction layer we care about the feature only.

## Seems like a waste of my time, and yours

Yeah, but hey, at least we tried!

We promise we did everything on our end to be as easy as possible to integrate. If you still find a hard time integrating Palmares with your library, maybe it's a feature missing on our end, and for that you can open an issue. If that's not the case, it's probably a skill issue. And for that there is nothing we can do.

## I'm kinda digging it now

Cool. Let's check for an example on what some palmares models would look like:

```ts
import {
  Model,
  define,
  auto,
  char,
  text,
  bool,
  ON_DELETE
} from '@palmares/databases';

import type { ModelOptionsType } from '@palmares/databases'

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

Your job here is to take that model, and transform it to your own model. Open the connection to the database, and effectively make the queries.

> OH MY GOD, YOU WANT US TO DO EVERYTHING?

- In a sense, yes.

In other words, using [Drizzle](https://orm.drizzle.team) for example we would write the above models like this (using SQLite):

```ts
import * as drzl from 'drizzle-orm';
import * as d from 'drizzle-orm/sqlite-core';

export const Company = d.sqliteTable(
  'company',
  {
    id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).unique(),
    slug: d.text('name', { length: 255 }).notNull(),
    name: d.text('name', { length: 255 }).notNull(),
    isActive: d.integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  },
  (table) => ({
    idIdx: d.uniqueIndex('companies_id_idx').on(table.id),
  })
);

export const User = d.sqliteTable(
  'users',
  {
    id: d.integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).unique(),
    firstName: d.text('first_name', { length: 255 }).notNull(),
    lastName: d.text('last_name', { length: 255 }).notNull(),
    email: d.text('email'),
    companyId: d
      .integer('company_id', { mode: 'number' })
      .notNull()
      .references((): d.AnySQLiteColumn => Company.id),
  },
  (table) => ({
    idIdx: d.uniqueIndex('users_id_idx').on(table.id),
  })
);

export const UserRelations = drzl.relations(User, (args) => ({
  company: args.one(Company, {
    fields: [User.companyId],
    references: [Company.id],
  }),
}));

export const CompanyRelations = drzl.relations(Company, (args) => ({
  usersOfCompany: args.many(User),
}));
```

## Seems complicated, I won't do that

Sometimes you want to pursue a musical career while your wife wants to have kids so you need to find a stable job to work on. It's part of life. We simplified a lot of things to make it easy for you to integrate and make this translation seamless.

We will divide this documentation by each part that you should be aware of.

1. The first thing we do is opening the connection to the database. Creating a database instance. We know, sometimes the user needs to define the schemas explicitly, passing all the models on the schema connection, [like on Drizzle](https://orm.drizzle.team/docs/get-started/sqlite-existing#step-3---setup-drizzle-config-file), on that cases the user needs to first use the `load-models` where your engine will translate the models for them and create the file. And then, the user needs to explicitly pass it on the initialization of the engine.
2. Now we will go to the model translation, most of the files on your engine will be related to that part. We translate the model options and model fields at the same time, almost.
3. Okay, there are many special cases now, what about relations? What do I do if a relation relates to itself? Or if we need to create other stuff after ALL the models were translated? We have APIs for that as well.
4. Almost ending, we already have the models translated, it exists in runtime, we will use it to make queries.
5. This part is optional, for a full integration, it's expected that you offer support for Palmares Migrations as well, but you already reached here, and your ORM already offer automatic migrations. If that's the case, you are not obligated to go here.

If it's okay for you we will use both our Sequelize and Drizzle adapters as examples. If you are the core maintainer of both libraries, sorry, i just learned it for this project, used a few times in the past only. Most of what I did was done by diving deep down on the docs, specially on the API Reference part.
