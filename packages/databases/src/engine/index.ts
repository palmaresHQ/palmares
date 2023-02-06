/* eslint-disable @typescript-eslint/no-unused-vars */
import { logging } from '@palmares/core';

import { NotImplementedEngineException } from './exceptions';
import { DatabaseConfigurationType } from '../types';
import {
  LOGGING_DATABASE_IS_NOT_CONNECTED,
  LOGGING_DATABASE_CLOSING,
} from '../utils';
import { EngineType, EngineInitializedModels } from './types';
import EngineFields from './fields';
import EngineMigrations from './migrations';
import EngineQuery from './query';
import { Model } from '../models/model';
import EngineGetQuery from './query/get';
import EngineSetQuery from './query/set';
import EngineRemoveQuery from './query/remove';
import EngineQuerySearch from './query/search';

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
export default class Engine<M extends Model = Model> implements EngineType {
  databaseName: string;
  databaseSettings: DatabaseConfigurationType<any, any>;
  initializedModels: EngineInitializedModels = {};
  fields: EngineFields;
  query: EngineQuery;
  migrations: EngineMigrations;
  ModelType: any;
  instance: any;
  _indirectlyRelatedModels: {
    [modelName: string]: { [relatedModelName: string]: string[] };
  } = {};

  constructor(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<any, any>,
    fields: typeof EngineFields,
    query: {
      query: typeof EngineQuery;
      get: typeof EngineGetQuery;
      set: typeof EngineSetQuery;
      remove: typeof EngineRemoveQuery;
      search: typeof EngineQuerySearch;
    },
    migration: typeof EngineMigrations
  ) {
    this.databaseName = databaseName;
    this.databaseSettings = databaseSettings;
    this.fields = new fields(this);
    this.query = new query.query(
      this,
      query.get,
      query.set,
      query.remove,
      query.search
    );
    this.migrations = new migration(this, this.fields);
  }

  /**
   * Factory function for creating a new Engine instance. Your engine should always implement this function
   * as static and return a new instance of your engine.
   */
  static async new(
    databaseName: string,
    databaseSettings: DatabaseConfigurationType<string, object>
  ): Promise<Engine> {
    throw new NotImplementedEngineException('new');
  }

  /**
   * Duplicates this instance to a new instance so we can work on it instead of the default one. Generally
   * you will not need to worry too much about this, this is used more on migrations so we can keep the state
   * models separated from the original models.
   *
   * @returns - A new engine instance after calling `.new` static method.
   */
  async duplicate(): Promise<Engine> {
    const newInstance = await (this.constructor as typeof Engine).new(
      this.databaseName,
      this.databaseSettings
    );
    newInstance.initializedModels = { ...this.initializedModels };
    return newInstance;
  }

  /**
   * We use this to see check if we have a connection to the database or not. We will only translate the models if we
   * have a connection to the database. If your orm does not rely on a connection to create the models you can return
   * true by default.
   *
   * @return - Return true if the database is connected or false otherwise.
   */
  async isConnected(): Promise<boolean> {
    await logging.logMessage(LOGGING_DATABASE_IS_NOT_CONNECTED, {
      databaseName: this.databaseName,
    });
    return false;
  }

  /**
   * Called when we want to close all of the connections to the database, if your engine can close the connection automatically
   * this don't need to be used.
   *
   * Please, call the this with `super.close()`, so we can log to the user that we are closing the database connection.
   */
  async close(): Promise<void> {
    await logging.logMessage(LOGGING_DATABASE_CLOSING, {
      databaseName: this.databaseName,
    });
  }

  /**
   * `initializeModel` will be called to translate the model to a instance of something that your engine can understand.
   * For that you should use the `EngineFields`. `EngineFields`, as explained in the class, is for translating each particular field
   * of the model to something that the orm can understand. This should return the model translated so the user can use it.
   *
   * On Palmares, the user will almost never make queries using our `ORM`, cause we don't have one, an instance is just the object
   * that the user can use to make queries.
   *
   * Example:
   * - Sequelize this would be the `User` on this example:
   * ```
   * const { Sequelize, Model, DataTypes } = require("sequelize");
   * const sequelize = new Sequelize("sqlite::memory:");
   *
   * const User = sequelize.define("user", {
   *    name: DataTypes.TEXT,
   *    favoriteColor: {
   *      type: DataTypes.TEXT,
   *      defaultValue: 'green'
   *    },
   *    age: DataTypes.INTEGER,
   *    cash: DataTypes.INTEGER
   * });
   *
   * ```
   * - On prisma, this would be `prisma.user`
   * ```
   * const { PrismaClient } = require('@prisma/client')
   *
   * const prisma = new PrismaClient()
   *
   * const users = await prisma.user.findMany() // here prisma.user is what we would need to return.
   * ```
   *
   * P.S.: Don't forget to call the base class with `super.initializeModel(model, theInstanceOfYourCustomModel)` so we can save it
   * on the `initializedModels` object n the class instance.
   *
   * @param model - The Palmares model instance so we can translate it.
   * @param modelInstance - The instance of the model translated (this is not needed when overriding this function)
   *
   * @returns - The instance of the translated model.
   */
  async initializeModel(model: Model, modelInstance?: any): Promise<any> {
    this.initializedModels[model.name] = modelInstance;
    return modelInstance;
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
   * const result = await engineInstance.transaction(transactionMultiply, 2, 2)
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
  async transaction<P extends Array<any>, R>(
    callback: (transaction: any, ...args: P) => R | Promise<R>,
    ...args: P
  ): Promise<R> {
    const transact = undefined;
    return await Promise.resolve(callback(transact, ...args));
  }
}

export {
  EngineQuery,
  EngineFields,
  EngineMigrations,
  EngineGetQuery,
  EngineSetQuery,
  EngineRemoveQuery,
  EngineQuerySearch,
};
