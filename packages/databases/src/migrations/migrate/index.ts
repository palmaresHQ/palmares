import Engine from "../../engine";
import { DatabaseSettingsType, InitializedEngineInstancesType } from "../../types";
import { FoundMigrationsFileType } from "../types";
import Migration from "./migration";

export default class Migrate {
  settings: DatabaseSettingsType;

  constructor(settings: DatabaseSettingsType) {
    this.settings = settings;
  }

  async _run(
    engineInstance: Engine,
    allMigrationsOfDatabase: FoundMigrationsFileType[]
  ) {
    for (const migrationFile of allMigrationsOfDatabase) {
      await Migration.buildFromFile(engineInstance, migrationFile, allMigrationsOfDatabase);
    }
  }

  static async buildAndRun(
    settings: DatabaseSettingsType,
    migrations: FoundMigrationsFileType[],
    initializedEngineInstances: InitializedEngineInstancesType
  ) {
    const initializedEngineInstancesEntries = Object.entries(initializedEngineInstances);
    for (const [database, { engineInstance }] of initializedEngineInstancesEntries) {
      const filteredMigrationsOfDatabase = migrations.filter(migration =>
        [database, '*'].includes(migration.migration.database)
      );
      const migrate = new this(settings);
      await migrate._run(engineInstance, filteredMigrationsOfDatabase);
    }
  }
}
