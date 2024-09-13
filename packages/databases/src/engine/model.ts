import { NotImplementedAdapterException } from './exceptions';

import type { DatabaseAdapter } from '.';
import type { ModelOptionsType } from '..';
import type { Field } from '../models/fields';
import type { Model } from '../models/model';

/**
 * Functional approach to creating a model adapter instead of the default class/inheritance approach.
 */
export function adapterModels<
  TTranslateOptionsFunction extends AdapterModels<any>['translateOptions'],
  TTranslateFieldsFunction extends AdapterModels<any>['translateFields'],
  TTranslateFunction extends AdapterModels<any>['translate'],
  TAfterModelsTranslationFunction extends AdapterModels<any>['afterModelsTranslation'],
  TCustomOptionsFunction extends (typeof AdapterModels)['customOptions']
>(args: {
  /**
   * Used for translating the options of the model. Options of the model are things like the `tableName`, `indexes`,
   * `timestamps`, etc. If your engine does not offer the option to implement the options, just return the `options`
   * argument as is.
   *
   * @example
   * ```ts
   * async translateOptions(
   *   _engine: SequelizeEngine,
   *   modelName: string,
   *   options: ModelOptionsType
   * ): Promise<ModelOptions> {
   *   const indexes = this.#indexes[modelName] ? this.#indexes[modelName] : [];
   *   return {
   *     underscored: options?.underscored || true,
   *     indexes: indexes,
   *     timestamps: false,
   *     tableName: options?.tableName,
   *     ...options?.customOptions,
   *   };
   * }
   * ```
   *
   * @param engine - Your custom engine instance.
   * @param modelName - The name of the model that is being translated.
   * @param modelOptions - The options of the model that is being translated.
   */
  translateOptions: TTranslateOptionsFunction;

  /**
   * This method is completely optional, we already try to solve that for you. What this method does is that it is used
   * to translate the fields of the model. We already give you the field entries of the model on `_fieldEntriesOfModel`.
   * Since we already has a default implementation you can opt to use it by calling `_defaultTranslateFieldsCallback`.
   *
   * If you opt to NOT use it, you should call `engine.fields.translateField` for each field of the model. If
   * `translateField` is not implemented on EngineFields, you can call `_defaultTranslateFieldCallback` that already
   * has a default implementation for you.
   *
   * This should return an object with the fields translated to something that YOUR ORM can understand. Each key
   * of the object is the field name and the value is the translated field.
   *
   * **IMPORTANT:** By default, if the `translate` method on any of your FieldsParser returns `undefined` or `null`,
   * it will **NOT** be added to the object. That's useful if you want to add it later and lazy evaluate that.
   *
   * _Note: All examples below are considering that we are translating to sequelize._
   *
   * - **If you opt out of the default implementation of both the `_defaultTranslateFieldCallback` and
   * `_defaultTranslateFieldsCallback`, this is how you can do it:**
   *
   * @example
   * ```ts
   * async function translateFields(
   *   engine: DatabaseAdapter,
   *   modelName: string,
   *   fieldEntriesOfModel: [string, Field][],
   *   model: Model,
   *   defaultTranslateFieldCallback: (field: Field) => Promise<any>,
   *   _: () => Promise<{ [key: string]: any }>
   * ) {
   *   const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = {};
   *   for (const [fieldName, field] of fieldEntriesOfModel) {
   *     const translatedAttributes = await engine.fields.translateField(engine, field, defaultTranslateFieldCallback);
   *     const isTranslatedAttributeDefined = translatedAttributes !== undefined &&
   *        translatedAttributes !== null && typeof translatedAttributes === 'object';
   *     if (isTranslatedAttributeDefined) fieldAttributes[fieldName] = translatedAttributes;
   *   }
   *
   *   return fieldAttributes;
   * }
   * ```
   *
   * - **If you opt in of the default implementation of just the `_defaultTranslateFieldCallback`,
   * this is how you can do it: (this assumes that `translateField` was not defined on your _EngineFields_
   * implementation)**
   *
   * @example
   * ```ts
   * async function translateFields(
   *   engine: DatabaseAdapter,
   *   modelName: string,
   *   fieldEntriesOfModel: [string, Field][],
   *   model: Model,
   *   defaultTranslateFieldCallback: (field: Field) => Promise<any>,
   *   _: () => Promise<{ [key: string]: any }>
   * ) {
   *   const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = {};
   *   for (const [fieldName, field] of fieldEntriesOfModel) {
   *     const translatedAttributes = await defaultTranslateFieldCallback(field);
   *     const isTranslatedAttributeDefined = translatedAttributes !== undefined &&
   *        translatedAttributes !== null && typeof translatedAttributes === 'object';
   *     if (isTranslatedAttributeDefined) fieldAttributes[fieldName] = translatedAttributes;
   *   }
   *
   *   return fieldAttributes;
   * }
   * ```
   *
   * - **If you opt in of the default implementation of just the
   * `_defaultTranslateFieldsCallback`, this is how you can do it:
   * (assuming that you want to let it translate first and then do anything with the fields afterwards)**
   *
   * @example
   * ```ts
   * async function translateFields(
   *   _engine: DatabaseAdapter,
   *   _modelName: string,
   *   _fieldEntriesOfModel: [string, Field][],
   *   _model: Model,
   *   _: (field: Field) => Promise<any>,
   *   defaultTranslateFieldsCallback: () => Promise<{ [key: string]: any }>
   * ) {
   *   const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = await defaultTranslateFieldsCallback();
   *
   *   // Do something with the fields after they were translated
   *
   *   return fieldAttributes;
   * }
   * ```
   *
   * Last but not least, you can totally opt out of using it. If that's your choice, just don't implement it and we will
   * use the default implementation.
   * On your `translate` method you should see that `fields` object will be an object where the keys are the field names
   * and the values are the translated fields.
   *
   * @param engine - Your custom engine instance.
   * @param modelName - The name of the model that is being translated.
   * @param fieldEntriesOfModel - The field entries of the model. It's an array of tuples where the first element is the
   * field name and the second is the field.
   * @param model - The model that is being translated.
   * @param defaultTranslateFieldCallback - The default implementation of the `translateField` method that Palmares
   * provides. If you have a `translateField` implementation on your `EngineFields` implementation, you need to make
   * sure that you pass it to this method.
   * @param defaultTranslateFieldsCallback - The default implementation of the `translateFields` method that Palmares
   * provides.
   *
   * @returns - An object where the keys are the field names and the values are the translated values.
   */
  translateFields?: TTranslateFieldsFunction;

  /**
   * The `translate` method will be called to translate the model to a instance of something that your engine/ORM can
   * understand. In other words, we will transform a Palmares model to YOUR model.
   *
   * ## first, a little explanation what it does:
   *
   * On Palmares, we DO NOT OFFER an ORM by default, we are really bad coders and we trust others (like you) to do that
   * for us. Translating a model means taking what we offer for them and passing  all that data to you. You will decide
   * what to do with that. Some ORMs like DrizzleORM, Sequelize, TypeORM, etc. Will have a default implementation of
   * how a model should be implemented. That's what this method does, it will take the palmares model and translate
   * to your own ORM.
   *
   * - On Sequelize this would be the `User` on this example:
   *
   * @example
   * ```ts
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
   * ```
   *
   * - On prisma, this would be `prisma.user`
   *
   * @example
   * ```ts
   * const { PrismaClient } = require('@prisma/client')
   *
   * const prisma = new PrismaClient()
   *
   * const users = await prisma.user.findMany() // here prisma.user is what we would need you to return.
   * ```
   *
   * Prisma, actually has a `gotcha` there. Because you might want to transform the data to a string before actually
   * returning the actual model implementation. That's why we have the `afterModelsTranslation` method. You can return
   * a string from here, and on the `afterModelsTranslation` method you can build the schema file and run the
   * `prisma generate` command to generate the models. And just after that return the models.
   *
   * **This is an example assuming that you are translating sequelize**
   *
   * @example
   * ```ts
   * async translate(
   *   engine: SequelizeEngine,
   *   modelName: string,
   *   model: ModelBaseClass,
   *   defaultTranslateCallback: () => Promise<{ options: ModelOptions; fields: ModelAttributes<any> }>,
   *   _: (_field: Field) => Promise<any>,
   *   __: () => Promise<{ [key: string]: ModelAttributeColumnOptions }>
   * ): Promise<ModelCtor<Model> | undefined> {
   *   const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();
   *
   *   translatedOptions.indexes = getIndexes(engine.connectionName, modelName);
   *
   *   const sequelizeModel = new Function('sequelizeModel', `return class ${modelName} extends sequelizeModel {}`)(
   *      Model
   *    );
   *
   *   const translatedModel = sequelizeModel.init(translatedAttributes, {
   *     sequelize: engine.instance,
   *     ...translatedOptions,
   *   });
   *
   *   if (translatedModel !== undefined) await this.#translateOrdering(model, translatedModel);
   *   return translatedModel;
   * }
   * ```
   *
   * @param engine - The instance of your DatabaseAdapter.
   * @param modelName - The name of the model that is being translated.
   * @param model - The Palmares model instance so we can translate it.
   * @param fieldEntriesOfModel - The field entries of the model. It's an array of tuples where the first element is the
   * field name and the second is the field.
   * @param modelOptions - The options of the model that is being translated.
   * @param defaultTranslateCallback - Instead of manually calling the `translateFields` and `translateOptions` methods,
   * you can call this function and it will do that for you. It will return an object
   * with the `options` and `fields` keys. The `options` key will be the return of the `translateOptions` method and the
   * `fields` key will be the return of the `translateFields` method.
   * @param defaultTranslateFieldCallback - This is passed here so you can pass to `translateFields` if you wish to call
   * it manually.
   * @param defaultTranslateFieldsCallback - This is passed here so you can pass to `translateFields` if you wish to
   * call it manually.
   *
   * @returns - The instance of the translated model.
   */
  translate: TTranslateFunction;

  /**
   * Some ORMs like Prisma requires you to run a generator command to generate the models to something that can be used
   * inside Typescript. With this method you can run this generator command.
   * This is called just once after all your models were translated.
   *
   * You have to options to return:
   * 1. You can return an array with all your models translated again (that's useful if you want to do one last change
   * to your models).
   * 2. You can return undefined and we will use the returned models from the `translate` method.
   *
   * @example
   * ```ts
   * async afterModelsTranslation(
   *    _engine: DatabaseAdapter, _models: [string, any][]
   * ): Promise<[string, any][] | undefined> {
   *   spawn('npx', ['prisma', 'generate'], { stdio: 'inherit' });
   *   return undefined;
   * }
   * ```
   *
   * @param engine - The engine instance.
   * @param models - An array of tuples where the first value is the modelName and the second is the value returned from
   * `translate` method.
   *
   * @returns - An array of tuples where the first value is the modelName and the second is the value returned from
   * `translate` method, or undefined if you don't want to modify the models.
   */
  afterModelsTranslation?: TAfterModelsTranslationFunction;
  /**
   * This method is used just for giving type-safety. If you implement this method, those are custom options that you
   * can pass for your model.
   *
   * For example, if you are using sequelize, those would be the `third` argument from `sequelize.define`.
   */
  customOptions?: TCustomOptionsFunction;
}) {
  class CustomAdapterModel<TModel> extends AdapterModels<TModel> {
    translateOptions = args.translateOptions;
    translateFields = args.translateFields as TTranslateFieldsFunction;
    translate = args.translate;
    afterModelsTranslation = args.afterModelsTranslation as TAfterModelsTranslationFunction;

    static customOptions = args.customOptions as TCustomOptionsFunction;
  }

  return CustomAdapterModel as typeof AdapterModels & {
    customOptions: TCustomOptionsFunction;
    new <TModel>(): AdapterModels<TModel> & {
      translateOptions: TTranslateOptionsFunction;
      translateFields: TTranslateFieldsFunction;
      translate: TTranslateFunction;
      afterModelsTranslation: TAfterModelsTranslationFunction;
      setGetTranslatedModels: <TGetTranslatedModelsFunction extends () => any>(
        getTranslatedModels: TGetTranslatedModelsFunction
      ) => Omit<AdapterModels<TModel>, 'getTranslatedModels'> & {
        getTranslatedModels: TGetTranslatedModelsFunction;
      };
    };
  };
}

