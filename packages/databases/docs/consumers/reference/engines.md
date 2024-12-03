[@palmares/databases](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/introduction.md) >
[consumers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/summary.md) >
[reference](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/summary.md) >
[engines](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/engines.md)

# Reference > Engines

> The star of the show

Palmares is not a star, palmares by itself does nothing exceptional. Engines on the other hand are the cornerstone of Palmares. Engines is what you have been using all of that time.

Probably, when they first announced Node you thought to yourself: Javascript on the server? That might be fun.

Then bombs started being dropped. And you said: Okay, how can I handle the data on my application.

First, you tried [Sequelize](https://sequelize.org/), then you took a look into [Knex.js](https://knexjs.org/), and probably, when Typescript started being a thing you checked out [TypeORM](https://typeorm.io/). But wait, there is this new one called [MikroORM](https://mikro-orm.io/). Forget it! [Prisma](https://www.prisma.io/) is the new kid in town. But where are you going? There is this one called [Drizzle](https://orm.drizzle.team/).

> "Don't look timmy, I don't want you to be influenced by.... TIMMY!"
> "Too late mom, I am already a [Drizzle](https://orm.drizzle.team/) shizzle my nizzle".

And many more like:

- [Kysely](https://kysely.dev/)
- [Mongoose](https://mongoosejs.com/)
- [Lucid](https://lucid.adonisjs.com/docs/introduction)

## Cool, you explained nothing, this docs are total garbage

> And you are right!

So let's understand how engines applies to Palmares:

- You need to explicitly access the engine instance and call `transaction()` to guarantee that a query is running inside of a transaction.
- An engine might, or might not implement all of our own APIs, so not everything from this doc might apply to that engine. So if you are an engine builder, make sure to provide a full documentation. If you are just a user, make sure to create a bunch of issues on their github repo.
- You are not forced to use our own [Model](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/models.md), and [Managers](https://github.com/palmaresHQ/palmares/blob/main/packages/databases/docs/consumers/reference/managers.md), and [QuerySets] in any way, you can access the translated model at any time and do the queries as you have been doing during all of this time. We tried our best to offer the best type-safe experience we could so you won't miss anything.
- _But palmares/databases is a piece of 💩, where are the fields I need?_ - We got you covered. You can write your own custom fields or let the engine instance itself write its own expected fields. Want `VARCHAR`, `REAL`, `Buffer`, `Schema`, whatever you need? You can consult the engine docs and take a look on what custom fields it export. Or create your own using the Field's `_overrideType()` method.

## Making a query on a transaction

To make a bunch of operations on the same transaction you should do it like the following:

```ts
import { SequelizeEngine } from '@palmares/sequelize-engine';

import { Profile } from './models';

const engineInstance = (await Profile.default.getEngineInstance()) as SequelizeEngine;

await engineInstance.useTransaction(async (transaction) => {
  await Promise.all([
    Profile.default.set(
      (qs) =>
        qs.where({ id: profileId }).data({
          balance: profileBalanceAsNumber - amountToPay,
        }),
      { transaction }
    ),
    Profile.default.set(
      (qs) =>
        qs.where({ id: contractorId }).data({
          balance: contractorBalance + amountToPay,
        }),
      { transaction }
    ),
  ]);
});
```

This will make sure to use the native transaction from the underlying engine. This way you can be sure that you won't lose anything when using that. It'll work the same way as it would work if you used it with the underlying engine.

**IMPORTANT**: When using `.join()`, or actions like `.set()` or `.remove()`, we will ALWAYS run it inside of a transaction. So, don't need to worry about passing it when you have deeply nested data creation. We will guarantee that if one part fails, everything gets rolled back to the original state. If you pass `transaction` on the second argument of the `.set()` and `.remove()` methods, we will use it instead of creating a new transaction.

## Creating my own fields

You can't create the fields on your own, you need to make sure that the engine instance support that before trying to roll. Ideally, you will know how to create that through the engine instance documentation, but if that's not available (which should never happen, _ideally_) you can discover that by taking a look at the code `translate` method from the `adapterFieldParser` of the engine instance.

Most engines should handle `customAttributes`, you can use that to pass what is needed to translate your custom field. For example, on `@palmares/sequelize-engine` you would create it like this:

```ts
import { DataTypes } from '@sequelize/core';

type ParamsAcceptedByField = {
  maybe?: number;
  outOfCreativity: string;
};

// Now when you call RealField.new() you will create a custom instance of the Field Class.
const RealField = Field._overrideType<
  { create: number; update: number; read: number },
  {
    customAttributes: ParamsAcceptedByField;
    unique: true;
    auto: false;
    allowNull: true;
    dbIndex: false;
    isPrimaryKey: false;
    defaultValue: any;
    typeName: 'realField';
    hasDefaultValue: false;
    engineInstance: DatabaseAdapter;
  },
  Pick<
    FieldWithOperationTypeForSearch<number>,
    'lessThan' | 'greaterThan' | 'and' | 'in' | 'or' | 'eq' | 'is' | 'between'
  >
>({
  typeName: 'realField', // Make sure this typeName is unique and does not clash with others.
});

// We use builder pattern to build the fields, your users will expect it as well.
// We tried simplifying it for you so it gets easier.
// It's still hard, but you are trying to do hard things either way.
const actualRealField = <TParams extends ParamsAcceptedByField>(params: TParams) => {
  // The params here will go for both: The customParameters of the field and our field. Also, make sure you follow what you defined on `._overrideType` definition.
  let field = RealField.new(params).unique().allowNull();

  // Here we are setting the type as DATATYPE.FLOAT from Sequelize.
  field = field._setPartialAttributes()({
    type: DataTypes.FLOAT,
  });

  // To get the full power of the Builder Pattern we need to create a class.
  class Builder {
    allowString(shouldAllow: boolean = true) {
      return (
        field
          // A union means create will be both "number" and "string"
          ._setPartialAttributes<{ create: string }, { create: 'union' }>()({ shouldAllow })
          ._setNewBuilderMethods<Builder>()
      );
    }

    is<const TValue extends string>(value: TValue) {
      return (
        field
          // Now we just accept the value that was set when creating
          ._setPartialAttributes<{ create: TValue }, { create: 'replace' }>()({ default: value })
          ._setNewBuilderMethods<Builder>()
      );
    }
  }

  const builder = new Builder();
  return field._setNewBuilderMethods(builder);
};

// Your users will use it like this, everything is fully typed for them. You just reached State-of-the-Palmares level of abstraction without a sweat.
class ACustomModel extends model<ACustomModel>() {
  fields = {
    myShinyRealField: actualRealField({
      outOfCreativity: 'The hardest part of programming: Properly naming your variables',
    }).allowString(),
  };
}

// Look at the type of myShinyRealField.
ACustomModel.default.set((qs) =>
  qs.data({
    myShinyRealField: '1',
  })
);
```

> Seems complicated

Of course it seems complicated, that's why you are reading the **Consumer** docs and not the **Integrator** docs.

But for real, you are _ideally_ not supposed to do it on your own. It is supposed for the **Integrator** to do it for you.
