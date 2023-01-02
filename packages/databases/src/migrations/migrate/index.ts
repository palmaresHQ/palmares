import { logging } from '@palmares/core';

import { PalmaresMigrations } from '../../defaults/models';
import Engine from '../../engine';
import {
  DatabaseSettingsType,
  InitializedEngineInstancesType,
} from '../../types';
import {
  LOGGING_MIGRATIONS_NO_NEW_MIGRATIONS,
  LOGGING_MIGRATIONS_RUNNING_FILE_NAME,
} from '../../utils';
import { FoundMigrationsFileType } from '../types';
import Migration from './migration';
import { MigrationsToAddAfterIterationType } from './type';

/**
 * This class holds the logic for evaluating migrations, usually evaluating migrations is simple because we just
 * need to build and call the `Migration` class.
 */
export default class Migrate {
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
    const newMigrationsToAddAfterIteration: MigrationsToAddAfterIterationType[] =
      [];
    for (const migrationToAddAfterIteration of this
      .migrationsToAddAfterIteration) {
      try {
        const createdMigration =
          await PalmaresMigrations.migrations.createMigration(
            migrationToAddAfterIteration.migrationName,
            migrationToAddAfterIteration.engineName
          );
        if (!createdMigration)
          newMigrationsToAddAfterIteration.push(migrationToAddAfterIteration);
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
      const lastMigrationName =
        await PalmaresMigrations.migrations.getLastMigrationName(engineName);
      const isAValidMigrationName =
        typeof lastMigrationName === 'string' && lastMigrationName !== '';
      if (isAValidMigrationName) return lastMigrationName;
    } catch {
      return null;
    }
    return null;
  }

  /**
   * This is the main method that is used to run the migrations in the specific database.
   *
   * @param engineInstance - The engine instance that is being used to run all of the migrations
   * in the database.
   * @param allMigrationsOfDatabase - All of the migration files that are available to be used inside of
   * this database.
   */
  private async _run(
    engineInstance: Engine,
    allMigrationsOfDatabase: FoundMigrationsFileType[]
  ) {
    const lastMigrationName = await this.getLastMigration(
      engineInstance.databaseName
    );
    const startIndexOfFilter =
      allMigrationsOfDatabase.findIndex(
        (migration) => migration.migration.name === lastMigrationName
      ) + 1;
    const filteredMigrationsOfDatabase = allMigrationsOfDatabase.slice(
      startIndexOfFilter,
      allMigrationsOfDatabase.length
    );

    if (filteredMigrationsOfDatabase.length > 0) {
      for (const migrationFile of filteredMigrationsOfDatabase) {
        const migrationName = migrationFile.migration.name;

        logging.logMessage(LOGGING_MIGRATIONS_RUNNING_FILE_NAME, {
          title: migrationName,
        });

        await Migration.buildFromFile(
          engineInstance,
          migrationFile,
          allMigrationsOfDatabase
        );
        await this.saveMigration(migrationName, engineInstance.databaseName);
      }
    } else {
      logging.logMessage(LOGGING_MIGRATIONS_NO_NEW_MIGRATIONS, {
        databaseName: engineInstance.databaseName,
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
    const initializedEngineInstancesEntries = Object.entries(
      initializedEngineInstances
    );
    for (const [
      database,
      { engineInstance },
    ] of initializedEngineInstancesEntries) {
      const filteredMigrationsOfDatabase = migrations.filter((migration) =>
        [database, '*'].includes(migration.migration.database)
      );
      const migrate = new this(settings);
      await migrate._run(engineInstance, filteredMigrationsOfDatabase);
    }
  }
}