/**
 * Used for translating a model from palmares to a model that your engine/ORM can understand. This is used alongside
 * the `EngineFields` instance.
 */
export class AdapterModels<TModel> {
  /**
   * Used for translating the options of the model. Options of the model are things like the `tableName`, `indexes`,
   * `timestamps`, etc. If your engine does not offer the option to implement the options, just return the `options`
   * argument as is.
   *
   * @example
   * ```ts
   * async translateOptions(
   *   _engine: SequelizeEngine,
   *   modelName: string,
   *   options: ModelOptionsType
   * ): Promise<ModelOptions> {
   *   const indexes = this.#indexes[modelName] ? this.#indexes[modelName] : [];
   *   return {
   *     underscored: options?.underscored || true,
   *     indexes: indexes,
   *     timestamps: false,
   *     tableName: options?.tableName,
   *     ...options?.customOptions,
   *   };
   * }
   * ```
   *
   * @param engine - Your custom engine instance.
   * @param modelName - The name of the model that is being translated.
   * @param modelOptions - The options of the model that is being translated.
   */
  // eslint-disable-next-line ts/require-await
  async translateOptions(_engine: DatabaseAdapter, _modelName: string, _modelOptions: ModelOptionsType): Promise<any> {
    throw new NotImplementedAdapterException('translateOptions');
  }

