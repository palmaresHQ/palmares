# Palmares/Databases

## Introduction

This documentation will walk you through [palmares](https://github.com/palmaresHQ/palmares), but focusing on the [@palmares/databases](https://www.npmjs.com/package/@palmares/databases) package.

### A rough and quick intro to Palmares

The goal of [palmares](https://github.com/palmaresHQ/palmares) is to give you, the programmer, the freedom to use what you want while still maintaining a core, well defined structure. This way you can still use Drizzle or Sequelize as you already using. At the same time [library maintainers like Lucia](https://github.com/lucia-auth/lucia/discussions/1707), don't need to recreate adapters for every ORM available, palmares will be the common abstraction above all. This specially useful when thinking on a framework level. We can create abstractions like Auth, Admin, Scaffolding, without needing to worry about which ORM or server you choose to use and those can work together.

### What is palmares databases?

The [@palmares/databases](https://www.npmjs.com/package/@palmares/databases) package offers you a simple API to interact with databases. Manage Schemas, access your data, relate your data. Everything you would do on a normal database.

At its core it does nothing, at the same time it does everything!

With 0 dependencies at its core (even no dependency on Node), you don't need to worry if it'll work on Expo. Without an adapter this will simply not do anything. But with the adapter this package offers you the ability to generate migrations, query your data and offer a really nice way to interact with your database.

Although we kinda see ourselves as an ORM, we are not **data frameworks** as drizzle like to call others like Django or Spring. You are not forced to build your project around our structure, although we think this is preferable most of the times, you are still free to use it the way you want, on your own existing projects without any hassle or problem.

### QuickStart

#### On your own

**TIP:** This QuickStart uses [drizzle orm, reach out to their docs for reference](https://orm.drizzle.team/docs/overview)

- **Step 1**. Create a `database.config.ts` with:

```ts
import {
  Model,
  define,
  auto,
  char,
  text,
  bool,
  ON_DELETE,
  setDatabaseConfig
} from '@palmares/databases';
import { NodeStd } from '@palmares/node-std';
import { DrizzleDatabaseAdapter } from '@palmares/drizzle-engine';
import { drizzle as drizzleBetterSqlite3 } from '@palmares/drizzle-engine/better-sqlite3';
import Database from 'better-sqlite3';

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
    createdAt: date().autoNowAdd(),
    companyId: foreignKey({
      relatedTo: () => Company,
      toField: 'id',
      relationName: 'company',
      relatedName: 'usersOfCompany',
      onDelete: ON_DELETE.CASCADE
    })
  }
});

const database = new Database('sqlite.db');

const newEngine = DrizzleDatabaseAdapter.new({
  output: './.drizzle/schema.ts',
  type: 'better-sqlite3',
  drizzle: drizzleBetterSqlite3(database),
});

export const db = newEngine[1]().instance.instance;

export default setDatabaseConfig({
  databases: {
    default: {
      engine: newEngine,
    },
  },
  locations: [
    {
      name: 'default',
      // @ts-ignore
      path: import.meta.dirname, // If your package.json does not contain the "type": "module" in it, change that to __dirname
      getMigrations: () => [],
      getModels: () => [authenticatedUsers, questions],
    },
  ],
  std: new NodeStd(),
});
```

- **Step 2**. Make your queries

  - **Using Palmares:**

  ```ts
  import { Company, User } from './database.config';

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

  - **Using your favorite ORM**:

    1. Create a file called `load.ts` and add the following:

    ```ts
    import databasesConfig from './database.config';

    databasesConfig.load();
    ```

    2. Run (we are using to run typescript from the command line [tsx](https://tsx.is/)):

    ```sh
    $ tsx load.ts
    ```

    3. You will see that `./.drizzle/schema.ts` file was created. You can query your models from there.

    ```ts
    import { db } from './database.config';
    import { Company } from './.drizzle/schema';

    const data = await db.insert(Company).values({
      name: 'Evil Foo',
      slug: 'evil-foo',
    });
    ```

#### With Palmares:

Coming Soon...

### Next Steps

- [Are you using to build applications?](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md)
- [You want to integrate your library?](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/integrators/summary.md)
