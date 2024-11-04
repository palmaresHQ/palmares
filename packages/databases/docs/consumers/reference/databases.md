[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md) >
[reference](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/summary.md) >
[databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/databases.md)

# Reference > Databases

The @palmares/databases package works by adding using an Adapter to query the data on databases. It is designed in a way that its intended to work with most common ORMs on the market.

To guarantee that it works correctly we rely on a couple of things.

1. Databases is an instance that is added to the global object called `$PDatabases`. This instance holds in cache all of the running adapters, and guarantee that the adapters are initialized once and just once. Specially on testing, it's important to understand that.
2. We pre-load the database when running with any of our App Servers. But there are a lot of places you might not have an App Server running. So we designed the Database to be lazy loaded when in use (when querying data). This means, that on some places the first query will take a little bit longer than subsequent queries (testing, command-line handlers or serverless). We also recommend of you being mindful when using APIs like `Promise.all` for doing multiple queries. Whenever possible, try to use the APIs we give you under `.set()`, `.get()` or `.remove()`.
3. Under database `settings`, and during the [Getting started](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/getting-started/with-palmares.md) you've probably seen that you can define a lot of connections at the same time. You saw that we started with `default` but you can include others as well. Be mindful that for every connection, we need to translate the database, this means going through all of the models and fields of those models. This can slow things down if too much connections are defined.
4. Although we designed the ORM to be as efficient as possible when querying, REMEMBER: It's a translation layer above another translation layer, so of course it'll be slower than using the underlying ORM directly. Our main goal is to give a common API for database access, so we and the community can offer abstractions without needing to worry about which ORM you've chosen.

## Settings

#### With Palmares

On `installedDomains` it should contain the following tuple. The second parameter of the tuple holds the settings.

```ts
[
  DatabasesDomain,
  {
    databases: {
      default: {
        engine: SequelizeEngine.new({
          dialect: 'sqlite',
          storage: './sequelize.sqlite3',
        }),
      },
    },
  },
],
```

#### On your Own

We are just focusing on databases here.

```ts
setDatabaseConfig({
  databases: {
    default: {
      engine: SequelizeEngine.new({
        dialect: 'sqlite',
        storage: './sequelize.sqlite3',
      }),
    },
  },
  // Other configs
});
```

- `databases`: This is the main setting, it holds all of the connections that you have on your application.
- `default`: The name of the connection, usually this is the primary connection of your database.
- `engine`: A the return of a DatabaseAdapter instance. The `.new()` is the setting for the engine adapter, every adapter will have its own settings.

## Lazy Loading and Database initialization

Lazy loading is the feature that lets this package be performant and independent of the framework. On [Managers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/managers.md) you should see more documentation regarding that.

Essentially when you make a query, the first thing we do is that we check if the database is already initialized, if it is not we will initialize the hole engine with all of the models. This means that there are some **"gotchas"** you should be aware of:

#### Be mindful when using Promise.all() or Promise.allSettled() APIs

Instead of:

```ts
await Promise.all([
  Company.default.set((qs) => qs.data({ name: 'FooCompany1' })),
  Company.default.set((qs) => qs.data({ name: 'FooCompany2' })),
  Company.default.set((qs) => qs.data({ name: 'FooCompany3' })),
]);
```

You can run it like this:

```ts
// The first call will lazy-load the db, the subsequent will work normally
await Company.default.set((qs) => qs.data({ name: 'FooCompany1' }));

await Promise.all([
  Company.default.set((qs) => qs.data({ name: 'FooCompany2' })),
  Company.default.set((qs) => qs.data({ name: 'FooCompany3' })),
]);
```

We are working around that limitation right now.

#### How to speed initialization?

This is better documented on the [Models](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/models.md) but you can speed things up using `instance` on `options` on the models. If your engine creates an instance in Javascript/Typescript or you want to reuse an instance that already exists. You can set `instance` on the model. This way, during the initialization it will not loop through all the models and all of the fields of the models, it'll use this instance to make the queries. Each engine should have this better documented for you.

#### When it is initialized without lazy loading?

Lazy loading just not take place when running the App Server. For example: `runserver` from @palmares/server should initialize the database before it can be used. This way when running your app we guarantee it's always available to be called. This is useful on a Serverful environment.

## Read More

- [Introduction](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/summary.md)
- [Engines](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/enginess.md)
- [Models](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/models.md)
- [Managers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/managers.md)
- [QuerySets](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/querysets.md)
- [Testing](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/testing.md)
