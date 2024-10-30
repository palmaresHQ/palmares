[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/summary.md) >
[reference](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/summary.md) >
[managers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md)

# Reference > Managers

During the [Getting Started](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/getting-started/querying-the-data.md) you saw that every model contain a `default` **Manager**. The idea of **Manager** is kinda the same from a _repository_. It's essentially where your queries will live.

#### What is the difference from common repository pattern?

Taken from an existing project I have worked on with Nest.js.

```ts
import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../modules/prisma/prisma.service';

@Injectable()
export default class ProfilePhotoRepository {
  private readonly logger = new Logger(ProfilePhotoRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async numberOfPhotosByProfileId(profileId: number) {
    this.logger.debug(`Retrieving the number of photos by profile id '${profileId}'`);
    return this.prismaService.profilePhotos.count({
      where: {
        profileId,
      },
    });
  }

  async byId(profilePhotoId: number) {
    this.logger.debug(`Fetching the profile photo with the id '${profilePhotoId}'`);
    return this.prismaService.profilePhotos.findUnique({
      where: {
        id: profilePhotoId,
      },
    });
  }
}
```

This essentially is explicit that it expects PrismaService to be injected when this class is initialized. On here we have an explicit dependency injection.

The same thing with **Palmares Managers** would be.

```ts
class MyCustomManager extends Manger<ProfilePhoto> {
  async getPrismaProfilePhotos() {
    return this.getInstance();
  }

  async numberOfPhotosByProfileId(profileId: number) {
    const prismaProfilePhotos = await getPrismaProfilePhotos();
    return prismaProfilePhotos.count({
      where: {
        profileId,
      },
    });
  }

  async byId(profilePhotoId: number) {
    const prismaProfilePhotos = await getPrismaProfilePhotos();
    return prismaProfilePhotos.findUnique({
      where: {
        id: profilePhotoId,
      },
    });
  }
}

const ProfilePhotos = define('ProfilePhotos', {
  fields: {}, //The fields will live here
  options: {
    tableName: 'profile_photos',
  },
  managers: {
    custom: MyCustomManager(),
  },
});

// OR (WHEN USING CLASSES)

class ProfilePhotos extends Model<ProfilePhotos>() {
  fields = {}; //The fields will live here

  options = {
    tableName: 'profile_photos',
  };

  static custom = MyCustomManager();
}

// And you can query like:

ProfilePhotos.custom.byId(123);
```

Do you see the difference? The **Manager** approach injects the model indirectly. You can access the model at any time. Get it's instance, but it's guaranteed for you that all the data you need is injected when you need. A great thing about this pattern is that Managers and Models are tightly coupled. On the original repository pattern there is nothing stopping the repository to access data from all of the models in the database. This means it's totally possible to have just one repository for the hole project. With the Manager pattern each repository is responsible for the data from one Model. Of course, not stops you from accessing data from other models on each Manager.

## Methods

#### getInstance

The "Heart" from the manager, it is used to get the model from the underlying engine instance being used. This allows you to make native queries with the ORM of your choice. Because of how Typescript works, you need to use `as` keyword to have it properly inferred for you.

**Why it's async?** Because of the DB's lazy initialization. There is no guarantee the translated engine model instance will be available when calling `.getInstance()` function. If the engine is not available we lazy initialize it before returning the model.

The only optional argument you can pass is the `engineName` from your settings, this way you can access the translated model from other engines.

_Example:_

```ts
import { eq } from 'drizzle-orm/sql';

import * as d from '../../.drizzle/schema';

const drizzleProfilePhotos = (await ProfilePhotos.default.getInstance()) as (typeof d)['ProfilePhotos'];
const count = await db.$count(drizzleProfilePhotos, eq(drizzleProfilePhotos.id, 1));
```

#### getEngineInstance

Returns the underlying DatabaseAdapter of choice. This way you can access the database class, or any other `root` information not directly available on your model instance.

**Why it's async?** Because of the DB's lazy initialization. There is no guarantee the engine instance will be available when calling `.getEngineInstance()` function. If the engine is not available we lazy initialize it before returning it to you.

_Example:_

```ts
import { eq } from 'drizzle-orm/sql';
import type { drizzle } from '@palmares/drizzle-engine/node-postgres';

import * as d from '../../.drizzle/schema';

const drizzleProfilePhotos = (await ProfilePhotos.default.getInstance()) as (typeof d)['ProfilePhotos'];
const db = (await ProfilePhotos.default.getEngineInstance()) as typeof drizzle;
const count = await db.$count(drizzleProfilePhotos, eq(drizzleProfilePhotos.id, 1));
```

#### get

Used for retrieving information from your database. It will receive a callback passing a [QuerySet](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md) and expects a [QuerySet](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md) from the return of the callback. As documented on the QuerySets documentation, you can also create a QuerySet outside of this function, and just return this custom QuerySet here.

**IMPORTANT**: This will always return an array of items or an empty array if nothing is found.

_Example:_

```ts
// Get all users with firstName as john
const users = await User.default.get((qs) => qs.where({ firstName: 'john' }));

// Get all users that contains the substring `jo` in the first name
const users2 = await User.default.get((qs) =>
  qs.where({
    firstName: {
      like: '%jo%',
    },
  })
);

// Get all the users from Company with id 1 at the same time we append the related record `company` on each of them.
const usersWithCompany = await User.default.get((qs) => qs.join(Company, 'company', (qs) => qs.where({ id: 1 })));
```

#### set

Used for updating ot creating information on the database. It's the same thing as `.get` except that it expects that you call `.data()` at the end of the queryset.

- **CREATE**: When the queryset does not contain ANY `.where()` clauses, it'll be a _CREATE_ operation. By default you can create more than one item on the same query.
- **UPDATE**: When the queryset contain ANY `.where()` clause, either on the root or its child querysets, it'll be an _UPDATE_ operation. It'll allow just one item to be set, if more than one is present, we will use the first one.

_Example:_

```ts
// CREATES a company called Super Company and then create 2 users, one with name "John", the other with the name 'Foo'
// and assign the Super Company to those users
const createdUsers = await User.default.set((qs) =>
  qs
    .join(Company, 'company', (qs) =>
      qs.data({
        name: 'Super Company',
      })
    )
    .data(
      {
        firstName: 'John',
        lastName: 'Doe',
      },
      {
        fistName: 'Foo',
        lastName: 'Bar',
      }
    )
);

// UPDATES the users that are from company with id 1. All of them will have the firstName `John`.
const updatedUsers = await User.default.set((qs) =>
  qs
    .join(Company, 'company', (qs) => qs.where({ id: 1 }))
    .data({
      firstName: 'John',
    })
);
```

#### remove

By design, no more delete without where issues! It'll only work if you add `.remove()` and a `.where()` clause on your QuerySet. You can still use `force: true` to delete all the data without `.where()` but this guarantee that you can safely delete your data without worrying.

_Example_:

```ts
// DOES NOT WORK, you MUST call explicitly`.remove()`
const removedUser = await User.default.remove((qs) => qs.where({ id: 1 }));

// Works
const removedUser = await User.default.remove((qs) => qs.where({ id: 1 }).remove());
```

I know it's kinda redundant, but it's safer to make it explicit, specially since you can reuse QuerySets. That way you don't unintentionally remove unwanted data.

## Read More

- [Introduction](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/summary.md)
- [Engines](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/enginess.md)
- [Models](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/models.md)
- [Managers](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/managers.md)
- [QuerySets](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/querysets.md)
- [Testing](https://github.com/palmaresHQ/palmares/blob/model-fields-new-api/packages/databases/docs/consumers/reference/testing.md)
