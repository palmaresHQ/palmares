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
 - [X] Add support for multiple databases.
 - [ ] 80% test coverage.
 - [ ] Better typescript support for abstract models.
 - [ ] Model to instance and instance to Model (translates a raw object to something that the orm/database can understand and vice versa).
 - [ ] Dynamic imports for models (similar with the `customImports` function on fields)
 - [ ] Lazy load the models, so we can tackle environments like serverless or the edge with the framework. (For that we need to just load the basic part of the models, without translating, we will only translate when we need it. When we translate we must be sure the dependencies are translated first.) It won't be the fastest solution but it will work.
