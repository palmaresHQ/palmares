# Getting Started > The Engine

> Definitely not a V16, more like a V4, but hey, at least it gets you places!

Palmares engine is where everything starts. Almost all methods on the adapter will receive the Engine instance by default. The cool thing is that the engine is a DatabaseEngine instance. This means you are free to append anything you want to the instance. Need to use some value when making the queries from when it was initialized, you can assign that to the engine instance. You can extend that class with all the data you need, we won't use it for anything besides calling the predefined methods or arguments.

## Let's get dirty

Here is an example of two engines: Sequelize and Drizzle

#### Drizzle

```ts
import { databaseAdapter } from '@palmares/databases';

const drizzleDatabaseAdapter = databaseAdapter({
  fields: new DrizzleFields(),
  models: new DrizzleModels(),
  query: new DrizzleQuery(),
  new: <
    TType extends
      | 'postgres-js'
      | 'node-postgres'
      | 'neon-http'
      | 'xata-http'
      | 'pglite'
      | 'vercel-postgres'
      | 'aws-data-api/pg'
      | 'pg-proxy'
      | 'libsql'
      | 'd1'
      | 'bun-sqlite'
      | 'expo-sqlite'
      | 'op-sqlite'
      | 'better-sqlite3',
    TDrizzleInstance extends ReturnTypeByType<TType>,
  >(args: {
    output: string;
    type: TType;
    drizzle: TDrizzleInstance;
    closeCallback?: () => void | Promise<void>;
  }): [
    {
      output: string;
      type: TType;
      drizzle: TDrizzleInstance;
      closeCallback?: () => void | Promise<void>;
    },
    () => Omit<InstanceType<ReturnType<typeof databaseAdapter>>, 'instance'> & {
      instance: {
        instance: ReturnTypeByType<
          TType,
          TDrizzleInstance extends ReturnTypeByType<TType, infer TSchema> ? TSchema : never
        >;
        mainType: 'postgres' | 'mysql' | 'sqlite';
        type:
          | 'postgres-js'
          | 'node-postgres'
          | 'neon-http'
          | 'xata-http'
          | 'pglite'
          | 'vercel-postgres'
          | 'aws-data-api/pg'
          | 'pg-proxy';
        output: string;
        closeCallback?: () => void | Promise<void>;
      };
    },
  ] => {
    const engineInstance = new drizzleDatabaseAdapter();
    engineInstance.instance = {
      output: args.output,
      type: args.type,
      mainType: args.type.includes('sqlite') ? 'sqlite' : 'postgres',
      instance: args.drizzle as any,
      closeCallback: args.closeCallback,
    } as {
      instance: any;
      mainType: 'postgres' | 'mysql' | 'sqlite';
      type:
        | 'postgres-js'
        | 'node-postgres'
        | 'neon-http'
        | 'xata-http'
        | 'pglite'
        | 'vercel-postgres'
        | 'aws-data-api/pg'
        | 'pg-proxy';
      output: string;
      closeCallback?: () => void | Promise<void>;
    };
    return [
      args,
      () =>
        engineInstance as unknown as Omit<InstanceType<ReturnType<typeof databaseAdapter>>, 'instance'> & {
          instance: {
            instance: ReturnTypeByType<
              TType,
              TDrizzleInstance extends ReturnTypeByType<TType, infer TSchema> ? TSchema : never
            >;
            mainType: 'postgres' | 'mysql' | 'sqlite';
            type:
              | 'postgres-js'
              | 'node-postgres'
              | 'neon-http'
              | 'xata-http'
              | 'pglite'
              | 'vercel-postgres'
              | 'aws-data-api/pg'
              | 'pg-proxy';
            output: string;
            closeCallback?: () => void | Promise<void>;
          };
        },
    ];
  },
  // eslint-disable-next-line ts/require-await
  isConnected: async (): Promise<boolean> => {
    return true;
  },
  transaction: async <TParameters extends any[], TResult>(
    databaseAdapter: DatabaseAdapter,
    callback: (
      transaction: Parameters<ReturnType<allDrizzleTypes>['transaction']>[0],
      ...args: TParameters
    ) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> => {
    const instanceData = checkIfInstanceSavedOrSave(
      databaseAdapter.connectionName,
      databaseAdapter.instance.type,
      databaseAdapter.instance.mainType,
      databaseAdapter.instance.instance
    );

    return new Promise((resolve, reject) => {
      try {
        instanceData.instance
          .transaction(async (transaction) => {
            try {
              resolve(await callback(transaction as any, ...args));
            } catch (e) {
              reject(e);
            }
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  },
  duplicate: async (getNewEngine: () => Promise<DatabaseAdapter>): Promise<DatabaseAdapter> => {
    return getNewEngine();
  },
  close: async (databaseAdapter): Promise<void> => {
    const instanceData = checkIfInstanceSavedOrSave(
      databaseAdapter.connectionName,
      databaseAdapter.instance.type,
      databaseAdapter.instance.mainType,
      databaseAdapter.instance.instance
    );
    try {
      await Promise.resolve(instanceData.closeCallback?.());
    } catch (_) {}
  },
});

export default drizzleDatabaseAdapter;
```

