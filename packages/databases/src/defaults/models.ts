import * as models from "../models";
import { ModelOptionsType } from "../models/types";
import PalmaresMigrationsManager from './managers';

/**
 * The default migration database. This is responsible for storing and saving all of the migrations that the user made.
 *
 * Usually the user will not have any access to this, this is for internal use only.
 */
export class PalmaresMigrations extends models.Model<PalmaresMigrations>() {
  fields = {
    id: new models.fields.BigAutoField(),
    migrationName: new models.fields.CharField({ maxLength: 150 }),
    engineName: new models.fields.CharField({ maxLength: 150 })
  }

  options: ModelOptionsType<PalmaresMigrations> = {
    tableName: 'palmares_migrations',
    ordering: ['-id']
  }

  static migrations = new PalmaresMigrationsManager()
}
