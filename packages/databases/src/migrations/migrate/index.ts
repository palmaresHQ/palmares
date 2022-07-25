import { DatabaseSettingsType, InitializedEngineInstancesType } from "../../types";
import { FoundMigrationsFileType } from "../types";

export default class Migrate {
  settings: DatabaseSettingsType;

  constructor(settings: DatabaseSettingsType) {
    this.settings = settings;
  }

  async _run() {

  }

  static async buildAndRun(
    settings: DatabaseSettingsType,
    migrations: FoundMigrationsFileType[],
    initializedEngineInstances: InitializedEngineInstancesType
  ) {
    const initializedEngineInstancesEntries = Object.entries(initializedEngineInstances);
    for (const [database, { engineInstance, projectModels }] of initializedEngineInstancesEntries) {
      const filteredMigrationsOfDatabase = migrations.filter(migration =>
        [database, '*'].includes(migration.migration.database)
      );
      const migrate = new this(settings);
      await migrate._run()
    }
  }
}