#### Sequelize

```ts
import { databaseAdapter } from '@palmares/databases';
import { Sequelize } from 'sequelize';

import SequelizeEngineFields from './fields';
import SequelizeMigrations from './migrations';
import SequelizeEngineModels from './model';
import SequelizeEngineQuery from './query';

import type { DatabaseAdapter } from '@palmares/databases';
import type { Options, Transaction } from 'sequelize';

const instancesByConnectionNames = new Map<
  string,
  {
    instance: Sequelize;
    isConnected: boolean | undefined;
  }
>();

const checkIfInstanceSavedOrSave = (
  connectionName: string,
  sequelizeInstance: Sequelize
): {
  instance: Sequelize;
  isConnected: boolean | undefined;
} => {
  const instance = instancesByConnectionNames.get(connectionName);
  if (instance !== undefined) return instance;

  const toSave = {
    instance: sequelizeInstance,
    isConnected: undefined,
  };
  instancesByConnectionNames.set(connectionName, toSave);
  return toSave;
};

const sequelizeDatabaseAdapter = databaseAdapter({
  fields: new SequelizeEngineFields(),
  migrations: new SequelizeMigrations(),
  models: new SequelizeEngineModels(),
  query: new SequelizeEngineQuery(),
  new: <TArgs extends Options & { url?: string }>(args: TArgs): [TArgs, DatabaseAdapter] => {
    return [
      args,
      () => {
        const isUrlDefined: boolean = typeof args.url === 'string';
        if (isUrlDefined) {
          const databaseUrl: string = args.url || '';
          const sequelizeInstance = new Sequelize(databaseUrl, args);
          const engineInstance = new sequelizeDatabaseAdapter();
          engineInstance.instance = sequelizeInstance;
          return [args, engineInstance];
        }

        const sequelizeInstance = new Sequelize(args);
        const engineInstance = new sequelizeDatabaseAdapter();
        engineInstance.instance = sequelizeInstance;
        return engineInstance;
      },
    ];
  },
  isConnected: async (databaseAdapter): Promise<boolean> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, databaseAdapter.instance);
    if (typeof instanceData.isConnected === 'boolean') return instanceData.isConnected ? true : false;

    const isSequelizeInstanceDefined = instanceData.instance instanceof Sequelize;

    if (isSequelizeInstanceDefined) {
      try {
        await instanceData.instance.authenticate();
        instanceData.isConnected = true;
      } catch (error) {
        instanceData.isConnected = false;
      }

      if (instanceData.isConnected) return instanceData.isConnected;
    }
    return false;
  },
  transaction: async <TParameters extends any[], TResult>(
    databaseAdapter: DatabaseAdapter,
    callback: (transaction: Transaction, ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, databaseAdapter.instance);

    return new Promise((resolve, reject) => {
      try {
        instanceData.instance
          .transaction(async (transaction) => {
            try {
              resolve(await callback(transaction, ...args));
            } catch (e) {
              reject(e);
            }
          })
          .catch(reject);
      } catch (e) {
        reject(e);
      }
    });
  },
  duplicate: async (getNewEngine: () => Promise<DatabaseAdapter>): Promise<DatabaseAdapter> => {
    return getNewEngine();
  },
  close: async (databaseAdapter): Promise<void> => {
    const instanceData = checkIfInstanceSavedOrSave(databaseAdapter.connectionName, databaseAdapter.instance);
    try {
      await Promise.resolve(instanceData.instance.close());
    } catch (_) {}
  },
});

export default sequelizeDatabaseAdapter;
```

