import { NotImplementedAdapterException } from './exceptions';

import type DatabaseAdapter from '.';
import type Migration from '../migrations/migrate/migration';
import type { Field } from '../models/fields';
import type { InitializedModelsType } from '../types';


/**
 * Functional approach for the migrations. This is used to run the migrations.
 *
 * DatabaseAdapter migrations enables developers to have migrations easily and automatically, no matter the orm they use.
 *
 * This can run FOR EACH MIGRATION FILE. So if you have 10 migration files this flow will run 10 times.
 * Or you can opt in to batchAll and let your ORM handle the migrations.
 */
export function adapterMigrations<
  TFunctionBatchAll extends AdapterMigration['batchAll'],
  TFunctionInit extends AdapterMigration['init'],
  TFunctionAddModel extends AdapterMigration['addModel'],
  TFunctionRemoveModel extends AdapterMigration['removeModel'],
  TFunctionChangeModel extends AdapterMigration['changeModel'],
  TFunctionAddField extends AdapterMigration['addField'],
  TFunctionChangeField extends AdapterMigration['changeField'],
  TFunctionRenameField extends AdapterMigration['renameField'],
  TFunctionRemoveField extends AdapterMigration['removeField'],
  TFunctionFinish extends AdapterMigration['finish'],
>(args: {
  /**
   * This function is COMPLETELY optional and allows you to batch all of the migrations on a single function. By default we run each migration file one by one, but for stuff like Prisma
   * we do not have this option. Prisma already migrates everything on a single command. So what we do is that instead of running each migration file one by one we run all of them at once.
   * We just generate the current state of the database and pass it to the batch function. Imagine that the state holds the strings of each model, so with that we just need to create the
   * .schema file and let the ORM do the rest.
   *
   * A simple prisma Example (it can be more complicated than that but you get the idea):
   * @example
   * ```ts
   * async currentBatch(engine: DatabaseAdapter, toStateModels: OriginalOrStateModelsByNameType, returnOfInit: any): Promise<void> {
   *   for (const model of Object.values(toStateModels)) {
   *     fs.appendFileSync('./prisma/schema.prisma', model.initialized);
   *   }
   *
   *   execSync('npx prisma migrate dev');
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toStateModels - All of the models on a key/value pair where the key is the name of the model and the value is the model itself.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  batchAll?: TFunctionBatchAll;

  /**
   * This is called before the migrations are run. If you want to initialize something before the migrations run you can use this function, but it's totally optional and not required.
   *
   * **Be aware: what you return from this function will be passed to all of the other functions as the LAST argument.**
   *
   * On Sequelize implementation we use this to initialize the queryInterface that is used on the migrations.
   * @example
   * ```
   * async init(engine: DatabaseAdapter<Sequelize>): Promise<QueryInterface> {
   *   return engine.instance?.getQueryInterface() as QueryInterface;
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   */
  init?: TFunctionInit;

  /**
   * This is called when we are creating a new column on the database. A model represent a table on the database (if we are talking about SQL databases).
   *
   * @example
   * ```ts
   * async addModel(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   migration: Migration
   * ): Promise<void> {
   *   const model = toModel.initialized;
   *
   *   await this.#queryInterface.createTable(
   *     model.options.tableName as string,
   *     model.getAttributes(),
   *     Object.assign(model.options, {
   *       transaction: migration.transaction,
   *     })
   *   );
   *
   *   await this.#handleCircularDependencies(engine, migration.transaction, { toModel });
   *   await this.#handleIndexes(migration.transaction, { toModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - The model that will be created on the database.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  addModel: TFunctionAddModel;
  /**
   * Removes a model/table from the database. This removes everything from the database, no worries about the data.
   *
   * A simple sequelize implementation:
   * @example
   * ```ts
   * async removeModel(
   *   _: DatabaseAdapter<Sequelize>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   migration: Migration
   * ): Promise<void> {
   *   const tableNameToRemove = fromModel.initialized.options.tableName as string;
   *   const transaction = migration.transaction;
   *   await this.#queryInterface.dropTable(tableNameToRemove, { transaction });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _fromModel - How the model WAS structured before running the migration.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  removeModel: TFunctionRemoveModel;
  /**
   * Used when the user changes the model. Let's say that the user changed the model name, added a new index, changed the ordering, changed pretty much any model configuration.
   *
   * This is called when the model had changed, not the fields but the options.
   *
   * @example
   * ```ts
   * async changeModel(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   migration: Migration
   * ): Promise<void> {
   *   const fromTableName = fromModel.initialized.tableName;
   *   const toTableName = toModel.initialized.tableName;
   *   const hasTheNameOfTheTableChanged = fromTableName !== toTableName;
   *
   *   if (hasTheNameOfTheTableChanged) {
   *     await this.#queryInterface.renameTable(fromTableName, toTableName, {
   *       transaction: migration.transaction,
   *     });
   *   }
   *
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { fromModel, toModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel -  How the model state WILL BE before running the migration.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  changeModel: TFunctionChangeModel;
  /**
   * When the user already has a model and you add a new field to the model this is used. So, in other words, this is used to add new fields to existing models.
   *
   * Here is a sequelize example:
   * @example
   * ```ts
   * async addField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldName: string,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   let sequelizeAttribute = toModel.initialized.getAttributes()[fieldName];
   *   const doesNotExistSequelizeAttribute = sequelizeAttribute === undefined;
   *   if (doesNotExistSequelizeAttribute) {
   *     const originalFieldName = toModel.original.fields[fieldName]?.fieldName;
   *     sequelizeAttribute = toModel.initialized.rawAttributes[originalFieldName];
   *   }
   *
   *   await this.#queryInterface.addColumn(
   *     toModel.initialized.options.tableName as string,
   *     sequelizeAttribute.field as string,
   *     sequelizeAttribute,
   *     { transaction: migration.transaction }
   *   );
   *
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { fromModel, toModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration. You can take the field data from the actual model instance.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldName -THe name of the field that is being added to the database.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  addField: TFunctionAddField;
  /**
   * When the user already has a model and a field but he makes changes to this field adding another attribute, changing the type, changing the name, etc.
   *
   * This is called when the field had changed, not the model but the field specifically.
   *
   * Here is a Sequelize example:
   * @example
   * ```ts
   * async changeField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldBefore: Field<any, any, any, any, any, any, any, any>,
   *   fieldAfter: Field<any, any, any, any, any, any, any, any>,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   const attributesAsArray = Object.values(toModel.initialized.getAttributes());
   *   const initializedAttribute = attributesAsArray.find((attribute) => attribute.field === fieldAfter.databaseName);
   *   const tableName = toModel.initialized.options.tableName as string;
   *   if (initializedAttribute) {
   *     const isOfTypeRelation = fieldBefore instanceof ForeignKeyField;
   *     // This removes the constraint, when we change the column sequelize automatically creates a new constraint
   *     // because of that we remove the old one.
   *     if (isOfTypeRelation) {
   *       const constraints: GetForeignKeyReferencesForTableReturnType[] | undefined =
   *         (await this.#queryInterface.getForeignKeyReferencesForTable(tableName, {
   *           transaction: migration.transaction,
   *         })) as GetForeignKeyReferencesForTableReturnType[] | undefined;
   *       if (constraints) {
   *         const constraintsToRemove = constraints?.filter(
   *           (constraint) => constraint.columnName === fieldBefore.databaseName
   *         );
   *         for (const constraintToRemove of constraintsToRemove) {
   *           await this.#queryInterface.removeConstraint(tableName, constraintToRemove.constraintName as string, {
   *             transaction: migration.transaction,
   *           });
   *         }
   *       }
   *     }
   *   }
   *   await this.#queryInterface.changeColumn(
   *     tableName,
   *     fieldAfter.databaseName as unknown as string,
   *     initializedAttribute,
   *     {
   *       transaction: migration.transaction,
   *     }
   *   );
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { toModel, fromModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldBefore - How the field WAS
   * @param _fieldAfter - How the field WILL BE.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  changeField: TFunctionChangeField;
  /**
   * Pretty much called whenever the user renames a field. Why this is done outside of the `changeField`? Because renaming a field can do change some values on the database. Some databases
   * might prefer to recreate the field from scratch, we opt for maintaining the data and renaming the field only.
   *
   * Here is a Sequelize example:
   * @example
   * ```ts
   * async renameField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldNameBefore: string,
   *   fieldNameAfter: string,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   const databaseNameAfter = toModel.initialized.getAttributes()[fieldNameAfter].field as string;
   *   const databaseNameBefore = toModel.initialized.getAttributes()[fieldNameBefore].field as string;
   *   const tableNameWhereRenameHappened = toModel.initialized.options.tableName as string;
   *
   *   await this.#queryInterface.renameColumn(tableNameWhereRenameHappened, databaseNameBefore, databaseNameAfter, {
   *     transaction: migration.transaction,
   *   });
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { toModel, fromModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldNameBefore - How the name of the model WAS.
   * @param _fieldNameAfter - How the name of the model WILL BE.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  renameField: TFunctionRenameField;

  /**
   * When a model already exists but we just want to remove an existing field that was created (if it was renamed we call renamed. We actually ask the user for what happened)
   *
   * Here is a Sequelize example:
   * @example
   * ```ts
   * async removeField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldName: string,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   const columnName = fromModel.initialized.getAttributes()[fieldName].field as string;
   *   const tableName = fromModel.initialized.options.tableName as string;
   *   await this.#queryInterface.removeColumn(tableName, columnName, {
   *     transaction: migration.transaction,
   *   });
   *   await this.#handleIndexes(migration, { toModel, fromModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldName - The name of the field that will be removed (THAT'S NOT THE DB NAME, BUT THE JS NAME)
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  removeField: TFunctionRemoveField;
  /**
   * When the migration file finishes running and you want to do some cleanup we call this function. If you don't have any cleanup to do, don't implement this function.
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  finish?: TFunctionFinish;
}) {
  class CustomAdapterMigration extends AdapterMigration {
    batchAll = args.batchAll as TFunctionBatchAll;
    init = args.init as TFunctionInit;
    addModel = args.addModel;
    removeModel = args.removeModel;
    changeModel = args.changeModel;
    addField = args.addField;
    changeField = args.changeField;
    renameField = args.renameField;
    removeField = args.removeField;
    finish = args.finish as TFunctionFinish;
  }

  return CustomAdapterMigration as typeof AdapterMigration & {
    new (): AdapterMigration & {
      batchAll: TFunctionBatchAll;
      init: TFunctionInit;
      addModel: TFunctionAddModel;
      removeModel: TFunctionRemoveModel;
      changeModel: TFunctionChangeModel;
      addField: TFunctionAddField;
      changeField: TFunctionChangeField;
      renameField: TFunctionRenameField;
      removeField: TFunctionRemoveField;
      finish: TFunctionFinish;
    };
  };
}

/**
 * DatabaseAdapter migrations enables developers to have migrations easily and automatically, no matter the orm they use.
 *
 * This can run FOR EACH MIGRATION FILE. So if you have 10 migration files this flow will run 10 times.
 * Or you can opt in to batchAll and let your ORM handle the migrations.
 */
export default class AdapterMigration {
  /**
   * This function is COMPLETELY optional and allows you to batch all of the migrations on a single function. By default we run each migration file one by one, but for stuff like Prisma
   * we do not have this option. Prisma already migrates everything on a single command. So what we do is that instead of running each migration file one by one we run all of them at once.
   * We just generate the current state of the database and pass it to the batch function. Imagine that the state holds the strings of each model, so with that we just need to create the
   * .schema file and let the ORM do the rest.
   *
   * A simple prisma Example (it can be more complicated than that but you get the idea):
   * @example
   * ```ts
   * async currentBatch(engine: DatabaseAdapter, toStateModels: OriginalOrStateModelsByNameType, returnOfInit: any): Promise<void> {
   *   for (const model of Object.values(toStateModels)) {
   *     fs.appendFileSync('./prisma/schema.prisma', model.initialized);
   *   }
   *
   *   execSync('npx prisma migrate dev');
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toStateModels - All of the models on a key/value pair where the key is the name of the model and the value is the model itself.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async batchAll?(
    _engine: DatabaseAdapter,
    _toStateModels: { [modelName: string]: InitializedModelsType['initialized'] },
    _returnOfInit: any
  ): Promise<void> {
    throw new NotImplementedAdapterException('batch');
  }

  /**
   * This is called before the migrations are run. If you want to initialize something before the migrations run you can use this function, but it's totally optional and not required.
   *
   * **Be aware: what you return from this function will be passed to all of the other functions as the LAST argument.**
   *
   * On Sequelize implementation we use this to initialize the queryInterface that is used on the migrations.
   * @example
   * ```
   * async init(engine: DatabaseAdapter<Sequelize>): Promise<QueryInterface> {
   *   return engine.instance?.getQueryInterface() as QueryInterface;
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   */
  // eslint-disable-next-line ts/require-await
  async init?(_engine: DatabaseAdapter): Promise<any> {
    return;
  }

  /**
   * This is called when we are creating a new column on the database. A model represent a table on the database (if we are talking about SQL databases).
   *
   * @example
   * ```ts
   * async addModel(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   migration: Migration
   * ): Promise<void> {
   *   const model = toModel.initialized;
   *
   *   await this.#queryInterface.createTable(
   *     model.options.tableName as string,
   *     model.getAttributes(),
   *     Object.assign(model.options, {
   *       transaction: migration.transaction,
   *     })
   *   );
   *
   *   await this.#handleCircularDependencies(engine, migration.transaction, { toModel });
   *   await this.#handleIndexes(migration.transaction, { toModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - The model that will be created on the database.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async addModel(
    _engine: DatabaseAdapter,
    _toModel: InitializedModelsType,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * Removes a model/table from the database. This removes everything from the database, no worries about the data.
   *
   * A simple sequelize implementation:
   * @example
   * ```ts
   * async removeModel(
   *   _: DatabaseAdapter<Sequelize>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   migration: Migration
   * ): Promise<void> {
   *   const tableNameToRemove = fromModel.initialized.options.tableName as string;
   *   const transaction = migration.transaction;
   *   await this.#queryInterface.dropTable(tableNameToRemove, { transaction });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _fromModel - How the model WAS structured before running the migration.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async removeModel(
    _engine: DatabaseAdapter,
    _fromModel: InitializedModelsType,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * Used when the user changes the model. Let's say that the user changed the model name, added a new index, changed the ordering, changed pretty much any model configuration.
   *
   * This is called when the model had changed, not the fields but the options.
   *
   * @example
   * ```ts
   * async changeModel(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   migration: Migration
   * ): Promise<void> {
   *   const fromTableName = fromModel.initialized.tableName;
   *   const toTableName = toModel.initialized.tableName;
   *   const hasTheNameOfTheTableChanged = fromTableName !== toTableName;
   *
   *   if (hasTheNameOfTheTableChanged) {
   *     await this.#queryInterface.renameTable(fromTableName, toTableName, {
   *       transaction: migration.transaction,
   *     });
   *   }
   *
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { fromModel, toModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel -  How the model state WILL BE before running the migration.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async changeModel(
    _engine: DatabaseAdapter,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * When the user already has a model and you add a new field to the model this is used. So, in other words, this is used to add new fields to existing models.
   *
   * Here is a sequelize example:
   * @example
   * ```ts
   * async addField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldName: string,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   let sequelizeAttribute = toModel.initialized.getAttributes()[fieldName];
   *   const doesNotExistSequelizeAttribute = sequelizeAttribute === undefined;
   *   if (doesNotExistSequelizeAttribute) {
   *     const originalFieldName = toModel.original.fields[fieldName]?.fieldName;
   *     sequelizeAttribute = toModel.initialized.rawAttributes[originalFieldName];
   *   }
   *
   *   await this.#queryInterface.addColumn(
   *     toModel.initialized.options.tableName as string,
   *     sequelizeAttribute.field as string,
   *     sequelizeAttribute,
   *     { transaction: migration.transaction }
   *   );
   *
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { fromModel, toModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration. You can take the field data from the actual model instance.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldName -THe name of the field that is being added to the database.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async addField(
    _engine: DatabaseAdapter,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldName: string,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * When the user already has a model and a field but he makes changes to this field adding another attribute, changing the type, changing the name, etc.
   *
   * This is called when the field had changed, not the model but the field specifically.
   *
   * Here is a Sequelize example:
   * @example
   * ```ts
   * async changeField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldBefore: Field<any, any, any, any, any, any, any, any>,
   *   fieldAfter: Field<any, any, any, any, any, any, any, any>,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   const attributesAsArray = Object.values(toModel.initialized.getAttributes());
   *   const initializedAttribute = attributesAsArray.find((attribute) => attribute.field === fieldAfter.databaseName);
   *   const tableName = toModel.initialized.options.tableName as string;
   *   if (initializedAttribute) {
   *     const isOfTypeRelation = fieldBefore instanceof ForeignKeyField;
   *     // This removes the constraint, when we change the column sequelize automatically creates a new constraint
   *     // because of that we remove the old one.
   *     if (isOfTypeRelation) {
   *       const constraints: GetForeignKeyReferencesForTableReturnType[] | undefined =
   *         (await this.#queryInterface.getForeignKeyReferencesForTable(tableName, {
   *           transaction: migration.transaction,
   *         })) as GetForeignKeyReferencesForTableReturnType[] | undefined;
   *       if (constraints) {
   *         const constraintsToRemove = constraints?.filter(
   *           (constraint) => constraint.columnName === fieldBefore.databaseName
   *         );
   *         for (const constraintToRemove of constraintsToRemove) {
   *           await this.#queryInterface.removeConstraint(tableName, constraintToRemove.constraintName as string, {
   *             transaction: migration.transaction,
   *           });
   *         }
   *       }
   *     }
   *   }
   *   await this.#queryInterface.changeColumn(
   *     tableName,
   *     fieldAfter.databaseName as unknown as string,
   *     initializedAttribute,
   *     {
   *       transaction: migration.transaction,
   *     }
   *   );
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { toModel, fromModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldBefore - How the field WAS
   * @param _fieldAfter - How the field WILL BE.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async changeField(
    _engine: DatabaseAdapter,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldBefore: Field,
    _fieldAfter: Field,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * Pretty much called whenever the user renames a field. Why this is done outside of the `changeField`? Because renaming a field can do change some values on the database. Some databases
   * might prefer to recreate the field from scratch, we opt for maintaining the data and renaming the field only.
   *
   * Here is a Sequelize example:
   * @example
   * ```ts
   * async renameField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldNameBefore: string,
   *   fieldNameAfter: string,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   const databaseNameAfter = toModel.initialized.getAttributes()[fieldNameAfter].field as string;
   *   const databaseNameBefore = toModel.initialized.getAttributes()[fieldNameBefore].field as string;
   *   const tableNameWhereRenameHappened = toModel.initialized.options.tableName as string;
   *
   *   await this.#queryInterface.renameColumn(tableNameWhereRenameHappened, databaseNameBefore, databaseNameAfter, {
   *     transaction: migration.transaction,
   *   });
   *   await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
   *   await this.#handleIndexes(migration, { toModel, fromModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldNameBefore - How the name of the model WAS.
   * @param _fieldNameAfter - How the name of the model WILL BE.
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async renameField(
    _engine: DatabaseAdapter,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldNameBefore: string,
    _fieldNameAfter: string,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * When a model already exists but we just want to remove an existing field that was created (if it was renamed we call renamed. We actually ask the user for what happened)
   *
   * Here is a Sequelize example:
   * @example
   * ```ts
   * async removeField(
   *   engine: DatabaseAdapter<Sequelize>,
   *   toModel: InitializedModelsType<ModelCtor<Model>>,
   *   fromModel: InitializedModelsType<ModelCtor<Model>>,
   *   fieldName: string,
   *   migration: Migration
   * ): Promise<void> {
   *   engine = engine as InstanceType<typeof SequelizeEngine>;
   *   const columnName = fromModel.initialized.getAttributes()[fieldName].field as string;
   *   const tableName = fromModel.initialized.options.tableName as string;
   *   await this.#queryInterface.removeColumn(tableName, columnName, {
   *     transaction: migration.transaction,
   *   });
   *   await this.#handleIndexes(migration, { toModel, fromModel });
   * }
   * ```
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _toModel - How the model state IS right now when running the migration, this is how the model will be after running the migration.
   * @param _fromModel - How the model state WAS before running the migration.
   * @param _fieldName - The name of the field that will be removed (THAT'S NOT THE DB NAME, BUT THE JS NAME)
   * @param _migration - The migration instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async removeField(
    _engine: DatabaseAdapter,
    _toModel: InitializedModelsType,
    _fromModel: InitializedModelsType,
    _fieldName: string,
    _migration: Migration,
    _returnOfInit: any
  ): Promise<void> {
    return;
  }

  /**
   * When the migration file finishes running and you want to do some cleanup we call this function. If you don't have any cleanup to do, don't implement this function.
   *
   * @param _engine - The engine instance that is running the migrations.
   * @param _returnOfInit - The return of the init function, if you implemented it, otherwise it will be undefined.
   */
  // eslint-disable-next-line ts/require-await
  async finish?(_engine: DatabaseAdapter, _returnOfInit: any): Promise<void> {
    return;
  }
}