  /**
   * This method is completely optional, we already try to solve that for you. What this method does is that it is
   * used to translate the fields of the model. We already give you the field entries of the model on
   * `_fieldEntriesOfModel`. Since we already has a default implementation you can opt to use it by
   * calling `_defaultTranslateFieldsCallback`.
   *
   * If you opt to NOT use it, you should call `engine.fields.translateField` for each field of the model. If
   * `translateField` is not implemented on EngineFields, you can call `_defaultTranslateFieldCallback` that
   * already has a default implementation for you.
   *
   * This should return an object with the fields translated to something that YOUR ORM can understand. Each
   * key of the object is the field name and the value is the translated field.
   *
   * **IMPORTANT:** By default, if the `translate` method on any of your FieldsParser returns `undefined` or
   * `null`, it will **NOT** be added to the object. That's useful if you want to add it later and lazy evaluate that.
   *
   * _Note: All examples below are considering that we are translating to sequelize._
   *
   * - **If you opt out of the default implementation of both the `_defaultTranslateFieldCallback` and
   * `_defaultTranslateFieldsCallback`, this is how you can do it:**
   *
   * @example
   * ```ts
   * async function translateFields(
   *   engine: DatabaseAdapter,
   *   modelName: string,
   *   fieldEntriesOfModel: [string, Field][],
   *   model: Model,
   *   defaultTranslateFieldCallback: (field: Field) => Promise<any>,
   *   _: () => Promise<{ [key: string]: any }>
   * ) {
   *   const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = {};
   *   for (const [fieldName, field] of fieldEntriesOfModel) {
   *     const translatedAttributes = await engine.fields.translateField(engine, field, defaultTranslateFieldCallback);
   *     const isTranslatedAttributeDefined = translatedAttributes !== undefined &&
   *        translatedAttributes !== null && typeof translatedAttributes === 'object';
   *     if (isTranslatedAttributeDefined) fieldAttributes[fieldName] = translatedAttributes;
   *   }
   *
   *   return fieldAttributes;
   * }
   * ```
   *
   * - **If you opt in of the default implementation of just the `_defaultTranslateFieldCallback`,
   * this is how you can do it:
   * (this assumes that `translateField` was not defined on your _EngineFields_ implementation)**
   *
   * @example
   * ```ts
   * async function translateFields(
   *   engine: DatabaseAdapter,
   *   modelName: string,
   *   fieldEntriesOfModel: [string, Field][],
   *   model: Model,
   *   defaultTranslateFieldCallback: (field: Field) => Promise<any>,
   *   _: () => Promise<{ [key: string]: any }>
   * ) {
   *   const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = {};
   *   for (const [fieldName, field] of fieldEntriesOfModel) {
   *     const translatedAttributes = await defaultTranslateFieldCallback(field);
   *     const isTranslatedAttributeDefined = translatedAttributes !== undefined &&
   *        translatedAttributes !== null && typeof translatedAttributes === 'object';
   *     if (isTranslatedAttributeDefined) fieldAttributes[fieldName] = translatedAttributes;
   *   }
   *
   *   return fieldAttributes;
   * }
   * ```
   *
   * - **If you opt in of the default implementation of just the `_defaultTranslateFieldsCallback`, this
   * is how you can do it:
   * (assuming that you want to let it translate first and then do anything with the fields afterwards)**
   *
   * @example
   * ```ts
   * async function translateFields(
   *   _engine: DatabaseAdapter,
   *   _modelName: string,
   *   _fieldEntriesOfModel: [string, Field][],
   *   _model: Model,
   *   _: (field: Field) => Promise<any>,
   *   defaultTranslateFieldsCallback: () => Promise<{ [key: string]: any }>
   * ) {
   *   const fieldAttributes: { [key: string]: ModelAttributeColumnOptions } = await defaultTranslateFieldsCallback();
   *
   *   // Do something with the fields after they were translated
   *
   *   return fieldAttributes;
   * }
   * ```
   *
   * Last but not least, you can totally opt out of using it. If that's your choice, just don't implement it and we will
   * use the default implementation.
   * On your `translate` method you should see that `fields` object will be an object where the keys are the field names
   * and the values are the translated fields.
   *
   * @param engine - Your custom engine instance.
   * @param modelName - The name of the model that is being translated.
   * @param fieldEntriesOfModel - The field entries of the model. It's an array of tuples where the first element is the
   * field name and the second is the field.
   * @param model - The model that is being translated.
   * @param defaultTranslateFieldCallback - The default implementation of the `translateField` method that Palmares
   * provides. If you have a `translateField` implementation on your `EngineFields` implementation, you need to make
   * sure that you pass it to this method.
   * @param defaultTranslateFieldsCallback - The default implementation of the `translateFields` method that Palmares
   * provides.
   *
   * @returns - An object where the keys are the field names and the values are the translated values.
   */
  // eslint-disable-next-line ts/require-await
  async translateFields?(
    _engine: DatabaseAdapter,
    _modelName: string,
    _fieldEntriesOfModel: [string, Field][],
    _model: Model,
    _defaultTranslateFieldCallback: (_field: Field) => Promise<any>,
    _defaultTranslateFieldsCallback: () => Promise<{ [key: string]: any }>
  ): Promise<{ [key: string]: any }> {
    throw new NotImplementedAdapterException('translateFields');
  }

