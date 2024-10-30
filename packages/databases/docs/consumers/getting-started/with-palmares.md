[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/summary.md) >
[getting-started](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/summary.md) >
[with-palmares](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/with-palmares.md)

# Getting Started > With Palmares

ONE OF US! ONE OF US! Welcome to the team! [Everybody claps their hands](https://www.youtube.com/watch?v=oyFQVZ2h0V8).

Okay, so you probably already know what `settings.ts` stands for, and you probably already have it defined on your project. If you don't have it, go ahead, create a `settings.ts` file on your project.

## Quick recap on domains

You read it, you forgot it, that's fine. I, myself sometimes forget stuff as well. What were we talking about?

**OH YEAH, DOMAINS!**

Let's recap: What are domains?

a) This thing you type on your browser to access youtube just to see your favorite streamer saying that AI will take your job.
b) Something you own.
**c)** A small part of your application that contains all the logic for that small parts of your application. For example, on a banking system you might have the `transaction`, `deposits`, `withdraws` and `transfers` domains. Each of those will have their own sets of models, controllers, api routes, services, etc. This separation of the application by domains keeps all domains isolated of each other on a certain level. Palmares uses this idea of domains from Domain Driven Design and extrapolates it in a sense that everything becomes a domain, your server, your database access, your schema definition, all that becomes small parts of your application that you can either plug it in or plug out as you need.

Of course the answer is **a**, they don't teach nothing useful for our youth on college nowadays, huh? Oh, you came here from a BootCamp? I get it then...

**P.S.:** All jokes aside, the answer is letter `c`.

## Now that we know what domains are, let's install it on our application

Go to `settings.ts` and add the following:

```ts
import { defineSettings } from '@palmares/core';
import DatabasesDomain from '@palmares/databases';
import NodeStd from '@palmares/node-std';
import SequelizeEngine from '@palmares/sequelize-engine';
import { dirname, join, resolve } from 'path';

export default defineSettings({
  basePath: dirname(resolve(import.meta.dirname)),
  settingsLocation: import.meta.filename,
  std: NodeStd,
  installedDomains: [
    // The rest of your domains go here. The order of Databases domain doesn't matter too much but we recommend keeping it above
    // your application domains
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
    // The rest of your domains go here.
  ],
});
```

And you are good to go. If you have `CoreDomain` from `@palmares/core` package installed in your application and installed on **installedDomains**, run on the terminal:

```sh
$ tsx manage.ts help
$ ts-node manage.ts help
$ bun manage.ts help
$ deno manage.ts help
```

This will list out all the commands this new domain added to your application.

Cool! You are good to go now.

## One last step

On your domain you might have something like this:
(if you don't create it on `src/my-custom-domain/index.ts`)

```ts
import { domain } from '@palmares/core';

export default domain('myCustomDomain', import.meta.dirname, {
  // The configs of your domain
});
```

You'll add a few things to your domain:

```ts
import { domain } from '@palmares/core';
import { databaseDomainModifier } from '@palmares/databases';

import * as models from './models';

export default domain('myCustomDomain', import.meta.dirname, {
  modifiers: [databaseDomainModifier] as const,
  getMigrations: () => [] // for now return an empty array.
  getModels: () => models,
});
```

Let's review it?

As you might already know, **modifiers** don't do anything to your domain, it just add type safety so what was not obligatory suddenly becomes obligatory and required. The `databaseDomainModifier` makes two callbacks required:

- **getModels** - All the models from your domain.
- **getMigrations** - Where your migrations are located. You don't have much choice here and they are always on `migrations` folder inside the domain folder.

**IMPORTANT**: DON'T FORGET TO INSTALL YOUR DOMAIN ON `installedDomains` on `settings.ts` LIKE:

```ts
import myCustomDomain from './my-custom-domain';

export default defineSettings({
  basePath: dirname(resolve(import.meta.dirname)),
  settingsLocation: import.meta.filename,
  std: NodeStd,
  installedDomains: [
    // Your other domains
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
    myCustomDomain, // Your created domain
  ],
});
```

## Up Next

- [Migrating the Changes](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/migrating-the-changes.md)
- [Querying the Data](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/querying-the-data.md)
