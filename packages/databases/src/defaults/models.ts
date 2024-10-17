import { PalmaresMigrationsManager } from './managers';
import { BigAutoField, CharField } from '..';
import { model } from '../models';

/**
 * The default migration database. This is responsible for storing and saving all of the migrations that the user made.
 *
 * Usually the user will not have any access to this, this is for internal use only.
 */
export class PalmaresMigrations extends model<PalmaresMigrations, any>() {
  fields = {
    id: BigAutoField.new(),
    migrationName: CharField.new({ maxLen: 150 }),
    engineName: CharField.new({ maxLen: 150 })
  };

  options = {
    tableName: 'palmares_migrations',
    ordering: ['-id']
  };

  static migrations = new PalmaresMigrationsManager();
}