  /**
   * The `translate` method will be called to translate the model to a instance of something that your engine/ORM can
   * understand. In other words, we will transform a Palmares model to YOUR model.
   *
   * ## first, a little explanation what it does:
   *
   * On Palmares, we DO NOT OFFER an ORM by default, we are really bad coders and we trust others (like you) to do that
   * for us. Translating a model means taking what we offer for them and passing all that data to you. You will decide
   * what to do with that. Some ORMs like DrizzleORM, Sequelize, TypeORM, etc. Will have a default implementation of
   * how a model should be implemented. That's what this method does, it will take the palmares model and translate
   * to your own ORM.
   *
   * - On Sequelize this would be the `User` on this example:
   *
   * @example
   * ```ts
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
   * ```
   *
   * - On prisma, this would be `prisma.user`
   *
   * @example
   * ```ts
   * const { PrismaClient } = require('@prisma/client')
   *
   * const prisma = new PrismaClient()
   *
   * const users = await prisma.user.findMany() // here prisma.user is what we would need you to return.
   * ```
   *
   * Prisma, actually has a `gotcha` there. Because you might want to transform the data to a string before actually
   * returning the actual model implementation. That's why we have the {@link AdapterModels['afterModelsTranslation']}
   * method. You can return a string from here, and on the `afterModelsTranslation` method you can build the schema
   * file and run the `prisma generate` command to generate the models. And just after that return the models.
   *
   * **This is an example assuming that you are translating sequelize**
   * @example
   * ```ts
   * async translate(
   *   engine: SequelizeEngine,
   *   modelName: string,
   *   model: ModelBaseClass,
   *   defaultTranslateCallback: () => Promise<{ options: ModelOptions; fields: ModelAttributes<any> }>,
   *   _: (_field: Field) => Promise<any>,
   *   __: () => Promise<{ [key: string]: ModelAttributeColumnOptions }>
   * ): Promise<ModelCtor<Model> | undefined> {
   *   const { options: translatedOptions, fields: translatedAttributes } = await defaultTranslateCallback();
   *
   *   translatedOptions.indexes = getIndexes(engine.connectionName, modelName);
   *
   *   const sequelizeModel = new Function('sequelizeModel', `return class ${modelName} extends sequelizeModel {}`)(
   *      Model
   *   );
   *
   *   const translatedModel = sequelizeModel.init(translatedAttributes, {
   *     sequelize: engine.instance,
   *     ...translatedOptions,
   *   });
   *
   *   if (translatedModel !== undefined) await this.#translateOrdering(model, translatedModel);
   *   return translatedModel;
   * }
   * ```
   *
   * @param engine - The instance of your DatabaseAdapter.
   * @param modelName - The name of the model that is being translated.
   * @param model - The Palmares model instance so we can translate it.
   * @param fieldEntriesOfModel - The field entries of the model. It's an array of tuples where the first element is
   * the field name and the second is the field.
   * @param modelOptions - The options of the model that is being translated.
   * @param defaultTranslateCallback - Instead of manually calling the `translateFields` and `translateOptions` methods,
   * you can call this function and it will do that for you. It will return an object
   * with the `options` and `fields` keys. The `options` key will be the return of the `translateOptions` method and the
   * `fields` key will be the return of the `translateFields` method.
   * @param defaultTranslateFieldCallback - This is passed here so you can pass to `translateFields` if you wish to call
   * it manually.
   * @param defaultTranslateFieldsCallback - This is passed here so you can pass to `translateFields` if you wish to
   * call it manually.
   *
   * @returns - The instance of the translated model.
   */
  // eslint-disable-next-line ts/require-await
  async translate(
    _engine: DatabaseAdapter,
    _modelName: string,
    _model: Model,
    _fieldEntriesOfModel: [string, Field][],
    _modelOptions: ModelOptionsType,
    _defaultTranslateCallback: () => Promise<{ options: any; fields: { [key: string]: any } }>,
    _defaultTranslateFieldCallback: (_field: Field) => Promise<any>,
    _defaultTranslateFieldsCallback: () => Promise<{ [key: string]: any }>
  ): Promise<any> {
    throw new NotImplementedAdapterException('translate');
  }

