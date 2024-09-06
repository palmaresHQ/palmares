import { Migration } from './migration';
import { PalmaresMigrations } from '../../defaults/models';
import { databaseLogger } from '../../logging';
import { State } from '../state';

import type { MigrationsToAddAfterIterationType } from './type';
import type { DatabaseAdapter } from '../../engine';
import type { DatabaseSettingsType, InitializedEngineInstancesType } from '../../types';
import type { FoundMigrationsFileType } from '../types';

/**
 * This class holds the logic for evaluating migrations, usually evaluating migrations is simple because we just
 * need to build and call the `Migration` class.
 */
export class Migrate {
  settings: DatabaseSettingsType;
  migrationsToAddAfterIteration: MigrationsToAddAfterIterationType[] = [];

  private constructor(settings: DatabaseSettingsType) {
    this.settings = settings;
  }

  /**
   * Instead of passing the values to save here, you see that we look through the `migrationsToAddAfterIteration`
   * because although we recommend adding the '@palmares/database' as the first domain in the project, there might
   * have use cases where users set other stuff first.
   *
   * Because of that, we hold the data to save in PalmaresMigration until it is created in the database so when it is
   * created we can save all of the data.
   *
   * So what you do is that you append a data to `migrationsToAddAfterIteration`, and only after that you can iterate over.
   * To save to the database that the migration was added.
   *
   * @param migrationName - The name of the migration file that was evaluated.
   * @param engineName - The name of the user defined engine that was created in `DATABASES`
   */
  async saveMigration(migrationName: string, engineName: string) {
    this.migrationsToAddAfterIteration.push({ migrationName, engineName });
    const newMigrationsToAddAfterIteration: MigrationsToAddAfterIterationType[] = [];
    for (const migrationToAddAfterIteration of this.migrationsToAddAfterIteration) {
      try {
        const createdMigration = await PalmaresMigrations.migrations.createMigration(
          migrationToAddAfterIteration.migrationName,
          migrationToAddAfterIteration.engineName
        );
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (!createdMigration) newMigrationsToAddAfterIteration.push(migrationToAddAfterIteration);
      } catch {
        newMigrationsToAddAfterIteration.push(migrationToAddAfterIteration);
      }
    }
    this.migrationsToAddAfterIteration = newMigrationsToAddAfterIteration;
  }

  /**
   * Retrieve the last migration name that was created in the database. This is the last migration file name
   * that was evaluated by palmares. This way we can filter only the migrations after that.
   *
   * @param engineName - The name of the engine to use, usually it will be the `default`.
   */
  async getLastMigration(engineName: string) {
    try {
      const lastMigrationName = await PalmaresMigrations.migrations.getLastMigrationName(engineName);
      const isAValidMigrationName = typeof lastMigrationName === 'string' && lastMigrationName !== '';
      if (isAValidMigrationName) return lastMigrationName;
    } catch {
      return null;
    }
    return null;
  }

  /**
   * This is the main method that is used to run the migrations in the specific database.
   *
   * There are 2 ways to run the migrations:
   * - Either we batch them into a single migration that just gets the current state and let the ORM handle the rest.
   * - Run each migration file individually and each migration action one by one.
   *
   * @param engineInstance - The engine instance that is being used to run all of the migrations
   * in the database.
   * @param allMigrationsOfDatabase - All of the migration files that are available to be used inside of
   * this database.
   */
  private async _run(engineInstance: DatabaseAdapter, allMigrationsOfDatabase: FoundMigrationsFileType[]) {
    const lastMigrationName = await this.getLastMigration(engineInstance.connectionName);
    const startIndexOfFilter =
      allMigrationsOfDatabase.findIndex((migration) => migration.migration.name === lastMigrationName) + 1;
    const filteredMigrationsOfDatabase = allMigrationsOfDatabase.slice(
      startIndexOfFilter,
      allMigrationsOfDatabase.length
    );

    if (filteredMigrationsOfDatabase.length > 0) {
      // Run the migrations in batch, so just get the current state and let the ORM handle the rest.
      if (engineInstance.migrations?.batchAll) {
        databaseLogger.logMessage('MIGRATION_RUNNING_IN_BATCH', {
          databaseName: engineInstance.connectionName
        });

        let returnOfInit: any = undefined;
        if (engineInstance.migrations.init) returnOfInit = await engineInstance.migrations.init(engineInstance);
        const currentState = await State.buildState(filteredMigrationsOfDatabase);
        const initializedModelsByName = await currentState.geInitializedModelsByName(engineInstance);
        const formattedModelsByName: { [modelName: string]: any } = {};

        for (const [modelName, model] of Object.entries(initializedModelsByName.initializedModels))
          formattedModelsByName[modelName] = model.initialized;

        await engineInstance.migrations.batchAll(engineInstance, formattedModelsByName, returnOfInit);
      }

      let connectionsToClose = [] as (() => Promise<void>)[];
      // Run the migrations one by one. Default Approach. We always run this because we need to save that the migration file was evaluated to the database.
      for (const migrationFile of filteredMigrationsOfDatabase) {
        const migrationName = migrationFile.migration.name;

        if (engineInstance.migrations?.batchAll === undefined) {
          databaseLogger.logMessage('MIGRATIONS_RUNNING_FILE_NAME', {
            title: migrationName
          });
          connectionsToClose = connectionsToClose.concat(
            await Migration.buildFromFile(engineInstance, migrationFile, allMigrationsOfDatabase)
          );
        }

        await this.saveMigration(migrationName, engineInstance.connectionName);
      }

      await Promise.allSettled(connectionsToClose.map((closeConnection) => closeConnection()));
    } else {
      databaseLogger.logMessage('MIGRATIONS_NO_NEW_MIGRATIONS', {
        databaseName: engineInstance.connectionName
      });
    }
  }

  /**
   * This is a factory method that MUST be called to create a new instance of the `Migrate` class.
   *
   * @param settings - The settings that is being used.
   * @param migrations - All of the migrations that are available to be used for this database.
   * @param initializedEngineInstances - The engine instances that were initialized so we can run the migrations
   * in each database.
   */
  static async buildAndRun(
    settings: DatabaseSettingsType,
    migrations: FoundMigrationsFileType[],
    initializedEngineInstances: InitializedEngineInstancesType
  ) {
    const initializedEngineInstancesEntries = Object.entries(initializedEngineInstances);
    for (const [database, { engineInstance }] of initializedEngineInstancesEntries) {
      const filteredMigrationsOfDatabase = migrations.filter((migration) =>
        [database, '*'].includes(migration.migration.database)
      );
      const migrate = new this(settings);
      await migrate._run(engineInstance, filteredMigrationsOfDatabase);
    }
  }
}
