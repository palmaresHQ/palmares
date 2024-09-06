import { State } from '../state';

import type { DatabaseAdapter } from '../../engine';
import type { Operation } from '../actions';
import type { FoundMigrationsFileType, MigrationFileType } from '../types';

export class Migration {
  domainName: string;
  databaseName: string;
  name: string;
  dependsOn: string;
  engineInstance: DatabaseAdapter;
  operations: Operation[] = [];
  allMigrations: FoundMigrationsFileType[];

  transaction: any = null;

  private constructor(
    engineInstance: DatabaseAdapter,
    migrationFile: MigrationFileType,
    domainName: string,
    allMigrations: FoundMigrationsFileType[]
  ) {
    this.engineInstance = engineInstance;
    this.name = migrationFile.name;
    this.databaseName = migrationFile.database;
    this.dependsOn = migrationFile.dependsOn;
    this.operations = migrationFile.operations;
    this.domainName = domainName;
    this.allMigrations = allMigrations;
  }

  /**
   * The method that is used to run the migration on the transaction.
   * This method will recreate the state FOR EVERY action. We know this is suboptimal but since this code
   * is only running on a CI environment then it's fine. It is also fine to flush your migrations from now
   * and then and recreate the migrations from scratch.
   *
   * @param transaction - The transaction that is being used to run the migration on.
   * @param allMigrations - All of the migrations that are available to be used inside of this database. With
   * this we reconstruct the state AFTER the migration has been run and BEFORE the migration has been run.
   * @param returnOfInit - The return of the init function that is run before the migration is run. If it's implemented we will pass it to all of the operations.
   */
  async #runOnTransaction(
    transaction: any,
    allMigrations: FoundMigrationsFileType[],
    returnOfInit: any
  ): Promise<(() => Promise<void>)[]> {
    this.transaction = transaction;
    const connectionsToClose: (() => Promise<void>)[] = [];
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      const fromState = await State.buildState(allMigrations, this.name, i);
      const { initializedModels: fromStateModelsByModelName, closeEngineInstance: closeFromEngineInstance } =
        await fromState.geInitializedModelsByName(this.engineInstance);

      const toState = await State.buildState(allMigrations, this.name, i + 1);
      const { initializedModels: toStateModelsByModelName, closeEngineInstance: closeToEngineInstance } =
        await toState.geInitializedModelsByName(this.engineInstance);

      await operation.run(
        this,
        this.engineInstance,
        fromStateModelsByModelName,
        toStateModelsByModelName,
        returnOfInit
      );

      if (closeToEngineInstance) connectionsToClose.push(() => closeToEngineInstance(this.engineInstance));
      if (closeFromEngineInstance) connectionsToClose.push(() => closeFromEngineInstance(this.engineInstance));
    }
    return connectionsToClose;
  }

  /**
   * The method that is used to effectively run the migration. By default we will run the migration
   * files in a transaction, so we guarantee that if the migration fails for some reason all of the
   * actions and changes will be rolled back.
   */
  private async run(): Promise<(() => Promise<void>)[]> {
    let returnOfInit: any = undefined;
    if (this.engineInstance.migrations?.init)
      returnOfInit = await this.engineInstance.migrations.init(this.engineInstance);
    const connectionsToClose = await this.engineInstance.useTransaction(
      this.#runOnTransaction.bind(this),
      this.allMigrations,
      returnOfInit
    );

    if (this.engineInstance.migrations?.finish)
      await this.engineInstance.migrations.finish(this.engineInstance, returnOfInit);

    return connectionsToClose;
  }

  /**
   * The static method that is used to build the migration from the file. We load the file data into memory
   * and then build the migration from that data.
   *
   * For running the migration we do need the engine instance that is being used to run this migration, the file
   * to build the migration from, and all of the migrations that is available for this engine instance. We need
   * them to be able to recreate the state.
   *
   * @param engineInstance - The engine instance that is being used to run all of the migrations in the database.
   * @param migrationFile - The current migration file that is running.
   * @param allMigrations - All of the migration files that are available to be used inside of this database. With
   * this we are able to recreate the state of the database.
   */
  static async buildFromFile(
    engineInstance: DatabaseAdapter,
    migrationFile: FoundMigrationsFileType,
    allMigrations: FoundMigrationsFileType[]
  ): Promise<(() => Promise<void>)[]> {
    const migration = new this(engineInstance, migrationFile.migration, migrationFile.domainName, allMigrations);
    return migration.run();
  }
}
