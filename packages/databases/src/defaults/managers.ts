import { Manager } from '../models';

import type { PalmaresMigrations } from './models';

export class PalmaresMigrationsManager {
  /**
   * Creates a new migration in the database. This way we can know what migrations have was evaluated and what migration
   * still needs to be evaluated.
   *
   * @param migrationName - The name of the migration file that was evaluated.
   * @param engineName - The name of the engine from which this migration was created.
   */
  async createMigration(migrationName: string, engineName: string) {
    return this.set(
      {
        migrationName,
        engineName
      },
      {
        useTransaction: true
      },
      engineName
    );
  }

  /**
   * Retrieves the last migration that was evaluated for a given engine.
   *
   * @param engineName - The name of the engine to create this migration for.
   *
   * @return - An empty '' string or the name of the last migration.
   */
  async getLastMigrationName(engineName: string) {
    const allMigrations = await this.get({ search: { engineName } }, engineName);
    return allMigrations.length > 0 ? allMigrations[0].migrationName : '';
  }
}
