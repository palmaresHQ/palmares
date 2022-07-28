import * as models from "../models";
import { ModelOptionsType } from "../models/types";
import PalmaresMigrationsManager from './managers';

export class PalmaresMigrations extends models.Model<PalmaresMigrations>() {
  fields = {
    id: new models.fields.BigAutoField(),
    migrationName: new models.fields.CharField({ maxLength: 150 }),
  }

  options: ModelOptionsType<PalmaresMigrations> = {
    tableName: 'palmares_migrations'
  }

  static migrations = new PalmaresMigrationsManager()
}
