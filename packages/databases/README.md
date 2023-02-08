# @palmares/database

This is responsible for handling database connections inside of the palmares framework.
We offer a middle ground between orms and palmares, this way when developing a new project in palmares
you can change the orm you want to use without having to change too much on your codebase.

## Installation

First, install by running the following command:

```
$ npm install @palmares/database
```

Then add the following in your settings.(js/ts) file:

```ts
export const INSTALLED_DOMAINS = [
  import('@palmares/database'), // <-- Add this line as the first domain.
  // Add all the other domains here.
];
// Other configs
export const DATABASES = {
  default: {
    engine: '@palmares/sequelize-engine',
    dialect: 'postgres',
    databaseName: 'postgres',
    username: 'postgres',
    password: '',
    host: 'localhost',
    port: 5435,
  },
};
```

## TODOs:

- [x] Add support for multiple databases.
- [ ] Dependency injection on models for testing managers without needing a database connection.
- [ ] 80% test coverage.
- [x] Better typescript support for abstract models.
- [ ] Model to instance and instance to Model (translates a raw object to something that the orm/database can understand and vice versa).
- [ ] Dynamic imports for models (similar with the `customImports` function on fields)
- [/] Lazy load the models, so we can tackle environments like serverless or the edge with the framework. (For that we need to just load the basic part of the models, without translating, we will only translate when we need it. When we translate we must be sure the dependencies are translated first.) It won't be the fastest solution but it will work. **(HALF DONE, WE ARE ABLE TO TRANSLATE THE ENGINE LAZILY BUT NOT THE MODELS AND ITS DEPENDENCIES (THE PROBLEM RELIES ON INDIRECT RELATIONS)**)
- [x] Better support for self referencing relations.
- [x] `Set` and `get` and even `delete` should have a better API for deleting, creating, updating, and retrieving related data. Also we should change the default functions api for an object. This way we can make it more flexible and easier to use. (instead of `set(dataToSet, search, engineName)` we can do `set({ dataToSet, search, engineName })`)
- [x] Better Support for relations on queries:
- [x] .get
- [x] .set
- [x] .delete
- [ ] Improve include relations on queries
  - [ ] Define if the relation should be excluded in a `remove` query (we are just fetching the data, and don't want to remove it)
  - [ ] Define exactly what field we are refearing in a relation 'if the same model has two relations with the same model, we should be able to define which one we are refearing to'
- [ ] Add `orderBy` and `limit` to queries
- [ ] Support for seeding data into the database (useful for testing).
- [x] Support for queries like 'in', 'between', 'lessThan', etc.
- [ ] Support for unmanaged models and distributed systems. We can have like, the model definition on this server, set this model to unmanaged, and try to fetch the resources for it
      automatically from the other servers. (This is useful for distributed systems, and for the edge)
  - [ ] Check if unmananaged models does not create an instance in the database.
- [ ] Possibility for Internal transactions (transactions that does not depend on the database engine, but on the framework itself.)
  - [ ] Custom transaction caller (so for example the user can define what to do when a transaction fails)
- [x] Functional model creation instead of class based.
- [ ] Make queries run in generators so we can better control the flow of the queries.
