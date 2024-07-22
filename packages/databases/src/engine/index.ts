import { NotImplementedAdapterException } from './exceptions';

import type AdapterFields from './fields';
import type AdapterMigrations from './migrations';
import type AdapterModels from './model';
import type AdapterQuery from './query';
import type { EngineInitializedModels } from './types';
import type model from '../models/model';
import type { DatabaseConfigurationType } from '../types';


export function databaseAdapter<
  TFieldsAdapter extends AdapterFields,
  TModelsAdapter extends AdapterModels,
  TQueryAdapter extends AdapterQuery,
  TMigrationsAdapter extends AdapterMigrations,
  TFunctionNew extends (typeof DatabaseAdapter)['new'],
  TFunctionDuplicate extends DatabaseAdapter['duplicate'],
  TFunctionClose extends DatabaseAdapter['close'],
  TFunctionIsConnected extends DatabaseAdapter['isConnected'],
  TFunctionTransaction extends DatabaseAdapter['transaction'],
>(args: {
  fields: TFieldsAdapter;
  models: TModelsAdapter;
  query: TQueryAdapter;
  migrations?: TMigrationsAdapter;
  new: TFunctionNew;
  duplicate: TFunctionDuplicate;
  isConnected: TFunctionIsConnected;
  close: TFunctionClose;
  transaction: TFunctionTransaction;
}) {
  class CustomDatabaseAdapter extends DatabaseAdapter<
    Awaited<ReturnType<TFunctionNew>>[1]['instance'],
    TFieldsAdapter,
    TModelsAdapter,
    TQueryAdapter,
    TMigrationsAdapter
  > {
    declare instance: Awaited<ReturnType<TFunctionNew>>[1]['instance'];
    fields = args.fields;
    models = args.models;
    query = args.query;
    migrations = args.migrations as TMigrationsAdapter;

    static new = args.new;
    duplicate = args.duplicate;
    isConnected = args.isConnected;
    close = args.close;
    transaction = args.transaction;
  }

  return CustomDatabaseAdapter
}

/**
 * Instead of creating our own ORM for the framework we wrap any orm we want to use inside of this class. This allow
 * our framework to have a consistent API for all ORMs that the user wants to use so he will not need to change much
 * of his code if he just wants to build a different orm.
 *
 * FOR ENGINE CREATORS:
 * 1 - Everything starts with the `new` constructor, first, this is how you will connect your engine to the database. Generally
 * most orms will create an instance of some class, save this on `instance`.
 *
 * 2- After that `initializeModel` will be called to translate the model to a instance of something that your engine can understand.
 * For that you should use the `EngineFields`. `EngineFields`, as explained in the class, is for translating each particular field
 * of the model to something that the orm can understand. This should return the model translated so we can use it. Don't forget to call
 * the base class with `super.initializeModel(model, theInstanceOfYourCustomModel)` so we can save it on the `initializedModels` object
 * in the class instance.
 */
export default class DatabaseAdapter<
  TInstanceType = any,
  TFieldsAdapter extends AdapterFields = AdapterFields,
  TModelsAdapter extends AdapterModels = AdapterModels,
  TQueryAdapter extends AdapterQuery = AdapterQuery,
  TMigrationsAdapter extends AdapterMigrations = AdapterMigrations,
> {
  connectionName!: string;
  databaseSettings!: DatabaseConfigurationType;
  initializedModels: EngineInitializedModels = {};
  models!: TModelsAdapter;
  fields!: TFieldsAdapter;
  query!: TQueryAdapter;
  migrations?: TMigrationsAdapter;
  ModelType: any;
  instance?: TInstanceType;
  __argumentsUsed!: any;
  __ignoreNotImplementedErrors = false;
  __modelsFilteredOutOfEngine!: { [modelName: string]: ReturnType<typeof model> };
  __modelsOfEngine!: { [modelName: string]: ReturnType<typeof model> };
  __indirectlyRelatedModels: {
    [modelName: string]: { [relatedModelName: string]: string[] };
  } = {};

  /**
   * Factory function for creating a new DatabaseAdapter instance. Your engine should always implement this function
   * as static and return a new instance of your engine.
   *
   * @returns - Will return a new engine instance.
   */
  static new(..._args: any[]): [any, DatabaseAdapter] {
    throw new NotImplementedAdapterException('new');
  }

  /**
   * Duplicates this instance to a new instance so we can work on it instead of the default one. Generally
   * you will not need to worry too much about this, this is used more on migrations so we can keep the state
   * models separated from the original models.
   *
   * @example
   * ```ts
   * async duplicate(getNewEngine: () => Promise<DatabaseAdapter>) {
   *    const duplicatedEngine = await getNewEngine();
   *    await duplicatedEngine.connection.close();
   *    await duplicatedEngine.connection.connect();
   *    return duplicatedEngine;
   * }
   * ```
   *
   * @param _getNewEngine - Default duplicate function, this should be called or it will throw an error.
   *
   * @returns - A new engine instance after calling `.new` static method.
   */
  // eslint-disable-next-line ts/require-await
  async duplicate(
    _getNewEngine: (...args: Parameters<(typeof DatabaseAdapter)['new']>) => Promise<DatabaseAdapter>
  ): Promise<DatabaseAdapter> {
    throw new NotImplementedAdapterException('duplicate');
  }

  /**
   * We use this to see check if we have a connection to the database or not. We will only translate the models if we
   * have a connection to the database. If your orm does not rely on a connection to create the models you can return
   * true by default.
   *
   * @return - Return true if the database is connected or false otherwise.
   */
  // eslint-disable-next-line ts/require-await
  async isConnected(engine: DatabaseAdapter): Promise<boolean> {
    throw new NotImplementedAdapterException('isConnected');
  }

  /**
   * Called when we want to close all of the connections to the database, if your engine can close the connection automatically
   * this don't need to be used.
   *
   * @example
   * ```ts
   *
   * ```
   */
  // eslint-disable-next-line ts/require-await
  async close?(_engine: DatabaseAdapter): Promise<void> {
    throw new NotImplementedAdapterException('close');
  }

  /**
   * A transaction is a database transaction, this is used to guarantee that all of the queries we do will run inside of a
   * transaction.
   *
   * @param callback - The callback that will be called to run inside of a transaction.
   * @param args - The arguments of the callback.
   *
   * @return - The return value of the callback.
   */
  async transaction<TParameters extends any[], TResult>(
    _databaseAdapter: DatabaseAdapter,
    callback: (transaction: any, ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> {
    const transact = undefined;
    return await Promise.resolve(callback(transact, ...args));
  }

  /**
   * A transaction is kinda strange, but it's a function that will run another function inside of it. With this
   * we can guarantee that a given piece of code will run inside of the transaction. After it finishes it returns the value
   * normally.
   *
   * @example
   * ```
   * function transactionMultiply(transaction: SequelizeTransaction, a: number, b: number) {
   *    return a * b;
   * }
   *
   * const result = await engineInstance.useTransaction(transactionMultiply, 2, 2)
   *
   * result // 4
   * ```
   *
   * On the example above, transactionMultiply run in a transaction and we pass the variables of this function on the other arguments. The first argument
   * is always the callback. The rest are the arguments of the callback function.
   *
   * @param callback - The callback that will be called to run inside of a transaction.
   * @param args - The arguments of the callback.
   *
   * @return - The return value of the callback.
   */
  async useTransaction<TParameters extends any[], TResult>(
    callback: (transaction: any, ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> {
    return await this.transaction(this, callback, ...args);
  }
}