Looks like a lot of things, we know it is, but you are probably a senior developer, you already built an ORM yourself so you probably know how to read this code. We will dissect each part of it with you.

## The databaseAdapter

As you saw, we simplified for you, instead of extending from a `DatabaseAdapter` class, we created a `databaseAdapter` that offer you type safety on all common methods. If you are paying close attention on what you are reading, you just saw: The **class** has its name _UpperCased_, but the **function** is _camelCased_.

Now this function expects a bunch of methods and stuff you don't even know what it means or what it is used for.

For `fields`, `migrations`, `models` and `query` we will cover on the next chapters. Don't need to worry for now. Let's focus on its entrypoint `.new()`.

### A brand NEW start

Through our databases documentation we teach the end user to initialize his chosen engine by always calling `NameOfTheEngine.new()`, if you look on the `DatabaseAdapter` class, you will see that that method is a static method from the class. In other words, the class does not need to be initialized for the user to access this method. For us, what is important to know is that it acts as constructor to open a new database connection.

The return of this function is a tuple where the first element is the arguments received from the new() function, we are just returning it . The second element of the tuple is a function that returns a the `DatabaseAdapter` instance. Now you might ask a few questions, i'll try to answer each one.

- **Why return the arguments on the first element of the tuple?**

During migration we will create a bunch of instances of your database. So we need that to duplicate the instances.

- **ooooookay???? But why?**

Because during migrations we have two instances: The next state and previous state. We will build all of the models in real time for each migration file that gets applied. For example: Let's say we are running the migration file where we create both a **User** and **Company** models. One instance is the next state, so this instance has those models created, the other instance is the state, or the past, on that instance both models will not exist.

Now you get it? Probably no, right? But think with us: The user changed one field of the model. For you to be able to compare against your model, you need 2 instances of the same model to be present at the same time: the present one, and the past one.

Oh, you are starting to get it now? Yeah, that's why we need to open 2 connections, so the models doesn't crash. You can't have 2 User models that looks exactly the same. Same table name, same fields. That's why we do this.

- **I kinda get it, needs to digest for a bit. Now why a function on the second element of the tuple?**

Imagine that the user runs just a help command, to list the commands available to run. Does it make sense to fail if the database connection is not reachable? The user just want to list the commands, why should he keep an open database connection for that?

Because of that, we will just open/require the database connection when we actually need it. In other words, when the user is effectively using the database or the application is running.

### Now is it Connected?

Sometimes the connection is required to start working translating the models. The `.isConnected()` method specifies to us that the database is properly connected and we can start translating.

Why is this needed? Because if the database is not properly connected, with a proper connection it might fail during the translation step, which will be hard to debug. This guarantees that the connection to the db is fully set before continuing with the translation of the models.

### Why Duplicate? Why Duplicate?

We kinda explained when we covered the `.new()` method. This is for duplicating the database instance during migration. You don't need to do much usually, we got a lot covered on `getNewEngine` callback received as the first argument of that function. Usually you just need to call that function and we do the hard work ourselves, but if you still need to change anything on the newly created instance, you can call that callback first and then do any other stuff.

While we are here, it's important to understand about one thing on how we designed the adapters: Instead of calling `super().nameOfTheMethod()` to get a default implementation we usually pass that default implementations as callback on the methods. This way it is explicit that the method contains a default a implementation.

### Transaction

Create a new transaction on your engine instance, no big deal. With that the user can do a bunch of operations and roll it back when something fails without need to worrying about anything. As you can see, it receives 3 arguments:

- The adapter instance itself.
- A callback that expects to receive the transaction on the first argument
- The arguments of that callback, but you just need to pass the args explicitly.

> **But HOW IS THIS PASSED TO THE FUNCTION THAT MAKES THE QUERY???**

Don't worry, we handle that. We'll cover that.

### After we are done, we close the connection

When the application stops we close the connection, how to handle that in your engine? If you want to safely close the connection, this is the place to do it.

## Up Next
