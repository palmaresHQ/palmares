[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md) >
[getting-started](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/summary.md) >
[installation](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/installation.md)

# Getting started > Installation

There are two ways you can use palmares databases library. You can either use it with palmares, the framework, or you can use it on your own. Of course the recommended way is running it with the framework, but we made it easy to roll on your own as well. You don't need to worry, all features are supported on both.

## Installation

##### The library

First thing you will need is the library, that's the core. But remember: It doesn't do anything, so you'll need to choose an adapter. For now we have 2: Sequelize and Drizzle.

```sh
$ npm install @palmares/databases
$ pnpm add @palmares/databases
$ yarn add @palmares/databases
$ bun add @palmares/databases
```

##### The adapter

Second thing you'll need is an adapter, refer to its documentation for more understanding. We will use Sequelize for now because, differently from Drizzle, it uses palmares migrations.

```sh
$ npm install @palmares/sequelize-engine
$ pnpm add @palmares/sequelize-engine
$ yarn add @palmares/sequelize-engine
$ bun add @palmares/sequelize-engine
```

## Creating your first models

Let's create our first palmares model? No? Okay.

A Model represents the structure of the tables on your database. A model holds all the information it needs about your database tables, like the indexes, the table name, the fields it contains, all that.

Palmares embraces both OOP (known as classes in TS/JS) or Functional approaches. It's up to you for what you want to use (we prefer classes, but don't talk to anyone).

Okay, enough talking, let's head to the code. On a file called `models.ts`, add the following piece of code:

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

Don't worry, we'll cover all that in the next chapters.

### From now, do you want

- [To roll on your own?](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/on-your-own.md)
- [Use it with palmares?](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/with-palmares.md)
- [A surprise?](https://youtu.be/dQw4w9WgXcQ?si=20-qoQjs8RyZaTZ7)
