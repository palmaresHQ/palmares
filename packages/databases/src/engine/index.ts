/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotImplementedEngineException } from './exceptions';
import { DatabaseConfigurationType } from '../types';
import { EngineType, EngineInitializedModels } from './types';
import EngineFields, {
  EngineFieldParser,
  EngineAutoFieldParser,
  EngineBigAutoFieldParser,
  EngineBigIntegerFieldParser,
  EngineCharFieldParser,
  EngineDateFieldParser,
  EngineDecimalFieldParser,
  EngineForeignKeyFieldParser,
  EngineIntegerFieldParser,
  EngineTextFieldParser,
  EngineUuidFieldParser,
} from './fields';
import EngineMigrations from './migrations';
import EngineQuery, {
  EngineGetQuery,
  EngineQuerySearch,
  EngineSetQuery,
  EngineRemoveQuery,
  EngineQueryOrdering,
} from './query';
import { Model } from '../models/model';
import EngineModels from './model';
import { Field } from '../models/fields';
import type { factoryFunctionForDefaultModelTranslateCallback } from '../models/utils';

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
export default class Engine {
  connectionName!: string;
  databaseSettings!: DatabaseConfigurationType;
  initializedModels: EngineInitializedModels = {};
  models!: EngineModels;
  fields!: EngineFields;
  query!: EngineQuery;
  migrations!: EngineMigrations;
  ModelType: any;
  instance: any;
  __argumentsUsed!: any;
  __ignoreNotImplementedErrors = false;
  __modelsFilteredOutOfEngine!: { [modelName: string]: typeof Model };
  __modelsOfEngine!: { [modelName: string]: typeof Model };
  __indirectlyRelatedModels: {
    [modelName: string]: { [relatedModelName: string]: string[] };
  } = {};

  /**
   * Factory function for creating a new Engine instance. Your engine should always implement this function
   * as static and return a new instance of your engine.
   *
   * @returns - Will return a new engine instance.
   */
  static async new(..._args: any[]): Promise<[any, Engine]> {
    throw new NotImplementedEngineException('new');
  }

  /**
   * Duplicates this instance to a new instance so we can work on it instead of the default one. Generally
   * you will not need to worry too much about this, this is used more on migrations so we can keep the state
   * models separated from the original models.
   *
   * @example
   * ```ts
   * async duplicate(getNewEngine: () => Promise<Engine>) {
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
  async duplicate(_getNewEngine: (...args: Parameters<typeof Engine['new']>) => Promise<Engine>): Promise<Engine> {
    throw new NotImplementedEngineException('duplicate');
  }

  /**
   * We use this to see check if we have a connection to the database or not. We will only translate the models if we
   * have a connection to the database. If your orm does not rely on a connection to create the models you can return
   * true by default.
   *
   * @return - Return true if the database is connected or false otherwise.
   */
  async isConnected(): Promise<boolean> {
    throw new NotImplementedEngineException('isConnected');
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
  async close?(_engine: Engine, _connectionName: string): Promise<void> {
    throw new NotImplementedEngineException('close');
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
  async initializeModel(
    _engine: Engine,
    _model: Model,
    _defaultInitializeModelCallback: ReturnType<typeof factoryFunctionForDefaultModelTranslateCallback>
  ): Promise<any> {
    new NotImplementedEngineException('initializeModel');
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
  async transaction<TParameters extends Array<any>, TResult>(
    callback: (transaction: any, ...args: TParameters) => TResult | Promise<TResult>,
    ...args: TParameters
  ): Promise<TResult> {
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
  EngineQueryOrdering,
  EngineFieldParser,
  EngineAutoFieldParser,
  EngineBigAutoFieldParser,
  EngineBigIntegerFieldParser,
  EngineCharFieldParser,
  EngineDateFieldParser,
  EngineDecimalFieldParser,
  EngineForeignKeyFieldParser,
  EngineIntegerFieldParser,
  EngineTextFieldParser,
  EngineUuidFieldParser,
  EngineModels,
};
