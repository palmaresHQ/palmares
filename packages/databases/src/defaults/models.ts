import PalmaresMigrationsManager from './managers';
import { BigAutoField, CharField } from '..';
import { model } from '../models';

import type { ModelOptionsType } from '../models/types';

/**
 * The default migration database. This is responsible for storing and saving all of the migrations that the user made.
 *
 * Usually the user will not have any access to this, this is for internal use only.
 */
export class PalmaresMigrations extends model<PalmaresMigrations>() {
  fields = {
    id: BigAutoField.new(),
    migrationName: CharField.new({ maxLength: 150 }),
    engineName: CharField.new({ maxLength: 150 }),
  };

  options: ModelOptionsType<PalmaresMigrations> = {
    tableName: 'palmares_migrations',
    ordering: ['-id'],
  };

  static migrations = new PalmaresMigrationsManager();
}
