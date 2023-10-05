import Engine from '../../engine';
import { Operation } from '../actions';
import State from '../state';
import { FoundMigrationsFileType, MigrationFileType } from '../types';

export default class Migration {
  domainName: string;
  databaseName: string;
  name: string;
  dependsOn: string;
  engineInstance: Engine;
  operations: Operation[] = [];
  allMigrations: FoundMigrationsFileType[];

  transaction: any = null;

  private constructor(
    engineInstance: Engine,
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
   */
  async #runOnTransaction(transaction: any, allMigrations: FoundMigrationsFileType[]): Promise<void> {
    this.transaction = transaction;
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      const fromState = await State.buildState(allMigrations, this.name, i);
      const { initializedModels: fromStateModelsByModelName, closeEngineInstance: closeFromEngineInstance } =
        await fromState.geInitializedModelsByName(this.engineInstance);
      const toState = await State.buildState(allMigrations, this.name, i + 1);

      const { initializedModels: toStateModelsByModelName, closeEngineInstance: closeToEngineInstance } =
        await toState.geInitializedModelsByName(this.engineInstance);
      await operation.run(this, this.engineInstance, fromStateModelsByModelName, toStateModelsByModelName);

      const promises: Promise<void>[] = [];
      if (closeToEngineInstance) promises.push(closeToEngineInstance(this.engineInstance, this.databaseName));
      if (closeFromEngineInstance) promises.push(closeFromEngineInstance(this.engineInstance, this.databaseName));
      await Promise.all(promises);
    }
  }

  /**
   * The method that is used to effectively run the migration. By default we will run the migration
   * files in a transaction, so we guarantee that if the migration fails for some reason all of the
   * actions and changes will be rolled back.
   */
  private async run(): Promise<void> {
    await this.engineInstance.migrations.init(this.engineInstance);
    await this.engineInstance.transaction(this.#runOnTransaction.bind(this), this.allMigrations);
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
    engineInstance: Engine,
    migrationFile: FoundMigrationsFileType,
    allMigrations: FoundMigrationsFileType[]
  ): Promise<void> {
    const migration = new this(engineInstance, migrationFile.migration, migrationFile.domainName, allMigrations);
    await migration.run();
  }
}
