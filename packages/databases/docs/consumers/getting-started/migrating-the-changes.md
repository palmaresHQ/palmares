[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md) >
[getting-started](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/summary.md) >
[migrating-the-changes](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/migrating-the-changes.md)

# Getting Started > Your first migration

A migration is a tool that lets you focus more on your code and less on your database changes. When you make a change, like, any change on your models, when you run `makemigrations` command it will know exactly what changes you made on your model and apply those changes on the next migration. It feels like magic, [because it is!](https://www.youtube.com/watch?v=Iz-8CSa9xj8)

**IMPORTANT**: This step is totally optional since the database engine can implement our migration tool or roll with their own. For example `@palmares/sequelize-engine` uses our migration tool but `@palmares/drizzle-engine` uses [drizzle-kit](https://orm.drizzle.team/docs/kit-overview) to handle the migrations.

## Whatever old guy, I'm not impressed

You already went through the setup, right? You installed your domain, added the models on getModels, and return and empty array on getMigrations.

Now:

#### On your own

Look how easy it is, people who use it with palmares are SOOOO DUMB. You should hate them!

On the root of the application create a file called `makemigrations.ts` and add the following:

```ts
import db from './database.config';

db.makemigrations({});
```

Now run with:

```sh
$ tsx makemigrations.ts
$ ts-node makemigrations.ts
$ bun makemigrations.ts
$ deno makemigrations.ts
```

It should create a new folder called `/migrations` with `index` and another file. Cool, you have created your first migration!

#### With Palmares

You are special, but those people who roll on their own are just so 2004. You should definitely not respect them!

Just run:

```sh
$ tsx manage.ts makemigrations
$ ts-node manage.ts makemigrations
$ bun manage.ts makemigrations
$ deno manage.ts makemigrations
```

You should see that it created a new folder called `/migrations` with `index` and another file on `my-custom-domain` folder. Cool, you have created your first migration!

## I'm little more impressed, but where are the tables?

To generate your tables you should

#### On your own

On `database.config.ts` you should add the following:

```ts
import * as migrations from './migrations'; // Add this import

export default setDatabaseConfig({
  locations: [
    {
      name: 'default',
      path: import.meta.dirname,
      getMigrations: () => migrations, // Remove the empty array and add this
      getModels: () => [User, Company],
    },
  ],
});
```

Then on the root of the application create a file called `migrate.ts` and add the following:

```ts
import db from './database.config';

db.migrate();
```

Now run with:

```sh
$ tsx migrate.ts
$ ts-node migrate.ts
$ bun migrate.ts
$ deno migrate.ts
```

Now we are rolling, cool!

#### With Palmares

On your domain you should change the empty array and return the migrations like this:

```ts
import * as migrations from './migrations'; // Add this import

export default domain('myCustomDomain', import.meta.dirname, {
  modifiers: [databaseDomainModifier] as const,
  getMigrations: () => migrations, // return the migrations
  getModels: () => models,
});
```

Now run:

```sh
$ tsx manage.ts migrate
$ ts-node manage.ts migrate
$ bun manage.ts migrate
$ deno manage.ts migrate
```

And we are rolling, congrats!

## Oh nice, where did the generated types go?

**We are in 2024 bro, we infer our stuff, we don't need generated types, that's just gross**

## Up Next

- [Querying the Data](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/querying-the-data.md)