  /**
   * Some ORMs like Prisma requires you to run a generator command to generate the models to something that can be used
   * inside Typescript. With this method you can run this generator command.
   * This is called just once after all your models were translated.
   *
   * You have to options to return:
   * 1. You can return an array with all your models translated again (that's useful if you want to do one last change
   * to your models).
   * 2. You can return undefined and we will use the returned models from the `translate` method.
   *
   * @example
   * ```ts
   * async afterModelsTranslation(
   *    _engine: DatabaseAdapter, _models: [string, any][]
   * ): Promise<[string, any][] | undefined> {
   *   spawn('npx', ['prisma', 'generate'], { stdio: 'inherit' });
   *   return undefined;
   * }
   * ```
   *
   * @param engine - The engine instance.
   * @param models - An array of tuples where the first value is the modelName and the second is the value returned from
   * `translate` method.
   *
   * @returns - An array of tuples where the first value is the modelName and the second is the value returned from
   * `translate` method, or undefined if you don't want to modify the models.
   */
  // eslint-disable-next-line ts/require-await
  async afterModelsTranslation?(
    _engine: DatabaseAdapter,
    _models: [string, any][]
  ): Promise<[string, any][] | undefined> {
    throw new NotImplementedAdapterException('afterModelsTranslation');
  }

  // eslint-disable-next-line ts/require-await
  async getModelInstanceForCustomHooks?(
    _engine: DatabaseAdapter,
    _modelName: string,
    _translatedModel: any
  ): Promise<any> {
    throw new NotImplementedAdapterException('getModelInstanceForCustomHooks');
  }

  getTranslatedModels(): TModel {
    return undefined as any;
  }

  /**
   * This method is used just for giving typesafety. If you implement this method, those are custom options that you can
   * pass for your model.
   *
   * For example, if you are using sequelize, those would be the `third` argument from `sequelize.define`.
   */
  static customOptions?(args: any) {
    return args;
  }
}
