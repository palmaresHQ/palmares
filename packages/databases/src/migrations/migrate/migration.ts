import Engine from "../../engine";
import { Operation } from "../actions";
import State from "../state";
import { FoundMigrationsFileType, MigrationFileType } from "../types";

export default class Migration {
  domainName: string;
  databaseName: string;
  name: string;
  dependsOn: string;
  engineInstance: Engine;
  operations: Operation[] = [];

  transaction: any = null;

  constructor(engineInstance: Engine, migrationFile: MigrationFileType, domainName: string) {
    this.engineInstance = engineInstance;
    this.name = migrationFile.name;
    this.databaseName = migrationFile.database;
    this.dependsOn = migrationFile.dependsOn;
    this.operations = migrationFile.operations;
    this.domainName = domainName;
  }

  async runOnTransaction(transaction: any, allMigrations: FoundMigrationsFileType[]) {
    this.transaction = transaction;
    for (let i = 0; i<this.operations.length; i++) {
      const operation = this.operations[i];
      const fromState = await State.buildState(allMigrations, this.name, i);
      const {
        initializedModels: fromStateModelsByModelName,
        closeEngineInstance: closeFromEngineInstance
      } = await fromState.geInitializedModelsByName(this.engineInstance);
      const toState = await State.buildState(allMigrations, this.name, i+1);

      const {
        initializedModels: toStateModelsByModelName,
        closeEngineInstance: closeToEngineInstance
      } = await toState.geInitializedModelsByName(this.engineInstance);
      await operation.run(
        this, this.engineInstance, fromStateModelsByModelName, toStateModelsByModelName
      );
      await closeToEngineInstance();
      await closeFromEngineInstance();
    }
  }

  async run(allMigrations: FoundMigrationsFileType[]) {
    await this.engineInstance.migrations.init();
    await this.engineInstance.transaction(this.runOnTransaction.bind(this), allMigrations);
  }

  static async buildFromFile(
    engineInstance: Engine,
    migrationFile: FoundMigrationsFileType,
    allMigrations: FoundMigrationsFileType[]
  ) {
    const migration = new this(engineInstance, migrationFile.migration, migrationFile.domainName);
    await migration.run(allMigrations);
  }
}
