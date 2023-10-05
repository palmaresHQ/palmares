import { EngineMigrations, Migration, InitializedModelsType, models } from '@palmares/databases';
import { ModelCtor, Model, QueryInterface, QueryInterfaceIndexOptions, Sequelize } from 'sequelize';
import type { SetRequired } from 'sequelize/types/utils/set-required';

import SequelizeEngine from './engine';
import {
  CircularDependenciesInMigrationType,
  GetForeignKeyReferencesForTableReturnType,
  IndexesToAddOnNextIterationType,
  MigrationModelType,
} from './types';

export default class SequelizeMigrations extends EngineMigrations {
  #circularDependenciesInMigration: CircularDependenciesInMigrationType[] = [];
  #queryInterface!: QueryInterface;
  #indexesToAddOnNextIteration: IndexesToAddOnNextIterationType[] = [];

  /**
   * This is based on the lifecycle of migrations, first we initialize the migration creating a query interface and
   * a transaction.
   */
  async init(engine: SequelizeEngine): Promise<void> {
    this.#queryInterface = engine.instance?.getQueryInterface() as QueryInterface;
  }
  /**
   * When the model references itself we need to evaluate it lazily. What this does is: First check if it has a circular dependency,
   * all circular dependencies will add a new column.
   *
   * For example:
   * ```
   * class CircularDependency extends models.Model<CircularDependency>() {
   *      fields = {
   *          circular: models.fields.ForeignKeyField.new({
   *              relatedTo:'Circular',
   *              onDelete: models.fields.ON_DELETE.CASCADE
   *          })
   *      }
   *      options = {
   *          tableName: 'circular_dependency',
   *      }
   * }
   *
   * class Circular extends models.Model<CircularDependency>() {
   *      fields = {
   *          circularFromHere: new models.fields.ForeignKeyField({
   *          relatedTo:'CircularDependency',
   *          onDelete: models.fields.ON_DELETE.CASCADE
   *      })
   * }
   *     options = {
   *          tableName: 'circular',
   *      }
   * }
   * ```
   *
   * Look that CircularDependency is dependant on Circular and Circular is dependant on CircularDependency.
   *
   * So what this does is that, on the creation of `Circular` or `CircularDependency` one of the columns will not yet be created.
   * So it won't create the column by default, you can remove this function, and create this simple model, make a migration and then
   * run this, you will see that `circular` table will be created but WILL NOT contain the `circularFromHere` column.
   *
   * So what we do is handle this and enforce it's creation.
   *
   * For doing that we will transverse the attributes defined in the model and we check if the 'relatedTo' attribute is already defined or not.
   * If it's not then we will append it to .circularDependenciesInMigration variable. The next time we run this function on the next operation we
   * enter on this function again, and then we will check if the model that is pending has been created or not. If it is then we will create the column.
   * Really simple stuff.
   *
   * @param migration - The migration that is currently running.
   * @param options - The models of how it was before and how it will be after this migration operation runs.
   */
  async #handleCircularDependencies(
    engine: SequelizeEngine,
    migration: Migration,
    {
      toModel,
      fromModel,
    }: {
      toModel: MigrationModelType;
      fromModel?: MigrationModelType;
    }
  ) {
    const sequelizeInstance = engine.instance as Sequelize;
    for (const { fromModel, toModel, fieldName, relatedToName } of this.#circularDependenciesInMigration) {
      const doesColumnDoNotExistInTheModel =
        toModel.initialized.getAttributes()[fieldName] === undefined ||
        engine.initializedModels[relatedToName] !== undefined;
      if (doesColumnDoNotExistInTheModel) {
        toModel.initialized = sequelizeInstance.model(toModel.initialized.name);
        await this.addField(engine, toModel, fromModel, fieldName, migration);
      }
    }

    const allFieldsOfModel = Object.values(toModel?.original?.fields || {});
    for (const fieldDefinition of allFieldsOfModel) {
      const isAForeignKeyField = fieldDefinition instanceof models.fields.ForeignKeyField;
      const fieldDoesNotExist = isAForeignKeyField && engine.initializedModels[fieldDefinition.relatedTo] === undefined;
      if (fieldDoesNotExist) {
        this.#circularDependenciesInMigration.push({
          fromModel: fromModel !== undefined ? fromModel : toModel,
          toModel: toModel,
          fieldName: fieldDefinition.fieldName,
          relatedToName: fieldDefinition.relatedTo,
        });
      }
    }
  }

  /**
   * Responsible for adding the indexes in the migration, it is not called directly from every operation
   * but instead this is handled by sequelizeEngine itself.
   *
   * This creates all of the indexes in all of the tables so no index is missing.
   */
  async #handleIndexes(
    migration: Migration,
    {
      fromModel,
      toModel,
    }: {
      fromModel?: MigrationModelType;
      toModel: MigrationModelType;
    }
  ) {
    this.#indexesToAddOnNextIteration = [];
    const failedIndexesForNextIteration: IndexesToAddOnNextIterationType[] = [];
    const toModelIndexes = toModel.initialized.options.indexes || [];
    const fromModelIndexes = fromModel?.initialized?.options?.indexes || [];
    const toModelName = toModel.initialized.options.tableName as string;
    const toModelDatabaseColumnNames = Object.keys(toModel.initialized.rawAttributes).map(
      (attributeName) => toModel.initialized.getAttributes()[attributeName].field
    );

    for (const toModelIndex of toModelIndexes) {
      const stringifiedToModelIndex = JSON.stringify(toModelIndex);
      const indexDoesNotExistInDbYet =
        fromModelIndexes.find((fromModelIndex) => JSON.stringify(fromModelIndex) === stringifiedToModelIndex) ===
        undefined;
      if (indexDoesNotExistInDbYet) {
        const hasTheSameFieldsInTheIndexName = toModelIndex.fields?.every((indexColumnName) =>
          toModelDatabaseColumnNames.includes(indexColumnName as string)
        );
        if (hasTheSameFieldsInTheIndexName) {
          try {
            const optionsToAddIndex = Object.assign(
              { transaction: migration.transaction },
              toModelIndex
            ) as SetRequired<QueryInterfaceIndexOptions, 'fields'>;
            await this.#queryInterface.addIndex(toModelName, optionsToAddIndex);
          } catch (e) {
            const error = e as Error;
            const isRelationAlreadyExistsError =
              error.name === 'SequelizeDatabaseError' &&
              new RegExp('^relation "\\w+" already exists$').test('relation "palmares_migrations_id" already exists');
            if (isRelationAlreadyExistsError) null;
            else throw e;
          }
        } else {
          failedIndexesForNextIteration.push({
            tableName: toModelName,
            index: toModelIndex,
          });
        }
      }

      for (const fromModelIndex of fromModelIndexes) {
        const stringifiedFromModelIndex = JSON.stringify(fromModelIndex);
        const indexDoesExistInDb =
          toModelIndexes.find((toModelIndex) => JSON.stringify(toModelIndex) === stringifiedFromModelIndex) ===
          undefined;
        if (indexDoesExistInDb) {
          await this.#queryInterface.removeIndex(
            toModel.initialized.options.tableName as string,
            fromModelIndex.name as string,
            { transaction: migration.transaction }
          );
        }
      }

      for (const toTryToAddOnThisIteration of this.#indexesToAddOnNextIteration) {
        try {
          const optionsToAddIndex = Object.assign(
            { transaction: migration.transaction },
            toTryToAddOnThisIteration.index
          ) as SetRequired<QueryInterfaceIndexOptions, 'fields'>;
          await this.#queryInterface.addIndex(toTryToAddOnThisIteration.tableName, optionsToAddIndex);
        } catch (e) {
          failedIndexesForNextIteration.push(toTryToAddOnThisIteration);
        }
      }
      this.#indexesToAddOnNextIteration = failedIndexesForNextIteration;
    }
  }

  /**
   * Responsible for creating a new table inside of the database.
   *
   * @param toModel - The model after the migration is applied
   * @param migration - The migration instance with all of the operations
   */
  async addModel(
    engine: SequelizeEngine,
    toModel: InitializedModelsType<ModelCtor<Model>>,
    migration: Migration
  ): Promise<void> {
    const model = toModel.initialized;

    await this.#queryInterface.createTable(
      model.options.tableName as string,
      model.getAttributes(),
      Object.assign(model.options, {
        transaction: migration.transaction,
      })
    );
    await this.#handleCircularDependencies(engine, migration.transaction, { toModel });
    await this.#handleIndexes(migration.transaction, { toModel });
  }

  /**
   * Removes a model/table from from the database in a running migration.
   *
   * @param fromModel - How the model was before the migration was applied.
   * @param migration - The migration instance with all of the operations
   */
  async removeModel(
    _: SequelizeEngine,
    fromModel: InitializedModelsType<ModelCtor<Model>>,
    migration: Migration
  ): Promise<void> {
    const tableNameToRemove = fromModel.initialized.options.tableName as string;
    const transaction = migration.transaction;
    await this.#queryInterface.dropTable(tableNameToRemove, { transaction });
  }

  /**
   * Changes the model options. Here we only change the table name, most of the other actions will already be handled
   * by the other methods. Even custom options impact on the fields itself so it might be overkill to just do
   * more than that here.
   */
  async changeModel(
    engine: SequelizeEngine,
    toModel: InitializedModelsType<ModelCtor<Model>>,
    fromModel: InitializedModelsType<ModelCtor<Model>>,
    migration: Migration
  ): Promise<void> {
    const fromTableName = fromModel.initialized.tableName;
    const toTableName = toModel.initialized.tableName;
    const hasTheNameOfTheTableChanged = fromTableName !== toTableName;

    if (hasTheNameOfTheTableChanged) {
      await this.#queryInterface.renameTable(fromTableName, toTableName, {
        transaction: migration.transaction,
      });
    }
    await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
    await this.#handleIndexes(migration, { fromModel, toModel });
  }

  async addField(
    engine: SequelizeEngine,
    toModel: InitializedModelsType<ModelCtor<Model>>,
    fromModel: InitializedModelsType<ModelCtor<Model>>,
    fieldName: string,
    migration: Migration
  ): Promise<void> {
    let sequelizeAttribute = toModel.initialized.getAttributes()[fieldName];
    const doesNotExistSequelizeAttribute = sequelizeAttribute === undefined;
    if (doesNotExistSequelizeAttribute) {
      const originalFieldName = toModel.original.fields[fieldName]?.fieldName;
      sequelizeAttribute = toModel.initialized.rawAttributes[originalFieldName];
    }

    await this.#queryInterface.addColumn(
      toModel.initialized.options.tableName as string,
      sequelizeAttribute.field as string,
      sequelizeAttribute,
      { transaction: migration.transaction }
    );
    await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
    await this.#handleIndexes(migration, { fromModel, toModel });
  }

  async removeField(
    engine: SequelizeEngine,
    toModel: InitializedModelsType<ModelCtor<Model>>,
    fromModel: InitializedModelsType<ModelCtor<Model>>,
    fieldName: string,
    migration: Migration
  ): Promise<void> {
    const columnName = fromModel.initialized.getAttributes()[fieldName].field as string;
    const tableName = fromModel.initialized.options.tableName as string;
    await this.#queryInterface.removeColumn(tableName, columnName, {
      transaction: migration.transaction,
    });
    await this.#handleIndexes(migration, { toModel, fromModel });
  }

  async renameField(
    engine: SequelizeEngine,
    toModel: InitializedModelsType<ModelCtor<Model>>,
    fromModel: InitializedModelsType<ModelCtor<Model>>,
    fieldNameBefore: string,
    fieldNameAfter: string,
    migration: Migration
  ): Promise<void> {
    const databaseNameAfter = toModel.initialized.getAttributes()[fieldNameAfter].field as string;
    const databaseNameBefore = toModel.initialized.getAttributes()[fieldNameBefore].field as string;
    const tableNameWhereRenameHappened = toModel.initialized.options.tableName as string;

    await this.#queryInterface.renameColumn(tableNameWhereRenameHappened, databaseNameBefore, databaseNameAfter, {
      transaction: migration.transaction,
    });
    await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
    await this.#handleIndexes(migration, { toModel, fromModel });
  }

  /**
   * Responsible for changing the fields of the model. This does many stuff, from creating indexes, to removing constraints and so on.
   * The idea is that this renames the table, this adds indexes, this changes the model attribute definition and so on.
   *
   * @param toModel - How the model will be after this operation.
   * @param fromModel - How the model was before this operation.
   * @param fieldBefore - How the field was before this operation.
   * @param fieldAfter - How the field will be after this operation
   * @param migration - The migration instance.
   */
  async changeField(
    engine: SequelizeEngine,
    toModel: InitializedModelsType<ModelCtor<Model>>,
    fromModel: InitializedModelsType<ModelCtor<Model>>,
    fieldBefore: models.fields.Field,
    fieldAfter: models.fields.Field,
    migration: Migration
  ): Promise<void> {
    const attributesAsArray = Object.values(toModel.initialized.getAttributes());
    const initializedAttribute = attributesAsArray.find((attribute) => attribute.field === fieldAfter.databaseName);
    const tableName = toModel.initialized.options.tableName as string;
    if (initializedAttribute) {
      const isOfTypeRelation = fieldBefore instanceof models.fields.ForeignKeyField;
      // This removes the constraint, when we change the column sequelize automatically creates a new constraint
      // because of that we remove the old one.
      if (isOfTypeRelation) {
        const constraints: GetForeignKeyReferencesForTableReturnType[] | undefined =
          (await this.#queryInterface.getForeignKeyReferencesForTable(tableName, {
            transaction: migration.transaction,
          })) as GetForeignKeyReferencesForTableReturnType[] | undefined;

        if (constraints) {
          const constraintsToRemove = constraints?.filter(
            (constraint) => constraint.columnName === fieldBefore.databaseName
          );

          for (const constraintToRemove of constraintsToRemove) {
            await this.#queryInterface.removeConstraint(tableName, constraintToRemove.constraintName as string, {
              transaction: migration.transaction,
            });
          }
        }
      }
    }

    await this.#queryInterface.changeColumn(tableName, fieldAfter.databaseName, initializedAttribute, {
      transaction: migration.transaction,
    });
    await this.#handleCircularDependencies(engine, migration, { fromModel, toModel });
    await this.#handleIndexes(migration, { toModel, fromModel });
  }
}
