import * as models from "../models";
import PalmaresMigrations from "./models";

export default class PalmaresMigrationsManager extends models.Manager<PalmaresMigrations, any> {
  async getLastMigrationName() {
    return await this.get();
  }
}
