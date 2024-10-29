# Getting Started > On your own

Cool, looks like you like it rough, huh? No problem, personally I don't have a problem with that. We did a lot of work so it comes as smooth as butter. You won't even feel it!

First thing to identify is if your project has a root, usually it's `app.ts` or `index.ts` on `src` folder. If it doesn't let's create a `database.config.ts` file. This will be our entrypoint, okay?

## Installing a few more dependencies

Before going in, let's install one more dependency, and don't act like you cared about the number of dependencies on your project.

```sh
$ npm install @palmares/node-std
$ pnpm add @palmares/node-std
$ yarn add @palmares/node-std
$ bun add @palmares/node-std
```

By default palmares is not dependent on any runtime, you literally install that dependency as you do with any other package. Because of that we have created our own abstraction layer above common operations we need when interacting with stuff like child_threads, folders, files, whatever.

## Writing your first config

Isn't it exciting? C'mon, show some excitement. I'm pretty sure your TS/JS projects does not contain enough config files.

Add that to the `database.config.ts` file or your app entrypoint.

```ts
import { setDatabaseConfig } from '@palmares/databases';
import { NodeStd } from '@palmares/node-std';
import { SequelizeEngine } from '@palmares/sequelize-engine';

import { Company, User } from './models';

export default setDatabaseConfig({
  databases: {
    default: {
      engine: SequelizeEngine.new({
        dialect: 'sqlite',
        storage: './sequelize.sqlite3',
      }),
    },
  },
  locations: [
    {
      name: 'default',
      path: import.meta.dirname, // If your package.json does not contain the "type": "module" in it, change that to __dirname
      getMigrations: () => [],
      getModels: () => [User, Company],
    },
  ],
  std: new NodeStd(),
});
```

Let's go over it?

- **databases** - The main setting. As you can see that it is an object with the `default` key. `default` is not required here but recommended. That's a connection name. We let you connect to multiple databases at the same time. For example, you might want to connect to a `replica` database. The cool thing is that you can manage them independently from each other. Each database will have it's own engine. For that tutorial, we are using Sequelize. You should follow the engine's tutorial for instruction, but don't worry, it's fully typed.

- **locations** - The hole reason i created the framework in the first place. I prefer Django and Nest.js approach on how to organize applications. On their approach you _ideally_ organize your application in isolation. This means for example, for an e-commerce app, you might have the `login`, `order` and `payment` folders. Each of them will have their own set of routes, **database tables**, services, controllers, etc. Do you see that I have bolded the `database tables`? Mostly, actually all ORMs in JS/TS create the migrations on a central folder, and I hate that. What we do is create the migrations where they belong, alongside their model definitions.

  - _name_ - will be the name of your domain, so on the example above it would be **login**, **order** or **payment**.
  - _path_ - Will be where it's located. Something like: `import.meta.dirname + '/login'`.
  - _getMigrations_ - Will be a callback for your migrations. You add the migrations here as they are generated, each migration is the file and you need to add them here manually or `import * as migrations from './migrations'` and pass `migrations` on the return of the callback.
  - _getModels_ - The models on the specific domain of the application.

- **std** - The dependency from the runtime you are using to build your applications on.

## Up Next

- [Migrating the Changes](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/migrating-the-changes.md)
- [Querying the Data](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/querying-the-data.md)
